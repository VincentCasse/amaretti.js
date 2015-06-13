"use strict";

var encode = function(str) {
	return new TextEncoder('utf-8').encode(str);
};
var decode = function(buf) {
	return new TextDecoder('utf-8').decode(new Uint8Array(buf));
};
/*var ab2str = function(buf) {
	return String.fromCharCode.apply(null, new Uint16Array(buf));
};*/
function b64ToUint6 (nChr) {

  return nChr > 64 && nChr < 91 ?
      nChr - 65
    : nChr > 96 && nChr < 123 ?
      nChr - 71
    : nChr > 47 && nChr < 58 ?
      nChr + 4
    : nChr === 43 ?
      62
    : nChr === 47 ?
      63
    :
      0;

}

function arrayBufferToBase64 (arrayBuffer) {
	return btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)));
}
/**
* TODO add better way to use atob whe possible
*/
//https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#Appendix.3A_Decode_a_Base64_string_to_Uint8Array_or_ArrayBuffer
function base64ToArrayByte(sBase64, nBlocksSize) { 

  var
    sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""), nInLen = sB64Enc.length,
    nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2, taBytes = new Uint8Array(nOutLen);

  for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
    nMod4 = nInIdx & 3;
    nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 6 * (3 - nMod4);
    if (nMod4 === 3 || nInLen - nInIdx === 1) {
      for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
        taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
      }
      nUint24 = 0;

    }
  }

  return taBytes;

}
var arrayByteToBase64 = function(arrayByte) {
	//http://stackoverflow.com/a/12713326
	var CHUNK_SZ = 0x8000;
	var c = [];
	for (var i = 0; i < arrayByte.length; i += CHUNK_SZ) {
		c.push(String.fromCharCode.apply(
			null,
			arrayByte.subarray(i, i + CHUNK_SZ)
		));
	}
	return btoa(c.join(''));
};

