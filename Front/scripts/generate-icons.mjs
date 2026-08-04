/**
 * Draws the application icons and writes them as PNG files.
 *
 * Everything is done by hand: a small rasteriser and a minimal PNG encoder on top of zlib.
 * No image library is pulled in, and the icons are regenerated with `npm run icons`.
 */

import { deflateSync, crc32 } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(here, '..', 'public')

// ---------- PNG encoding ----------

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)

  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body) >>> 0, 0)

  return Buffer.concat([length, body, crc])
}

function encodePng(width, height, pixels) {
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)

  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0 // filter: none
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }

  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8 // bit depth
  header[9] = 6 // truecolour with alpha
  header[10] = 0
  header[11] = 0
  header[12] = 0

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// ---------- Tiny rasteriser ----------

function createCanvas(size) {
  return { size, pixels: Buffer.alloc(size * size * 4) }
}

function blend(canvas, x, y, [r, g, b], alpha) {
  if (alpha <= 0 || x < 0 || y < 0 || x >= canvas.size || y >= canvas.size) {
    return
  }

  const index = (y * canvas.size + x) * 4
  const existing = canvas.pixels[index + 3] / 255
  const out = alpha + existing * (1 - alpha)

  if (out <= 0) {
    return
  }

  for (let channel = 0; channel < 3; channel++) {
    const previous = canvas.pixels[index + channel]
    canvas.pixels[index + channel] = Math.round((([r, g, b][channel] * alpha) + previous * existing * (1 - alpha)) / out)
  }

  canvas.pixels[index + 3] = Math.round(out * 255)
}

/** Anti-aliased coverage of a signed distance: 1 inside, 0 outside, smooth on the edge. */
function coverage(distance) {
  return Math.min(1, Math.max(0, 0.5 - distance))
}

function fillShape(canvas, distanceOf, colourOf, alpha = 1) {
  for (let y = 0; y < canvas.size; y++) {
    for (let x = 0; x < canvas.size; x++) {
      const cover = coverage(distanceOf(x + 0.5, y + 0.5))

      if (cover > 0) {
        blend(canvas, x, y, colourOf(x + 0.5, y + 0.5), cover * alpha)
      }
    }
  }
}

const roundedSquare = (size, radius, inset) => (x, y) => {
  const dx = Math.max(Math.abs(x - size / 2) - (size / 2 - inset - radius), 0)
  const dy = Math.max(Math.abs(y - size / 2) - (size / 2 - inset - radius), 0)

  return Math.hypot(dx, dy) - radius
}

const circle = (cx, cy, r) => (x, y) => Math.hypot(x - cx, y - cy) - r

const mix = (a, b, t) => a.map((value, index) => Math.round(value + (b[index] - value) * t))

// ---------- The icon ----------

function drawIcon(size, padding) {
  const canvas = createCanvas(size)
  const unit = size / 100
  const inset = padding * unit
  const usable = size - inset * 2
  const centre = size / 2

  // Board: rounded square with a vertical gradient.
  const top = [42, 138, 92]
  const bottom = [15, 74, 47]
  fillShape(
    canvas,
    roundedSquare(size, usable * 0.22, inset),
    (_, y) => mix(top, bottom, (y - inset) / usable),
  )

  // Grid lines.
  const lineColour = [10, 52, 33]
  for (let i = 1; i < 4; i++) {
    const at = inset + (usable * i) / 4
    const thickness = Math.max(1, unit * 0.7)

    fillShape(canvas, (x, y) => Math.abs(y - at) - thickness / 2 + Math.max(0, Math.abs(x - centre) - usable / 2) * 8, () => lineColour, 0.5)
    fillShape(canvas, (x, y) => Math.abs(x - at) - thickness / 2 + Math.max(0, Math.abs(y - centre) - usable / 2) * 8, () => lineColour, 0.5)
  }

  // The disc, caught mid-flip: black on the left, white on the right.
  const discRadius = usable * 0.3
  fillShape(canvas, circle(centre, centre + usable * 0.06, discRadius), (x) =>
    x < centre ? [17, 17, 17] : [245, 248, 245],
  )
  fillShape(
    canvas,
    (x, y) => Math.abs(Math.hypot(x - centre, y - centre - usable * 0.06) - discRadius) - unit * 0.8,
    () => [8, 32, 22],
    0.85,
  )

  // Crown above it: the corner that can never be taken back.
  const crownWidth = usable * 0.36
  const crownHeight = usable * 0.2
  const crownTop = centre + usable * 0.06 - discRadius - crownHeight * 0.72
  const gold = [242, 201, 76]

  fillShape(
    canvas,
    (x, y) => {
      const localX = (x - (centre - crownWidth / 2)) / crownWidth
      const localY = (y - crownTop) / crownHeight

      if (localX < 0 || localX > 1 || localY < 0 || localY > 1) {
        return 1
      }

      // Three peaks: the silhouette is the area under a triangular wave.
      const wave = Math.abs(((localX * 3) % 1) - 0.5) * 2
      const ceiling = localX > 0.34 && localX < 0.66 ? wave * 0.72 : wave * 0.45 + 0.18

      return localY < ceiling ? 1 : -1
    },
    () => gold,
  )

  fillShape(canvas, circle(centre, crownTop + crownHeight * 0.8, unit * 2.4), () => [226, 87, 76])

  return canvas
}

function write(name, size, padding) {
  const canvas = drawIcon(size, padding)
  const file = resolve(publicDir, name)

  mkdirSync(publicDir, { recursive: true })
  writeFileSync(file, encodePng(size, size, canvas.pixels))

  console.log(`${name}  ${size}x${size}`)
}

write('icon-192.png', 192, 4)
write('icon-512.png', 512, 4)
write('icon-maskable-512.png', 512, 14)
write('apple-touch-icon.png', 180, 0)
