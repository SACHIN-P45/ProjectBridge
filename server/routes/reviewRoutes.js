const express = require('express');
const router = express.Router();
const { submitReview, getDeveloperReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.post('/', protect, roleCheck('student'), submitReview);
router.get('/developer/:id', getDeveloperReviews);

module.exports = router;
