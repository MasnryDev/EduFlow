import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import profileRouter from "./profile";
import resourcesRouter from "./resources";
import generateRouter from "./generate";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(profileRouter);
router.use(resourcesRouter);
router.use(generateRouter);
router.use(statsRouter);

export default router;
