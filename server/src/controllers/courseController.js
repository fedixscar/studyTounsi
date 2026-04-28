const prisma = require('../prisma');
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const gemini = require('../services/gemini');


const getCourses = async (req, res) => {
  const courses = await prisma.course.findMany({
    where: { userId: req.user.id },
    include: {
      parts: {
        select: { id: true, order: true, title: true, status: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ courses });
};

const getCourse = async (req, res) => {
  const course = await prisma.course.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: {
      parts: {
        orderBy: { order: 'asc' },
        include: {
          summary: true,
          remark: true,
          tip: true,
          quiz: { select: { id: true, questions: true } }
        }
      },
      recapSheet: true
    }
  });

  if (!course) return res.status(404).json({ error: 'Cours introuvable' });
  res.json({ course });
};

const createCourse = async (req, res) => {
  const { title, language, sourceType, sourceUrl, textContent } = req.body;

  if (!title) return res.status(400).json({ error: 'Le titre est requis' });

  let extractedText = '';
  let finalSourceType = sourceType || 'TEXT';

  if (req.file) {
    const filePath = req.file.path;
    const mimeType = req.file.mimetype;

    if (mimeType === 'application/pdf') {
      finalSourceType = 'PDF';
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdf(dataBuffer);
      extractedText = pdfData.text;
    } else if (mimeType.startsWith('image/')) {
      finalSourceType = 'IMAGE';
      const fileBuffer = fs.readFileSync(filePath);
      const base64 = fileBuffer.toString('base64');
      extractedText = await gemini.extractTextFromFile(base64, mimeType);
    } else if (mimeType === 'text/plain') {
      finalSourceType = 'TEXT';
      extractedText = fs.readFileSync(filePath, 'utf-8');
    }

    fs.unlinkSync(filePath);
  } else if (textContent) {
    extractedText = textContent;
    finalSourceType = 'TEXT';
  } else if (sourceUrl && sourceType === 'YOUTUBE') {
    finalSourceType = 'YOUTUBE';
    extractedText = `[Vidéo YouTube: ${sourceUrl}] - L'analyse de vidéo YouTube sera disponible prochainement.`;
  }

  if (!extractedText.trim()) {
    return res.status(400).json({ error: 'Impossible d\'extraire le contenu du fichier' });
  }

  const course = await prisma.course.create({
    data: {
      userId: req.user.id,
      title,
      language: language || 'FR',
      sourceType: finalSourceType,
      sourceUrl: sourceUrl || null,
      status: 'PROCESSING'
    }
  });

  analyzeCourseAsync(course.id, extractedText, language || 'FR', req.user.id);

  res.status(201).json({ course, message: 'Analyse en cours...' });
};

const analyzeCourseAsync = async (courseId, text, language, userId) => {
  try {
    const analysis = await gemini.analyzeCourse(text, language);

    for (const part of analysis.parts) {
      await prisma.part.create({
        data: {
          courseId,
          order: part.order,
          title: part.title,
          content: part.content
        }
      });
    }

    await prisma.course.update({
      where: { id: courseId },
      data: { status: 'READY' }
    });

    console.log(`✅ Course ${courseId} analyzed: ${analysis.parts.length} parts detected`);
  } catch (err) {
    console.error(`❌ Analysis failed for course ${courseId}:`, err.message);
    await prisma.course.update({
      where: { id: courseId },
      data: { status: 'ERROR' }
    });
  }
};

const deleteCourse = async (req, res) => {
  const course = await prisma.course.findFirst({
    where: { id: req.params.id, userId: req.user.id }
  });
  if (!course) return res.status(404).json({ error: 'Cours introuvable' });

  await prisma.course.delete({ where: { id: req.params.id } });
  res.json({ message: 'Cours supprimé avec succès' });
};

module.exports = { getCourses, getCourse, createCourse, deleteCourse };
