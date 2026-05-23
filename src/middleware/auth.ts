import jwt, { type JwtPayload } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import config from "../config";
import { pool } from "../db";
import type { ROLES } from "../types";



const auth = (...roles: ROLES[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      
    const token = req.headers.authorization;

    if(!token){
        res.status(401).json({
            success : false,
            message : "Unauthorized Access"
        })
    };
    const decoded = jwt.verify(token as string, config.secret as string ) as JwtPayload;
   
    const userData = await pool.query(
        `
        SELECT * FROM users WHERE id=$1
        `,[decoded.id]
    )
    const user = userData.rows[0]
    if(userData.rows.length === 0){
        res.status(404).json({
            success : false,
            message : "User not found!"
        })
    }
    // console.log("user role",user.role);
    if(roles.length && !roles.includes(user.role)){
          res.status(403).json({
            success : false,
            message : "Unauthorized user!"
        })

    }
    req.user = decoded

    next();
}
};

export default auth;