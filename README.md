# blkdat-stream

[![Version](http://img.shields.io/npm/v/blkdat-stream.svg)](https://www.npmjs.org/package/blkdat-stream)

A lite blk\*.dat streaming module, useful for parsing the Bitcoin blockchain


### Example

``` javascript

var fs = require('fs')
var glob = require('glob')

var CombinedStream = require('combined-stream')
var BlkDatStream = require('blkdat-stream')

glob(process.env.BLOCKS_DIR + '/blk*.dat', function (err, fileNames) {
  if (err) throw err

  var cs = new CombinedStream()

  fileNames.forEach(function(fileName) {
    cs.append(fs.createReadStream(fileName, { mode: '0444' }))
  })

  var bds = new BlkDatStream()
  var j = 0
  bds.on('data', function(blockData) {
    console.log('>> Read block (', j, ')')
    j++

    // ... now, parse the block data buffer
  })

  cs.pipe(bds)
})
```

To parse the returned block data, use a library such as [bitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib) or [bitcore](https://github.com/bitpay/bitcore)
