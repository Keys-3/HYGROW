const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyAsW3UdiapN41zCfAd5Wi_kQNzLzojeORk",
  authDomain: "farm-help-383f1.firebaseapp.com",
  projectId: "farm-help-383f1",
  storageBucket: "farm-help-383f1.appspot.com",
  messagingSenderId: "149037929627",
  appId: "1:149037929627:web:eee26088fc7342420f623e",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkUsers() {
  const usersSnap = await getDocs(collection(db, "users"));
  usersSnap.docs.forEach(doc => {
    console.log(`ID: ${doc.id}, Email: ${doc.data().email}, Role: ${doc.data().role}`);
  });
  process.exit(0);
}

checkUsers().catch(console.error);
