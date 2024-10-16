const createError = require("../utils/createError")
const jwt = require("jsonwebtoken")
const tryCatch = require("../utils/tryCatch")
const prisma = require("../config/index")

module.exports = tryCatch(async(req,res,next) => {
  const authorization = req.headers.authorization
  console.log(authorization)
  if (!authorization || !authorization.includes('Bearer')){
    createError(401,"Unauthorized")
  }
  const token = authorization.split(' ')[1]
  const payload = jwt.verify(token,process.env.SECRET)
  console.log(payload)
  const foundUser = await prisma.user.findUnique({
    where : {id : payload.id}
  })
  console.log('+++++++++++++++++',foundUser,'++++++++++++++++++++++++++++++')
  if (!foundUser){
    createError(401,"Unauthorized")
  }
  const {password,...userData} = foundUser
  req.user = userData
  next()
})