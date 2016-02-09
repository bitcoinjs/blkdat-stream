var through = require('through')

module.exports = function BlkDatStream (blkMagicInt) {
  if (blkMagicInt === undefined) blkMagicInt = 0xd9b4bef9

  var buffers = []
  var buffer = new Buffer(0)

  var blockLength
  var remaining = 0
  var needed = 0

  return through(function write (data) {
    remaining += data.length
    buffers.push(data)

    // early exit if we have a header, but not enough data
    if (needed !== 0 && remaining < needed) return

    // merge buffers
    buffer = Buffer.concat([buffer].concat(buffers), remaining)
    buffers = []

    do {
      // do we need to parse a magic header?
      if (needed === 0) {
        // do we have enough for a magic header?
        if (remaining < 8) break

        // read magic number from the magic header
        var magicInt = buffer.readUInt32LE(0)
        if (magicInt !== blkMagicInt) throw new Error('Unexpected data')

        // read block length from the magic header
        blockLength = buffer.readUInt32LE(4)

        // include the magic header
        needed = 8 + blockLength

        // and loop
        continue
      }

      // read the block
      var block = buffer.slice(8, needed)

      // process block
      this.queue(block)

      // update stream information
      buffer = buffer.slice(needed)
      remaining = buffer.length
      needed = 0

    // do we [still] have enough data?
    } while (remaining >= needed)
  })
}
