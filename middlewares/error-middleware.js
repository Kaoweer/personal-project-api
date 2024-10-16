module.exports = (err,req,res,next) => {
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({err : err.message})
  console.log(err)
}