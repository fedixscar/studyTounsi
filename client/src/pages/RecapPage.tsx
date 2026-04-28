import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Trophy, Lightbulb, StickyNote, FileText,
  Download, Loader2, Sparkles, BookOpen, Star
} from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

interface RecapContent {
  allTips: string[]
  allRemarks: string[]
  miniSummary: string
  keyFormulas: string[]
  studyAdvice: string
}
interface Recap { id: string; content: RecapContent; createdAt: string }

export default function RecapPage() {
  const { id: courseId } = useParams()
  const [recap, setRecap] = useState<Recap | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const recapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.get(`/recap/${courseId}`)
      .then(r => setRecap(r.data.recap))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [courseId])

  const generate = async () => {
    setGenerating(true)
    try {
      const { data } = await api.post(`/recap/${courseId}/generate`)
      setRecap(data.recap)
      toast.success('Fiche récap générée avec succès !')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors de la génération')
    } finally {
      setGenerating(false)
    }
  }

  const exportPDF = async () => {
    if (!recapRef.current || !recap) return
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: html2canvas } = await import('html2canvas')
      toast('Export PDF en cours...', { icon: '📄' })
      const canvas = await html2canvas(recapRef.current, {
        backgroundColor: '#0F0E17',
        scale: 2,
        useCORS: true,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`recap-cours-${courseId}.pdf`)
      toast.success('PDF téléchargé !')
    } catch {
      toast.error('Erreur lors de l\'export PDF')
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="skeleton" style={{ height: 32, width: '40%', borderRadius: 8 }} />
      <div className="skeleton" style={{ height: 500, borderRadius: 'var(--radius-lg)' }} />
    </div>
  )

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Link to={`/courses/${courseId}`} className="btn btn-secondary btn-sm" style={{ marginBottom: 16, display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Retour au cours
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, marginBottom: 4 }}>
              <Trophy size={24} style={{ color: 'var(--color-primary-light)', verticalAlign: 'middle', marginRight: 8 }} />
              Fiche Récap Finale
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Synthèse complète de toutes les parties du cours
            </p>
          </div>
          {recap && (
            <button className="btn btn-accent" onClick={exportPDF}>
              <Download size={16} /> Exporter en PDF
            </button>
          )}
        </div>
      </div>

      {!recap ? (
        <div className="glass-card animate-scale-in" style={{ padding: '64px 40px', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 40px var(--color-primary-glow)' }}>
            <Sparkles size={32} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h2 style={{ fontWeight: 800, marginBottom: 10 }}>Générer la Fiche Récap</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 380, margin: '0 auto 24px', lineHeight: 1.7 }}>
            Gemini va synthétiser toutes vos astuces, points clés et résumés en une fiche de révision optimisée.
          </p>
          <button className="btn btn-primary btn-lg" onClick={generate} disabled={generating}>
            {generating
              ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Génération en cours...</>
              : <><Sparkles size={18} /> Générer avec Gemini</>}
          </button>
        </div>
      ) : (
        <div ref={recapRef} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="glass-card" style={{ padding: 28, background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.05))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <BookOpen size={18} style={{ color: 'var(--color-primary)' }} />
              <h2 style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: '1rem' }}>Résumé Ultra-Condensé</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem' }}>
              {recap.content.miniSummary}
            </p>
          </div>

          {recap.content.allTips?.length > 0 && (
            <div className="glass-card" style={{ padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Lightbulb size={18} style={{ color: '#F59E0B' }} />
                <h2 style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: '1rem' }}>
                  Toutes les Astuces ({recap.content.allTips.length})
                </h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recap.content.allTips.map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: '50%', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#F59E0B', marginTop: 1 }}>{i + 1}</span>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recap.content.allRemarks?.length > 0 && (
            <div className="glass-card" style={{ padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <StickyNote size={18} style={{ color: 'var(--color-accent)' }} />
                <h2 style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: '1rem' }}>
                  Points Clés ({recap.content.allRemarks.length})
                </h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recap.content.allRemarks.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ flexShrink: 0, color: 'var(--color-accent)', marginTop: 3, fontSize: '0.8rem' }}>◆</span>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{r}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recap.content.keyFormulas?.length > 0 && (
            <div className="glass-card" style={{ padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <FileText size={18} style={{ color: '#10B981' }} />
                <h2 style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: '1rem' }}>
                  Formules & Méthodes
                </h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                {recap.content.keyFormulas.map((f, i) => (
                  <div key={i} style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {recap.content.studyAdvice && (
            <div className="glass-card" style={{ padding: 28, background: 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(6,182,212,0.04))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Star size={18} style={{ color: 'var(--color-primary-light)' }} />
                <h2 style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: '1rem' }}>Conseils de Révision</h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.9rem' }}>
                {recap.content.studyAdvice}
              </p>
            </div>
          )}

          <div style={{ textAlign: 'center', paddingTop: 8 }}>
            <button className="btn btn-accent btn-lg" onClick={exportPDF} style={{ margin: '0 auto' }}>
              <Download size={18} /> Télécharger en PDF
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
