import express from "express";
import cors from "cors";
import path from "path";
import { routesApp } from "./config/routes";
import "dotenv/config";

global.__basedir = path.resolve(__dirname);

// const corsOptions = {
//   origin: "http://localhost:8081",
// };

const app = express();
// app.use(cors(corsOptions));
app.use(cors());
app.use(express.urlencoded({ extended: true }));

routesApp(app);

app.listen(process.env.PORT, () =>
  console.log(`Server is running in port: ${process.env.PORT}`)
);
