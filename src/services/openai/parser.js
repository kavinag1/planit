import { env } from '../../config/env.js'
import { localParseBrainDump } from '../../utils/taskEngine.js'

function toJsonSafe(text) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function callGeminiAPI(prompt, maxTokens = 1200) {
  if (!env.geminiApiKey) {
    return null
  }

  try {
    const { GoogleGenAI } = await import('@google/genai')
    const ai = new GoogleGenAI({ apiKey: env.geminiApiKey })

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.7,
      },
    })

    return response.text || null
  } catch (error) {
    // Silently fail - fall back to local parsing
    if (error?.status === 429) {
      console.warn('⚠️ API quota exceeded - local parsing active')
    }
    return null
  }
}

function normalizeTaskPriority(priority, fallback = 'medium') {
  const value = String(priority || '').toLowerCase()
  if (['critical', 'high', 'medium', 'low'].includes(value)) return value
  return fallback
}

async function enrichPrioritiesAndTags(tasks) {
  if (!env.geminiApiKey || tasks.length === 0) return tasks

  const prompt = `You are a task-prioritization assistant.
Return ONLY valid JSON array with this shape:
[{"id": string, "priority": "critical"|"high"|"medium"|"low", "tags": string[]}]

Rules:
- Use deadline urgency heavily.
- Avoid assigning all tasks the same priority unless clearly justified.
- Add 2-5 practical tags.

Tasks:
${JSON.stringify(tasks.map((t) => ({ id: t.id, title: t.title, rawInput: t.rawInput, deadline: t.deadline, category: t.category, estimatedMinutes: t.estimatedMinutes })))}
`

  try {
    const textOutput = await callGeminiAPI(prompt, 1200)
    if (!textOutput) return tasks

    const parsed = toJsonSafe(textOutput)
    if (!Array.isArray(parsed)) return tasks

    const map = new Map(parsed.map((entry) => [entry.id, entry]))
    return tasks.map((task) => {
      const ai = map.get(task.id)
      if (!ai) return task
      return {
        ...task,
        priority: normalizeTaskPriority(ai.priority, task.priority),
        tags: Array.isArray(ai.tags) ? ai.tags.map((tag) => String(tag)).filter(Boolean) : task.tags,
      }
    })
  } catch {
    return tasks
  }
}

export async function parseBrainDumpAI(text) {
  const trimmed = String(text || '').trim()
  if (!trimmed) return []

  // Try AI first if key is available
  if (env.geminiApiKey) {
    const aiResult = await tryAIParsing(trimmed)
    if (aiResult) return aiResult
  }

  // Fall back to local parsing
  console.log('📋 Using local task parser...')
  return localParseBrainDump(trimmed)
}

async function tryAIParsing(text) {
  const today = new Date().toISOString().slice(0, 10)
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)

  const prompt = `You are a task planner. Convert this user brain dump into a JSON array of tasks with AUTO-CALCULATED dates.

Current date is ${today}.

CRITICAL RULES:
1. Split input into separate tasks.
2. REMOVE date/deadline words from the title (e.g., "Need to pay padma 500rs on tuesday" → title: "Pay padma 500rs")
3. Parse ALL date references in the original text:
   - "tomorrow" → ${tomorrow}
   - "tuesday" = next Tuesday's date (if today is Wed Mar 29, 2026, then Tuesday = 2026-04-07)
   - "next Monday/Tuesday/etc" → calculate actual date
   - "Saturday" = next Saturday's date
   - "in 2 days" → calculate actual date
   - "17th April" → 2026-04-17 format
4. ASSIGN DATES AUTOMATICALLY - if ANY date hint exists, calculate the deadline
5. IF NO deadline mentioned, assign a default deadline 7 days from today
6. SMART CATEGORY DETECTION (in priority order - check in this order):
   - Use "errands" for: buy, purchase, shop, get, pick up, vendor, store, market, grocery, collect
   - Use "work" for: code, design, develop, build, project, meeting, presentation, report, write, document
   - Use "school" for: study, research, essay, exam, assignment, homework, class, course, learning
   - Use "personal" for EVERYTHING ELSE: pay, payment, money, transfer, lend, borrow, call, text, email, exercise, health, hobby, plan, organize, clean, family, appointments, organize, prepare, arrange
   - DO NOT assign "school" or "work" unless the task explicitly mentions school/work activities
7. SMART SUBTASKS (CRITICAL - Follow exactly):
   - NEVER create subtasks for single-action tasks: pay, call, text, email, buy (one quick thing), pick up, transfer, etc.
   - ONLY create subtasks if ALL of these are true:
     a) Estimated time is >=45 minutes AND
     b) Task has complex keywords: plan, design, research, develop, write, organize, build, prepare (for something complex)
   - For SINGLE-ACTION or QUICK TASKS: Keep subtasks array EMPTY []
8. SMART TIME ESTIMATES (be REALISTIC):
   - Single action (pay, call, text, email): 2-5 minutes
   - Quick errands (buy one thing, pick up): 15-30 minutes
   - Simple tasks: 20-30 minutes
   - Medium tasks (with planning): 45-90 minutes
   - Complex tasks (projects, research, writing): 120+ minutes
9. SMART TAGS (2-3 most relevant):
   - Only tags directly describing the task
   - Do NOT include category words as tags
   - Examples: "payment", "urgent", "follow-up", "shopping", "errands", "home"
10. Return ONLY valid JSON.

Output shape:
[{
  "title": string,
  "category": "school"|"work"|"personal"|"errands",
  "priority": "critical"|"high"|"medium"|"low",
  "estimatedMinutes": number,
  "deadline": "YYYY-MM-DD",
  "suggestedStartDate": "YYYY-MM-DD",
  "tags": string[],
  "subtasks": [{"title": string, "deadline": "YYYY-MM-DD"}]
}]

Brain dump:
${text}`

  try {
    const textOutput = await callGeminiAPI(prompt, 1500)

    if (!textOutput) {
      return null
    }

    const parsed = toJsonSafe(textOutput)

    if (!Array.isArray(parsed)) {
      return null
    }

    const mapped = parsed.map((task) => ({
      id: crypto.randomUUID(),
      title: task.title || 'Untitled task',
      rawInput: text,
      category: task.category || 'personal',
      priority: normalizeTaskPriority(task.priority, 'medium'),
      estimatedMinutes: Number(task.estimatedMinutes) || 30,
      actualMinutes: 0,
      deadline: task.deadline || null,
      suggestedStartDate: task.suggestedStartDate || new Date().toISOString().slice(0, 10),
      dependencies: [],
      status: 'todo',
      tags: Array.isArray(task.tags) ? task.tags : [],
      subtasks: Array.isArray(task.subtasks)
        ? task.subtasks
            .map((item) => ({
              id: crypto.randomUUID(),
              title: String(item.title || item),
              status: 'todo',
              deadline: item.deadline || null,
            }))
            .filter((item) => item.title.trim())
        : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))

    return enrichPrioritiesAndTags(mapped)
  } catch (error) {
    console.warn('⚠️ AI parsing failed:', error?.message || error)
    return null
  }
}

