const router = require('express').Router();
const {
  getSubjects, getExercise, submitExercise, createSubject, createExercise
} = require('../controllers/exerciseController');
const { authenticate, isAdmin } = require('../middleware/auth');

router.use(authenticate);

router.get('/subjects', getSubjects);
router.get('/:id', getExercise);
router.post('/:id/submit', submitExercise);

router.post('/subjects', isAdmin, createSubject);
router.post('/', isAdmin, createExercise);

module.exports = router;
