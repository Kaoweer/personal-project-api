const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const exerciseData = require("../data/exercise.json");

const dataString = [];
for (tag of exerciseData) {
  let newValue;
  let newObj = {};
  for ([key, value] of Object.entries(tag)) {
    if (key === "images" || key === "id" || key === "instructions") {
      continue;
    }
    newValue = value;
    if (typeof value === "object") {
      if (!value) {
        newValue = null;
      } else if (value.length == 0) {
        newValue = null;
      } else newValue = JSON.stringify(value);
    }
    newObj[key] = newValue;
  }
  dataString.push(newObj);
}
const users = [];
users.push({username: "Hello",email: "kaowkawo@admin.com",password: "$10$AmIvP1ydSG/AFsowHPR1MuYBYXzByYYRaF1o7sI5EYK581ckGHEaO"},
  {username: "Googbye",email: "kaowkawo1@admin.com",password: "$10$AmIvP1ydSG/AFsowHPR1MuYBYXzByYYRaF1o7sI5EYK581ckGHEaO"},
  {username: "Kaowkawo",email: "kaowkawo2@admin.com",password: "$10$AmIvP1ydSG/AFsowHPR1MuYBYXzByYYRaF1o7sI5EYK581ckGHEaO"}
);

const TrainingProgram = []
TrainingProgram.push({authorId : 1},{authorId : 1},{authorId : 1})

async function run() {
  await prisma.Workout.createMany({ data: dataString });
  await prisma.user.createMany({ data: users });
  await prisma.TrainingProgram.createMany({ data: TrainingProgram });
}

run();
console.log("DB Seed...");