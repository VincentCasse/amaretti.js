'use strict'

describe('Generation key features', function () {

	var amaretti;

	describe('Check configuration', function () {
		
		beforeEach(function () {
			
		});

		it ('should be configure iteration number', function () {
			var iterations = 42;

			amaretti = require('amaretti').init({
				iterations: iterations,
				enableNative: true
			});

			expect(amaretti.iterations).toEqual(iterations);
		});

	});

	var customIterations = 42;

	beforeEach(function () {
		amaretti = require('amaretti').init({
			iterations: customIterations
		});
		sjcl.random.startCollectors();
	});

	describe('Use native functions', function() {

		var importKeyIsCalled = false,
			deriveKeyIsCalled = false,
			exportKeyIsCalled = false;

		beforeEach(function () {
			spyOn(amaretti, 'getCrypto').and.callFake(function() {
				return {
					subtle: {
						importKey: function (type, pass, name) {
							importKeyIsCalled = true;
							expect(name.name).toEqual('PBKDF2');						
							return new Promise(function(resolve, reject) {
								resolve(true);
							});
						}, 
						deriveKey: function(opts) {
							deriveKeyIsCalled = true;
							expect(opts.name).toEqual('PBKDF2');
							expect(opts.hash).toEqual('SHA-1');
							expect(opts.iterations).toEqual(customIterations);
							return new Promise(function(resolve, reject) {
								resolve('true');
							});
						},
						exportKey: function() {
							exportKeyIsCalled = true;
							return new Promise(function(resolve, reject) {
								resolve(new ArrayBuffer('test'));
							});
						}
					}
				};
			});
			spyOn(sjcl.misc,'pbkdf2');
		});

		it('should use crypto.subtle.importKey if available', function (done) {
	
			var test = amaretti.generateKey('pass', 'salt', 'SHA-1').then(function(key) {
				expect(importKeyIsCalled).toBe(true);
				expect(deriveKeyIsCalled).toBe(true);
				expect(exportKeyIsCalled).toBe(true);
				expect(sjcl.misc.pbkdf2).not.toHaveBeenCalled();
				done();
			}, function (error) {
				expect(error).toBe(false);
				done()
			});			
		});
	});

	describe('use SJCL lib if native function is not available', function(done) {

		var importKeyIsCalled = false,
			deriveKeyIsCalled = false,
			exportKeyIsCalled = false;

		beforeEach(function () {
			spyOn(sjcl.misc, 'pbkdf2').and.callFake(function() {
				return 'crypted';
			});
		});

		it('should use sjcl.misc.pbkdf2 if there is not web crypto api', function (done) {

			amaretti.paranoia = 0;
			spyOn(amaretti, 'getCrypto').and.callFake(function() {
				return undefined;
			});

			var test = amaretti.generateKey('pass', 'salt', 'SHA-1').then(function(key) {
				expect(importKeyIsCalled).toBe(false);
				expect(deriveKeyIsCalled).toBe(false);
				expect(sjcl.misc.pbkdf2).toHaveBeenCalled();
				done();
			}, function(error) {
				expect(error).toBe('');
				done();
			});
		});

		it('should use sjcl.misc.pbkdf2 if there is not web crypto api but no importKey', function (done) {

			amaretti.paranoia = 0;
			spyOn(amaretti, 'getCrypto').and.callFake(function() {
				return {
					subtle: {
						importKey: undefined,
						deriveKey: function(opts) {
							deriveKeyIsCalled = true;
							expect(opts.name).toEqual('PBKDF2');
							expect(opts.hash).toEqual('SHA-1');
							expect(opts.iterations).toEqual(customIterations);
							return new Promise(function(resolve, reject) {
								resolve(true);
							});
						},
						exportKey: undefined,
					}
				};
			});

			var test = amaretti.generateKey('pass', 'salt', 'SHA-1').then(function(key) {
				expect(importKeyIsCalled).toBe(false);
				expect(deriveKeyIsCalled).toBe(false);
				expect(exportKeyIsCalled).toBe(false);
				expect(sjcl.misc.pbkdf2).toHaveBeenCalled();
				done();
			}, function(error) {
				expect(error).toBe(false);
				done();
			});
		});

		it('should use sjcl.misc.pbkdf2 if there is not web crypto api but no deriveKey', function (done) {

			amaretti.paranoia = 0;
			spyOn(amaretti, 'getCrypto').and.callFake(function() {
				return {
					subtle: {
						importKey: function (type, pass, name) {
							importKeyIsCalled = true;
							expect(name.name).toEqual('PBKDF2');							
							return new Promise(function(resolve, reject) {
								resolve(true);
							});
						}, 
						deriveKey: undefined,
						exportKey: undefined,
					}
				};
			});

			spyOn(sjcl.codec.base64, 'toBits').and.callFake(function() {
				return [4242];
			});

			var test = amaretti.generateKey('pass', 'salt', 'SHA-1').then(function(key) {
				expect(importKeyIsCalled).toBe(false);
				expect(deriveKeyIsCalled).toBe(false);
				expect(exportKeyIsCalled).toBe(false);
				expect(sjcl.misc.pbkdf2).toHaveBeenCalled();
				done();
			}, function(error) {
				expect(error).toBe(false);
				done();
			});
		});

		it('should use sjcl.misc.pbkdf2 if there is not web crypto api but no exportKey', function (done) {

			amaretti.paranoia = 0;
			spyOn(amaretti, 'getCrypto').and.callFake(function() {
				return {
					subtle: {
						importKey: undefined,
						deriveKey: undefined,
						exportKey: function() {
							exportKeyIsCalled = true;
						},
					}
				};
			});

			var test = amaretti.generateKey('pass', 'salt', 'SHA-1').then(function(key) {
				expect(importKeyIsCalled).toBe(false);
				expect(deriveKeyIsCalled).toBe(false);
				expect(exportKeyIsCalled).toBe(false);
				expect(sjcl.misc.pbkdf2).toHaveBeenCalled();
				done();
			}, function(error) {
				expect(error).toBe(false);
				done();
			});
		});
	});
});
