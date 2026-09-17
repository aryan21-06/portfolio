import "server-only";
import { cert, getApps, initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "node:fs";
import path from "node:path";

function getCredential() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    return cert({ projectId, clientEmail, privateKey });
  }

  const localCredentialsPath = path.join(process.cwd(), "firebase-adminsdk.json");
  if (fs.existsSync(localCredentialsPath)) {
    const credentials = JSON.parse(fs.readFileSync(localCredentialsPath, "utf8"));
    return cert(credentials);
  }

  return applicationDefault();
}

export function getAdminDb() {
  const app = getApps()[0] ?? initializeApp({ credential: getCredential() });
  return getFirestore(app);
}
