const express = require('express')
const router = express.Router()
const programController = require('../controllers/program-controller')
const authenticate = require('../middlewares/authenticate')

// Create program
router.post('/',authenticate,programController.createProgram)
// get All public programs
router.get('/',programController.getAllPrograms)
// get program by id
router.get('/get/:programId',programController.getProgramById)
// get personal program
router.get('/personal',authenticate,programController.getPersonalPrograms)
// Add exercise to program
router.post('/:programId/:workoutId',programController.addWorkout)
// Remove exercise from program
router.delete('/:id',programController.removeWorkout)
// get program
router.get('/:programId?',programController.getProgram)
// edit program
router.patch('/:programId',programController.updateProgram)
// edit publicity
router.patch('/publicity/:programId/:publicity',programController.editPublicity)
// 

module.exports = router