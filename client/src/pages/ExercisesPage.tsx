import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dumbbell, ChevronRight, BookOpen, Loader2 } from 'lucide-react'
import api from '../lib/api'

interface Exercise { id: string; title: string; difficulty: string; createdAt: string }
interface Subject { id: string; name: string; exercises: Exercise[] }

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: '#10B981', medium: '#F59E0B', hard: '#EF4444'
}
const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Facile', medium: 'Moyen', hard: 'Difficile'
}

export default function ExercisesPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    api.get('/exercises/subjects')
      .then(r => { setSubjects(r.data.subjects); if (r.data.subjects.length) setActive(r.data.subjects[0].id) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const current = subjects.find(s => s.id === active)

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: 4 }}>
          <Dumbbell size={24} style={{ verticalAlign: 'middle', marginRight: 10, color: '#10B981' }} />
          Section Devoirs
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Exercices corrigés et expliqués par Gemini IA</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Chargement...
        </div>
      ) : subjects.length === 0 ? (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
          <BookOpen size={36} style={{ color: 'var(--color-primary)', margin: '0 auto 12px' }} />
          <h3 style={{ fontWeight: 700, marginBottom: 6 }}>Aucun devoir disponible</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Les administrateurs ajouteront bientôt des exercices par matière.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, alignItems: 'start' }}>
          <div className="glass-card" style={{ padding: '12px 8px', position: 'sticky', top: 20 }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', padding: '4px 8px 10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-heading)' }}>Matières</p>
            {subjects.map(s => (
              <button
                key={s.id}
                className={`nav-item ${active === s.id ? 'active' : ''}`}
                onClick={() => setActive(s.id)}
              >
                {s.name}
                <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.exercises.length}</span>
              </button>
            ))}
          </div>

          <div>
            {current && (
              <>
                <h2 style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: 16, fontSize: '1.1rem' }}>
                  {current.name} — {current.exercises.length} exercice{current.exercises.length > 1 ? 's' : ''}
                </h2>
                {current.exercises.length === 0 ? (
                  <div className="glass-card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
                    Aucun exercice pour cette matière
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} className="stagger-children">
                    {current.exercises.map(ex => (
                      <Link key={ex.id} to={`/exercises/${ex.id}`} className="glass-card" style={{ padding: '18px 22px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: 6 }}>{ex.title}</div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: DIFFICULTY_COLORS[ex.difficulty] || '#F59E0B', background: `${DIFFICULTY_COLORS[ex.difficulty] || '#F59E0B'}18`, padding: '2px 8px', borderRadius: 999, border: `1px solid ${DIFFICULTY_COLORS[ex.difficulty] || '#F59E0B'}30` }}>
                              {DIFFICULTY_LABELS[ex.difficulty] || ex.difficulty}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {new Date(ex.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
