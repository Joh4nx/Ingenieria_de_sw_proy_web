// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB2BNv1Vezda4CK9aH643WAvlvgKVkOUuQ",
  authDomain: "el-gusto-de-don-justo.firebaseapp.com",
  databaseURL: "https://el-gusto-de-don-justo-default-rtdb.firebaseio.com/",
  projectId: "el-gusto-de-don-justo",
  storageBucket: "el-gusto-de-don-justo.appspot.com",
  messagingSenderId: "1018184490702",
  appId: "1:1018184490702:web:7954b8311d30a45e2fba9f",
  measurementId: "G-EW8TZ154JH"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app); 

export { db, auth };
