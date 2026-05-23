import type { Request, Response } from "express";
import { pool } from "../../db";
import { signupService } from "./signup.service";

const createUser = async (req: Request, res:Response) => {
    // const {name, email, password, role} = req.body; 
    // const allowedRoles = ['contributor', 'maintainer'];
    // const userRole = role || 'contributor';

  
    // if (!allowedRoles.includes(userRole)) {
    //     return res.status(400).json({
    //         success: false,
    //         message: "Invalid role"
    //     });
    // }
    try {
       const result = await signupService.createUserIntoDB(req.body)
       res.status(201).json({
            success : true,
            message: "User registered successfully",
            data: result.rows[0]
        })
            
    } catch (error:any) {
        res.status(500).json({
        success : false,
        message: error.message,
        data: error
    })
    }
};
const getUsers = async(req : Request, res : Response) => {
  try {
    const result = await signupService.getAllUsersFromDB();
    res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        data: result.rows,
    });
  } catch (error:any) {
    res.status(500).json({
        success: false,
        message: error.message,
        error: error
    })
    
  }
} 
export const signupController = {
    createUser,
    getUsers
}