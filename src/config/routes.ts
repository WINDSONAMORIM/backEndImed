import express, { Application, Request, Response } from "express";
import { fileRoutes } from "../features/file/file.routes";
import { initialPage } from "./initialPage";
import { transformRoutes } from "../features/transform/transform.routes";

const routesApp = (app: Application) => {
  const router = express.Router();

  app.use("/", router);

  router.get("/", (request: Request, response: Response) =>
    response.send(initialPage)
  );

  fileRoutes(router);
  transformRoutes(router);
};

export { routesApp };
