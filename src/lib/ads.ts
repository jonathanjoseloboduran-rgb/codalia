// Banner de AdMob para usuarios free. Premium = sin anuncios.
// Usa IDs de PRUEBA de Google (seguros). Cambiar por los reales antes de publicar.

import { AdMob, BannerAdPosition, BannerAdSize, BannerAdPluginEvents } from '@capacitor-community/admob'
import { Capacitor } from '@capacitor/core'

// ⚠️ IDs de PRUEBA. Reemplazar por los de tu cuenta AdMob antes de publicar.
const BANNER_AD_ID = 'ca-app-pub-3940256099942544/6300978111'

let initialized = false
let visible = false

function setAdHeight(px: number) {
  document.documentElement.style.setProperty('--ad-height', px > 0 ? `${px}px` : '0px')
}

export async function showAdBanner(): Promise<void> {
  if (Capacitor.getPlatform() !== 'android') return
  try {
    if (!initialized) {
      await AdMob.initialize({ initializeForTesting: true })
      // El banner empuja el contenido: guardamos su altura en una CSS var
      AdMob.addListener(BannerAdPluginEvents.SizeChanged, (info) => {
        setAdHeight(info?.height ?? 0)
      })
      initialized = true
    }
    if (visible) return
    await AdMob.showBanner({
      adId: BANNER_AD_ID,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: true,
    })
    visible = true
  } catch {
    // en web o si falla, no pasa nada
  }
}

export async function hideAdBanner(): Promise<void> {
  if (!visible) return
  try { await AdMob.removeBanner() } catch { /* noop */ }
  visible = false
  setAdHeight(0)
}
