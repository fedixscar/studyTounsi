const prisma = require('../prisma');
const gemini = require('../services/gemini');


const getRecap = async (req, res) => {
  const recap = await prisma.recapSheet.findFirst({
    where: {
      courseId: req.params.courseId,
      userId: req.user.id
    }
  });

  if (!recap) return res.status(404).json({ error: 'Fiche récap non trouvée' });
  res.json({ recap });
};

const generateRecap = async (req, res) => {
  const course = await prisma.course.findFirst({
    where: { id: req.params.courseId, userId: req.user.id },
    include: {
      parts: {
        orderBy: { order: 'asc' },
        include: { summary: true, remark: true, tip: true }
      }
    }
  });

  if (!course) return res.status(404).json({ error: 'Cours introuvable' });

  const allCompleted = course.parts.length > 0 && course.parts.every(p => p.status !== 'PENDING');
  if (!allCompleted) {
    return res.status(400).json({ error: 'Toutes les parties doivent être complétées avant de générer la fiche récap' });
  }

  const existing = await prisma.recapSheet.findFirst({
    where: { courseId: course.id, userId: req.user.id }
  });
  if (existing) return res.json({ recap: existing });

  const content = await gemini.generateRecap(course.parts, course.language);

  const recap = await prisma.recapSheet.create({
    data: {
      courseId: course.id,
      userId: req.user.id,
      content
    }
  });

  res.status(201).json({ recap });
};

module.exports = { getRecap, generateRecap };
