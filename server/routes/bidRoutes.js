const express = require('express');
const router = express.Router();
const { submitBid, getProjectBids, acceptBid, getMyBids, updateBid } = require('../controllers/bidController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.post('/', protect, roleCheck('developer'), submitBid);
router.get('/my', protect, roleCheck('developer'), getMyBids);
router.get('/project/:projectId', protect, getProjectBids);
router.put('/:id/accept', protect, roleCheck('student'), acceptBid);
router.put('/:id', protect, roleCheck('developer'), updateBid);

module.exports = router;
