import type { Request, Response } from "express"
import { loginService } from "./login.service"

const loginUser = async(req : Request, res : Response) => {
    try {
        const result = await loginService.loginUserIntoDB(req.body);
         res.status(200).json({
            success : true,
            message: "Logged In Successfully",
            data: result
        })
        
    } catch (error :any) {
        res.status(500).json({
        success : false,
        message: error.message,
        data: error
        
    })

}
}
export const loginController = {
    loginUser
}