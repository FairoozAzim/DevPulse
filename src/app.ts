import express, {type Application, type Request, type Response} from "express"
import 'dotenv/config';
import config from "./config";

import { initDB, pool } from "./db";
import {Pool} from "pg";
import { userRoute } from "./modules/users/user.route";
import { authRoute } from "./modules/auth/auth.route";

const app : Application = express();
const port = config.port;

app.use(express.json()) 
app.use(express.urlencoded({extended :true}))

app.use("/api/auth/signup", userRoute)
app.use("/api/auth", authRoute)
app.use((req, res, next) => {
    console.log("Time: ", Date.now());
    next();
})


export default app;