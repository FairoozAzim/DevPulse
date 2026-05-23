import type { Request, Response } from "express";
import { pool } from "../../db";
import { signupService } from "./signup.service";
import sendResponse from "../../utils/sendResponse";

const createUser = async (req: Request, res:Response) => {

    try {
       const result = await signupService.createUserIntoDB(req.body)
        sendResponse(res,{
            statusCode : 201,
            success : true,
            message: "User registered successfully",
            data: result.rows[0]
        } )
            
    } catch (error:any) {
        sendResponse(res,{
            statusCode : 500,
            success : false,
            message: error.message,
            data: error
        } )
    }
};

export const signupController = {
    createUser,
}