import { pool } from "../../db";
import type { IUser } from "./user.interface";
import bcrypt from "bcryptjs";

const createUserIntoDB = async(payload : IUser) => {

    const { name, email, password, role } = payload;
    const hashPassword = await bcrypt.hash(password, 11);

    const allowedRoles = ['contributor', 'maintainer'];
    const userRole = role || 'contributor';
    if (!allowedRoles.includes(userRole)) {
        throw new Error("Invalid Role!");
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

export const userService = {
    createUserIntoDB,
    getAllUsersFromDB
}