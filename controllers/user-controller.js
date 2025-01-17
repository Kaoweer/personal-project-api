const prisma = require("../config");

module.exports.getUserProfile = async (req, res) => {
  const { userId } = req.params;
  console.log(
    userId,
    "---------------------------------------------------------------------------"
  );
  const userProfile = await prisma.user.findUnique({
    where: {
      id: parseInt(userId),
    },
  });
  const userProgram = await prisma.trainingProgram.findMany({
    where: {
      id: +userId,
      status: "PUBLIC",
    },
  });
  res.json({ userProfile, userProgram });
};
