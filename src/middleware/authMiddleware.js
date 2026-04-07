import jwt from 'jsonwebtoken'

function authMiddleware(req, res, next){
  const authHeader = req.headers['authorization']
  // Frontend may send either raw token or "Bearer <token>".
  const token = (authHeader || '').startsWith('Bearer')
    ? authHeader.slice(7)
    : authHeader

  if(!token){return res.status(401).json({message:"No Token Provided"})
  }
  // Verify the token
  const jwtSecret = process.env.JWTSECRET || process.env.JWT_SECRET
  if(!jwtSecret){
    return res.status(500).json({message:"JWT secret not configured"})
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if(err){
      console.error("CRITICAL: JWT Secret is missing from .env");
      return res.status(401).json({message:"Invalid Token"})
    }
    req.userId = decoded.id
    next()
  })
  
}


export {authMiddleware};