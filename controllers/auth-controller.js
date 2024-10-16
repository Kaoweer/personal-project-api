const createError = require("../utils/createError");
const tryCatch = require("../utils/tryCatch");
const prisma = require("../config/index");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")

function checkEmailOrPhone(identity) {
  let identityKey = "";
  if (/^[0-9]{10,15}$/.test(identity)) {
    identityKey = "mobile";
  }
  if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(identity)) {
    identityKey = "email";
  }
  if (!identityKey) {
    createError(400, "Please input valid email and phone number");
  }
  return identityKey;
}

module.exports.login = tryCatch(async (req, res, next) => {
  const {identity,password} = req.body
  if (!(identity.trim() && password.trim())){
    createError(400, "Please fill all inputs");
  }
  const identityKey = checkEmailOrPhone(identity);
  const foundUser = await prisma.user.findUnique({
    where : {[identityKey] : identity}
  })
  if (!foundUser){
    createError(400,"this user doesn't exist")
  }
  const isPasswordMatch = await bcrypt.compare(password,foundUser.password)
  if (!isPasswordMatch){
    createError(400,"Email or password aren't legit")
  }
  const payload = {id : foundUser.id}
  console.log(payload)
  const token = jwt.sign(payload,process.env.SECRET,{expiresIn: "30d"})
  console.log(token)
  const {password : pw,...userData} = foundUser
  res.json({token,userData})
});
module.exports.register = tryCatch(async (req, res, next) => {
  const { identity, username, password, confirmPassword,gender } = req.body;
  console.log(identity, username, password, confirmPassword,gender);
  if (
    !(
      identity.trim() &&
      username.trim() &&
      password.trim() &&
      confirmPassword.trim()
    )
  ) {
    createError(400, "Please fill all inputs");
  }
  if (password !== confirmPassword) {
    createError(400, "Password and confirm password doesn't match");
  }
  const foundUsername = await prisma.user.findUnique({
    where : {username : username}
  })
  console.log("found username",foundUsername)
  if (foundUsername){
    createError(400,"This username is already exist")
  }
  const identityKey = checkEmailOrPhone(identity);
  const findIdentity = await prisma.user.findUnique({
    where: { [identityKey]: identity },
  });
  if (findIdentity) {
    createError(400, "This user is already exist");
  }
  const hashedPassword = await bcrypt.hash(password,10);
  const newUser = {
    [identityKey]: identity,
    password: hashedPassword,
    username,
    gender
  };
  const result = await prisma.user.create({ data: newUser });
  res.json(result);
});
// module.exports.editProfile = (req, res, next) => {
//   const user = req.user
//   const {}
// };
