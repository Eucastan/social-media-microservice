import multer from "multer";
import multerS3 from "multer-s3";
import { s3 } from "../config/s3Client.js";

const upload = multer({

    storage: multerS3({
        s3,
        bucket: process.env.S3_BUCKET_NAME,
        acl: "public-read",
        key: function(req, file, cb){
            const timestamp = Date.now();
            const filename = `${file.fieldname}-${timestamp}-${file.originalname}`;
            cb(null, filename);
        }
    }),

    limits: {
        fileSize: 50 * 1024 * 1024  
    },

    fileFilter: (req, file, cb) => {
        const validTypes = ["image/jpeg", "image/jpg", "image/png", "video/mp4"];
        if(validTypes.includes(file.mimetype)){
            cb(null, true);
        }else{
            cb(new Error("Invalid file type"))
        }
    }
});

export default upload;