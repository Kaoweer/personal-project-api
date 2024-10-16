const prisma = require("../config");
const tryCatch = require("../utils/tryCatch");

module.exports.getWorkout = tryCatch(async (req, res) => {
  const { amount, page } = req.params;
  const { workoutId,primaryMuscles, mechanic, equipment, category, level, force } = req.query;
  console.log(req.query,"-------------------------------------------------------------------------------")
  const limit = (page - 1) * amount;
  const workouts = await prisma.workout.findMany({
    take: +amount,
    skip: +limit,
    where: {
      primaryMuscles : {
        contains : primaryMuscles
      },
      id : +workoutId || undefined,
      mechanic,
      equipment,
      category,
      level,
      force
    },
  });

  res.json(workouts);
});

module.exports.getWorkoutById = tryCatch(async (req, res) => {
  const {workoutId} = req.params
  const workout = await prisma.workout.findUnique({
    where : {
      id : +workoutId
    }
  })
  res.json(workout)
})
