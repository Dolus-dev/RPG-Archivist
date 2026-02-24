import express from "express";
import { router as LoginRouter } from "./login";
export const router = express.Router();

router.use("/login", LoginRouter);
