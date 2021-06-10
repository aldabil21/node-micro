import express from "express";
import { getUser, signIn, signUp, signOut } from "../controller/user";
import { currentUser } from "@aldabil/microservice-common";
import { authVal } from "../validators";
const router = express.Router();

// @ Method  GET
// @ ACCESS  PUBLIC
// @ DESC    Get current user
router.get("/", currentUser, getUser);
// @ Method  POST
// @ ACCESS  PUBLIC
// @ DESC    Sign in user
router.post("/signin", authVal, signIn);
// @ Method  GET
// @ ACCESS  PUBLIC
// @ DESC    Create new user
router.post("/signup", authVal, signUp);
// @ Method  POST
// @ ACCESS  PUBLIC
// @ DESC    Sign out (delete cookie)
router.post("/signout", signOut);

export { router as routes };
