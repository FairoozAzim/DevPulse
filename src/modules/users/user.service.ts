import { pool } from "../../db";
import type { IUser } from "./user.interface";

const createUserIntoDB = async(payload : IUser) => {
    const { name, email, password, role } = payload;
    const allowedRoles = ['contributor', 'maintainer'];
    const userRole = role || 'contributor';
    const result = await pool.query(`
        INSERT INTO users (name, email, password, role) VALUES($1, $2, $3, $4) 
        RETURNING id, name, email, role, created_at, updated_at
        `, [name, email, password, userRole]);
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