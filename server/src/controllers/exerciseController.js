const prisma = require('../prisma');
const gemini = require('../services/gemini');


const getSubjects = async (req, res) => {
  const subjects = await prisma.subject.findMany({
    include: {
      exercises: {
        select: { id: true, title: true, difficulty: true, createdAt: true }
      }
    }
  });
  res.json({ subjects });
};

const getExercise = async (req, res) => {
  const exercise = await prisma.exercise.findUnique({
    where: { id: req.params.id },
    include: { subject: true }
  });

  if (!exercise) return res.status(404).json({ error: 'Exercice introuvable' });
  res.json({ exercise });
};

const submitExercise = async (req, res) => {
  const { answer } = req.body;
  if (!answer?.trim()) return res.status(400).json({ error: 'La réponse est requise' });

  const exercise = await prisma.exercise.findUnique({
    where: { id: req.params.id }
  });

  if (!exercise) return res.status(404).json({ error: 'Exercice introuvable' });

  const correction = await gemini.correctExercise(
    exercise.title,
    exercise.description,
    answer
  );

  const submission = await prisma.studentSubmission.create({
    data: {
      exerciseId: exercise.id,
      userId: req.user.id,
      answer,
      score: correction.score,
      feedback: correction.feedback,
      corrections: correction
    }
  });

  res.status(201).json({ submission, correction });
};

const createSubject = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Le nom est requis' });

  const subject = await prisma.subject.create({ data: { name } });
  res.status(201).json({ subject });
};

const createExercise = async (req, res) => {
  const { subjectId, title, description, difficulty } = req.body;
  if (!subjectId || !title || !description) {
    return res.status(400).json({ error: 'subjectId, title et description sont requis' });
  }

  const exercise = await prisma.exercise.create({
    data: { subjectId, title, description, difficulty: difficulty || 'medium' }
  });
  res.status(201).json({ exercise });
};

module.exports = { getSubjects, getExercise, submitExercise, createSubject, createExercise };
