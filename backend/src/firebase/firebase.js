const admin = require('firebase-admin');
const serviceAccount = require('../../firebase-credentials.json');


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://el-gusto-de-don-justo-default-rtdb.firebaseio.com/'
});

const db = admin.database();
module.exports = db;
