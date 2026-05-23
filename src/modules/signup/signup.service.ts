import { pool } from "../../db";
import AppError from "../../utils/sendError";
import type { IUser } from "./signup.interface";
import bcrypt from "bcryptjs";

const createUserIntoDB = async(payload : IUser) => {

    const { name, email, password, role } = payload;
    const hashPassword = await bcrypt.hash(password, 11);

    const allowedRoles = ['contributor', 'maintainer'];
    const userRole = role || 'contributor';
    //role validation for max safety
    if (!allowedRoles.includes(userRole)) {
        throw new AppError(400,"Invalid Role!");
    }

    const result = await pool.query(`
        INSERT INTO users (name, email, password, role) VALUES($1, $2, $3, $4) 
        RETURNING *
        `, [name, email, hashPassword, userRole]);
    delete result.rows[0].password;
    return result;
};
const getAllUsersFromDB = async() => {
     const result = await pool.query(`
        SELECT * FROM users
        `);
    return result;
}

export const signupService = {
    createUserIntoDB,
    getAllUsersFromDB
}