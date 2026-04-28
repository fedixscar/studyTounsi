import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Upload, Dumbbell, LogOut, Sparkles, Menu, X } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { TunisCoursBrand } from './Logo'

const NAV_ITEMS = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/upload',     icon: Upload,           label: 'Analyser un cours' },
  { to: '/exercises',  icon: Dumbbell,         label: 'Devoirs' },
]

const SIDEBAR_WIDTH = 240

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Déconnecté avec succès')
    navigate('/login')
  }

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '24px 16px 12px', flexShrink: 0 }}>
        <TunisCoursBrand logoSize={34} />
      </div>

      <div style={{ margin: '16px 12px 14px', height: 2, borderRadius: 999, background: 'linear-gradient(90deg, var(--color-primary) 50%, var(--color-navy) 50%)', flexShrink: 0 }} />

      <nav style={{ flex: 1, padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '12px 8px 16px', flexShrink: 0 }}>
        <div className="glass-card" style={{ padding: '10px 14px', marginBottom: 6 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
        </div>
        <button onClick={handleLogout} className="nav-item" style={{ color: 'var(--color-danger)', width: '100%' }}>
          <LogOut size={15} /> Déconnexion
        </button>
      </div>
    </div>
  )

  return (
    <>
      <div className="bg-orb" style={{ width: 500, height: 500, top: -150, left: -100, background: 'rgba(231,0,19,0.06)' }} />
      <div className="bg-orb" style={{ width: 350, height: 350, bottom: 50, right: -50, background: 'rgba(26,43,107,0.12)' }} />

      <div style={{ display: 'flex', minHeight: '100dvh', background: 'var(--bg-primary)' }}>

        <aside
          className="hide-mobile"
          style={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            height: '100dvh',
            overflowY: 'auto',
            zIndex: 20,
            background: 'rgba(13,18,48,0.92)',
            borderRight: '1px solid var(--border)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <SidebarContent />
        </aside>

        <div
          className="hide-desktop"
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0,
            height: 60,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            background: 'rgba(7,9,26,0.96)',
            borderBottom: '1px solid var(--border)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <TunisCoursBrand logoSize={30} />
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="btn btn-secondary btn-sm"
            style={{ padding: 8, minHeight: 'unset' }}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {mobileOpen && (
          <>
            <div
              className="hide-desktop"
              style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              onClick={() => setMobileOpen(false)}
            />
            <aside
              className="hide-desktop"
              style={{
                position: 'fixed',
                left: 0, top: 0, bottom: 0,
                width: 260,
                zIndex: 50,
                background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto',
              }}
            >
              <SidebarContent />
            </aside>
          </>
        )}

        <main style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 10 }}>
          <div className="hide-desktop" style={{ height: 60 }} />

          <div style={{ padding: 'clamp(20px, 3vw, 32px) clamp(16px, 3vw, 32px)' }}>
            <Outlet />
          </div>
        </main>

      </div>
    </>
  )
}
