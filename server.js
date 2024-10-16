require("dotenv").config()
const express = require("express")
const app = express()
const authRoute = require("./routes/auth-route")
const exerciseRoute = require("./routes/exercise-route")
const programRoute = require("./routes/program-route")
const errorHandler = require("./middlewares/error-middleware")
const notFoundHandler = require("./middlewares/not-found")
const cors = require('cors')

app.use(express.json())
app.use(cors())

app.use('/auth',authRoute)
app.use('/program',programRoute)
app.use('/exercise',exerciseRoute)

app.use(errorHandler)
app.use("*",notFoundHandler)

const port = process.env.PORT || 5000
app.listen(port,() => console.log(`This server is running on port ${port}`))