const express = require('express');
const weatherController = require('../controllers/weatherController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Weather routes
router.get('/current', weatherController.getCurrentWeather);
router.get('/forecast', weatherController.getWeatherForecast);
router.get('/location/:locationId', weatherController.getWeatherByLocation);
router.get('/alerts', weatherController.getWeatherAlerts);

module.exports = router; 