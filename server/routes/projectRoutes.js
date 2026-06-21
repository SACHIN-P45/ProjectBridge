const express = require('express');
const router = express.Router();
const {
  createProject, getProjects, getMyProjects, getProject,
  updateProject, uploadSourceCode, approveProject, deleteProject,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

router.get('/', protect, roleCheck('developer'), getProjects);
router.post('/', protect, roleCheck('student'), upload.array('attachments', 5), createProject);
router.get('/my', protect, getMyProjects);
router.get('/:id', protect, getProject);
router.put('/:id', protect, updateProject);
router.post('/:id/upload-source', protect, roleCheck('developer'), upload.single('sourceCode'), uploadSourceCode);
router.put('/:id/approve', protect, roleCheck('student'), approveProject);
router.delete('/:id', protect, roleCheck('student'), deleteProject);

module.exports = router;
