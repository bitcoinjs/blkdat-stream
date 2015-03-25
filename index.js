var through = require('through')

module.exports = function BlkDatStream() {
  var buffers = []
  var buffer = new Buffer(0)
  var len = 0
  var needed = 0

  return through(function write(data) {
    len += data.length
    buffers.push(data)

    // do we have a header? and do we have enough data?
    if (needed !== 0 && len < needed) return

    // merge buffers
    buffer = Buffer.concat([buffer].concat(buffers), len)
    buffers = []

    var offset = 0

    // do we [still] have enough data?
    while (len >= needed) {
      // do we need to parse a magic header?
      if (needed === 0) {
        // do we have enough for a magic header?
        if (len < 8) break

        // read the magic header (magic number, block length)
        var magicInt = buffer.readUInt32LE(offset)
        var blockLength = buffer.readUInt32LE(offset + 4)

        if (magicInt !== 0xd9b4bef9) {
          throw new Error('Unexpected data')
        }

        // now, block length is what is needed
        needed = blockLength
        len -= 8
        offset += 8

        // and loop
        continue
      }

      // read the block
      var block = buffer.slice(offset, offset + needed)

      // process block
      this.queue(block)

      // update cursor information
      offset += needed
      len -= needed
      needed = 0
      buffer = buffer.slice(offset)
      offset = 0
    }

    // reset buffer
    buffer = buffer.slice(offset)
    len = buffer.length
  })
}
