import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAnalytics, isSupported as analyticsSupported } from 'firebase/analytics'
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { env, hasFirebaseEnv } from '../../config/env.js'

const firebaseConfig = {
  apiKey: env.firebaseApiKey,
  authDomain: env.firebaseAuthDomain,
  projectId: env.firebaseProjectId,
  storageBucket: env.firebaseStorageBucket,
  messagingSenderId: env.firebaseMessagingSenderId,
  appId: env.firebaseAppId,
  measurementId: env.firebaseMeasurementId,
}

const app = hasFirebaseEnv
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null

const db = app ? getFirestore(app) : null
const auth = app ? getAuth(app) : null
let analytics = null

async function initAnalytics() {
  if (!app || typeof window === 'undefined') return null
  const supported = await analyticsSupported().catch(() => false)
  if (!supported) return null
  analytics = getAnalytics(app)
  return analytics
}

async function ensureAnonymousAuth() {
  if (!auth) return null
  if (auth.currentUser) return auth.currentUser
  const cred = await signInAnonymously(auth)
  return cred.user
}

async function signInWithGoogle() {
  if (!auth) return null
  const provider = new GoogleAuthProvider()
  const result = await signInWithPopup(auth, provider)
  return result.user
}

async function signOutUser() {
  if (!auth) return
  await signOut(auth)
}

function subscribeAuthState(callback) {
  if (!auth) {
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback)
}

function getCurrentUser() {
  return new Promise((resolve) => {
    if (!auth) {
      resolve(null)
      return
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })
}

export {
  app,
  auth,
  db,
  analytics,
  ensureAnonymousAuth,
  hasFirebaseEnv as hasFirebaseConfig,
  initAnalytics,
  signInWithGoogle,
  signOutUser,
  subscribeAuthState,
  getCurrentUser,
}