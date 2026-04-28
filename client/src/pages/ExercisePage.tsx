import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Dumbbell, Send, CheckCircle, AlertCircle,
  Loader2, Star, ThumbsUp, ChevronRight
} from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

interface Exercise {
  id: string; title: string; description: string; difficulty: string
  subject: { name: string }
}
interface Correction {
  score: number; maxScore: number; grade: string; feedback: string
  corrections: { aspect: string; status: string; comment: string }[]
  improvements: string
}

const STATUS_COLORS: Record<string, string> = {
  correct: '#10B981', partial: '#F59E0B', incorrect: '#EF4444'
}
const STATUS_LABELS: Record<string, string> = {
  correct: '✓ Correct', partial: '~ Partiel', incorrect: '✗ Incorrect'
}

export default function ExercisePage() {
  const { id } = useParams()
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [loading, setLoading] = useState(true)
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [correction, setCorrection] = useState<Correction | null>(null)

  useEffect(() => {
    api.get(`/exercises/${id}`)
      .then(r => setExercise(r.data.exercise))
      .catch(() => toast.error('Exercice introuvable'))
      .finally(() => setLoading(false))
  }, [id])

  const submit = async () => {
    if (!answer.trim()) { toast.error('Veuillez entrer votre réponse'); return }
    setSubmitting(true)
    try {
      const { data } = await api.post(`/exercises/${id}/submit`, { answer })
      setCorrection(data.correction)
      toast.success('Réponse corrigée par Gemini !')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors de la soumission')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="skeleton" style={{ height: 32, width: '50%', borderRadius: 8 }} />
      <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />
    </div>
  )
  if (!exercise) return null

  const scorePercent = correction ? Math.round((correction.score / correction.maxScore) * 100) : 0

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Link to="/exercises" className="btn btn-secondary btn-sm" style={{ marginBottom: 16, display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Tous les devoirs
        </Link>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-accent)', background: 'rgba(6,182,212,0.1)', padding: '2px 10px', borderRadius: 999, border: '1px solid rgba(6,182,212,0.2)' }}>
            {exercise.subject.name}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{exercise.difficulty}</span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 800 }}>{exercise.title}</h1>
      </div>

      <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Dumbbell size={18} style={{ color: '#10B981' }} />
          <h2 style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: '0.95rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Énoncé
          </h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
          {exercise.description}
        </p>
      </div>

      {!correction ? (
        <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <h2 style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: '0.95rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Votre réponse
            </h2>
          </div>
          <textarea
            className="input"
            style={{ minHeight: 180, resize: 'vertical', fontSize: '0.95rem', lineHeight: 1.7 }}
            placeholder="Rédigez votre réponse ici..."
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            disabled={submitting}
          />
          <button
            className="btn btn-primary"
            style={{ marginTop: 14, width: '100%' }}
            onClick={submit}
            disabled={submitting || !answer.trim()}
          >
            {submitting
              ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Correction par Gemini...</>
              : <><Send size={16} /> Soumettre ma réponse</>}
          </button>
        </div>
      ) : (
        <div className="animate-scale-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="glass-card" style={{ padding: 28, background: scorePercent >= 60 ? 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.05))' : 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(245,158,11,0.05))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: scorePercent >= 60 ? '#10B981' : 'var(--color-danger)', lineHeight: 1 }}>
                  {correction.score}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ {correction.maxScore}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', fontFamily: 'var(--font-heading)', marginBottom: 4 }}>
                  {correction.grade}
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${scorePercent}%`, background: scorePercent >= 60 ? 'linear-gradient(90deg, #10B981, #06B6D4)' : 'linear-gradient(90deg, #EF4444, #F59E0B)' }} />
                </div>
                <div style={{ marginTop: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{scorePercent}%</div>
              </div>
              {scorePercent >= 80 && <Star size={32} style={{ color: '#F59E0B', flexShrink: 0 }} />}
            </div>
          </div>

          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <ThumbsUp size={16} style={{ color: 'var(--color-primary)' }} />
              <h3 style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: '0.9rem' }}>Feedback général</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem' }}>{correction.feedback}</p>
          </div>

          {correction.corrections?.length > 0 && (
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: 14, fontSize: '0.9rem' }}>
                Détail par critère
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {correction.corrections.map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 'var(--radius-md)', background: `${STATUS_COLORS[c.status] || '#6B7280'}10`, border: `1px solid ${STATUS_COLORS[c.status] || '#6B7280'}25` }}>
                    <div style={{ flexShrink: 0 }}>
                      {c.status === 'correct' ? <CheckCircle size={16} style={{ color: '#10B981' }} /> : <AlertCircle size={16} style={{ color: STATUS_COLORS[c.status] }} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', fontFamily: 'var(--font-heading)', marginBottom: 3, color: STATUS_COLORS[c.status] }}>
                        {c.aspect} — {STATUS_LABELS[c.status] || c.status}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {correction.improvements && (
            <div className="glass-card" style={{ padding: 24, background: 'rgba(124,58,237,0.04)' }}>
              <h3 style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: 10, fontSize: '0.9rem' }}>
                Comment s'améliorer
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem' }}>{correction.improvements}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setCorrection(null); setAnswer('') }}>
              Recommencer
            </button>
            <Link to="/exercises" className="btn btn-primary" style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              Autre devoir <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
