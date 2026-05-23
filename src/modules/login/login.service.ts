import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { pool } from "../../db";
import config from "../../config";

const loginUserIntoDB = async(payload : {email :string, password: string}) => {

const {email, password} = payload;

const userData = await pool.query(`
    SELECT * FROM users WHERE email=$1
    `,[email]);
    if(userData.rows.length === 0){
        throw new Error("Invalid credentials");

    };
    const user= userData.rows[0];
    // console.log(user);
    const matchPassword = await bcrypt.compare(password, user.password);
    
    if(!matchPassword){
        throw new Error("Invalid Credentials!");
    }
    const jwtPayload = {
        id : user.id,
        name : user.name,
        role : user.role
    }

    const accessToken = jwt.sign(jwtPayload, config.secret as string, {expiresIn : "1d"})
    return {accessToken};


}

export const loginService = {
    loginUserIntoDB
}