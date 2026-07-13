import logo from '@/assets/logo.png'

// Logo de Codalia. Importado como asset para que Vite resuelva bien la ruta
// dentro del APK (file://).
export function Logo({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <img
      src={logo}
      width={size}
      height={size}
      alt="Codalia"
      className={`rounded-full ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
