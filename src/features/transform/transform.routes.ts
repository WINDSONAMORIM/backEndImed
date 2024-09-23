import { Router } from "express";
import { TransformController } from "./controller/transform.controller";

export const transformRoutes = (router: Router) => {
  const transformController = new TransformController();

  router.get("/transform", transformController.convert);
};
