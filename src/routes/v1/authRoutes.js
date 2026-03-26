import express from 'express'
import { register ,login} from '../../controllers/v1/authControllers.js'

const router = express.Router()
// Register new User Endpoint
router.post("/register", register)
router.post("/login", login)

export default router