import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload, FileText, Image, Type, Link2,
  CheckCircle, Loader2, X, ArrowRight, Sparkles
} from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

type SourceType = 'PDF' | 'IMAGE' | 'TEXT' | 'YOUTUBE'
type Language = 'FR' | 'TN' | 'BOTH'

const SOURCE_TYPES: { type: SourceType; icon: any; label: string; desc: string }[] = [
  { type: 'PDF',     icon: FileText, label: 'PDF',     desc: 'Cours en PDF' },
  { type: 'IMAGE',   icon: Image,    label: 'Image',   desc: 'Photo de cours' },
  { type: 'TEXT',    icon: Type,     label: 'Texte',   desc: 'Coller du texte' },
  { type: 'YOUTUBE', icon: Link2,    label: 'YouTube', desc: 'Lien vidéo' },
]

const LANGUAGES: { lang: Language; flag: string; label: string }[] = [
  { lang: 'FR',   flag: '🇫🇷', label: 'Français' },
  { lang: 'TN',   flag: '🇹🇳', label: 'Tunisien' },
  { lang: 'BOTH', flag: '🌐', label: 'Les deux' },
]

export default function UploadPage() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(1)
  const [sourceType, setSourceType] = useState<SourceType>('PDF')
  const [language, setLanguage] = useState<Language>('FR')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [textContent, setTextContent] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) {
      setFile(f)
      if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ''))
    }
  }, [title])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ''))
    }
  }

  const canProceed = () => {
    if (sourceType === 'PDF' || sourceType === 'IMAGE') return !!file
    if (sourceType === 'TEXT') return textContent.trim().length > 50
    if (sourceType === 'YOUTUBE') return youtubeUrl.includes('youtube.com') || youtubeUrl.includes('youtu.be')
    return false
  }

  const handleSubmit = async () => {
    if (!title.trim()) { toast.error('Veuillez entrer un titre pour le cours'); return }
    setLoading(true)
    setStep(3)
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('language', language)
      formData.append('sourceType', sourceType)
      if (file) formData.append('file', file)
      if (textContent) formData.append('textContent', textContent)
      if (youtubeUrl) formData.append('sourceUrl', youtubeUrl)

      const { data } = await api.post('/courses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Cours envoyé ! Analyse en cours par Gemini...')
      navigate(`/courses/${data.course.id}`)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'upload')
      setStep(2)
      setLoading(false)
    }
  }

  const inputAccept = sourceType === 'PDF' ? '.pdf' : sourceType === 'IMAGE' ? 'image/*' : ''

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2rem)', fontWeight: 800, marginBottom: 8 }}>
          Analyser un cours
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Choisissez votre source de contenu et laissez l'IA faire le reste
        </p>
      </div>

      {step === 3 && (
        <div className="glass-card animate-scale-in" style={{ padding: '64px 40px', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 40px var(--color-primary-glow)' }}>
            <Sparkles size={32} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 12 }}>
            L'IA analyse votre cours...
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 380, margin: '0 auto 24px' }}>
            L'IA détecte les parties, structure le contenu et prépare vos fiches. Cela peut prendre quelques secondes.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            {[0.2, 0.4, 0.6].map(d => (
              <div key={d} className="pulse-dot" style={{ animationDelay: `${d}s` }} />
            ))}
          </div>
        </div>
      )}

      {step !== 3 && (
        <>
          <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
            <h2 style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: 16, fontSize: '1rem', color: 'var(--text-secondary)' }}>
              1. TYPE DE CONTENU
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {SOURCE_TYPES.map(({ type, icon: Icon, label, desc }) => (
                <button
                  key={type}
                  onClick={() => { setSourceType(type); setFile(null); setTextContent('') }}
                  style={{
                    padding: '16px 10px', borderRadius: 'var(--radius-md)', border: `1px solid ${sourceType === type ? 'var(--color-primary)' : 'var(--border)'}`,
                    background: sourceType === type ? 'rgba(124,58,237,0.12)' : 'var(--bg-card)',
                    cursor: 'pointer', transition: 'var(--transition)', textAlign: 'center'
                  }}
                >
                  <Icon size={22} style={{ color: sourceType === type ? 'var(--color-primary-light)' : 'var(--text-muted)', margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: '0.8rem', color: sourceType === type ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
            <h2 style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: 16, fontSize: '1rem', color: 'var(--text-secondary)' }}>
              2. CONTENU
            </h2>

            {(sourceType === 'PDF' || sourceType === 'IMAGE') && (
              <>
                <input ref={fileRef} type="file" accept={inputAccept} onChange={handleFileChange} style={{ display: 'none' }} />
                <div
                  className={`dropzone ${dragging ? 'dragging' : ''}`}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                >
                  {file ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
                      <CheckCircle size={24} style={{ color: '#10B981' }} />
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{file.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                      <button onClick={e => { e.stopPropagation(); setFile(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', marginLeft: 8 }}>
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload size={36} style={{ color: 'var(--color-primary)', margin: '0 auto 12px' }} />
                      <div style={{ fontWeight: 600, fontFamily: 'var(--font-heading)', marginBottom: 4 }}>
                        Glissez votre {sourceType === 'PDF' ? 'PDF' : 'image'} ici
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        ou <span style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>cliquez pour parcourir</span> · Max 20 MB
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {sourceType === 'TEXT' && (
              <textarea
                className="input"
                style={{ height: 200, resize: 'vertical', padding: '14px 16px' }}
                placeholder="Collez ou tapez votre contenu de cours ici... (50 caractères minimum)"
                value={textContent}
                onChange={e => setTextContent(e.target.value)}
              />
            )}

            {sourceType === 'YOUTUBE' && (
              <div>
                <div style={{ position: 'relative' }}>
                  <Link2 size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#EF4444' }} />
                  <input
                    className="input" style={{ paddingLeft: 40 }}
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={e => setYoutubeUrl(e.target.value)}
                  />
                </div>
                <p style={{ marginTop: 10, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  ⚠️ L'analyse de vidéos YouTube est en version bêta. L'IA analysera l'URL pour extraire le sujet principal.
                </p>
              </div>
            )}
          </div>

          <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: 16, fontSize: '1rem', color: 'var(--text-secondary)' }}>
              3. CONFIGURATION
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label" htmlFor="course-title">Titre du cours</label>
                <input
                  id="course-title" className="input"
                  placeholder="ex: Introduction à l'HTML"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="label">Langue d'explication</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {LANGUAGES.map(({ lang, flag, label }) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      style={{
                        padding: '10px 20px', borderRadius: 'var(--radius-md)',
                        border: `1px solid ${language === lang ? 'var(--color-primary)' : 'var(--border)'}`,
                        background: language === lang ? 'rgba(124,58,237,0.12)' : 'var(--bg-card)',
                        cursor: 'pointer', transition: 'var(--transition)',
                        fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.9rem',
                        color: language === lang ? 'var(--text-primary)' : 'var(--text-secondary)',
                        display: 'flex', alignItems: 'center', gap: 6
                      }}
                    >
                      {flag} {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            disabled={!canProceed() || loading}
            onClick={handleSubmit}
          >
            {loading ? (
              <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Analyse en cours...</>
            ) : (
              <><Sparkles size={18} /> Analyser avec Gemini <ArrowRight size={18} /></>
            )}
          </button>
        </>
      )}
    </div>
  )
}