var Amaretti = {

	authTagLength : 128,
	paranoia: 10,
	iterations: 5000,
	enableNative: true,

	init: function (opts) {
		this.authTagUsedSpace = this.authTagLength / 4;
		sjcl.random.startCollectors();

		if (opts) {
			this.iterations = opts.iterations ? opts.iterations : 5000;
			this.enableNative = opts.enableNative !== undefined ? opts.enableNative : true; 
		}
		return this;
	},

	getCrypto: function() {
		return window.crypto || window.msCrypto;
	},

	getSalt: function() {
		var origSalt;
		var salt;
		return new Promise(function(resolve, reject) {
			if (Amaretti.enableNative &&
				Amaretti.getCrypto() &&
				Amaretti.getCrypto().getRandomValues) {
				try {
					origSalt = Amaretti.getCrypto().getRandomValues(new Uint8Array(64));
					salt = arrayByteToBase64(origSalt);
					resolve(salt);
				} catch (exception) {
					reject(exception.message);
				}
				return;
			}

			if (sjcl.random.isReady(Amaretti.paranoia) === 0) {
				reject('sjcl random is not ready');
				return;
			}
			try {
				origSalt = sjcl.random.randomWords(8, Amaretti.paranoia);
				salt = sjcl.codec.base64.fromBits(origSalt);
				resolve(salt);
			} catch (exception) {
				reject(exception.message);
			}
		});
	},

	generateKey: function(passphrase, salt, algo) {
		if (!algo) {
			return new Promise(function(resolve, reject) {
				reject('Please add an algo');
			});
		}

		if (Amaretti.enableNative &&
			Amaretti.getCrypto() &&
			Amaretti.getCrypto().subtle &&
			Amaretti.getCrypto().subtle.importKey && 
			Amaretti.getCrypto().subtle.deriveKey && 
			Amaretti.getCrypto().subtle.exportKey) {

			return Amaretti.getCrypto().subtle.importKey(
				'raw',
				encode(passphrase),
				{ name: 'PBKDF2' },
				false,
				['deriveKey']
			).then(function(baseKey) {

				var cryptoAlgo;
				if (algo === 'SHA-1') {
					cryptoAlgo = 'SHA-1';
				} else if (algo === 'SHA-256') {
					throw 'SHA-256 is not yet available on firefox';
				} else {
					throw 'Your algo is not available';
				}

				return Amaretti.getCrypto().subtle.deriveKey(
					{
						name: 'PBKDF2',
						hash: cryptoAlgo,
						salt: base64ToArrayByte(salt),
						iterations: Amaretti.iterations
					},
					baseKey,
					{
						name: 'AES-GCM',
						length: 256
					},
					true,
					['encrypt', 'decrypt']
				).then(function (key) {
					return Amaretti.getCrypto().subtle.exportKey('raw', key)
						.then(function (rawKey) {
							return new Promise(function(resolve, reject) {
								try {
							 		resolve(arrayByteToBase64(new Uint8Array(rawKey)));
							 	} catch (exception) {
							 		reject(exception.message);
							 	}
							});
					});
				});
			});
		} else {
			return new Promise(function(resolve, reject) {
				try {
					var sjclAlgo;

					if (algo === 'SHA-1') {
						sjclAlgo = function (key) {
							// todo sha-1
					    	var hasher = new sjcl.misc.hmac( key, sjcl.hash.sha256 );
						    this.encrypt = function () {
						        return hasher.encrypt.apply( hasher, arguments );
						    };
						};
					} else if (algo === 'SHA-256') {
						sjclAlgo = function (key) {
					    	var hasher = new sjcl.misc.hmac( key, sjcl.hash.sha256 );
						    this.encrypt = function () {
						        return hasher.encrypt.apply( hasher, arguments );
						    };
						};
					} else {
						throw 'Your algo is not available';
					}

					var key = sjcl.misc.pbkdf2(
						passphrase,
						sjcl.codec.base64.toBits(salt),
						Amaretti.iterations,
						256,
						sjclAlgo
					);
					// TODO fix SHA1
					// https://github.com/bitwiseshiftleft/sjcl/issues/75
					resolve(sjcl.codec.base64.fromBits(key));
				} catch (exception) {
					reject(exception.message);
				}
			});
		}
	},

	encrypt: function(key, message, nonce) {
		if (Amaretti.enableNative &&
			Amaretti.getCrypto() &&
			Amaretti.getCrypto().subtle &&
			Amaretti.getCrypto().subtle.importKey &&
			Amaretti.getCrypto().subtle.encrypt) {

			return Amaretti.getCrypto().subtle.importKey(
				'raw',
				base64ToArrayByte(key),
				{
					name: 'AES-GCM',
					length: 256
				},
				true,
				['encrypt', 'decrypt']
			).then(function (rawKey) {
				
				return Amaretti.getCrypto().subtle.encrypt(
					{
						name: 'AES-GCM',
						iv: base64ToArrayByte(nonce),
						tagLength: Amaretti.authTagLength
					},
					rawKey,
					encode(message)
				).then(function (crypted) {
					return new Promise(function (resolve, reject) {
						try {	
							resolve(arrayBufferToBase64(crypted));
						} catch (exception) {
							reject(exception.message);
						}
					});
				});
			});
		} else {
			return new Promise(function(resolve, reject) {
				try {
					var rawKey = sjcl.codec.base64.toBits(key);
					var rawNonce = sjcl.codec.base64.toBits(nonce);
					var keyAES = new sjcl.cipher.aes(rawKey);
					var crypt = sjcl.mode.gcm.encrypt(
						keyAES,
						sjcl.codec.utf8String.toBits(message),
						rawNonce,
						sjcl.codec.utf8String.toBits(Amaretti.authData),
						Amaretti.authentificationTagLength);

					resolve(sjcl.codec.base64.fromBits(crypt));
				} catch (exception) {
					reject(exception.message);
				}
			});
		}	
	},

	decrypt: function(key, crypted, nonce) {

		if (Amaretti.enableNative &&
			Amaretti.getCrypto() &&
			Amaretti.getCrypto().subtle &&
			Amaretti.getCrypto().subtle.importKey &&
			Amaretti.getCrypto().subtle.decrypt) {

			return Amaretti.getCrypto().subtle.importKey(
				'raw',
				base64ToArrayByte(key),
				{
					name: 'AES-GCM',
					length: 256
				},
				true,
				['encrypt', 'decrypt']
			).then(function (rawKey) {
				return Amaretti.getCrypto().subtle.decrypt(
					{
						name: 'AES-GCM',
						iv: base64ToArrayByte(nonce),
						tagLength: Amaretti.authTagLength
					},
					rawKey,
					base64ToArrayByte(crypted)
				).then(function(plaintext) {
					return new Promise(function(resolve, reject) {
						resolve(decode(plaintext));
					});
				}, function (err) {
					return new Promise(function(resolve, reject) {
						reject('Integrity/Authenticity check failed! Invalid password?');
					});
				});
			});
		} else {
			return new Promise(function(resolve, reject) {
				try {
					var rawKey = sjcl.codec.base64.toBits(key);
					var rawNonce = sjcl.codec.base64.toBits(nonce);
					var rawCrypted = sjcl.codec.base64.toBits(crypted);
					var keyAES = new sjcl.cipher.aes(rawKey);

					var crypt = sjcl.mode.gcm.decrypt(
						keyAES,
						rawCrypted,
						rawNonce,
						sjcl.codec.utf8String.toBits(Amaretti.authData),
						Amaretti.authentificationTagLength);
					var decrypt = sjcl.codec.utf8String.fromBits(crypt);
					resolve(decrypt);
				} catch (exception) {
					reject(exception.message);
				}
			});
		}
	}
};


//# sourceMappingURL=amaretti.js.map