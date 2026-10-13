const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary = require("../config/cloudinary")
const { v4: uuidv4 } = require("uuid")


const folderMap = {
    courtImages: "courts",
    fawryReceipt: "bookings",
    personalIdImage: "users",
};

const storage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => {
        const folder = folderMap[file.fieldname] || "others"

        return {
        folder,
        public_id: `${folder}-${uuidv4()}`,
        resource_type: "image",
        transformation: [{ width: 800, height: 800, crop: "limit" },{ quality: "auto" }]
    }}
})

const fileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith("image")) {
        return cb(new Error("Only image files are allowed"), false)
    }
    cb(null, true)
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
})

module.exports = { upload }
