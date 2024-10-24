const express = require('express')
const router = express.Router()
const exerciseController = require('../controllers/exercise-controller')

router.get('/:amount/:page?',exerciseController.getWorkout)

// console.log('asdasddas')
router.get('/id/id/id/:workoutId',exerciseController.getWorkoutById)

module.exports = router