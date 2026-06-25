import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth'

const firebaseConfig = {
  apiKey:            "AIzaSyAT0-0nS47M-p38F9qb_OWWP5T1KOh_OeI",
  authDomain:        "ecommerce-project-331c7.firebaseapp.com",
  projectId:         "ecommerce-project-331c7",
  storageBucket:     "ecommerce-project-331c7.firebasestorage.app",
  messagingSenderId: "161410165334",
  appId:             "1:161410165334:web:a72ee0f4ce8aa47ba469f7",
  measurementId:     "G-1VF2HL5VEL",
}

const app  = initializeApp(firebaseConfig)
export const auth = getAuth(app)

// Google
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider)
  const idToken = await result.user.getIdToken()
  return idToken
}

// Facebook
const facebookProvider = new FacebookAuthProvider()
facebookProvider.addScope('email')
facebookProvider.addScope('public_profile')

export async function signInWithFacebook() {
  const result = await signInWithPopup(auth, facebookProvider)
  const idToken = await result.user.getIdToken()
  return idToken
}
