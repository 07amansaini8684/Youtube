// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: "./.env",
})

// Second approach to connect database
connectDB()
.then(()=>{
  app.listen(process.env.PORT || 4000,()=>{
    console.log(`Server is running on port ${process.env.PORT}`)
    
  })
})
.catch((err) => {
  console.error("Mongo db connection failed |||| ",err);
})


// first approach to connect database
/*
import express from "express"
const app = express()
(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
    app.on("error",(error)=>{
        console.log("Error",error);
        throw error
    })
    app.listen(process.env.PORT,()=>{
        console.log(`Server is running on port,${process.env.PORT}`);

    })
  } catch (error) {
    console.log("Error", error);
    throw err;
  }
})();
*/




