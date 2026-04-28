import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../lib/api'
import toast from 'react-hot-toast'
import TunisCoursLogo from '../components/Logo'
import { TunisCoursIcon } from '../components/Logo'

export default function AuthPage() {
  const [searchParams] = useSearchParams()
  const [isRegister, setIsRegister] = useState(searchParams.get('tab') === 'register')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    setIsRegister(searchParams.get('tab') === 'register')
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login'
      const payload = isRegister ? form : { email: form.email, password: form.password }
      const { data } = await api.post(endpoint, payload)
      setAuth(data.user, data.token)
      toast.success(isRegister ? `Bienvenue, ${data.user.name} ! 🎓` : `Content de vous revoir, ${data.user.name} !`)
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
      <div className="bg-orb" style={{ width: 600, height: 600, top: -200, right: -120, background: 'rgba(231,0,19,0.08)' }} />
      <div className="bg-orb" style={{ width: 400, height: 400, bottom: -100, left: -60, background: 'rgba(26,43,107,0.12)' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <TunisCoursLogo size={44} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.4rem', lineHeight: 1.1 }}>
                <span style={{ color: 'var(--color-primary)' }}>TUNIS</span><span style={{ color: 'white' }}>COURS</span>
              </div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.04em', fontFamily: 'var(--font-heading)' }}>Apprendre · Comprendre · Réussir</div>
            </div>
          </Link>
        </div>

        <div className="glass-card animate-scale-in" style={{ padding: '36px 32px' }}>
          <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.04)', marginBottom: 28 }}>
            {[{ label: 'Connexion', val: false }, { label: 'Inscription', val: true }].map(({ label, val }) => (
              <button
                key={label}
                className={`tab-btn ${isRegister === val ? 'active' : ''}`}
                style={{ flex: 1 }}
                onClick={() => setIsRegister(val)}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 4 }}>
              {isRegister ? 'Créer un compte' : 'Bon retour !'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {isRegister
                ? 'Commencez à apprendre avec l\'IA dès aujourd\'hui'
                : 'Continuez votre apprentissage'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {isRegister && (
              <div>
                <label htmlFor="name" className="label">Nom complet</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="name" name="name" type="text" required autoComplete="name"
                    className="input" style={{ paddingLeft: 40 }}
                    placeholder="Ahmed Ben Salem"
                    value={form.name} onChange={handleChange}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="email" name="email" type="email" required autoComplete="email"
                  className="input" style={{ paddingLeft: 40 }}
                  placeholder="ahmed@example.com"
                  value={form.email} onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label">Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="password" name="password" type={showPassword ? 'text' : 'password'} required autoComplete={isRegister ? 'new-password' : 'current-password'}
                  className="input" style={{ paddingLeft: 40, paddingRight: 44 }}
                  placeholder={isRegister ? 'Au moins 6 caractères' : '••••••••'}
                  value={form.password} onChange={handleChange}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }} disabled={loading}>
              {loading ? (
                <><div className="spinner" style={{ width: 16, height: 16 }} /> Chargement...</>
              ) : (
                <>{isRegister ? 'Créer mon compte' : 'Se connecter'} <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div style={{ marginTop: 18, padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(231,0,19,0.05)', border: '1px solid rgba(231,0,19,0.15)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <TunisCoursIcon size={16} />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {isRegister ? 'Compte gratuit · Aucune carte bancaire requise' : 'Vos cours et fiches sont sauvegardés'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
