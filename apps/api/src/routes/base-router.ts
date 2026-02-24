import express from "express";
import { router as AuthRouter } from "./auth";

export const router = express.Router();

router.use("/auth", AuthRouter);
