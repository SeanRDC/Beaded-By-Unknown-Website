const cloudinary = require('cloudinary').v2;
const multer = require('multer');

const { HttpError } = require('../middleware/errors');

const MAX_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const FOLDER = 'beaded_by_unknown';

const accept = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 2 },
  fileFilter(req, file, done) {
    if (IMAGE_TYPES.has(file.mimetype)) return done(null, true);
    return done(new HttpError(400, 'Images must be JPG, PNG or WebP, under 5 MB.'));
  }
});

const uploads = {
  /* The dashboard sends primaryImage. The old edit route expected image, so both are accepted. */
  acceptImages: accept.fields([
    { name: 'primaryImage', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'secondaryImage', maxCount: 1 }
  ]),

  store(file) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: FOLDER, allowed_formats: ['jpg', 'png', 'webp'] }, (err, result) => {
          if (err) reject(new HttpError(502, 'Could not upload that picture. Please try again.'));
          else resolve(result.secure_url);
        })
        .end(file.buffer);
    });
  }
};

module.exports = uploads;
