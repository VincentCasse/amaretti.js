'use strict'

describe('Diversity testing : try to create salt from lib and decrypt from native and inverse', function () {

	var amaretti;
	var amarettiSjcl;

	beforeEach(function () {
		amaretti = Amaretti.init();
		sjcl.random.startCollectors();
		amarettiSjcl = Amaretti.init({
			enableNative: false
		});
		sjcl.random.startCollectors();
	});

	describe('Use all native', function() {

		it('should use crypto.subtle.importKey if available', function (done) {
	
			var m = 'Lorem ipsum dolor sit amet, consectetur adipiscing';
			m += 'elit, sed do eiusmod tempor ut et dolore magna aliqua.';
			m += 'Ut enim ad minim veniam, quis nostrud ullamco laboris nisi';
			m += 'ut aliquip ex ea commodo conseq irure dolor in reprehenderit';
			m += 'in voluptate velit esse eu fugiat nulla pariatur. Excepteur';
			m += 'sint occaecat cupidatat, sunt in culpa qui officia deserunt';
			m += 'mollit anim id est laborum';

			var salt, key, nonce, crypted;

			amaretti.getSalt().then(function (generatedSalt) {
				salt = generatedSalt;
				return amaretti.generateKey('oneunittest', salt, 'SHA-1');
			}).then(function (generatedKey) {
				key = generatedKey;
				return amaretti.getSalt();
			}).then(function (generatedNonce) {
				nonce = generatedNonce;
				return amaretti.encrypt(key, m, nonce);
			}).then(function (generateCrypted) {
				crypted = generateCrypted;
				return amaretti.decrypt(key, crypted, nonce);
			}).then(function (decrypted) {
				expect(decrypted).toEqual(m);
				expect(salt).not.toBe(undefined);
				expect(salt).not.toBe('');
				expect(key).not.toBe(undefined);
				expect(key).not.toBe('');
				expect(nonce).not.toBe(undefined);
				expect(nonce).not.toBe('');
				done();
			});
		});
	});

	describe('Use all sjcl', function() {

		it('should use crypto.subtle.importKey if available', function (done) {
	
			var m = 'Lorem ipsum dolor sit amet, consectetur adipiscing';
			m += 'elit, sed do eiusmod tempor ut et dolore magna aliqua.';
			m += 'Ut enim ad minim veniam, quis nostrud ullamco laboris nisi';
			m += 'ut aliquip ex ea commodo conseq irure dolor in reprehenderit';
			m += 'in voluptate velit esse eu fugiat nulla pariatur. Excepteur';
			m += 'sint occaecat cupidatat, sunt in culpa qui officia deserunt';
			m += 'mollit anim id est laborum';

			var salt, key, nonce, crypted;

			amarettiSjcl.getSalt().then(function (generatedSalt) {
				salt = generatedSalt;
				return amarettiSjcl.generateKey('oneunittest', salt, 'SHA-1');
			}).then(function (generatedKey) {
				key = generatedKey;
				return amarettiSjcl.getSalt();
			}).then(function (generatedNonce) {
				nonce = generatedNonce;
				return amarettiSjcl.encrypt(key, m, nonce);
			}).then(function (generateCrypted) {
				crypted = generateCrypted;
				return amarettiSjcl.decrypt(key, crypted, nonce);
			}).then(function (decrypted) {
				expect(decrypted).toEqual(m);
				expect(salt).not.toBe(undefined);
				expect(salt).not.toBe('');
				expect(key).not.toBe(undefined);
				expect(key).not.toBe('');
				expect(nonce).not.toBe(undefined);
				expect(nonce).not.toBe('');
				done();
			});
		});
	});

	describe('Generate a native salt and crypt with sjcl', function() {

		it('should use crypto.subtle.importKey if available', function (done) {
	
			var m = 'Lorem ipsum dolor sit amet, consectetur adipiscing';
			m += 'elit, sed do eiusmod tempor ut et dolore magna aliqua.';
			m += 'Ut enim ad minim veniam, quis nostrud ullamco laboris nisi';
			m += 'ut aliquip ex ea commodo conseq irure dolor in reprehenderit';
			m += 'in voluptate velit esse eu fugiat nulla pariatur. Excepteur';
			m += 'sint occaecat cupidatat, sunt in culpa qui officia deserunt';
			m += 'mollit anim id est laborum';

			var salt, key, nonce, crypted;
			amaretti.getSalt().then(function (generatedSalt) {
				salt = generatedSalt;
				return amaretti.generateKey('oneunittest', salt, 'SHA-1');
			}).then(function (generatedKey) {
				key = generatedKey;
				return amaretti.getSalt();
			}).then(function (generatedNonce) {
				nonce = generatedNonce;
				return amarettiSjcl.encrypt(key, m, nonce);
			}).then(function (generateCrypted) {
				crypted = generateCrypted;
				return amarettiSjcl.decrypt(key, crypted, nonce);
			}).then(function (decrypted) {
				expect(decrypted).toEqual(m);
				expect(salt).not.toBe(undefined);
				expect(salt).not.toBe('');
				expect(key).not.toBe(undefined);
				expect(key).not.toBe('');
				expect(nonce).not.toBe(undefined);
				expect(nonce).not.toBe('');
				done();
			});
		});
	});

	describe('Mix between SJCL and native implementation', function() {

		it('should encrypt using sjcl lib with native key', function (done) {
	
			var m = 'Lorem ipsum dolor sit amet, consectetur adipiscing';
			m += 'elit, sed do eiusmod tempor ut et dolore magna aliqua.';
			m += 'Ut enim ad minim veniam, quis nostrud ullamco laboris nisi';
			m += 'ut aliquip ex ea commodo conseq irure dolor in reprehenderit';
			m += 'in voluptate velit esse eu fugiat nulla pariatur. Excepteur';
			m += 'sint occaecat cupidatat, sunt in culpa qui officia deserunt';
			m += 'mollit anim id est laborum';

			var salt, key, nonce, crypted;
			amaretti.getSalt().then(function (generatedSalt) {
				salt = generatedSalt;
				return amaretti.generateKey('oneunittest', salt, 'SHA-1');
			}).then(function (generatedKey) {
				key = generatedKey;
				return amaretti.getSalt();
			}).then(function (generatedNonce) {
				nonce = generatedNonce;
				return amarettiSjcl.encrypt(key, m, nonce);
			}).then(function (generatedCrypted) {
				crypted = generatedCrypted;
				return amarettiSjcl.decrypt(key, crypted, nonce);
			}).then(function (decrypted) {
				expect(decrypted).toEqual(m);
				expect(salt).not.toBe(undefined);
				expect(salt).not.toBe('');
				expect(key).not.toBe(undefined);
				expect(key).not.toBe('');
				expect(nonce).not.toBe(undefined);
				expect(nonce).not.toBe('');
				done();
			});
		});

		it('should encrypt using native implementation with sjcl key', function (done) {
	
			var m = 'Lorem ipsum dolor sit amet, consectetur adipiscing';
			m += 'elit, sed do eiusmod tempor ut et dolore magna aliqua.';
			m += 'Ut enim ad minim veniam, quis nostrud ullamco laboris nisi';
			m += 'ut aliquip ex ea commodo conseq irure dolor in reprehenderit';
			m += 'in voluptate velit esse eu fugiat nulla pariatur. Excepteur';
			m += 'sint occaecat cupidatat, sunt in culpa qui officia deserunt';
			m += 'mollit anim id est laborum';

			var salt, key, nonce, crypted;
			amaretti.getSalt().then(function (generatedSalt) {
				salt = generatedSalt;
				return amaretti.generateKey('oneunittest', salt, 'SHA-1');
			}).then(function (generatedKey) {
				key = generatedKey;
				return amarettiSjcl.getSalt();
			}).then(function (generatedNonce) {
				nonce = generatedNonce;
				return amaretti.encrypt(key, m, nonce);
			}).then(function (generatedCrypted) {
				crypted = generatedCrypted;
				return amaretti.decrypt(key, crypted, nonce);
			}).then(function (decrypted) {
				expect(decrypted).toEqual(m);
				expect(salt).not.toBe(undefined);
				expect(salt).not.toBe('');
				expect(key).not.toBe(undefined);
				expect(key).not.toBe('');
				expect(nonce).not.toBe(undefined);
				expect(nonce).not.toBe('');
				done();
			});
		});

		it('should native decrypt a message encrypted from sjcl lib', function (done) {
	
			var m = 'Lorem ipsum dolor sit amet, consectetur adipiscing';
			m += 'elit, sed do eiusmod tempor ut et dolore magna aliqua.';
			m += 'Ut enim ad minim veniam, quis nostrud ullamco laboris nisi';
			m += 'ut aliquip ex ea commodo conseq irure dolor in reprehenderit';
			m += 'in voluptate velit esse eu fugiat nulla pariatur. Excepteur';
			m += 'sint occaecat cupidatat, sunt in culpa qui officia deserunt';
			m += 'mollit anim id est laborum';

			var salt, key, nonce, crypted;
			amaretti.getSalt().then(function (generatedSalt) {
				salt = generatedSalt;
				return amaretti.generateKey('oneunittest', salt, 'SHA-1');
			}).then(function (generatedKey) {
				key = generatedKey;
				return amaretti.getSalt();
			}).then(function (generatedNonce) {
				nonce = generatedNonce;
				return amarettiSjcl.encrypt(key, m, nonce);
			}).then(function (generatedCrypted) {
				crypted = generatedCrypted;
				return amaretti.decrypt(key, crypted, nonce);
			}).then(function (decrypted) {
				expect(decrypted).toEqual(m);
				expect(salt).not.toBe(undefined);
				expect(salt).not.toBe('');
				expect(key).not.toBe(undefined);
				expect(key).not.toBe('');
				expect(nonce).not.toBe(undefined);
				expect(nonce).not.toBe('');
				done();
			});
		});

		it('should sjcl decrypt a message encrypted from native implementation', function (done) {
	
			var m = 'Lorem ipsum dolor sit amet, consectetur adipiscing';
			m += 'elit, sed do eiusmod tempor ut et dolore magna aliqua.';
			m += 'Ut enim ad minim veniam, quis nostrud ullamco laboris nisi';
			m += 'ut aliquip ex ea commodo conseq irure dolor in reprehenderit';
			m += 'in voluptate velit esse eu fugiat nulla pariatur. Excepteur';
			m += 'sint occaecat cupidatat, sunt in culpa qui officia deserunt';
			m += 'mollit anim id est laborum';

			var salt, key, nonce, crypted;
			amaretti.getSalt().then(function (generatedSalt) {
				salt = generatedSalt;
				return amaretti.generateKey('oneunittest', salt, 'SHA-1');
			}).then(function (generatedKey) {
				key = generatedKey;
				return amaretti.getSalt();
			}).then(function (generatedNonce) {
				nonce = generatedNonce;
				return amaretti.encrypt(key, m, nonce);
			}).then(function (generatedCrypted) {
				crypted = generatedCrypted;
				return amarettiSjcl.decrypt(key, crypted, nonce);
			}).then(function (decrypted) {
				expect(decrypted).toEqual(m);
				expect(salt).not.toBe(undefined);
				expect(salt).not.toBe('');
				expect(key).not.toBe(undefined);
				expect(key).not.toBe('');
				expect(nonce).not.toBe(undefined);
				expect(nonce).not.toBe('');
				done();
			});
		});
	});
});

	
