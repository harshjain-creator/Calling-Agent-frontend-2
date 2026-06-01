import { useTheme } from '@/contexts/ThemeContext'
import { COMPANY } from '@/config'

/**
 * Brand logo — theme aware.
 * Light mode → blue FI DIGITAL mark. Dark mode → white mark.
 */
export default function Logo({ className = 'h-7 w-auto object-contain' }) {
  const { theme } = useTheme()
  const src = theme === 'dark' ? '/fidigital-logo-white.png' : '/fidigital-logo.png'
  return <img src={src} alt={COMPANY.name} className={className} />
}
