import admin from 'firebase-admin'

// Initialize Firebase Admin once (singleton pattern)
if (!admin.apps.length) {
  // Option A — Service account JSON (recommended for production)
  // Set FIREBASE_SERVICE_ACCOUNT env var to the full JSON string, OR
  // place the file at backend/config/serviceAccountKey.json and uncomment below.
  //
  // import { createRequire } from 'module'
  // const require = createRequire(import.meta.url)
  // const serviceAccount = require('./serviceAccountKey.json')
  // admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })

  // Option B — Project ID only (works on Google Cloud / Firebase hosting automatically)
  // Falls back to Application Default Credentials (ADC).
  // On Render / Railway / VPS you MUST use Option A above.
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  } else {
    // Minimal init — only works when ADC is available (Cloud Run, Firebase Functions, etc.)
    admin.initializeApp({ projectId: 'ecommerce-project-331c7' })
  }
}

export default admin
