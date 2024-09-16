import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import {uploadCloudinary} from "../utils/cloudinary.js"

import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asynchandler(async (req, res) => {
    const { fullname, username, email, password } = req.body;
    console.log(fullname, username, password, email);
    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "full information is required");
    }

    const existedUser = User.findOne({
        $or: [{ username }, { email }],
    });
    if (existedUser) {
        throw new ApiError(409, "username or email already exists");
    }

    const avatarFilepath = req.files?.avatar[0]?.path;
    const coverImageFilepath = req.files?.coverImage[0]?.path

    if (!avatarFilepath) {
        throw new ApiError(400, "avatar is required");
    }

   const avatar = await uploadCloudinary(avatarFilepath)
   const coverImage = await uploadCloudinary(coverImageFilepath)

   if(!avatar){
    throw new ApiError(400, "avatar upload failed")
   }

   const creatUser = await User.create({
    fullname,
    username : username.toLowerCase(),
    email,
    password,
    avatar : avatar.url,
    coverImage : coverImage?.url || "",
   })

  const createdUser =  await User.findById(creatUser._id).select(
    "-password -refreshToken",

   )
   if(!createdUser){
    throw new ApiError(500, "Something went wrong , user not found")
   }

   return res.status(201).json(
    new ApiRespons(200, createdUser, "User regisetered Successfully")
   )

   


});

export { registerUser };
