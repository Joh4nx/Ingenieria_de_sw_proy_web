// upload.js
const multer = require('multer');

const storage = multer.memoryStorage(); // Guardar en memoria para procesar con sharp
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes.'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter, 
  limits: { fileSize: 5 * 1024 * 1024 } // límite de 5 MB
});

module.exports = upload;
