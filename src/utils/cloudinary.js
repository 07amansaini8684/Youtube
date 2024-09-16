import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadCloudinary = async (filePath) =>{
    try {
        if(!filePath) return null
        // uploading file on couldinary
       const response = await cloudinary.uploader.upload(filePath,{resource_type : "auto"})
        // file uploaded successfully
        console.log("file is uploaded on cloudinary and url",response.url)
        return response
    } catch (error) {
        fs.unlinkSync(filePath) // it remove the localy saved file as the upload operation got failed
        console.log("Error while uploading file on cloudinary", error)
        return null
        
    }
}

export {uploadCloudinary}