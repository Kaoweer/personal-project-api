const tryCatch = require("../utils/tryCatch");
const prisma = require("../config/index");
const createError = require("../utils/createError");
const cloudinary = require("../config/cloudinary")
const path = require('path')
const fs = require('fs/promises');

module.exports.createProgram = tryCatch(async (req, res) => {
  const { name, status,tags,detail } = req.body;

  const haveFile = !!req.file;
  let uploadResult = {};
  if (haveFile) {
    uploadResult = await cloudinary.uploader.upload(req.file.path, {
      overwrite: true,
      public_id: path.parse(req.file.path).name,
    });
    fs.unlink(req.file.path);
  }
  const image = uploadResult.secure_url || ""

  const stringTag = JSON.stringify(tags)
  const createdProgram = await prisma.TrainingProgram.create({
    data: {
      authorId: +req.user.id,
      name: name,
      status: status,
      tags : stringTag,
      image : image,
      detail : detail || ""
    },
  });
  res.json(createdProgram);
});
// Maybe send ids through req.body
module.exports.addWorkout = tryCatch(async (req, res) => {
  const { programId, workoutId } = req.params;
  const { day } = req.query;
  let lastVal;
  const [maxOrder] = await prisma.ProgramWorkout.findMany({
    where: { programId: +programId },
    orderBy: { orderPriority: "desc" },
    take: 1,
  });
  if (!maxOrder) {
    lastVal = 1;
  }
  // else if (Object.keys(maxOrder).length === 0){
  //   lastVal = 1
  // }
  else {
    lastVal = +maxOrder.orderPriority + 1;
  }
  const rs = await prisma.ProgramWorkout.create({
    data: {
      orderPriority: lastVal,
      sets: 1,
      reps: 1,
      rest: 1,
      trainingProgram: {
        connect: {
          id: +programId,
        },
      },
      workout: {
        connect: {
          id: +workoutId,
        },
      },
      day: +day,
    },
  });
  res.json(rs);
});

module.exports.removeWorkout = tryCatch(async (req, res, next) => {
  const { id } = req.params;
  // const foundWorkout = await prisma.ProgramWorkout.findMany({
  //   where: { programId: +programId },
  // });
  // if (Object.keys(foundWorkout).length === 0) {
  //   createError(401, "Program doesn't exist");
  // }
  // console.log("foundWorkout", foundWorkout);
  // let id;
  // if (
  //   !foundWorkout.some((item) => {
  //     id = item.id;
  //     console.log(id);
  //     return item.orderPriority === +orderPriority;
  //   })
  // ) {
  //   createError(401, "This order doesn't exist");
  // }
  const deletedWorkout = await prisma.ProgramWorkout.delete({
    where: { id: +id },
  });
  res.json(deletedWorkout);
});

module.exports.getProgram = tryCatch(async (req, res, next) => {
  const { programId } = req.params;
  const { day } = req.query;
  const input = !day
    ? { programId: +programId }
    : { programId: +programId, day: +day };
  console.log(input);
  const programList = await prisma.programWorkout.findMany({
    orderBy: { orderPriority: "asc" },
    where: input,
    include: {
      workout: {
        select: {
          name: true,
          equipment: true,
          category: true,
          force: true,
          mechanic: true,
          primaryMuscles: true,
        },
      },
    },
  });
  // if (programList.length === 0){
  //   createError(400,"This program doesn't exist")
  // }
  console.log("Program", programList);
  res.json(programList);
});

module.exports.getProgramById = tryCatch(async (req, res, next) => {
  const { programId } = req.params;
  const program = await prisma.trainingProgram.findUnique({
    where: {
      id: +programId,
    },
    include: {
      author: {
        select: {
          username: true,
        },
      },
    },
  });
  res.json(program);
});

