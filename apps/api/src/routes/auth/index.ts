import express from "express";
import { router as LoginRouter } from "./login";
import { router as LogoutRouter } from "./logout";

export const router = express.Router();

router.use("/login", LoginRouter);
router.use("/logout", LogoutRouter);
