import express from "express";
import { router as AuthRouter } from "./auth";
import { router as TraitsRouter } from "./traits";

export const router = express.Router();

router.use("/auth", AuthRouter);
router.use("/traits", TraitsRouter);