module.exports.updateProgram = tryCatch(async (req, res, next) => {
  const { programId } = req.params;
  const updateArray = req.body;
  const dataSet = { id: new Set(), orderPriority: new Set() };
  for (newData of updateArray) {
    dataSet.id.add(newData.id);
    dataSet.orderPriority.add(newData.orderPriority);
  }
  const foundProgram = await prisma.programWorkout.findMany({
    where: { programId: +programId },
    include: {
      workout: {
        select: {
          category: true,
          mechanic: true,
          level: true,
          equipment: true,
        },
      },
    },
  });
  console.log(foundProgram);
  const programIdSet = new Set();
  for (foundData of foundProgram) {
    programIdSet.add(foundData.id);
  }
  console.log("----------", programIdSet, dataSet.id);
  // if (foundProgram.length !== updateArray.length){
  //   createError(400,"Data size don't match")
  // }
  for (let id of dataSet.id) {
    if (!programIdSet.has(id)) {
      createError(400, "ProgramId and Id need to match");
    }
  }
  if (dataSet.id.size !== updateArray.length) {
    createError(400, "There's a duplication in program id");
  }
  if (dataSet.orderPriority.size !== updateArray.length) {
    createError(400, "There's a duplication in workout order");
  }
  for (newData of updateArray) {
    newData.sets = newData.sets > 0 ? newData.sets : 0;
    newData.reps = newData.reps > 0 ? newData.reps : 0;
    newData.rest = newData.rest > 0 ? newData.rest : 0;

    await prisma.programWorkout.update({
      where: { id: +newData.id },
      data: {
        sets: +newData.sets,
        reps: +newData.reps,
        rest: +newData.rest,
        orderPriority: +newData.orderPriority,
      },
    });
  }
  let tags = {
    category: new Set(),
    mechanic: new Set(),
    level: new Set(),
    equipment: new Set(),
  };
  for (let item of foundProgram) {
    for (let tag in tags) {
      if (item.workout[tag]) tags[tag].add(item.workout[tag]);
    }
  }
  for (let [key, value] of Object.entries(tags)) {
    tags[key] = Array.from(value);
  }
  const stringifyTag = JSON.stringify(tags);
  console.log(
    tags,
    "-----++++++++++++++++++++++++++++++++++++++++++++++++++++"
  );
  // const compressedTag = await zlib.gzipSync(stringifyTag).toString('base64');
  // console.log(compressedTag,"-----------------------------------------------------------------------")
  // const updatedTag = await prisma.trainingProgram.update({
  //   where : {
  //     id : +programId
  //   },
  //   data : {
  //     tags : compressedTag
  //   }
  // })
  // console.log(updatedTag)
  res.json({ msg: "done" });
});

module.exports.getAllPrograms = tryCatch(async (req, res, next) => {
  const allProgram = await prisma.trainingProgram.findMany({
    where: { status: "PUBLIC" },
    include: {
      author: {
        select: {
          username: true,
        },
      },
      workouts: {
        include: {
          workout: {
            select: {
              category: true,
              mechanic: true,
              level: true,
              equipment: true,
            },
          },
        },
      },
    },
  });
  res.json(allProgram);
});

module.exports.getPersonalPrograms = tryCatch(async (req, res, next) => {
  const { id } = req.user;
  const allProgram = await prisma.trainingProgram.findMany({
    where: { authorId: +id },
  });
  res.json(allProgram);
});

module.exports.editPublicity = tryCatch(async (req, res, next) => {
  const { programId, publicity } = req.params;
  const { name, status, tags, detail } = req.body;

  console.log(tags,"------------------------------------")

  if (isNaN(programId)) {
    return next(createError(400, "Invalid Program ID"));
  }

  console.log(programId, publicity);
  console.log(name, status, tags, detail);

  const haveFile = !!req.file;
  let uploadResult = {};
  
  if (haveFile) {
    try {
      uploadResult = await cloudinary.uploader.upload(req.file.path, {
        overwrite: true,
        public_id: path.parse(req.file.path).name,
      });
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("File deletion error: ", err);
      });
    } catch (error) {
      return next(createError(500, "Image upload failed"));
    }
  }

  const foundProgram = await prisma.trainingProgram.findUnique({
    where: { id: +programId },
  });

  if (!foundProgram) {
    return next(createError(404, "Program not found"));
  }

  const image = uploadResult.secure_url || foundProgram.image;
  const prvDetail = detail || foundProgram.detail;
  const prvTag = tags || foundProgram.tags;
  const prvPublicity = ["PUBLIC", "PRIVATE", "PERSONAL"].includes(publicity)
    ? publicity
    : foundProgram.status; // Use string for publicity
  const stringTag = prvTag ? prvTag : undefined;

  const updatedProgram = await prisma.trainingProgram.update({
    where: { id: +programId },
    data: { 
      status: prvPublicity,
      name: name,
      tags: stringTag,
      image: image,
      detail: prvDetail,
    },
  });

  res.json(updatedProgram);
});

