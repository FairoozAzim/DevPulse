import express, {type Application, type Request, type Response} from "express"
import {Pool} from "pg";
import 'dotenv/config';
import config from "./config";
import { initDB, pool } from "./db";
import { userRoute } from "./modules/users/user.route";

const app : Application = express();
const port = config.port;

app.use(express.json()) 
app.use(express.urlencoded({extended :true}))

app.use('/api/auth/signup', userRoute)



export default app;