import "dotenv/config"
import express from "express"
import { router } from "./routes"
import cookieParser from 'cookie-parser'

const app = express();

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cookieParser());

app.use(router)


app.listen(3333, () => console.log("Server running on port 3333"));