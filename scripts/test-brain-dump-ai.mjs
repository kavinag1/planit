import dotenv from 'dotenv'
import { GoogleGenAI } from '@google/genai'

dotenv.config({ path: '.env.local' })
const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY

if (!apiKey) {
  console.error('No Gemini API key found in .env.local (VITE_GEMINI_API_KEY or GEMINI_API_KEY).')
  process.exit(1)
}

const ai = new GoogleGenAI({ apiKey })
const prompt = 'Return strict JSON only: [{"title":"Test task","priority":"medium"}]'

const models = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
]

async function tryModel(model) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 120,
        },
      })
      const text = typeof response.text === 'function' ? response.text() : response.text
      if (text) {
        console.log(`SUCCESS model=${model} attempt=${attempt}`)
        console.log(`OUTPUT ${String(text).slice(0, 220)}`)
        return true
      }
      console.log(`EMPTY model=${model} attempt=${attempt}`)
    } catch (error) {
      const status = error?.status || error?.response?.status || 'unknown'
      const message = error?.message || String(error)
      console.log(`FAIL model=${model} attempt=${attempt} status=${status} msg=${message}`)

      if (String(status) === '503') {
        await new Promise((resolve) => setTimeout(resolve, 1200))
        continue
      }

      if (String(status) === '429') {
        return false
      }

      break
    }
  }

  return false
}

let worked = false
for (const model of models) {
  // eslint-disable-next-line no-await-in-loop
  const ok = await tryModel(model)
  if (ok) {
    worked = true
    break
  }
}

if (!worked) {
  console.error('No tested Gemini model succeeded locally.')
  process.exit(2)
}
