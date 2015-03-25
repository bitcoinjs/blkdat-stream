var fs = require('fs')
var glob = require('glob')

var CombinedStream = require('combined-stream')
var BlkDatStream = require('../')

glob(process.env.BLOCKS_DIR + '/blk*.dat', function (err, fileNames) {
  if (err) throw err

  var cs = new CombinedStream()

  fileNames.forEach(function(fileName) {
    cs.append(fs.createReadStream(fileName, { mode: '0444' }))
  })

  var bds = new BlkDatStream()
  var j = 0
  bds.on('data', function() {
    console.log('>> Read block (', j, ')')
    j++
  })

  cs.pipe(bds)
})
