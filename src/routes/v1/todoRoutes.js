import express from 'express'
const router = express.Router()
import { getTodos, addTodo, updateTodo, deleteTodo } from '../../controllers/v1/todoControllers.js'

// Get All Todo for the users
router.get( "/",getTodos)

// Create a New Todo
router.post("/",addTodo);

// Update a Todo
router.put("/:id",updateTodo)

// Delete a Todo
router.delete("/:id",deleteTodo)

export default router;