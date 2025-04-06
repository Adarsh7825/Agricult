const express = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User profile routes
router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile);
router.put('/location', userController.updateUserLocation);
router.put('/change-password', userController.changePassword);

module.exports = router; 