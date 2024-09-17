import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asynchandler(async (req, res) => {
  const { fullname, username, email, password } = req.body;
  // console.log(fullname, username, password, email);
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "full information is required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "username or email already exists");
  }

  // console.log(req.files)
  // const avatarFilepath = req.files?.avatar[0]?.path;
  // const coverImageFilepath = req.files?.coverImage[0]?.path

  let coverImageFilepath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageFilepath = req.files.coverImage[0].path;
  }

  let avatarFilepath;
  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatarFilepath = req.files.avatar[0].path;
  }

  if (!avatarFilepath) {
    throw new ApiError(400, "avatar is required");
  }

  const avatar = await uploadCloudinary(avatarFilepath);
  const coverImage = await uploadCloudinary(coverImageFilepath);

  if (!avatar) {
    throw new ApiError(400, "avatar upload failed");
  }

  const creatUser = await User.create({
    fullname,
    username: username.toLowerCase(),
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(creatUser._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong , user not found");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User regisetered Successfully"));
});

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken(); // Fixed method name
    const refreshToken = user.generateRefreshToken(); // Fixed method name

    user.refreshToken = refreshToken; // Fixed typo
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken }; // Fixed typo
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong. Cannot generate refresh and access tokens" // Fixed typo
    );
  }
};

const loginUser = asynchandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "Username or email is required"); // Clarified error message
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(404, "User not found. Please check your credentials."); // Clarified error message
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(404, "Invalid password"); // Clarified error message
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  ); // Fixed typo

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Secure cookies only in production
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options) // Fixed typo
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken }, // Fixed typo
        "User logged in successfully"
      )
    );
});

const logoutUser = asynchandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "User logged out Successfully"));
});

const refreshAccessToken = asynchandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "UnAuthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "UnAuthorized request, Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newrefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken, options)
      .json(new ApiResponse(200, null, "Access token refreshed successfully"));
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});



export { registerUser, loginUser, logoutUser, refreshAccessToken };
