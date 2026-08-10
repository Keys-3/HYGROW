const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, deleteDoc, doc } = require("firebase/firestore");

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

async function cleanup() {
  console.log("Starting cleanup...");
  
  // 1. Get all valid users from Firestore
  const usersSnap = await getDocs(collection(db, "users"));
  const validUserIds = usersSnap.docs.map(doc => doc.id);
  console.log(`Found ${validUserIds.length} valid users in DB.`);
  
  // 2. Cleanup orphaned inventory
  const invSnap = await getDocs(collection(db, "inventory"));
  let invDeleted = 0;
  for (const invDoc of invSnap.docs) {
    const data = invDoc.data();
    if (!validUserIds.includes(data.farmer_id)) {
      await deleteDoc(doc(db, "inventory", invDoc.id));
      invDeleted++;
    }
  }
  console.log(`Deleted ${invDeleted} orphaned inventory items.`);
  
  // 3. Cleanup orphaned market listings
  const mktSnap = await getDocs(collection(db, "market_listings"));
  let mktDeleted = 0;
  for (const mktDoc of mktSnap.docs) {
    const data = mktDoc.data();
    if (!validUserIds.includes(data.farmer_id)) {
      await deleteDoc(doc(db, "market_listings", mktDoc.id));
      mktDeleted++;
    }
  }
  console.log(`Deleted ${mktDeleted} orphaned market listings.`);

  // 4. Cleanup orphaned orders
  const ordersSnap = await getDocs(collection(db, "orders"));
  let ordersDeleted = 0;
  for (const orderDoc of ordersSnap.docs) {
    const data = orderDoc.data();
    if (!validUserIds.includes(data.customer_id) || !validUserIds.includes(data.seller_id)) {
      await deleteDoc(doc(db, "orders", orderDoc.id));
      ordersDeleted++;
    }
  }
  console.log(`Deleted ${ordersDeleted} orphaned orders.`);

  console.log("Cleanup complete!");
  process.exit(0);
}

cleanup().catch(console.error);
