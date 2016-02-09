# blkdat-stream

[![Version](http://img.shields.io/npm/v/blkdat-stream.svg)](https://www.npmjs.org/package/blkdat-stream)

A lite blk\*.dat streaming module, useful for parsing the Bitcoin blockchain

**Note**: For a high performance C++ parser, see https://github.com/dcousens/fast-dat-parser


### Example

``` javascript
// usage: cat blk*.dat | node this.js

var BlockStream = require('blkdat-stream')
var blockStream = new BlockStream() // for testnet3: new BlockStream(0x0709110b)

process.stdin.pipe(new BlockStream()).on('data', function (blockBuffer) {
	// ... now, parse the block data buffer (is an atomic block)
})
```

To parse the returned block data, use a library such as [bitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib) or [bitcore](https://github.com/bitpay/bitcore).
