'use strict'

describe('encryption features', function () {

	var amaretti;

	beforeEach(function () {
		amaretti = Amaretti.init({
			enableNative: true
		});
		sjcl.random.startCollectors();
	});

	describe('Use native functions', function() {

		var importKeyIsCalled = false,
			encryptIsCalled = false;

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
						encrypt: function(key, message, nonce) {
							encryptIsCalled = true;
							return new Promise(function(resolve, reject) {
								resolve(new ArrayBuffer(12));
							});
						}
					}
				};
			});
			spyOn(sjcl.mode.gcm,'encrypt');
		});

		it('should use crypto.subtle.importKey if available', function (done) {
	
			var test = amaretti.encrypt('key', 'message', 'nonce').then(function(key) {
				expect(importKeyIsCalled).toBe(true);
				expect(encryptIsCalled).toBe(true);
				expect(sjcl.mode.gcm.encrypt).not.toHaveBeenCalled();
				done();
			}, function (error) {
				console.log('error', error);
				expect(error).toBe(false);
				done()
			});			
		});
	});

	describe('use SJCL lib if native function is not available', function(done) {

		var importKeyIsCalled = false,
			encryptIsCalled = false;

		beforeEach(function () {
			spyOn(sjcl.mode.gcm, 'encrypt').and.callFake(function() {
				return 'crypted';
			});

			spyOn(sjcl.cipher, 'aes').and.callFake(function() {
				return 'aesKey';
			});
			spyOn(sjcl.codec.base64, 'toBits').and.callFake(function () {
				return [4242];
			})
		});

		it('should use sjcl.mode.gcm.encrypt if there is not web crypto api', function (done) {

			amaretti.paranoia = 0;
			spyOn(amaretti, 'getCrypto').and.callFake(function() {
				return undefined;
			});

			var test = amaretti.encrypt('key', 'message', 'nonce').then(function(key) {
				expect(importKeyIsCalled).toBe(false);
				expect(encryptIsCalled).toBe(false);
				expect(sjcl.mode.gcm.encrypt).toHaveBeenCalled();
				done();
			}, function(error) {
				expect(error).toBe('');
				done();
			});
		});

		it('should use sjcl.mode.gcm.encrypt if there is not web crypto api but no importKey', function (done) {

			amaretti.paranoia = 0;
			spyOn(amaretti, 'getCrypto').and.callFake(function() {
				return {
					subtle: {
						importKey: undefined,
						encrypt: function() {
							deriveKeyIsCalled = true;
							return new Promise(function(resolve, reject) {
								resolve(true);
							});
						}
					}
				};
			});

			var test = amaretti.encrypt('key', 'message', 'nonce').then(function(key) {
				expect(importKeyIsCalled).toBe(false);
				expect(encryptIsCalled).toBe(false);
				expect(sjcl.mode.gcm.encrypt).toHaveBeenCalled();
				done();
			}, function(error) {
				expect(error).toBe(false);
				done();
			});
		});

		it('should use sjcl.mode.gcm.encrypt if there is not web crypto api but no encrypt api', function (done) {

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
						encrypt: undefined
					}
				};
			});

			var test = amaretti.encrypt('key', 'message', 'nonce').then(function(key) {
				expect(importKeyIsCalled).toBe(false);
				expect(encryptIsCalled).toBe(false);
				expect(sjcl.mode.gcm.encrypt).toHaveBeenCalled();done();
			}, function(error) {
				expect(error).toBe(false);
				done();
			});
		});
	});
});
