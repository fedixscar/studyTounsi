import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BookOpen, Upload, Trophy, Clock, CheckCircle,
  SkipForward, Loader2, Plus, Dumbbell, ArrowRight, Sparkles, AlertCircle,
  Trash2, X
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import api from '../lib/api'

interface Course {
  id: string
  title: string
  language: string
  sourceType: string
  status: string
  createdAt: string
  parts: { id: string; order: number; title: string; status: string }[]
}

export default function Dashboard() {
  const user = useAuthStore(s => s.user)
  const navigate = useNavigate()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [toDelete, setToDelete] = useState<Course | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    api.get('/courses')
      .then(r => setCourses(r.data.courses))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await api.delete(`/courses/${toDelete.id}`)
      setCourses(cs => cs.filter(c => c.id !== toDelete.id))
      toast.success('Cours supprimé')
      setToDelete(null)
    } catch {
      toast.error('Erreur lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  const getProgress = (parts: Course['parts']) => {
    if (!parts.length) return 0
    return Math.round(parts.filter(p => p.status !== 'PENDING').length / parts.length * 100)
  }

  const allParts       = courses.flatMap(c => c.parts)
  const totalValidated = allParts.filter(p => p.status === 'VALIDATED').length
  const totalSkipped   = allParts.filter(p => p.status === 'SKIPPED').length
  const readyCourses   = courses.filter(c => c.status === 'READY').length

  const STATS = [
    { icon: BookOpen,    color: 'var(--color-primary)', bg: 'rgba(231,0,19,0.12)',   label: 'Cours analysés',   value: readyCourses },
    { icon: CheckCircle, color: '#10B981',               bg: 'rgba(16,185,129,0.12)', label: 'Parties validées', value: totalValidated },
    { icon: SkipForward, color: '#F59E0B',               bg: 'rgba(245,158,11,0.12)', label: 'Parties passées',  value: totalSkipped },
    { icon: Trophy,      color: 'var(--color-accent)',  bg: 'rgba(201,168,76,0.12)', label: 'Total parties',    value: allParts.length },
  ]

  return (
    <div>

      <div className="page-header">
        <div className="page-header-left">
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800 }}>
            Bonjour, {user?.name?.split(' ')[0]}
          </h1>
          <p>Continuez votre apprentissage</p>
        </div>
        <div className="page-header-action">
          <Link to="/upload" className="btn btn-primary">
            <Plus size={17} /> Analyser un cours
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        {STATS.map(({ icon: Icon, color, bg, label, value }) => (
          <div key={label} className="glass-card stat-card">
            <div className="stat-card-icon" style={{ background: bg }}>
              <Icon size={18} color={color} />
            </div>
            <div className="stat-card-body">
              <div className="stat-card-value" style={{ color }}>
                {loading
                  ? <div className="skeleton" style={{ height: 22, width: 28, borderRadius: 4 }} />
                  : value
                }
              </div>
              <div className="stat-card-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div
          className="glass-card"
          style={{ padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, border: '1px solid rgba(239,68,68,0.3)' }}
        >
          <AlertCircle size={18} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
            Impossible de charger vos cours. Veuillez rafraîchir la page.
          </p>
        </div>
      )}

      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-heading)', margin: 0 }}>Mes cours</h2>
          {courses.length > 0 && (
            <Link to="/upload" className="btn btn-secondary btn-sm">
              <Plus size={13} /> Nouveau
            </Link>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: 88, borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>

        ) : courses.length === 0 && !error ? (
          <div className="glass-card" style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(231,0,19,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Sparkles size={24} style={{ color: 'var(--color-primary)' }} />
            </div>
            <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: '1rem' }}>Aucun cours pour l'instant</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.88rem' }}>
              Uploadez votre premier cours et laissez l'IA faire le travail
            </p>
            <Link to="/upload" className="btn btn-primary">
              <Upload size={15} /> Analyser mon premier cours
            </Link>
          </div>

        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} className="stagger-children">
            {courses.map(course => {
              const progress    = getProgress(course.parts)
              const isProcessing = course.status === 'PROCESSING'
              const isError      = course.status === 'ERROR'
              const allDone      = course.parts.length > 0 && course.parts.every(p => p.status !== 'PENDING')

              return (
                <div
                  key={course.id}
                  className="glass-card"
                  style={{ padding: '16px 20px', cursor: isProcessing ? 'wait' : 'pointer' }}
                  onClick={() => !isProcessing && navigate(`/courses/${course.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && !isProcessing && navigate(`/courses/${course.id}`)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: course.parts.length > 0 && !isProcessing && !isError ? 10 : 0 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontFamily: 'var(--font-heading)',
                            fontSize: '0.93rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%',
                          }}
                        >
                          {course.title}
                        </span>
                        <span style={{ fontSize: '0.68rem', padding: '2px 7px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--border)', flexShrink: 0 }}>
                          {course.language === 'FR' ? 'FR' : course.language === 'TN' ? 'TN Darija' : 'FR + TN'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Clock size={10} />
                          {new Date(course.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                        <span>{course.parts.length} partie{course.parts.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                      {isProcessing ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: 'var(--color-accent)' }}>
                          <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Analyse...
                        </span>
                      ) : isError ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--color-danger)' }}>
                          <AlertCircle size={12} /> Erreur
                        </span>
                      ) : allDone ? (
                        <button className="btn btn-accent btn-sm" onClick={() => navigate(`/courses/${course.id}/recap`)}>
                          Voir Récap
                        </button>
                      ) : (
                        <span className="badge badge-pending">{progress}%</span>
                      )}
                      <button
                        onClick={() => setToDelete(course)}
                        title="Supprimer ce cours"
                        aria-label="Supprimer ce cours"
                        style={{
                          background: 'none',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)',
                          padding: 6,
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'var(--transition)',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.color = 'var(--color-danger)'
                          e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'
                          e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = 'var(--text-muted)'
                          e.currentTarget.style.borderColor = 'var(--border)'
                          e.currentTarget.style.background = 'none'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {!isProcessing && !isError && course.parts.length > 0 && (
                    <>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                      <div style={{ display: 'flex', gap: 5, marginTop: 8, flexWrap: 'wrap' }}>
                        {course.parts.slice(0, 7).map(p => (
                          <span
                            key={p.id}
                            className={`badge badge-${p.status.toLowerCase()}`}
                            style={{ fontSize: '0.63rem', padding: '2px 6px', gap: 3 }}
                          >
                            {p.status === 'VALIDATED' && <CheckCircle size={8} />}
                            {p.status === 'SKIPPED'   && <SkipForward  size={8} />}
                            P{p.order}
                          </span>
                        ))}
                        {course.parts.length > 7 && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                            +{course.parts.length - 7}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div
        className="glass-card"
        style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Dumbbell size={18} style={{ color: '#10B981' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: '0.9rem' }}>Section Devoirs</div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Exercices corrigés par Gemini IA</div>
          </div>
        </div>
        <Link to="/exercises" className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
          Accéder <ArrowRight size={13} />
        </Link>
      </div>

      {toDelete && (
        <div className="modal-overlay" onClick={() => !deleting && setToDelete(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontWeight: 700, margin: 0 }}>Supprimer ce cours ?</h3>
              <button
                onClick={() => setToDelete(null)}
                disabled={deleting}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 8, fontSize: '0.9rem', lineHeight: 1.6 }}>
              Vous êtes sur le point de supprimer{' '}
              <strong style={{ color: 'var(--text-primary)' }}>« {toDelete.title} »</strong>.
            </p>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: '0.82rem' }}>
              Toutes les parties, quiz, tentatives et la fiche récap associés seront supprimés. Cette action est irréversible.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setToDelete(null)}
                disabled={deleting}
              >
                Annuler
              </button>
              <button
                className="btn btn-danger"
                style={{ flex: 1 }}
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting
                  ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Suppression...</>
                  : <><Trash2 size={14} /> Supprimer</>}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
