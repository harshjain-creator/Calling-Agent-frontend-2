import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LogIn, LogOut, User2 } from 'lucide-react'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import Logo from '@/components/Logo'
import ThemeToggle from '@/components/ThemeToggle'
import LoginModal from '@/components/LoginModal'
import { useAuth } from '@/contexts/AuthContext'
import { COMPANY, NAV_LINKS, CLIENT_NAV_LINKS, SUPER_NAV_LINKS } from '@/config'
import { confirm as swalConfirm, toast } from '@/lib/swal'

function NavItem({ item }) {
  const navigate = useNavigate()
  const { to, label, hash } = item

  // Hash links scroll to a landing section (navigating home first if needed).
  const handleClick = (e) => {
    if (!hash) return
    e.preventDefault()
    const scrollTo = () => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
    if (window.location.pathname !== to) { navigate(to); setTimeout(scrollTo, 120) }
    else scrollTo()
  }

  return (
    <NavLink
      to={hash ? `${to}#${hash}` : to}
      end={to === '/'}
      onClick={handleClick}
      className={({ isActive }) =>
        `relative px-3 py-2 text-sm font-medium transition-colors ${
          isActive && !hash
            ? 'text-[var(--color-accent)]'
            : 'text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {label}
          {isActive && !hash && (
            <motion.span
              layoutId="nav-underline"
              className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-[2px] w-6 rounded-full bg-[var(--color-accent)]"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
        </>
      )}
    </NavLink>
  )
}

/**
 * Minimal header — logo only on the left, theme toggle + login/dashboard on
 * the right. No nav menu (removed by request). Mobile + desktop identical.
 */
export default function Header() {
  const [loginOpen, setLoginOpen] = useState(false)
  const { isAuthed, role, user, logout } = useAuth()
  const navigate = useNavigate()

  // Pick the nav list based on auth state + role
  let activeNavLinks = NAV_LINKS
  if (isAuthed) {
    activeNavLinks = role === 'super_admin' ? SUPER_NAV_LINKS : CLIENT_NAV_LINKS
  }

  async function handleLogout() {
    const ok = await swalConfirm({
      title: 'Log out?',
      text:  'Your session will end. You can sign in again any time.',
      confirmText: 'Log out',
    })
    if (!ok) return
    await logout()
    toast({ icon: 'success', text: 'Logged out' })
    navigate('/')
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 glass border-b border-[var(--color-border)]">
        <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link to="/" className="group inline-flex items-center" aria-label={COMPANY.name}>
            <Logo className="h-9 sm:h-10 w-auto object-contain group-hover:scale-[1.04] transition-transform" />
          </Link>

          {/* Center nav — role-aware */}
          <nav className="hidden md:flex items-center gap-1">
            {activeNavLinks.map(l => <NavItem key={l.label} item={l} />)}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isAuthed ? (
              <>
                <span className="hidden lg:flex items-center gap-1.5 px-2 text-xs text-[var(--color-fg-muted)]">
                  <User2 className="size-3.5" />
                  {user?.email}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="size-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <Button variant="gradient" size="sm" onClick={() => setLoginOpen(true)}>
                <LogIn className="size-4" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  )
}
