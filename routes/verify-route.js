const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth-controller')
const authenticate = require('../middlewares/authenticate')
const upload = require('../middlewares/upload-multer')
const roleCheck = require('../middlewares//role-check')
const verifyController = require('../controllers/verify-controller')

router.post("/",authenticate,roleCheck.isClient,upload.single('image'),verifyController.uploadVerify)
router.patch("/:userId",authenticate,roleCheck.isAdmin,verifyController.editVerify)
router.get("/",authenticate,roleCheck.isAdmin,verifyController.getVerify)

module.exports = router