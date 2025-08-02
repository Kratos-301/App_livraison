const multer = require('multer');
const path = require('path');

// Configuration du stockage des fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Dossier où enregistrer les fichiers
    cb(null, 'public/uploads/livreurs/');
  },
  filename: function (req, file, cb) {
    // Nom du fichier : exemple pp_1723456.jpg
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'pp_' + uniqueSuffix + path.extname(file.originalname));
  }
});

// On crée le middleware multer avec cette config
const upload = multer({ storage });

module.exports = upload;
