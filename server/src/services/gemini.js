const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getModel = () => genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

const callWithRetry = async (fn, retries = 2) => {
  try {
    return await fn();
  } catch (err) {
    const errorMsg = (err?.message || '').toLowerCase();
    const isRetryable = err?.status === 429 || err?.status === 503 || errorMsg.includes('429') || errorMsg.includes('503');

    if (isRetryable && retries > 0) {
      console.log(` Gemini busy or limit hit — waiting 30s before retry (${retries} left)...`);
      await new Promise(r => setTimeout(r, 30000));
      return await callWithRetry(fn, retries - 1);
    }
    throw err;
  }
};

const getLangInstruction = (language) => {
  const common = "IMPORTANT: Garde TOUJOURS les clés du JSON en anglais comme indiqué dans la structure demandée.";
  if (language === 'TN') return `Réponds UNIQUEMENT en dialecte tunisien (darija). Sois clair et pédagogique. ${common}`;
  if (language === 'BOTH') return `Réponds en français, puis ajoute une version en dialecte tunisien (darija) après "--- Version Tunisienne ---". ${common}`;
  return `Réponds UNIQUEMENT en français. Sois clair et pédagogique. ${common}`;
};

const extractJson = (text, context = 'la réponse') => {
  console.log(`\n\n==========================================`);
  console.log(` RÉPONSE BRUTE DE GEMINI POUR : ${context}`);
  console.log(`==========================================`);
  console.log(text);
  console.log(`==========================================\n\n`);

  let cleaned = text.trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '');

  const start = cleaned.indexOf('{');
  if (start === -1) throw new Error(`Gemini n'a pas retourné un JSON valide pour ${context}`);

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return JSON.parse(cleaned.substring(start, i + 1));
    }
  }
  throw new Error(`JSON non équilibré dans ${context}`);
};

const analyzeCourse = async (content, language = 'FR') => {
  const model = getModel();
  const langInstr = getLangInstruction(language);

  const prompt = `${langInstr}

Analyse ce contenu pédagogique et découpe-le en parties logiques (I, II, III...).
Génère UNIQUEMENT un JSON valide (clés en anglais) avec cette structure exacte:
{
  "title": "Titre général du cours",
  "parts": [
    {
      "order": 1,
      "title": "Titre de la partie",
      "content": "Contenu complet de cette partie..."
    }
  ]
}

Contenu à analyser:
${content.substring(0, 15000)}`;

  const result = await callWithRetry(() => model.generateContent(prompt));
  const data = extractJson(result.response.text(), "l'analyse du cours");

  if (data.parts && Array.isArray(data.parts)) {
    data.parts = data.parts.map(p => ({
      ...p,
      content: Array.isArray(p.content) ? p.content.join('\n') : String(p.content || '')
    }));
  }

  return data;
};

const generatePartContent = async (partTitle, partContent, language = 'FR') => {
  const model = getModel();
  const langInstr = getLangInstruction(language);

  const prompt = `${langInstr}

Pour la partie suivante d'un cours:
Titre: "${partTitle}"
Contenu: "${partContent.substring(0, 8000)}"

Génère UNIQUEMENT un JSON valide (clés en anglais) avec cette structure:
{
  "summary": "Résumé détaillé et pédagogique de la partie (3-5 paragraphes)",
  "remarks": "Points importants à retenir sous forme de liste à puces (une seule chaîne de caractères)",
  "tips": "Astuces et conseils pratiques sous forme de liste à puces (une seule chaîne de caractères)"
}`;

  const result = await callWithRetry(() => model.generateContent(prompt));
  const data = extractJson(result.response.text(), 'le contenu de la partie');

  if (Array.isArray(data.remarks)) data.remarks = data.remarks.map(s => `• ${s}`).join('\n');
  if (Array.isArray(data.tips)) data.tips = data.tips.map(s => `• ${s}`).join('\n');
  if (Array.isArray(data.summary)) data.summary = data.summary.join('\n\n');

  return data;
};

