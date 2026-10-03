import express from "express"
import {z} from "zod"
import { prisma } from "./lib/prisma"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"


const app=express()
app.use(express.json())

app.get('/health',(req,res)=>{
    res.json({
        message:"Health is good"
    })
})


app.post('/signup',async(req,res)=>{
    
    const {email,name,password}=req.body
    
    
    try {
        const userExists=await prisma.user.findUnique({
            where:{
                email
            }
        })
        
        if(userExists){
            return res.status(409).json({
                message:"User already exist"
            })
            
        }
        
        const hashedPassword=await bcrypt.hash(password,10)
        const user=await prisma.user.create({
            data:{
                name,
                email,
                passwordHash:hashedPassword
            }
        })
        
        const token=jwt.sign({
            sub:user.id,
            email:email
        },process.env.SECRET_KEY !)

        res.cookie("token",token)
        
        return res.status(201).json({
            message:"User created",
            data:{
                email:user.email,
                name:user.name,
            }
        })


    } catch (error) {
        console.error(error);
        
        return res.status(500).json({
            message:"Internal server error"
        })
        
    }
})


app.post('/signin',async(req,res)=>{
    const {email,password}=req.body
    
    try {
        const result=await prisma.user.findUnique({
            where:{
                email
            }
        })
        if(!result){
            return res.status(401).json({
                message:"User not exist"
            })
        }
        const userPassword=await bcrypt.compare(password,result.passwordHash)
        if(userPassword){

             const token=jwt.sign({
                sub:result.id,
                email:email
            },process.env.SECRET_KEY!)
            
            res.cookie("token",token)
            return res.status(200).json({
                message:"Signin successful"
            })
        }
        
        return res.status(401).json({
        message:"Invalid crenditals"
    })
    
} catch (error) {
    console.error(error);
    
    return res.status(500).json({
        message:"Internal server error"
    })
    
    
    
}
})



const CreatePromblemSchema=z.object({
    question:z.string(),
    description:z.string(),

})


app.post('/create/problem',async(req,res)=>{
    const problem=req.body
    const{success}=CreatePromblemSchema.safeParse(problem)
    
    if(!success){
        return res.status(400).json({
            message:"Bad Request"

        })
        
    }

    try {
        const createProblem=await prisma.problem.create({
            data:problem
        })
        return res.json({
            message:"Promblem Created",
            data:createProblem
        })
        
    } catch (error) {
        return res.status(500).json({
            message:"Internal server error",

        })
        
    }

    
})




app.listen(3000,()=>{
    console.log('Server is running')
})
