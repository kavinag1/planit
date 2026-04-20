export const env = {
  firebaseApiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  firebaseAuthDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  firebaseProjectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  firebaseStorageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  firebaseMessagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  firebaseAppId: import.meta.env.VITE_FIREBASE_APP_ID,
  firebaseMeasurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  openAiApiKey: import.meta.env.VITE_OPENAI_API_KEY,
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY,
  googleCalendarClientId: import.meta.env.VITE_GOOGLE_CALENDAR_CLIENT_ID,
}

export const hasFirebaseEnv = Boolean(
  env.firebaseApiKey &&
    env.firebaseAuthDomain &&
    env.firebaseProjectId &&
    env.firebaseStorageBucket &&
    env.firebaseMessagingSenderId &&
    env.firebaseAppId,
)