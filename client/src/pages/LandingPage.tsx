import { Link } from 'react-router-dom'
import { Brain, FileText, CheckCircle, ArrowRight, Zap, Upload, MapPin } from 'lucide-react'
import TunisCoursLogo from '../components/Logo'

const FEATURES = [
  { icon: Brain,       color: '#E70013', rgb: '231,0,19',   title: 'Analyse IA Automatique',  desc: "L'IA détecte et structure automatiquement les parties de votre cours." },
  { icon: FileText,    color: '#1A2B6B', rgb: '26,43,107',  title: 'Fiches de Révision',       desc: 'Résumés, points clés et astuces générés pour chaque partie.' },
  { icon: CheckCircle, color: '#10B981', rgb: '16,185,129', title: 'Quiz Intelligents',        desc: 'QCM notés sur 20 avec explications personnalisées si vous échouez.' },
  { icon: MapPin,      color: '#C9A84C', rgb: '201,168,76', title: 'Français & Tunisien',      desc: 'Apprenez dans votre langue — français ou dialecte tunisien darija.' },
]

const STEPS = [
  { n: '01', title: 'Uploadez votre cours',  desc: 'PDF, image, texte ou lien YouTube' },
  { n: '02', title: 'Analyse IA',            desc: 'Détection des parties et génération des fiches' },
  { n: '03', title: 'Étudiez et testez',     desc: 'Quiz par partie avec feedback immédiat' },
  { n: '04', title: 'Obtenez votre récap',   desc: 'Fiche finale téléchargeable en PDF' },
]

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100dvh', position: 'relative', overflow: 'hidden' }}>
      <div className="bg-orb" style={{ width: 700, height: 700, top: -250, right: -150, background: 'rgba(231,0,19,0.07)' }} />
      <div className="bg-orb" style={{ width: 500, height: 500, bottom: 100, left: -100, background: 'rgba(26,43,107,0.1)' }} />

      <div style={{ height: 4, background: 'linear-gradient(90deg, var(--color-primary) 50%, var(--color-navy) 50%)', position: 'relative', zIndex: 20 }} />

      <nav style={{ position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <TunisCoursLogo size={44} />
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.3rem', lineHeight: 1.1 }}>
                <span style={{ color: 'var(--color-primary)' }}>TUNIS</span>
                <span style={{ color: 'white' }}>COURS</span>
              </div>
              <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', letterSpacing: '0.04em', fontFamily: 'var(--font-heading)' }}>
                Apprendre · Comprendre · Réussir
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/login" className="btn btn-secondary btn-sm">Se connecter</Link>
            <Link to="/login?tab=register" className="btn btn-primary btn-sm">Commencer</Link>
          </div>
        </div>
      </nav>

      <section style={{ position: 'relative', zIndex: 10, maxWidth: 1100, margin: '0 auto', padding: '72px 24px 90px', textAlign: 'center' }}>
        <div className="animate-fade-in" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderRadius: 999, marginBottom: 32, background: 'rgba(231,0,19,0.08)', border: '1px solid rgba(231,0,19,0.28)' }}>
          <TunisCoursLogo size={18} />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary-light)', fontFamily: 'var(--font-heading)', letterSpacing: '0.05em' }}>
            PLATEFORME TUNISIENNE · IA GÉNÉRATIVE
          </span>
        </div>

        <h1 className="animate-fade-in delay-100" style={{ fontSize: 'clamp(2.2rem, 6vw, 4.2rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}>
          Apprenez plus vite avec<br />
          <span style={{ color: 'var(--color-primary)' }}>l'Intelligence</span>{' '}
          <span style={{ color: 'white' }}>Artificielle</span>
        </h1>

        <p className="animate-fade-in delay-100" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-accent)', fontFamily: 'var(--font-heading)', marginBottom: 18, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Apprendre · Comprendre · Réussir
        </p>

        <p className="animate-fade-in delay-200" style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', color: 'var(--text-secondary)', maxWidth: 540, margin: '0 auto 40px', lineHeight: 1.75 }}>
          Uploadez n'importe quel cours — PDF, image, texte ou vidéo YouTube — et laissez l'IA l'analyser, le résumer et créer des quiz personnalisés.
        </p>

        <div className="animate-fade-in delay-300" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/login?tab=register" className="btn btn-primary btn-lg">
            <Zap size={18} /> Analyser mon cours <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            <Upload size={18} /> Se connecter
          </Link>
        </div>

        <div className="animate-fade-in delay-400" style={{ display: 'flex', gap: 0, justifyContent: 'center', marginTop: 56, flexWrap: 'wrap', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border)', maxWidth: 640, margin: '48px auto 0' }}>
          {[
            { label: 'Formats supportés', value: 'PDF · Image · Texte · YouTube' },
            { label: 'Par quiz', value: '7 Questions / 20 pts' },
            { label: 'Langues', value: 'Français & Darija' },
          ].map(({ label, value }, i) => (
            <div key={label} style={{ flex: 1, minWidth: 160, padding: '18px 12px', textAlign: 'center', background: 'var(--bg-card)', borderLeft: i > 0 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-primary-light)', marginBottom: 4 }}>{value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ position: 'relative', zIndex: 10, maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, marginBottom: 12 }}>
            Tout ce dont vous avez besoin
          </h2>
          <div style={{ width: 48, height: 3, background: 'linear-gradient(90deg, var(--color-primary), var(--color-navy))', borderRadius: 999, margin: '0 auto' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 18 }} className="stagger-children">
          {FEATURES.map(({ icon: Icon, color, rgb, title, desc }) => (
            <div key={title} className="glass-card" style={{ padding: 24 }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `rgba(${rgb}, 0.12)`, boxShadow: `0 0 20px rgba(${rgb}, 0.18)`, marginBottom: 14 }}>
                <Icon size={22} color={color} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6, fontFamily: 'var(--font-heading)' }}>{title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ position: 'relative', zIndex: 10, maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, marginBottom: 12 }}>Comment ça marche ?</h2>
          <div style={{ width: 48, height: 3, background: 'linear-gradient(90deg, var(--color-primary), var(--color-navy))', borderRadius: 999, margin: '0 auto' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          {STEPS.map(({ n, title, desc }, i) => (
            <div key={n} className="animate-fade-in" style={{ textAlign: 'center', padding: '28px 16px', animationDelay: `${i * 0.1}s` }}>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, fontFamily: 'var(--font-heading)', WebkitTextStroke: '2px var(--color-primary)', color: 'transparent', marginBottom: 14, opacity: 0.8 }}>{n}</div>
              <h3 style={{ fontWeight: 700, marginBottom: 6, fontFamily: 'var(--font-heading)', fontSize: '0.95rem' }}>{title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ position: 'relative', zIndex: 10, padding: '40px 24px 80px', textAlign: 'center' }}>
        <div style={{ maxWidth: 540, margin: '0 auto', padding: '48px 36px', borderRadius: 'var(--radius-xl)', background: 'linear-gradient(135deg, rgba(231,0,19,0.1), rgba(26,43,107,0.12))', border: '1px solid rgba(231,0,19,0.22)', backdropFilter: 'blur(20px)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <TunisCoursLogo size={52} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 10, fontFamily: 'var(--font-heading)' }}>
            Prêt à apprendre autrement ?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem', lineHeight: 1.7 }}>
            Rejoignez des milliers d'étudiants tunisiens qui utilisent l'IA pour mieux réviser.
          </p>
          <Link to="/login?tab=register" className="btn btn-primary btn-lg">
            Commencer maintenant <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <div style={{ height: 4, background: 'linear-gradient(90deg, var(--color-navy) 50%, var(--color-primary) 50%)' }} />
      <footer style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.82rem', fontFamily: 'var(--font-heading)' }}>
        © 2026 TunisCours — Apprendre · Comprendre · Réussir
      </footer>
    </div>
  )
}
