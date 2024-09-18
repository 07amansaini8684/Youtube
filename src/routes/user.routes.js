import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateUserAvatar,
  updateUserCoverImage,
  updateUserDetails,
} from "../controllers/user.controller.js";

import upload from "../middlewares/multerMiddleware.js";
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

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyjwt, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post(verifyjwt, changeCurrentPassword);
router.route("/current-user").get(verifyjwt, getCurrentUser);
router.route("/update-details").patch(verifyjwt, updateUserDetails);
router
  .route("/avatar")
  .patch(verifyjwt, upload.single("avatar"), updateUserAvatar);
router
  .route("/cover-image")
  .patch(verifyjwt, upload.single("coverImage"), updateUserCoverImage);

// getting form params
router.route("/channel/:username").get(verifyjwt, getUserChannelProfile);
//
router.route("/history").get(verifyjwt, getWatchHistory);

export default router;
