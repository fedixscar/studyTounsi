# 🎓 EduSmart — Plateforme d'Apprentissage Intelligente

Une plateforme full-stack pilotée par **Gemini 1.5 Flash** qui analyse n'importe quel contenu pédagogique (PDF, image, texte, YouTube), le découpe en parties, génère des fiches de révision, des quiz notés, et une fiche récap finale — le tout en français et/ou en tunisien.

---

## ✨ Fonctionnalités

| Fonctionnalité | Description |
|---|---|
| 📤 **Upload multi-format** | PDF, image (OCR via Gemini), texte, lien YouTube |
| 🤖 **Analyse automatique** | Gemini détecte les parties du cours (I, II, III…) |
| 📝 **Fiches générées** | Résumé, remarques, astuces par partie |
| ❓ **Quiz QCM** | 7 questions notées /20 avec explication des erreurs |
| 🏆 **Fiche récap finale** | Synthèse complète, téléchargeable en PDF |
| 📚 **Section Devoirs** | Exercices corrigés et expliqués par Gemini |
| 🌐 **Bilingue** | Français + Dialecte tunisien (darija) |
| 🔐 **Auth JWT** | Inscription / Connexion sécurisée |

---

## 🏗️ Architecture

```
projetweb/
├── client/    ← React 18 + Vite + Tailwind CSS
└── server/    ← Node.js + Express + Prisma + PostgreSQL
```

**Stack :**
- **Frontend** : React 18, Vite, Tailwind CSS, React Router, Zustand, Framer Motion, Lucide
- **Backend** : Node.js, Express, Prisma ORM, PostgreSQL
- **IA** : Gemini 1.5 Flash (`@google/generative-ai`)
- **Auth** : JWT + bcrypt
- **Upload** : Multer (PDF, images, texte)
- **PDF Export** : jsPDF + html2canvas

---

## 🚀 Installation & Démarrage

### Prérequis
- Node.js 18+
- PostgreSQL (local ou [Railway](https://railway.app) / [Supabase](https://supabase.com))
- Clé API Gemini → [Google AI Studio](https://aistudio.google.com/apikey)

### 1. Configurer le Backend

```bash
cd server
cp .env.example .env
# Éditez .env avec vos identifiants
npm run db:migrate     # Créer les tables
npm run dev            # Lancer le serveur sur :5000
```

### 2. Configurer le Frontend

```bash
cd client
npm install
npm run dev            # Lancer le client sur :5173
```

### 3. Variables d'environnement (`server/.env`)

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/edusmart"
JWT_SECRET="votre-clé-secrète-jwt"
GEMINI_API_KEY="votre-clé-api-gemini"
PORT=5000
CLIENT_URL=http://localhost:5173
```

---

## 📁 Structure du Projet

```
server/
├── src/
│   ├── index.js              # Point d'entrée Express
│   ├── services/gemini.js    # Service Gemini AI centralisé
│   ├── controllers/          # Logique métier
│   ├── routes/               # Définition des routes
│   └── middleware/           # Auth JWT, Upload, Error handler
└── prisma/schema.prisma      # Schéma base de données

client/src/
├── pages/          # Toutes les pages
├── components/     # Layout + composants réutilisables
├── store/          # État global (Zustand)
└── lib/            # Client API (Axios)
```

---

## 🤖 Prompts Gemini

| Tâche | Endpoint |
|---|---|
| Analyser le cours | `POST /api/courses` |
| Générer résumé/fiches | `POST /api/parts/:id/generate` |
| Générer quiz | `POST /api/quiz/part/:id/generate` |
| Corriger quiz | `POST /api/quiz/:id/submit` |
| Fiche récap | `POST /api/recap/:courseId/generate` |
| Corriger devoir | `POST /api/exercises/:id/submit` |

---

## 🎨 Design System

- **Palette** : Deep Indigo (#0F0E17) · Electric Violet (#7C3AED) · Cyan (#06B6D4)
- **Style** : Glassmorphism dark mode
- **Typographie** : Plus Jakarta Sans (headings) + Inter (body)
- **Icônes** : Lucide React

---

## 📦 Déploiement

| Partie | Service |
|---|---|
| Frontend | [Vercel](https://vercel.com) |
| Backend + BDD | [Railway](https://railway.app) |

```bash
# Frontend
cd client && npm run build

# Backend — Railway détecte automatiquement Node.js
# Ajoutez les variables d'environnement dans le dashboard Railway
```

---

© 2025 EduSmart
