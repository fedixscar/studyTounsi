interface LogoProps {
  size?: number
  className?: string
}

export default function TunisCoursLogo({ size = 40, className }: LogoProps) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      <img
        src="/logo.png"
        alt="TunisCours"
        style={{
          width: '130%',
          height: '130%',
          objectFit: 'cover',
          objectPosition: '50% 20%',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  )
}

export function TunisCoursIcon({ size = 28, className }: LogoProps) {
  return <TunisCoursLogo size={size} className={className} />
}

export function TunisCoursBrand({ logoSize = 40 }: { logoSize?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <TunisCoursLogo size={logoSize} />
      <div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.2rem', lineHeight: 1.1 }}>
          <span style={{ color: 'var(--color-primary)' }}>TUNIS</span>
          <span style={{ color: 'white' }}>COURS</span>
        </div>
        <div style={{ fontSize: '0.57rem', color: 'var(--text-muted)', letterSpacing: '0.04em', fontFamily: 'var(--font-heading)' }}>
          Apprendre · Comprendre · Réussir
        </div>
      </div>
    </div>
  )
}
