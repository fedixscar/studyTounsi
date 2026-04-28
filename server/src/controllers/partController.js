const prisma = require('../prisma');
const gemini = require('../services/gemini');


const getPart = async (req, res) => {
  const part = await prisma.part.findFirst({
    where: {
      id: req.params.id,
      course: { userId: req.user.id }
    },
    include: {
      summary: true,
      remark: true,
      tip: true,
      quiz: true,
      course: { select: { id: true, title: true, language: true } }
    }
  });

  if (!part) return res.status(404).json({ error: 'Partie introuvable' });
  res.json({ part });
};

const generatePartContent = async (req, res) => {
  const part = await prisma.part.findFirst({
    where: {
      id: req.params.id,
      course: { userId: req.user.id }
    },
    include: {
      course: { select: { language: true } },
      summary: true,
      remark: true,
      tip: true
    }
  });

  if (!part) return res.status(404).json({ error: 'Partie introuvable' });

  if (part.summary && part.remark && part.tip) {
    return res.json({ message: 'Contenu déjà généré', part });
  }

  const content = await gemini.generatePartContent(part.title, part.content, part.course.language);

  const [summary, remark, tip] = await Promise.all([
    prisma.summary.upsert({
      where: { partId: part.id },
      update: { content: content.summary },
      create: { partId: part.id, content: content.summary }
    }),
    prisma.remark.upsert({
      where: { partId: part.id },
      update: { content: content.remarks },
      create: { partId: part.id, content: content.remarks }
    }),
    prisma.tip.upsert({
      where: { partId: part.id },
      update: { content: content.tips },
      create: { partId: part.id, content: content.tips }
    })
  ]);

  res.json({ summary, remark, tip });
};

const updatePartStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['PENDING', 'VALIDATED', 'SKIPPED'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Statut invalide' });
  }

  const part = await prisma.part.findFirst({
    where: { id: req.params.id, course: { userId: req.user.id } }
  });

  if (!part) return res.status(404).json({ error: 'Partie introuvable' });

  const updated = await prisma.part.update({
    where: { id: req.params.id },
    data: { status }
  });

  res.json({ part: updated });
};

module.exports = { getPart, generatePartContent, updatePartStatus };
