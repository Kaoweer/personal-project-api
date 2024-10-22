const createError = require("../utils/createError")
const jwt = require("jsonwebtoken")
const tryCatch = require("../utils/tryCatch")
const prisma = require("../config/index")

module.exports = tryCatch(async(req,res,next) => {
  const {id} = req.user
  const {programId} = req.params
  if (!id || !programId){
    createError(401,"This user is not allow to access this program")
  }
  const isUserAllowed = await prisma.allowedUser.findUnique({
    where : {
      programId_userId : {
        programId: +programId,
        userId: +id,
      }
    }
  })
  if (!isUserAllowed){
    createError(401,"This user is not allow to access this program")
  }
  next()
  console.log(isUserAllowed)
})