const generateQuiz = async (partTitle, partContent, language = 'FR') => {
  const model = getModel();
  const langInstr = getLangInstruction(language);

  const prompt = `${langInstr}

Crée un quiz de 7 questions QCM sur cette partie de cours:
Titre: "${partTitle}"
Contenu: "${partContent.substring(0, 6000)}"

Le score total est sur 20 points (questions valent entre 2 et 4 points selon difficulté).
Retourne UNIQUEMENT un JSON valide (clés en anglais):
{
  "questions": [
    {
      "id": 1,
      "question": "Question ici?",
      "options": ["Réponse A", "Réponse B", "Réponse C", "Réponse D"],
      "correctIndex": 0,
      "points": 3,
      "explanation": "Explication de la bonne réponse"
    }
  ],
  "totalPoints": 20,
  "passingScore": 12
}

Assure-toi que les options sont variées et que les mauvaises réponses sont plausibles.`;

  const result = await callWithRetry(() => model.generateContent(prompt));
  return extractJson(result.response.text(), 'le quiz');
};

const explainQuizErrors = async (questions, wrongAnswers, language = 'FR') => {
  const model = getModel();
  const langInstr = getLangInstruction(language);

  const wrongDetails = wrongAnswers.map(w => {
    const q = questions.find(q => q.id === w.questionId);
    return `Question: "${q.question}" | Réponse donnée: "${q.options[w.givenIndex]}" | Bonne réponse: "${q.options[q.correctIndex]}"`;
  }).join('\n');

  const prompt = `${langInstr}

L'étudiant a raté ces questions dans son quiz:
${wrongDetails}

Pour chaque question ratée, donne une explication personnalisée et pédagogique qui aide l'étudiant à comprendre son erreur.
Retourne UNIQUEMENT un JSON valide (clés en anglais):
{
  "explanations": [
    {
      "questionId": 1,
      "explanation": "Explication détaillée et encourageante..."
    }
  ]
}`;

  const result = await callWithRetry(() => model.generateContent(prompt));
  return extractJson(result.response.text(), 'les explications');
};

const generateRecap = async (parts, language = 'FR') => {
  const model = getModel();
  const langInstr = getLangInstruction(language);

  const partsData = parts.map(p => ({
    title: p.title,
    tip: p.tip?.content || '',
    remark: p.remark?.content || '',
    summary: p.summary?.content?.substring(0, 500) || ''
  }));

  const prompt = `${langInstr}

Génère une fiche récap finale pour ce cours qui comporte ${parts.length} parties:
${JSON.stringify(partsData, null, 2)}

Retourne UNIQUEMENT un JSON valide (clés en anglais):
{
  "allTips": ["Astuce 1", "Astuce 2", ...],
  "allRemarks": ["Point clé 1", "Point clé 2", ...],
  "miniSummary": "Résumé ultra-condensé du cours en 5-8 phrases",
  "keyFormulas": ["Formule/méthode importante 1", ...],
  "studyAdvice": "Conseils de révision personnalisés"
}`;

  const result = await callWithRetry(() => model.generateContent(prompt));
  return extractJson(result.response.text(), 'le récap');
};

const correctExercise = async (exerciseTitle, exerciseDescription, studentAnswer, language = 'FR') => {
  const model = getModel();
  const langInstr = getLangInstruction(language);

  const prompt = `${langInstr}

Corrige et évalue la réponse de cet étudiant:

Exercice: "${exerciseTitle}"
Énoncé: "${exerciseDescription}"
Réponse de l'étudiant: "${studentAnswer}"

Retourne UNIQUEMENT un JSON valide (clés en anglais):
{
  "score": 15,
  "maxScore": 20,
  "grade": "Bien",
  "feedback": "Feedback général encourageant et constructif",
  "corrections": [
    {
      "aspect": "Aspect évalué",
      "status": "correct|partial|incorrect",
      "comment": "Commentaire détaillé"
    }
  ],
  "improvements": "Suggestions d'amélioration spécifiques"
}`;

  const result = await callWithRetry(() => model.generateContent(prompt));
  return extractJson(result.response.text(), 'la correction');
};

const extractTextFromFile = async (fileContent, mimeType) => {
  const model = getModel();

  const prompt = 'Extrait et retourne TOUT le texte contenu dans ce document de manière structurée. Conserve la structure logique (titres, sous-titres, listes). Ne résume pas, extrais tout le contenu textuel.';

  const result = await callWithRetry(() => model.generateContent([
    prompt,
    { inlineData: { data: fileContent, mimeType } }
  ]));
  return result.response.text();
};

module.exports = {
  analyzeCourse,
  generatePartContent,
  generateQuiz,
  explainQuizErrors,
  generateRecap,
  correctExercise,
  extractTextFromFile
};
