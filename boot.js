import express from 'express'
const app = express()
import bodyParser from 'body-parser'
import config from './config/server.config.js'
import svcRoute from "./routes/svc.route.js";
import authRoute from "./routes/auth.route.js";
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

app.use(bodyParser.json());
// app.use(cors({origin:'*'}))
app.use(cors())

svcRoute(app);
authRoute(app);
app.listen(config.port,()=>{
    console.log(`Server started at ${config.port}`)
})  
