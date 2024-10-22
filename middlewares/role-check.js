const createError = require("../utils/createError");
const tryCatch = require("../utils/tryCatch");

module.exports.isAdmin = tryCatch(async(req,res,next) => {
  const {role} = req.user
  if (!req.user){
    createError(401,"Unauthorized")
  }
  if (role != "ADMIN"){
    createError(401,"Unauthorized")
  }
  next()
})

module.exports.isClient = tryCatch(async(req,res,next) => {
  const {role} = req.user
  if (!req.user){
    createError(401,"Unauthorized")
  }
  if (role != "CLIENT"){
    createError(401,"Unauthorized")
  }
  next()
})

module.exports.isTrainer = tryCatch(async(req,res,next) => {
  const {role} = req.user
  if (!req.user){
    createError(401,"Unauthorized")
  }
  if (role != "TRAINER"){
    createError(401,"Unauthorized")
  }
  next()
})