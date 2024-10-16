const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth-controller')
const authenticate = require('../middlewares/authenticate')

// register
router.post('/register',authController.register)
// login
router.post('/login',authController.login)
// edit profile
router.patch('/:id',authenticate)

module.exports = router