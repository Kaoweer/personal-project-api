const prisma = require("../config");
const tryCatch = require("../utils/tryCatch")
const cloudinary = require("../config/cloudinary")
const path = require('path')
const fs = require('fs/promises');
const createError = require("../utils/createError");

module.exports.uploadVerify = tryCatch(async(req,res) => {
  const {id} = req.user
  const haveFile = !!req.file;
  let uploadResult = {};
  if (haveFile) {
    uploadResult = await cloudinary.uploader.upload(req.file.path, {
      overwrite: true,
      public_id: path.parse(req.file.path).name,
    });
    fs.unlink(req.file.path);
  }
  const data = {
    imageUrl: uploadResult.secure_url || "",
    userId: req.user.id,
  };

  console.log(data)
  const rs = await prisma.verification.create({
    data : data
  })
  res.json(rs);
})

module.exports.editVerify = tryCatch(async(req,res) => {
  const {userId} = req.params
  const {role} = req.body
  const foundUser = await prisma.user.findUnique({
    where : {
      id : +userId
    }
  })
  if (!foundUser) {
    createError(404,"User not found")
  }
  const foundVerification = await prisma.verification.findUnique({
    where : {
      userId : +userId
    }
  })
  if (!foundVerification){
    createError(404,"Verification not found")
  }
  const updatedUser = await prisma.user.update({
    where : {
      id : +userId
    },
    data : {
      role : role
    }
  })
  res.json(updatedUser)
})

module.exports.getVerify = tryCatch(async(req,res) => {
  const verifyArray = await prisma.verification.findMany({
    include : {
      user : {
        select : {username:true}
      }
    }
  })
  res.json(verifyArray)
})