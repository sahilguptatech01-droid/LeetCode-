import type { NextFunction,Request,Response } from "express"
import jwt from "jsonwebtoken"




export const auth=(req:Request,res:Response,next:NextFunction)=>{
   try {
       const token=req.cookies.token
       
       if(token){
           const userDetails=jwt.verify(token,process.env.SECRET_KEY!) 
           if(userDetails){
                res.locals.userId=userDetails.sub
              return next()

           }
       }
   
       return res.status(401).json({
           message:"Unauthorised"
       })
    
   } catch (error) {
        return res.status(500).json({
           message:"Internal server failuure"
       })
    
   }

}

