# Amaretti.js

[![Join the chat at https://gitter.im/VincentCasse/amaretti.js](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/VincentCasse/amaretti.js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](https://travis-ci.org/VincentCasse/amaretti.js.svg)](https://travis-ci.org/VincentCasse/amaretti.js.svg)
[![Coverage Status](https://coveralls.io/repos/VincentCasse/amaretti.js/badge.svg?branch=master&service=github)](https://coveralls.io/github/VincentCasse/amaretti.js?branch=master)

Amaretti.js is a library to encrypt and decrypt message into the browser. They use native implementation (WebCrypto APIs) when available, or SJCL library when not.

## Getting started

### Installation

This library can be installed with npm or bower, as you prefer:

```bash
bower install amaretti
```

```bash
npm install amaretti
```

### How to use it

Just import the javascript file and require the library. Require system is included into amaretti library

```html
<script src="public/vendor.js"></script>
<script src="public/amaretti.js"></script>
var Amaretti = require('amaretti').init();
```

### Generate a salt

Salt are used into key generation and to randomize the encryption of a message. You can get a base64 salt using this `Amaretti.getSalt()`

```javascript
Amaretti.getSalt().then(function(salt) {
	// Manipulate your salt
}, function (error) {
	// There was an error
});
```

### Generate a key

To encrypt or decrypt messages, you need to use a key. You can generate a key usable with a passphrase (like a password). Key generated is returned as base64. To randomize the generation, you need to give a salt and a hash algorithm

```javascript
Amaretti.generateKey(passphrase, salt, hash).then(function(key) {
	// Manipulate your key
}, function (error) {
	// There was an error
});
```
 * __passphrase__: is the passphrase used to encrypt or decrypt messages
 * __salt__: is the salt, base64 encoded, used to randomize the key generator
 * __hash__: is the name of algorithm used to hash the key. It could be _SHA-1_ or _SHA-256_

### Encrypt a message

You can encrypt a message with your key. Amaretti use AES-GCM to encrypt data. To avoid brut-force attack agains the encrypted data, each data had to be encrypt with a different and random nonce. You can use a salt as nonce. Don't lose this nonce, you will need it to decrypt the message.

```javascript
Amaretti.encrypt(key, message, nonce).then(function(encrypted) {
	// Manipulate your encrypted message
}, function (error) {
	// There was an error
});
```
 * __key__: is the base64 used to encrypt message
 * __message__: is the message to encrypt
 * __nonce__: is a random value, in base64 format, use to avoid attacks

### Decrypt a message

```javascript
Amaretti..decrypt(key, encrypted, nonce).then(function(decrypted) {
	// Manipulate your encrypted message
}, function (error) {
	// There was an error
});
```

 * __key__: is the base64 used to encrypt message
 * __encrypted: is the encrypted message to decrypt, in base64 format
 * __nonce__: is a random value, in base64 format, use to avoid attacks

## License

MIT

## How to contribute

Hum ... on github :)

### To build library

```bash
npm install
bower install
brunch build
```

### To run tests

```bash
npm run test
```

## Ideas for a roadmap

* Return key and crypted data with JOSE standard (JWE and JWT)
* Check sha-256 for firefox and sha-1 for SJCL ito key generation
