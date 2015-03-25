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
    var remaining = len

    // do we [still] have enough data?
    while (remaining >= needed) {
      // do we need to parse a magic header?
      if (needed === 0) {
        // do we have a magic header?
        if (remaining < 8) break

        // read the magic byte / block length
        var magicByte = buffer.readUInt32LE(offset)
        var blockLength = buffer.readUInt32LE(offset + 4)

        if (magicByte !== 0xd9b4bef9) {
          throw new Error('Unexpected data')
        }

        // now, block length is needed
        needed = blockLength
        remaining -= 8
        offset += 8

        // now loop
        continue
      }

      var block = buffer.slice(offset, offset + needed)
      offset += needed
      remaining -= needed
      needed = 0

      // process block
      buffer = buffer.slice(offset)
      len = buffer.length
      offset = 0

      this.queue(block)
    }

    // reset buffer
    buffer = buffer.slice(offset)
    len = buffer.length
  })
}
