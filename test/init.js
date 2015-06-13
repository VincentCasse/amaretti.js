'use strict'

describe('Salt features', function () {

	var amaretti;

	beforeEach(function () {
		amaretti = Amaretti.init();
	});

	it('should be configured', function() {
		expect(amaretti.authTagLength).toBe(128);
		expect(amaretti.authTagUsedSpace).toBe(32);
	});

	it('sjcl should start collector and entropy is good', function() {
		expect(sjcl.random.isReady()).toBeGreaterThan(false);
	});

});