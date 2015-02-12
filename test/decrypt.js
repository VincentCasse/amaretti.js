'use strict'

describe('Uncryption features', function () {

	var amaretti;

	beforeEach(function () {
		amaretti = require('amaretti').init({
			enableNative: true
		});
		sjcl.random.startCollectors();
	});

	describe('Use native functions', function() {

		var importKeyIsCalled = false,
			decryptIsCalled = false;

		beforeEach(function () {
			spyOn(amaretti, 'getCrypto').and.callFake(function() {
				return {
					subtle: {
						importKey: function (type, key) {
							importKeyIsCalled = true;					
							return new Promise(function(resolve, reject) {
								resolve(true);
							});
						}, 
						decrypt: function(key, message, nonce) {
							decryptIsCalled = true;
							return new Promise(function(resolve, reject) {
								resolve(new TextEncoder('utf-8').encode('true'));
							});
						}
					}
				};
			});
			spyOn(sjcl.mode.gcm,'decrypt');
		});

		it('should use crypto.subtle.importKey if available', function (done) {
	
			var test = amaretti.decrypt('key', 'message', 'nonce').then(function(key) {
				expect(importKeyIsCalled).toBe(true);
				expect(decryptIsCalled).toBe(true);
				expect(sjcl.mode.gcm.decrypt).not.toHaveBeenCalled();
				done();
			}, function (error) {
				expect(error).toBe(false);
				done()
			});			
		});
	});

	describe('use SJCL lib if native function is not available', function(done) {

		var importKeyIsCalled = false,
			decryptIsCalled = false;

		beforeEach(function () {
			spyOn(sjcl.mode.gcm, 'decrypt').and.callFake(function() {
				return 'crypted';
			});

			spyOn(sjcl.cipher, 'aes').and.callFake(function() {
				return 'aesKey';
			});
			spyOn(sjcl.codec.base64, 'toBits').and.callFake(function () {
				return [4242];
			})
		});

		it('should use sjcl.mode.gcm.decrypt if there is not web crypto api', function (done) {

			amaretti.paranoia = 0;
			spyOn(amaretti, 'getCrypto').and.callFake(function() {
				return undefined;
			});

			var test = amaretti.decrypt('key', 'message', 'nonce').then(function(key) {
				expect(importKeyIsCalled).toBe(false);
				expect(decryptIsCalled).toBe(false);
				expect(sjcl.mode.gcm.decrypt).toHaveBeenCalled();
				done();
			}, function(error) {
				expect(error).toBe('');
				done();
			});
		});

		it('should use sjcl.mode.gcm.decrypt if there is not web crypto api but no importKey', function (done) {

			amaretti.paranoia = 0;
			spyOn(amaretti, 'getCrypto').and.callFake(function() {
				return {
					subtle: {
						importKey: undefined,
						decrypt: function() {
							deriveKeyIsCalled = true;
							return new Promise(function(resolve, reject) {
								resolve(new TextEncoder('utf-8').encode('true'));
							});
						}
					}
				};
			});

			var test = amaretti.decrypt('key', 'message', 'nonce').then(function(key) {
				expect(importKeyIsCalled).toBe(false);
				expect(decryptIsCalled).toBe(false);
				expect(sjcl.mode.gcm.decrypt).toHaveBeenCalled();
				done();
			}, function(error) {
				expect(error).toBe(false);
				done();
			});
		});

		it('should use sjcl.mode.gcm.decrypt if there is not web crypto api but no decrypt api', function (done) {

			amaretti.paranoia = 0;
			spyOn(amaretti, 'getCrypto').and.callFake(function() {
				return {
					subtle: {
						importKey: function (type, pass) {
							importKeyIsCalled = true;						
							return new Promise(function(resolve, reject) {
								resolve(true);
							});
						}, 
						decrypt: undefined
					}
				};
			});

			var test = amaretti.decrypt('key', 'message', 'nonce').then(function(key) {
				expect(importKeyIsCalled).toBe(false);
				expect(decryptIsCalled).toBe(false);
				expect(sjcl.mode.gcm.decrypt).toHaveBeenCalled();done();
			}, function(error) {
				expect(error).toBe(false);
				done();
			});
		});
	});
});
