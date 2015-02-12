module.exports = config:
	paths:
		 watched:
		 	['app']
	files:
		javascripts: 
			joinTo: 
				'vendor.js': /^bower_components/
				'amaretti.js': /^app/
	plugins:
    	jshint:
      		pattern: /^app\/.*\.js$/
      		options:
        		bitwise: false
        		curly: true
        		node: true
      		globals:
        		jQuery: true
        		window: true
        		global: true
        		btoa: true
        		Uint8Array: true
        		require: true
        		console: true
        		module: true
        		Promise: true
        		TextDecoder: true
        		TextEncoder: true
        		sjcl: true
      		warnOnly: true
