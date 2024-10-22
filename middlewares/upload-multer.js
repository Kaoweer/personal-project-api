const path = require('path')
const multer = require('multer')
// console.log(__dirname)
// console.log(__dirname, '../upload-pic')
const storage = multer.diskStorage({
    //cb = callback
    destination : (req,file, cb) => cb(null, path.join(__dirname, '../upload_pic')),
    filename: (req,file,cb) => {
        const {id} = req.user
        const fullFilename = `${id}_${Date.now()}_${path.extname(file.originalname)}`
        cb(null, fullFilename)
    }
})

module.exports = multer({storage: storage})