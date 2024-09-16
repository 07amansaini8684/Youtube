import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";

import { upload } from "../middlewares/multerMiddleware.js";
import { verifyjwt } from "../middlewares/authMiddleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser
);
router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyjwt, logoutUser)

export default router;
