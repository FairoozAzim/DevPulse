import config from "../config";
import { Pool } from "pg";

export const pool = new Pool({
    connectionString : config.connection_string,
})

export const initDB = async() => {
    try{
      await pool.query(`
         CREATE TABLE IF NOt EXISTS users(
         id SERIAL PRIMARY KEY,
         name VARCHAR(100),
         email VARCHAR(50) UNIQUE NOT NULL,
         password TEXT NOT NULL,
         role VARCHAR(20) NOT NULL 
            DEFAULT 'contributor'
            CHECK (role IN ('contributor', 'maintainer')),
         created_at TIMESTAMP DEFAULT NOW(),
         updated_at TIMESTAMP DEFAULT NOW()
        )
        `
      );
       await pool.query(`
         CREATE TABLE IF NOt EXISTS issues(
         id SERIAL PRIMARY KEY,
         title VARCHAR(150) NOT NULL,
         description VARCHAR(20) NOT NULL,
         type VARCHAR(20) NOT NULL
              CHECK (type IN ('bug', 'feature_request')),
         status VARCHAR(20) NOT NULL
              DEFAULT 'open'
              CHECK (status IN ('open', 'in_progress', 'resolved')),
         reporter_id INT,
         created_at TIMESTAMP DEFAULT NOW(),
         updated_at TIMESTAMP DEFAULT NOW()
        )
        `
      );
       console.log("Database connected successfully");
    } catch(error){
        console.log(error);
    }
};