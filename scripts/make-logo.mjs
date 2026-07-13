// Rasteriza el logo SVG a los PNG que necesita la app:
//   public/logo.png       → logo para la UI (header, carga, certificado)
//   assets/icon.png       → ícono del launcher (logo centrado sobre fondo oscuro)
//   assets/splash.png     → splash de carga
// Luego: npx capacitor-assets generate --android

import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const SVG = 'C:/Users/Jonathan Lobo/Downloads/logo_codalia.svg'
const BLUE = '#2563EB' // rellena las esquinas redondeadas → ícono azul sólido (sin oscuro)
const DARK = '#0F172A'

const svg = readFileSync(SVG)
mkdirSync(join(root, 'public'), { recursive: true })
mkdirSync(join(root, 'assets'), { recursive: true })

// 1) Logo para la UI (512). El azul llena todo (sin transparencia en esquinas);
//    el componente <Logo> lo recorta en círculo con CSS.
await sharp(svg, { density: 320 })
  .resize(512, 512, { fit: 'cover', position: 'center' })
  .flatten({ background: BLUE })
  .png()
  .toFile(join(root, 'public', 'logo.png'))

// 2) Ícono del launcher (1024): el azul llena el marco, sin fondo oscuro.
//    El launcher lo enmascara en círculo → ícono completamente redondo y azul.
await sharp(svg, { density: 320 })
  .resize(1024, 1024, { fit: 'cover', position: 'center' })
  .flatten({ background: BLUE })
  .png()
  .toFile(join(root, 'assets', 'icon.png'))

// 3) Splash: logo centrado sobre fondo oscuro de la app (2732)
const logoSplash = await sharp(svg, { density: 320 })
  .resize(520, 520, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png().toBuffer()

await sharp({ create: { width: 2732, height: 2732, channels: 4, background: DARK } })
  .composite([{ input: logoSplash, gravity: 'center' }])
  .png()
  .toFile(join(root, 'assets', 'splash.png'))

console.log('Logos generados: public/logo.png, assets/icon.png, assets/splash.png')
