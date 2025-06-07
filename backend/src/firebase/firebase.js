// firebase/firebase.js (o donde inicialices admin)
const admin = require('firebase-admin');

// Si usas dotenv para cargar variables de entorno en desarrollo
// (esto no es necesario en servicios de hosting que manejan variables de entorno nativamente como Vercel, Heroku, etc.)
require('dotenv').config(); 

// Lee el contenido JSON de la variable de entorno y pársalo
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
} catch (e) {
  console.error("Error al parsear FIREBASE_SERVICE_ACCOUNT_KEY:", e);
  console.error("Asegúrate de que la variable de entorno esté definida y sea un JSON válido.");
  // Maneja el error apropiadamente, quizás saliendo del proceso
  process.exit(1); 
}


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL // Usa la variable de entorno para la URL también
});

const db = admin.database();
module.exports = db;