const router = require('express').Router();
const { getRecap, generateRecap } = require('../controllers/recapController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/:courseId', getRecap);
router.post('/:courseId/generate', generateRecap);

module.exports = router;
