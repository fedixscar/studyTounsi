const prisma = require('../prisma');
const gemini = require('../services/gemini');


const getQuiz = async (req, res) => {
  const quiz = await prisma.quiz.findFirst({
    where: {
      partId: req.params.partId,
      part: { course: { userId: req.user.id } }
    }
  });

  if (!quiz) return res.status(404).json({ error: 'Quiz non trouvé — générez-le d\'abord' });
  res.json({ quiz });
};

const generateQuiz = async (req, res) => {
  const part = await prisma.part.findFirst({
    where: {
      id: req.params.partId,
      course: { userId: req.user.id }
    },
    include: {
      course: { select: { language: true } },
      quiz: true
    }
  });

  if (!part) return res.status(404).json({ error: 'Partie introuvable' });

  if (part.quiz) return res.json({ quiz: part.quiz });

  const quizData = await gemini.generateQuiz(part.title, part.content, part.course.language);

  const quiz = await prisma.quiz.create({
    data: {
      partId: part.id,
      questions: quizData
    }
  });

  res.status(201).json({ quiz });
};

const submitQuiz = async (req, res) => {
  const { answers } = req.body;

  const quiz = await prisma.quiz.findFirst({
    where: {
      id: req.params.quizId,
      part: { course: { userId: req.user.id } }
    },
    include: { part: { select: { id: true, course: { select: { language: true } } } } }
  });

  if (!quiz) return res.status(404).json({ error: 'Quiz introuvable' });

  const questions = quiz.questions.questions;
  let score = 0;
  const wrongAnswers = [];

  answers.forEach(answer => {
    const question = questions.find(q => q.id === answer.questionId);
    if (!question) return;

    if (answer.selectedIndex === question.correctIndex) {
      score += question.points;
    } else {
      wrongAnswers.push({
        questionId: answer.questionId,
        givenIndex: answer.selectedIndex
      });
    }
  });

  const totalScore = quiz.questions.totalPoints;
  const passingScore = quiz.questions.passingScore;
  const passed = score >= passingScore;

  const attempt = await prisma.quizAttempt.create({
    data: {
      quizId: quiz.id,
      userId: req.user.id,
      score,
      totalScore,
      passed,
      answers
    }
  });

  if (passed) {
    await prisma.part.update({
      where: { id: quiz.part.id },
      data: { status: 'VALIDATED' }
    });
  }

  let explanations = [];
  if (wrongAnswers.length > 0) {
    const result = await gemini.explainQuizErrors(
      questions,
      wrongAnswers,
      quiz.part.course.language
    );
    explanations = result.explanations;
  }

  res.json({ attempt, score, totalScore, passingScore, passed, explanations });
};

const getAttempts = async (req, res) => {
  const attempts = await prisma.quizAttempt.findMany({
    where: {
      quizId: req.params.quizId,
      userId: req.user.id
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ attempts });
};

module.exports = { getQuiz, generateQuiz, submitQuiz, getAttempts };
