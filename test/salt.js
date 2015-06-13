'use strict'

describe('Salt features', function () {

	var amaretti;

	beforeEach(function () {
		amaretti = Amaretti.init({
			enableNative: true
		});
		sjcl.random.startCollectors();

	});

	describe('Use native functions', function() {

		var getRandomValuesIsCalled = false;

		beforeEach(function () {
			spyOn(amaretti, 'getCrypto').and.callFake(function() {
				return {
					getRandomValues: function (array) {
						getRandomValuesIsCalled = true;
						return array;
					}
				};
			});
			spyOn(sjcl.random,'randomWords');
		});

		it('should use crypto.getRandomValues is available', function (done) {
	
			var test = amaretti.getSalt().then(function(salt) {
				expect(getRandomValuesIsCalled).toBe(true);
				expect(sjcl.random.randomWords).not.toHaveBeenCalled();
				done();
			}, function(error) {
				expect(error).toBe(false);
				done();
			});			
		});
	});

	describe('use SJCL lib if native function is not available', function(done) {

		var getRandomValuesIsCalled = false;

		beforeEach(function () {
			amaretti.paranoia = 0;
			spyOn(amaretti, 'getCrypto').and.callFake(function() {
				return undefined;
			});
			spyOn(sjcl.random, 'randomWords').and.callThrough();
		});

		it('should use jcl.random.randomWords', function (done) {
			var test = amaretti.getSalt().then(function(salt) {
				expect(getRandomValuesIsCalled).toBe(false);
				expect(sjcl.random.randomWords).toHaveBeenCalled();
				done();
			}, function(error) {
				expect(error).toBe(false);
				done();
			});
		});
	});
});
