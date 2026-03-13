import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

const rawConfig = fs.readFileSync("./firebase-applet-config.json", "utf-8");
const firebaseConfig = JSON.parse(rawConfig);

initializeApp({ projectId: firebaseConfig.projectId });
const db = getFirestore(firebaseConfig.firestoreDatabaseId);

async function test() {
  try {
    const snapshot = await db.collection("users").limit(1).get();
    console.log("Success! Docs:", snapshot.size);
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}
test();
