import express from "express";

export const router = express.Router();

// Middlewares that are applied to many or all route from the semi-highest level of the route hierarchy should be added here. For example, if you have a middleware that checks for authentication, you can add it here so that it applies to all routes that are defined after this middleware is added.
