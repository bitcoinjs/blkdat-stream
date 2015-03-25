var through = require('through')

module.exports = function BlkDatStream() {
  var buffers = []
  var buffer = new Buffer(0)
  var remaining = 0
  var needed = 0

  return through(function write(data) {
    remaining += data.length
    buffers.push(data)

    // early exit if we have a header, but not enough data
    if (needed !== 0 && remaining < needed) return

    // merge buffers
    buffer = Buffer.concat([buffer].concat(buffers), remaining)
    buffers = []

    var offset = 0

    // do we [still] have enough data?
    while (remaining >= needed) {
      // do we need to parse a magic header?
      if (needed === 0) {
        // do we have enough for a magic header?
        if (remaining < 8) break

        // read the magic header (magic number, block length)
        var magicInt = buffer.readUInt32LE(0)
        var blockLength = buffer.readUInt32LE(4)

        if (magicInt !== 0xd9b4bef9) {
          throw new Error('Unexpected data')
        }

        // now, block length is what is needed
        needed = blockLength
        remaining -= 8
        offset = 8

        // and loop
        continue
      }

      // read the block
      var block = buffer.slice(offset, offset + needed)

      // process block
      this.queue(block)

      // update cursor information
      buffer = buffer.slice(offset + needed)
      remaining -= needed
      needed = 0
    }

    // truncate Buffer if magic header was read
    if (needed !== 0) {
      buffer = buffer.slice(offset)
      remaining = buffer.length
    }
  })
}
