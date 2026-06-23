const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const {
  getDashboardStats,
  getAllUsers,
  createDeveloper,
  updateDeveloper,
  developerSetPassword,
  updateUserStatus,
  deleteUser,
  getAllProjects,
  deleteProject,
  getAllPayments,
  getAllReviews,
  deleteReview,
  sendGlobalNotification
} = require('../controllers/adminController');

// Public route - developer sets their own password after email verification
router.post('/developers/set-password', developerSetPassword);

// All routes below require admin auth
router.use(protect, roleCheck('admin'));

router.get('/stats', getDashboardStats);

router.route('/users')
  .get(getAllUsers);
  
router.route('/users/:id')
  .delete(deleteUser);

router.put('/users/:id/status', updateUserStatus);
router.post('/developers', createDeveloper);
router.put('/developers/:id', updateDeveloper);

router.route('/projects')
  .get(getAllProjects);

router.route('/projects/:id')
  .delete(deleteProject);

router.route('/payments')
  .get(getAllPayments);

router.route('/reviews')
  .get(getAllReviews);

router.route('/reviews/:id')
  .delete(deleteReview);

router.post('/notifications', sendGlobalNotification);

module.exports = router;
