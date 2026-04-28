const router = require('express').Router();
const { getCourses, getCourse, createCourse, deleteCourse } = require('../controllers/courseController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authenticate);

router.get('/', getCourses);
router.get('/:id', getCourse);
router.post('/', upload.single('file'), createCourse);
router.delete('/:id', deleteCourse);

module.exports = router;
