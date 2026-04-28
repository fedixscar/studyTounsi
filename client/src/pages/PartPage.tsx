import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, BookOpen, StickyNote, Lightbulb, HelpCircle,
  CheckCircle, SkipForward, Loader2, AlertCircle, RotateCcw,
  ChevronRight, X
} from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

interface Question {
  id: number; question: string; options: string[]; correctIndex: number; points: number; explanation: string
}
interface QuizData { questions: Question[]; totalPoints: number; passingScore: number }
interface Part {
  id: string; order: number; title: string; status: string
  summary: { content: string } | null
  remark: { content: string } | null
  tip: { content: string } | null
  quiz: { id: string; questions: QuizData } | null
  course: { id: string; title: string; language: string }
}

type Tab = 'summary' | 'remarks' | 'tips' | 'quiz'

export default function PartPage() {
  const { courseId, partId } = useParams()
  const navigate = useNavigate()
  const [part, setPart] = useState<Part | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('summary')
  const [quizStarted, setQuizStarted] = useState(false)
  const [generatingQuiz, setGeneratingQuiz] = useState(false)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showSkipModal, setShowSkipModal] = useState(false)

  useEffect(() => {
    api.get(`/parts/${partId}`)
      .then(r => setPart(r.data.part))
      .catch(() => { toast.error('Partie introuvable'); navigate(`/courses/${courseId}`) })
      .finally(() => setLoading(false))
  }, [partId, courseId, navigate])

  const generateQuiz = async () => {
    if (!part) return
    setGeneratingQuiz(true)
    try {
      const { data } = await api.post(`/quiz/part/${part.id}/generate`)
      setPart(p => p ? { ...p, quiz: data.quiz } : p)
      toast.success('Quiz généré !')
    } catch (err: any) { 
      toast.error(err.response?.data?.error || 'Erreur lors de la génération du quiz') 
    } finally { setGeneratingQuiz(false) }
  }

  const submitQuiz = async () => {
    if (!part?.quiz) return
    const answersList = part.quiz.questions.questions.map(q => ({
      questionId: q.id, selectedIndex: answers[q.id] ?? -1
    }))
    if (answersList.some(a => a.selectedIndex === -1)) { toast.error('Répondez à toutes les questions'); return }
    setSubmitting(true)
    try {
      const { data } = await api.post(`/quiz/${part.quiz.id}/submit`, { answers: answersList })
      setResult(data); setSubmitted(true)
      if (data.passed) { toast.success(`Bravo ! ${data.score}/${data.totalScore} ✅`); setPart(p => p ? { ...p, status: 'VALIDATED' } : p) }
      else toast.error(`Score : ${data.score}/${data.totalScore} — Réessayez !`)
    } catch (err: any) { 
      toast.error(err.response?.data?.error || 'Erreur lors de la soumission') 
    } finally { setSubmitting(false) }
  }

  const skipPart = async () => {
    if (!part) return
    try {
      await api.patch(`/parts/${part.id}/status`, { status: 'SKIPPED' })
      setShowSkipModal(false); toast.success('Partie passée ⏭️')
      navigate(`/courses/${courseId}`)
    } catch { toast.error('Erreur') }
  }

  const TABS = [
    { id: 'summary' as Tab, icon: BookOpen, label: 'Résumé' },
    { id: 'remarks' as Tab, icon: StickyNote, label: 'Remarques' },
    { id: 'tips' as Tab, icon: Lightbulb, label: 'Astuces' },
    { id: 'quiz' as Tab, icon: HelpCircle, label: 'Quiz' },
  ]

  if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div className="skeleton" style={{ height: 32, width: '50%', borderRadius: 8 }} />
    <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-lg)' }} />
  </div>
  if (!part) return null

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Link to={`/courses/${courseId}`} className="btn btn-secondary btn-sm" style={{ marginBottom: 16, display: 'inline-flex' }}>
          <ArrowLeft size={16} /> {part.course.title}
        </Link>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', fontWeight: 800, marginBottom: 6 }}>
              Partie {part.order} — {part.title}
            </h1>
            <span className={`badge badge-${part.status.toLowerCase()}`}>
              {part.status === 'VALIDATED' ? '✓ Validée' : part.status === 'SKIPPED' ? '⏭ Passée' : '○ En cours'}
            </span>
          </div>
          {part.status === 'PENDING' && (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowSkipModal(true)}>
              <SkipForward size={14} /> Passer
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.04)', marginBottom: 20 }}>
        {TABS.map(({ id, icon: Icon, label }) => (
          <button key={id} className={`tab-btn ${activeTab === id ? 'active' : ''}`} style={{ flex: 1 }} onClick={() => setActiveTab(id)}>
            <Icon size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />{label}
          </button>
        ))}
      </div>

      <div className="glass-card animate-fade-in" style={{ padding: 28, minHeight: 280 }}>
        {activeTab !== 'quiz' ? (
          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
            {(activeTab === 'summary' ? part.summary?.content : activeTab === 'remarks' ? part.remark?.content : part.tip?.content)
              || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Contenu non disponible</span>}
          </div>
        ) : (
          <QuizSection
            quiz={part.quiz} quizStarted={quizStarted} generatingQuiz={generatingQuiz}
            answers={answers} submitted={submitted} result={result} submitting={submitting}
            courseId={courseId!}
            onGenerate={generateQuiz}
            onStart={() => setQuizStarted(true)}
            onAnswer={(qid: number, idx: number) => setAnswers(a => ({ ...a, [qid]: idx }))}
            onSubmit={submitQuiz}
            onRetry={() => { setAnswers({}); setSubmitted(false); setResult(null) }}
          />
        )}
      </div>

      {showSkipModal && (
        <div className="modal-overlay" onClick={() => setShowSkipModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontWeight: 700 }}>Passer cette partie ?</h3>
              <button onClick={() => setShowSkipModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.9rem' }}>
              La partie sera marquée <strong style={{ color: '#F59E0B' }}>⏭ Passée</strong>. Vous pourrez y revenir plus tard.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowSkipModal(false)}>Annuler</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={skipPart}><SkipForward size={14} /> Passer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function QuizSection({ quiz, quizStarted, generatingQuiz, answers, submitted, result, submitting, courseId, onGenerate, onStart, onAnswer, onSubmit, onRetry }: any) {
  if (!quiz) return (
    <div style={{ textAlign: 'center', padding: '32px 0' }}>
      <HelpCircle size={40} style={{ color: 'var(--color-primary)', margin: '0 auto 16px' }} />
      <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Quiz non encore généré</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>7 questions notées sur 20 avec l'IA</p>
      <button className="btn btn-primary" onClick={onGenerate} disabled={generatingQuiz}>
        {generatingQuiz ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Génération...</> : 'Générer le Quiz'}
      </button>
    </div>
  )

  if (!quizStarted) return (
    <div style={{ textAlign: 'center', padding: '32px 0' }}>
      <div style={{ width: 60, height: 60, borderRadius: 18, background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <HelpCircle size={28} style={{ color: 'var(--color-primary)' }} />
      </div>
      <h3 style={{ fontWeight: 700, marginBottom: 6 }}>Quiz prêt !</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
        {quiz.questions.questions.length} questions · {quiz.questions.totalPoints} pts · Seuil : {quiz.questions.passingScore} pts
      </p>
      <button className="btn btn-primary" onClick={onStart}>Commencer <ChevronRight size={16} /></button>
    </div>
  )

  if (submitted && result) return (
    <div className="animate-scale-in">
      <div style={{ textAlign: 'center', padding: '20px 0 24px' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: result.passed ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)' }}>
          {result.passed ? <CheckCircle size={32} style={{ color: '#10B981' }} /> : <AlertCircle size={32} style={{ color: 'var(--color-danger)' }} />}
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-heading)', marginBottom: 4 }}>{result.score}/{result.totalScore}</div>
        <p style={{ color: result.passed ? '#10B981' : 'var(--color-danger)', fontWeight: 600 }}>
          {result.passed ? '✅ Bravo, partie validée !' : `❌ Minimum requis : ${result.passingScore} pts`}
        </p>
      </div>
      {result.explanations?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ fontWeight: 700, marginBottom: 10, fontFamily: 'var(--font-heading)', fontSize: '0.9rem' }}>Explications des erreurs</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {result.explanations.map((exp: any) => (
              <div key={exp.questionId} style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{exp.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: 10 }}>
        {!result.passed && <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onRetry}><RotateCcw size={14} /> Réessayer</button>}
        <Link to={`/courses/${courseId}`} className="btn btn-primary" style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <ChevronRight size={14} /> {result.passed ? 'Partie suivante' : 'Retour au cours'}
        </Link>
      </div>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-primary-light)' }}>
          {Object.keys(answers).length}/{quiz.questions.questions.length} réponses
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {quiz.questions.questions.map((q: Question, qi: number) => (
          <div key={q.id}>
            <p style={{ fontWeight: 600, marginBottom: 10, fontSize: '0.9rem', fontFamily: 'var(--font-heading)' }}>
              <span style={{ color: 'var(--color-primary-light)', marginRight: 6 }}>Q{qi + 1}.</span>{q.question}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 6 }}>({q.points} pts)</span>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {q.options.map((opt: string, oi: number) => (
                <button key={oi} className={`quiz-option ${answers[q.id] === oi ? 'selected' : ''}`} onClick={() => onAnswer(q.id, oi)}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.7rem', fontWeight: 700, background: answers[q.id] === oi ? 'var(--color-primary)' : 'rgba(255,255,255,0.06)', color: answers[q.id] === oi ? 'white' : 'var(--text-muted)' }}>
                    {String.fromCharCode(65 + oi)}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button className="btn btn-primary" style={{ marginTop: 20, width: '100%' }} onClick={onSubmit} disabled={submitting}>
        {submitting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Correction en cours...</> : 'Soumettre le quiz'}
      </button>
    </div>
  )
}