export async function generateSubtasksAI(task) {
  if (!task?.title) return []

  if (!env.openAiApiKey) {
    return generateDefaultSubtasks(task)
  }

  const today = new Date().toISOString().slice(0, 10)
  const taskDeadline = task.deadline
  let deadlineInfo = ''
  let dateInstructions = ''
  
  if (taskDeadline) {
    deadlineInfo = ` with final deadline: ${taskDeadline}`
    // Calculate 4 evenly spaced dates from today to deadline
    const deadline = new Date(taskDeadline)
    const todayDate = new Date(today)
    const daysAvailable = Math.max(1, Math.floor((deadline - todayDate) / 86400000))
    const daysPerStep = Math.max(1, Math.floor(daysAvailable / 4))
    
    const dates = []
    for (let i = 1; i <= 4; i++) {
      const d = new Date(todayDate)
      d.setDate(d.getDate() + daysPerStep * i)
      dates.push(d.toISOString().slice(0, 10))
    }
    dates[3] = taskDeadline // Ensure last one is exact deadline
    dateInstructions = `\nUse these calculated dates for subtasks in order: ${dates.join(', ')}`
  } else {
    dateInstructions = `\nIf no deadline provided, spread subtasks every 2 days starting tomorrow. Generate dates automatically.`
  }

  const prompt = `Generate 4 specific, milestone-based subtasks for completing this task: "${task.title}"${deadlineInfo}.

Each subtask should:
- Be a concrete action step (e.g., "Start researching", "Gather materials", "Create draft", "Review and finalize")
- Have a CALCULATED deadline${deadlineInfo ? '' : ' (spread every 2 days from today unless task has deadline)'}
- Be detailed enough to guide action
${dateInstructions}

Return ONLY a valid JSON array of objects with this shape:
[
  {"title": string, "deadline": "YYYY-MM-DD"}
]`

  try {
    const textOutput = await callGeminiAPI(prompt, 600)
    if (!textOutput) {
      return generateDefaultSubtasks(task)
    }

    const parsed = toJsonSafe(textOutput)

    if (!Array.isArray(parsed)) {
      return generateDefaultSubtasks(task)
    }

    return parsed
      .map((item) => ({
        title: String(item.title || item),
        deadline: item.deadline || null,
      }))
      .filter((item) => item.title.trim())
  } catch {
    return generateDefaultSubtasks(task)
  }
}

function generateDefaultSubtasks(task) {
  const deadline = task.deadline
  let subtasks = []
  const today = new Date()
  
  if (deadline) {
    const deadlineDate = new Date(deadline)
    const daysUntilDeadline = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24))
    const quarterDay = Math.max(1, Math.floor(daysUntilDeadline / 4))

    const dates = [
      new Date(today.getTime() + quarterDay * 1000 * 60 * 60 * 24).toISOString().slice(0, 10),
      new Date(today.getTime() + (quarterDay * 2) * 1000 * 60 * 60 * 24).toISOString().slice(0, 10),
      new Date(today.getTime() + (quarterDay * 3) * 1000 * 60 * 60 * 24).toISOString().slice(0, 10),
      deadline,
    ]

    // Create proper milestone-based subtasks without the full task title
    const milestones = [
      'Start planning and research',
      'Gather materials and prepare',
      'Create first draft',
      'Review and finalize',
    ]

    subtasks = milestones.map((milestone, idx) => ({
      title: milestone,
      deadline: dates[idx],
    }))
  } else {
    // Even without a deadline, assign dates 2 days apart
    const milestones = [
      'Start planning and research',
      'Gather materials and prepare',
      'Create first draft',
      'Review and finalize',
    ]
    
    const baseDate = new Date(today)
    subtasks = milestones.map((milestone, idx) => {
      const date = new Date(baseDate)
      date.setDate(date.getDate() + (idx + 1) * 2) // 2, 4, 6, 8 days from now
      return {
        title: milestone,
        deadline: date.toISOString().slice(0, 10),
      }
    })
  }

  return subtasks
}
