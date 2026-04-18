const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

require('dotenv').config();

// 1. Tell Cloudinary who we are
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Set up the storage destination
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'beaded_by_unknown', // This creates a neat folder in your Cloudinary account
    allowedFormats: ['jpeg', 'png', 'jpg']
  }
});

// 3. Create the upload middleware we will use on our routes
const upload = multer({ storage: storage });

module.exports = { upload };