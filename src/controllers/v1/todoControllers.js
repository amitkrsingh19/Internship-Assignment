import prisma from '../../prismaClient.js'

async function getTodos (req,res) {
    const id = req.userId;
    try{
      const todos = await prisma.todo.findMany({
        where : {
          userId : id
      }
    })
    res.json(todos)
    }catch(err){
      console.error(err)
      res.status(500).json({message : "Could not Fetch Todos"})
    }
   }

async function addTodo(req,res){
  const {task}= req.body
  const id = req.userId
  try{
    const newTodo = await prisma.todo.create({
      data:{
        task ,
        userId : id
      }
    });
    
    res.status(201).json({
      message:"successfully added todo",
      "task":newTodo})
  }catch(err){
    return res.status(500).json({message:err})
  }
 }

 async function updateTodo(req,res){
    const {completed} = req.body
    const {id} = req.params
    const userId = req.userId
    try{
      const todoId = parseInt(id);
      const updatedTodo = await prisma.todo.updateMany({
        where : {
          id : todoId,
          userId : userId
        },
        data: {
          completed : !!completed
        }
      })
      if (updatedTodo.count === 0 ){
        return res.status(404).json({message: "Todo not found or Unauthorized" })
      }
      res.json(updatedTodo)
    }catch(err){
      console.error({message:err})
      res.status(500).json({message:"Internal server error"})
    }
   }

async function deleteTodo(req,res){ 
    const {id} = req.params
    const userId = req.userId
    try{
      const todoId = parseInt(id)
      // Ensure users can only delete their own todos.
      const deleteSTodo = await prisma.todo.deleteMany({
        where : {
          id : todoId,
          userId
        }
      });
      if (deleteSTodo.count === 0) {
        return res.status(404).json({message:"Todo not found or Unauthorized"})
      }
      res.status(201).json({message:"task Deleted"})
    }catch(err){
      console.error("Error deleting todo:",err);
      res.status(500).send({message:err})
    }
  }

export {getTodos, addTodo, updateTodo, deleteTodo}