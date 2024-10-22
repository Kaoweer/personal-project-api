const express = require('express')
const router = express.Router()
const programController = require('../controllers/program-controller')
const authenticate = require('../middlewares/authenticate')
const isAllowed = require('../middlewares/allow-user')

// Create program
router.post('/',authenticate,programController.createProgram)
// get All public programs
router.get('/',programController.getAllPrograms)
// get program by id
router.get('/get/:programId',programController.getProgramById)
// get personal program
router.get('/personal/',authenticate,programController.getPersonalPrograms)
// Send allow user
router.get('/allow',authenticate,programController.getRequest)
router.get('/allow/user/:programId',authenticate,programController.getAllowStatus)
router.post('/allow/get?',authenticate,programController.getAllRequest)
router.post('/allow/:programId',authenticate,programController.sendAllowRequest)
router.patch('/allow/:programId',authenticate,programController.updateRequest)
// Add exercise to program
router.post('/:programId/:workoutId?',programController.addWorkout)
// Remove exercise from program
router.delete('/:id',programController.removeWorkout)
// get program
router.get('/:programId?',programController.getProgram)
// edit program
router.patch('/:programId',programController.updateProgram)
// edit publicity
router.patch('/publicity/:programId/:publicity',programController.editPublicity)
// 
router.delete('/:programId/day/:day',programController.removeProgrambyDate)
// 

module.exports = router