module.exports.removeProgrambyDate = tryCatch(async (req, res) => {
  const { programId, day } = req.params;
  const deletedDate = await prisma.programWorkout.deleteMany({
    where: {
      programId: +programId,
      day: +day,
    },
  });
  res.json(deletedDate);
});

module.exports.sendAllowRequest = tryCatch(async (req, res) => {
  const { id } = req.user;
  const { programId } = req.params;

  const isProgramExist = await prisma.trainingProgram.findUnique({
    where: { id: +programId },
  });
  if (!isProgramExist) {
    createError(400, "This program doesn't exist");
  }
  const foundUser = await prisma.allowedUser.findUnique({
    where: {
      programId_userId: {
        programId: +programId,
        userId: +id,
      },
    },
  });
  if (foundUser) {
    createError(400, "This request is already sent");
  }
  const sendRequest = await prisma.allowedUser.create({
    data: { programId: +programId, userId: +id },
  });
  res.json(sendRequest);
});
module.exports.updateRequest = tryCatch(async (req, res) => {
  const { userId, isAllowed } = req.body;
  const { programId } = req.params;
  const isProgramExist = await prisma.trainingProgram.findUnique({
    where: { id: +programId },
  });
  if (!isProgramExist) {
    createError(400, "This program doesn't exist");
  }
  const updatedRequest = await prisma.allowedUser.update({
    where: {
      programId_userId: {
        programId: +programId,
        userId: +userId,
      },
    },
    data: { isAllowed: isAllowed },
  });
  res.json(updatedRequest);
});

module.exports.getAllRequest = tryCatch(async (req, res) => {
  const {programIdList} = req.body
  const {userId} = req.query

  let requestList = []
  if (req.body || programIdList.length == 0){
    requestList = await prisma.allowedUser.findMany({
      where : {
        userId : +userId
      }
    })
    console.log(1,requestList)
  }else{
    requestList = await prisma.allowedUser.findMany({
      where : {
        programId : {
          in : programIdList
        },
        userId :+userId
      }
    })
    console.log(1,requestList)
  }
  
  res.json(requestList)
})

module.exports.getAllowStatus = tryCatch(async (req, res) => {
  const {programId} = req.params
  const {id} = req.user
  const isUserAllowed = await prisma.allowedUser.findUnique({
    where: {
      programId_userId: {
        programId: +programId,
        userId: +id,
      },
    },
  })
  res.json(isUserAllowed)
})
module.exports.getRequest = tryCatch(async (req, res) => {
  const {id} = req.user
  console.log(id,"+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+")
  const userProgram = await prisma.trainingProgram.findMany({
    where : {
      authorId : +id,
      status : "PERSONAL"
    },
  })
  console.log(userProgram)
  const programArray = userProgram.map((el) => +el.id)
  console.log(programArray)
  const requests = await prisma.allowedUser.findMany({
    where : {
      programId : {
        in : programArray
      }
    },
    include : {
      user : {
        select : {username : true}
      },
      trainingProgram : {
        select : {name : true}
      }
    },
    orderBy : [
      {isAllowed : "asc"},
      {id : "asc"}
    ]
  })
  console.log(programArray,requests)
  res.json(requests)
})

module.exports.deleteProgram = tryCatch(async(req,res) => {
  const {programId} = req.params

  const foundProgram = await prisma.trainingProgram.findUnique({
    where: { id: +programId },
  })

  if (!foundProgram){
    createError(404,"Program not found")
  }
  console.log(foundProgram.authorId !== req.user.id,typeof foundProgram.authorId,typeof req.user.id,55555555)
  if(foundProgram.authorId !== req.user.id){
    createError(401,"Unauthorized")
  }
  const deletedProgram = await prisma.trainingProgram.delete({
    where : {
      id : +programId
    }
  })
  res.json(deletedProgram)
})