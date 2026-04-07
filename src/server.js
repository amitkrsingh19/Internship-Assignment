import 'dotenv/config'
import express from 'express'
import path ,{dirname} from 'path'
import {fileURLToPath} from 'url'
import authRoutes from '../src/routes/v1/authRoutes.js'
import todoRoutes from '../src/routes/v1/todoRoutes.js'
import {authMiddleware} from '../src/middleware/authMiddleware.js'
import cors from 'cors'

// Must match the frontend + Dockerfile expectation.
const PORT = process.env.PORT || 8383

const app = express()

// Get the filename 
const __filename = fileURLToPath(import.meta.url)
// Get the directory name
const __dirname = dirname(__filename)

// Middlewares
app.use(cors())
app.use(express.json())
const publicPath = path.join(__dirname,'../public')
app.use(express.static(publicPath))

app.get("/",(req,res) => {
  res.sendFile(path.join(publicPath,"index.html"))
})

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/todos', authMiddleware, todoRoutes)

app.listen(PORT,'0.0.0.0',() => {
  console.log(`Server started at PORT :${PORT}`)
})
