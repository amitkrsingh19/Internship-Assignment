import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../../prismaClient.js'


async function register(req,res){
    const {username , password} = req.body
    console.log(username)
    if(!username || !password){
        return res.status(400).json({ message: "username and password are required" })
    }
    const userExist = await prisma.user.findUnique({
        where : {
            username : username
        }
    })
    if(userExist){
        return res.status(401).send({message:"user Already Exists,Kindly Login"
        })
    }
        // encrypt the password
    const hashedPassword = bcrypt.hashSync(password, 8)
      
    // Save the New User and Hashed Password in DB
    try{
        const user = await prisma.user.create({
        data : {
            username : username,
            password : hashedPassword
        }
    })
      
          // Default ToDOs
    const defaultTodo = "Hello :) Add your first todo!"
    await prisma.todo.create({
        data : {
            task : defaultTodo,
            userId : user.id,
            completed : false
       }
    })
    // Create Payload and Respond with Token
    const jwtSecret = process.env.JWTSECRET || process.env.JWT_SECRET
    if(!jwtSecret){
      return res.status(500).json({ message: "JWT secret not configured" })
    }
    const token = jwt.sign({id : user.id},jwtSecret,{expiresIn:'1h'})
    return res.status(201).json({token});

    }catch(err){
        console.log(err.message)
        return res.status(503).json({ message: "Internal Server Error" })
    }
}

async function login(req,res){
    const {username,password} = req.body
    if(!username || !password){
      return res.status(400).json({ message: "username and password are required" })
    }
    try{
      const user = await prisma.user.findUnique({
        where : {
          username : username
        }
      })
      if(!user){
        return res.status(404).send({message:"user not FOUND "})
      }
      // Hash the password
      const passwordIsValid = bcrypt.compareSync(password,user.password)
  
      if(!passwordIsValid){ return res.status(404).send({message:"InValid Password"})
      }
  
      // sign Token with payload
      const jwtSecret = process.env.JWTSECRET || process.env.JWT_SECRET
      if(!jwtSecret){
        return res.status(500).json({ message: "JWT secret not configured" })
      }
      const token = jwt.sign({id:user.id}, jwtSecret, {expiresIn:'1h'}) 
      return res.json({token})
    } catch(err){
      console.log(err.message)
      res.sendStatus(503)
    }
  }

export { register, login }