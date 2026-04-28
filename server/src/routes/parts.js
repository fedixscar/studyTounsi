const router = require('express').Router();
const { getPart, generatePartContent, updatePartStatus } = require('../controllers/partController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/:id', getPart);
router.post('/:id/generate', generatePartContent);
router.patch('/:id/status', updatePartStatus);

module.exports = router;
