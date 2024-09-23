import multer from "multer";
import util from "util";
import path from "path";
import fs from "fs";
import { NextFunction, Request, Response } from "express";

const maxSize = 2 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    console.log("filename:", file.originalname);
    cb(null, file.originalname);
  },
});

const uploadFile = multer({
  storage: storage,
  limits: { fileSize: maxSize },
}).any();

const uploadFileMiddleware = util.promisify(uploadFile);
export default uploadFileMiddleware;
