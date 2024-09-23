import { Router } from "express";
import { FileController } from "./controller/file.controller";
import  uploadFileMiddleware  from "./middleware/upload";

export const fileRoutes = (router: Router) => {
  const fileController = new FileController();

  router.post("/upload", uploadFileMiddleware, fileController.upload);
  router.get("/files", fileController.getListFiles);
  router.get("/files/:name", fileController.download);
};
