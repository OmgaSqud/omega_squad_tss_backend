const { initializeApp } = require("firebase/app");
const { getAnalytics } = require("firebase/analytics");
const { getFirestore } = require("firebase/firestore");
const { getAuth } = require("firebase/auth");

const firebaseConfig = {
  apiKey: "AIzaSyDkzXxpk-vZICBNUjeOSDY_59gAN9V6cuI",
  authDomain: "tss-db-e1729.firebaseapp.com",
  projectId: "tss-db-e1729",
  storageBucket: "tss-db-e1729.appspot.com",
  messagingSenderId: "1077439325934",
  appId: "1:1077439325934:web:a9d95e54ac2dc6f7cc75ff",
  measurementId: "G-0X2N0B8T3Y",
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

module.exports = db;
