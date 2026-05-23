import express, {type Application, type Request, type Response} from "express"
import 'dotenv/config';
import config from "./config";


import { initDB, pool } from "./db";
import {Pool} from "pg";
import { userRoute } from "./modules/users/user.route";
import { authRoute } from "./modules/auth/auth.route";
import logger from "./middleware/logger";
import { issueRoute } from "./modules/issues/issue.route";

const app : Application = express();
const port = config.port;

app.use(express.json());
app.use(express.text()); 
app.use(express.urlencoded({extended :true}));
app.use(logger);

app.use("/api/auth", userRoute)
app.use("/api/auth", authRoute)
app.use("/api/issues", userRoute)
app.use("/api/issues", issueRoute)
app.use("/api/issues/:id",issueRoute)




export default app;