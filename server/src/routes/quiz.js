const router = require('express').Router();
const { getQuiz, generateQuiz, submitQuiz, getAttempts } = require('../controllers/quizController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/part/:partId', getQuiz);
router.post('/part/:partId/generate', generateQuiz);
router.post('/:quizId/submit', submitQuiz);
router.get('/:quizId/attempts', getAttempts);

module.exports = router;
