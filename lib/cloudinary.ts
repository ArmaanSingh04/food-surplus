import { v2 as cloudinary } from "cloudinary"

import dotenv from "dotenv"

dotenv.config()

cloudinary.config({
    cloud_name: "dpaad1uob",
    api_key: '995434151823613',
    api_secret: process.env.CLOUDINARY_API_SECRET
})


export {
    cloudinary
}

