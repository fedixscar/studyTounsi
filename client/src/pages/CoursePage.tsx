import { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, CheckCircle, SkipForward,
  BookOpen, Lightbulb, StickyNote, HelpCircle,
  Loader2, RefreshCw, Trophy, FileDown
} from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

interface Part {
  id: string; order: number; title: string; status: string
  summary: { content: string } | null
  remark: { content: string } | null
  tip: { content: string } | null
  quiz: { id: string } | null
}
interface Course {
  id: string; title: string; language: string; status: string
  parts: Part[]
  recapSheet: { id: string } | null
}

export default function CoursePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)

  const fetchCourse = useCallback(async () => {
    try {
      const { data } = await api.get(`/courses/${id}`)
      setCourse(data.course)
      if (data.course.status === 'PROCESSING') {
        setTimeout(fetchCourse, 3000)
      }
    } catch {
      toast.error('Cours introuvable')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => { fetchCourse() }, [fetchCourse])

  const generateContent = async (partId: string) => {
    setGenerating(partId)
    try {
      await api.post(`/parts/${partId}/generate`)
      await fetchCourse()
      toast.success('Contenu généré avec succès !')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors de la génération')
    } finally {
      setGenerating(null)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="skeleton" style={{ height: 40, width: '60%', borderRadius: 'var(--radius-md)' }} />
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />)}
      </div>
    )
  }

  if (!course) return null

  const isProcessing = course.status === 'PROCESSING'
  const isError = course.status === 'ERROR'
  const allDone = course.parts.length > 0 && course.parts.every(p => p.status !== 'PENDING')
  const progress = course.parts.length ? Math.round(course.parts.filter(p => p.status !== 'PENDING').length / course.parts.length * 100) : 0

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <Link to="/dashboard" className="btn btn-secondary btn-sm" style={{ marginBottom: 16, display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Tableau de bord
        </Link>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, marginBottom: 4 }}>
              {course.title}
            </h1>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {course.language === 'FR' ? '🇫🇷 Français' : course.language === 'TN' ? '🇹🇳 Tunisien' : '🌐 Les deux'}
              </span>
              <span style={{ color: 'var(--border)' }}>·</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{course.parts.length} partie{course.parts.length > 1 ? 's' : ''}</span>
            </div>
          </div>
          {allDone && (
            <Link to={`/courses/${id}/recap`} className="btn btn-accent">
              <Trophy size={16} /> Voir la Fiche Récap
            </Link>
          )}
        </div>

        {course.parts.length > 0 && !isProcessing && (
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>Progression</span>
              <span style={{ fontWeight: 600, color: 'var(--color-primary-light)' }}>{progress}%</span>
            </div>
            <div className="progress-bar" style={{ height: 8 }}>
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {isProcessing && (
        <div className="glass-card animate-scale-in" style={{ padding: '48px 32px', textAlign: 'center' }}>
          <Loader2 size={36} style={{ color: 'var(--color-primary)', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
          <h2 style={{ fontWeight: 700, marginBottom: 8 }}>L'IA analyse votre cours...</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Cette page se mettra à jour automatiquement</p>
        </div>
      )}

      {isError && (
        <div className="glass-card" style={{ padding: 32, textAlign: 'center', border: '1px solid rgba(239,68,68,0.3)' }}>
          <h2 style={{ fontWeight: 700, color: 'var(--color-danger)', marginBottom: 8 }}>Erreur d'analyse</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>L'IA n'a pas pu analyser ce contenu.</p>
          <button onClick={() => navigate('/upload')} className="btn btn-secondary">
            <RefreshCw size={16} /> Réessayer avec un autre fichier
          </button>
        </div>
      )}

      {!isProcessing && !isError && course.parts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="stagger-children">
          {course.parts.map((part, idx) => {
            const hasContent = part.summary && part.remark && part.tip
            const isGen = generating === part.id

            return (
              <div key={part.id} className="glass-card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: hasContent ? 16 : 0 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.85rem', fontFamily: 'var(--font-heading)',
                    background: part.status === 'VALIDATED' ? 'rgba(16,185,129,0.15)' : part.status === 'SKIPPED' ? 'rgba(245,158,11,0.15)' : 'rgba(124,58,237,0.12)',
                    color: part.status === 'VALIDATED' ? '#10B981' : part.status === 'SKIPPED' ? '#F59E0B' : 'var(--color-primary-light)',
                    border: `1px solid ${part.status === 'VALIDATED' ? 'rgba(16,185,129,0.3)' : part.status === 'SKIPPED' ? 'rgba(245,158,11,0.3)' : 'rgba(124,58,237,0.3)'}`
                  }}>
                    {part.status === 'VALIDATED' ? <CheckCircle size={16} /> : part.status === 'SKIPPED' ? <SkipForward size={16} /> : idx + 1}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: 2 }}>{part.title}</div>
                    <span className={`badge badge-${part.status.toLowerCase()}`}>
                      {part.status === 'VALIDATED' ? '✓ Validée' : part.status === 'SKIPPED' ? '⏭ Passée' : '○ En attente'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                    {!hasContent && part.status === 'PENDING' && (
                      <button className="btn btn-secondary btn-sm" onClick={() => generateContent(part.id)} disabled={!!generating}>
                        {isGen ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Génération...</> : <><BookOpen size={14} /> Générer le contenu</>}
                      </button>
                    )}
                    {hasContent && (
                      <Link to={`/courses/${id}/parts/${part.id}`} className="btn btn-primary btn-sm">
                        {part.status === 'PENDING' ? <>Étudier</> : <>Revoir</>}
                      </Link>
                    )}
                  </div>
                </div>

                {hasContent && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingLeft: 48 }}>
                    {[
                      { icon: BookOpen, label: 'Résumé', color: 'var(--color-primary)' },
                      { icon: StickyNote, label: 'Remarques', color: 'var(--color-accent)' },
                      { icon: Lightbulb, label: 'Astuces', color: '#F59E0B' },
                      { icon: HelpCircle, label: 'Quiz', color: '#10B981' }
                    ].map(({ icon: Icon, label, color }) => (
                      <span key={label} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '3px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600, fontFamily: 'var(--font-heading)',
                        background: `rgba(${color === 'var(--color-primary)' ? '124,58,237' : color === 'var(--color-accent)' ? '6,182,212' : color === '#F59E0B' ? '245,158,11' : '16,185,129'}, 0.1)`,
                        color, border: `1px solid ${color}30`
                      }}>
                        <Icon size={11} />{label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {allDone && !isProcessing && (
        <div style={{ marginTop: 24, padding: '24px 28px', borderRadius: 'var(--radius-xl)', background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.08))', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Trophy size={28} style={{ color: 'var(--color-primary-light)' }} />
            <div>
              <div style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: 2 }}>Cours terminé ! 🎉</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Toutes les parties ont été traitées</div>
            </div>
          </div>
          <Link to={`/courses/${id}/recap`} className="btn btn-primary">
            <FileDown size={16} /> Générer la Fiche Récap
          </Link>
        </div>
      )}
    </div>
  )
}
