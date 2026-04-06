import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'

dayjs.extend(customParseFormat)

const CATEGORY_KEYWORDS = {
  school: ['study', 'assignment', 'exam', 'lecture', 'class', 'homework', 'project', 'ee'],
  work: ['meeting', 'client', 'report', 'ticket', 'deploy', 'review', 'team'],
  personal: ['gym', 'health', 'family', 'call', 'journal', 'habit', 'read'],
  errands: ['buy', 'grocery', 'pickup', 'drop', 'bank', 'clean', 'repair'],
}

const PRIORITY_SCALE = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}

const TAG_HINTS = {
  writing: ['draft', 'essay', 'write', 'report', 'summary'],
  research: ['research', 'read', 'topic', 'sources', 'evidence'],
  exam: ['exam', 'revision', 'study', 'quiz', 'test'],
  admin: ['submit', 'form', 'deadline', 'application'],
  errands: ['buy', 'grocery', 'pickup', 'drop', 'bank'],
  communication: ['call', 'email', 'message', 'reply'],
}

export function normalizeText(input) {
  return String(input || '')
    .trim()
    .replace(/\s+/g, ' ')
}

export function splitBrainDump(input) {
  return String(input || '')
    .split(/[\n,;]+/)
    .map((line) => normalizeText(line))
    .filter(Boolean)
}

function toDate(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(dateLike) {
  const date = toDate(dateLike)
  if (!date) return null
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}

function startOfDay(dateLike = new Date()) {
  const date = toDate(dateLike) || new Date()
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(dateLike, days) {
  const base = toDate(dateLike) || new Date()
  const next = new Date(base)
  next.setDate(next.getDate() + days)
  return next
}

function diffDays(a, b) {
  const msPerDay = 24 * 60 * 60 * 1000
  const aMs = startOfDay(a).getTime()
  const bMs = startOfDay(b).getTime()
  return Math.floor((aMs - bMs) / msPerDay)
}

const MONTHS =
  'january|february|march|april|may|june|july|august|september|october|november|december'

function parseMonthDayExpression(expression, now = new Date()) {
  const clean = expression
    .toLowerCase()
    .replace(/(st|nd|rd|th)/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  const year = now.getFullYear()
  const withYear = `${clean} ${year}`
  const parsed = dayjs(withYear, ['D MMMM YYYY', 'D MMM YYYY', 'MMMM D YYYY', 'MMM D YYYY'], true)
  if (!parsed.isValid()) return null

  if (parsed.isBefore(dayjs(startOfDay(now)))) {
    return parsed.add(1, 'year').toDate()
  }

  return parsed.toDate()
}

function parseNaturalDeadline(text, now = new Date()) {
  const lower = String(text || '').toLowerCase()
  const byPattern = new RegExp(`(?:due\\s+by|by|due\\s+on|on)\\s+(\\d{1,2}(?:st|nd|rd|th)?\\s+(?:${MONTHS})(?:\\s+\\d{4})?)`)
  const dayMonthPattern = new RegExp(`(\\d{1,2}(?:st|nd|rd|th)?\\s+(?:${MONTHS})(?:\\s+\\d{4})?)`)

  const byMatch = lower.match(byPattern)
  if (byMatch?.[1]) {
    const parsed = parseMonthDayExpression(byMatch[1], now)
    if (parsed) return parsed
  }

  const dayMonthMatch = lower.match(dayMonthPattern)
  if (dayMonthMatch?.[1]) {
    const parsed = parseMonthDayExpression(dayMonthMatch[1], now)
    if (parsed) return parsed
  }

  return null
}

export function detectCategory(text) {
  const lower = String(text || '').toLowerCase()
  for (const [category, words] of Object.entries(CATEGORY_KEYWORDS)) {
    if (words.some((w) => lower.includes(w))) return category
  }
  return 'personal'
}

export function detectDeadline(text, now = new Date()) {
  const lower = String(text || '').toLowerCase()
  if (lower.includes('today')) return startOfDay(now)
  if (lower.includes('tomorrow')) return addDays(startOfDay(now), 1)

  const inDays = lower.match(/in\s+(\d+)\s+day/)
  if (inDays) return addDays(startOfDay(now), Number(inDays[1]))

  const iso = lower.match(/(20\d{2}-\d{2}-\d{2})/)
  if (iso) return toDate(iso[1])

  const natural = parseNaturalDeadline(text, now)
  if (natural) return natural

  return null
}

export function estimateMinutes(text) {
  const lower = String(text || '').toLowerCase()
  const hourMatch = lower.match(/(\d+)\s*(hour|hours|hr|hrs|h)/)
  const minMatch = lower.match(/(\d+)\s*(minute|minutes|min|mins|m)/)

  if (hourMatch) {
    const hours = Number(hourMatch[1])
    const mins = minMatch ? Number(minMatch[1]) : 0
    return Math.max(10, Math.min(600, hours * 60 + mins))
  }

  if (minMatch) {
    return Math.max(10, Math.min(600, Number(minMatch[1])))
  }

  if (/draft|assignment|research|project|slides|presentation/.test(lower)) return 90
  if (/buy|call|email|reply|book/.test(lower)) return 25
  return 45
}

export function detectPriority(text, deadline, now = new Date()) {
  const lower = String(text || '').toLowerCase()

  if (/urgent|asap|critical|immediately/.test(lower)) return 'critical'
  if (/important|priority/.test(lower)) return 'high'
  if (/exam|final|submission|due/.test(lower)) return 'high'
  if (/draft|project|assignment|research/.test(lower)) return 'medium'

  if (deadline) {
    const daysLeft = diffDays(deadline, now)
    if (daysLeft <= 0) return 'critical'
    if (daysLeft <= 2) return 'high'
    if (daysLeft <= 6) return 'medium'
    if (daysLeft <= 14) return 'medium'
  }

  return 'medium'
}

export function inferTags(text, category) {
  const lower = String(text || '').toLowerCase()
  const tags = new Set()

  Object.entries(TAG_HINTS).forEach(([tag, hints]) => {
    if (hints.some((hint) => lower.includes(hint))) {
      tags.add(tag)
    }
  })

  if (category) tags.add(category)

  if (lower.includes('ee')) tags.add('extended-essay')
  if (lower.includes('deadline') || lower.includes('due')) tags.add('deadline')

  return [...tags]
}

export function deriveTitle(text) {
  const normalized = normalizeText(text)
  if (!normalized) return 'Untitled task'
  const stripped = normalized
    .replace(/\b(today|tomorrow|urgent|asap|in\s+\d+\s+days?)\b/gi, '')
    .replace(new RegExp(`\\b(due\\s+by|due\\s+on|by|on)\\s+\\d{1,2}(st|nd|rd|th)?\\s+(${MONTHS})(\\s+\\d{4})?\\b`, 'gi'), '')
    .replace(new RegExp(`\\b\\d{1,2}(st|nd|rd|th)?\\s+(${MONTHS})(\\s+\\d{4})?\\b`, 'gi'), '')
    .replace(/\bdue\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (!stripped) return 'Untitled task'
  return stripped.charAt(0).toUpperCase() + stripped.slice(1)
}

function timelineDates(now, deadlineDate) {
  if (!deadlineDate) return []
  const totalDays = Math.max(1, diffDays(deadlineDate, now))
  const checkpoints = [
    Math.max(1, Math.floor(totalDays * 0.2)),
    Math.max(2, Math.floor(totalDays * 0.45)),
    Math.max(3, Math.floor(totalDays * 0.7)),
  ]
  return checkpoints.map((days) => formatDate(addDays(now, days)))
}

function buildDeadlineSubtasks(title, deadlineDate, now = new Date()) {
  if (!deadlineDate) {
    // No deadline - assign dates 2 days apart
    const milestones = [
      'Start planning and research',
      'Gather materials and prepare',
      'Create first draft',
      'Review and finalize',
    ]
    return milestones.map((milestone, idx) => {
      const d = new Date(now)
      d.setDate(d.getDate() + (idx + 1) * 2)
      return {
        id: crypto.randomUUID(),
        title: milestone,
        deadline: formatDate(d),
        status: 'todo',
      }
    })
  }

  // Has deadline - split timeline evenly
  const [d1, d2, d3] = timelineDates(now, deadlineDate)
  const due = formatDate(deadlineDate)
  const milestones = [
    'Start planning and research',
    'Gather materials and prepare',
    'Create first draft',
    'Review and finalize',
  ]
  const dates = [d1, d2, d3, due]

  return milestones.map((milestone, idx) => ({
    id: crypto.randomUUID(),
    title: milestone,
    deadline: dates[idx],
    status: 'todo',
  }))
}

export function createTaskFromText(text, now = new Date()) {
  const deadlineDate = detectDeadline(text, now)
  const estimatedMinutes = estimateMinutes(text)
  const priority = detectPriority(text, deadlineDate, now)
  const category = detectCategory(text)
  const title = deriveTitle(text)

  return {
    id: crypto.randomUUID(),
    title,
    rawInput: normalizeText(text),
    category,
    priority,
    estimatedMinutes,
    actualMinutes: 0,
    deadline: deadlineDate ? formatDate(deadlineDate) : null,
    suggestedStartDate: formatDate(now),
    dependencies: [],
    subtasks: buildDeadlineSubtasks(title, deadlineDate, now),
    status: 'todo',
    tags: inferTags(text, category),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function localParseBrainDump(text, now = new Date()) {
  return splitBrainDump(text).map((line) => createTaskFromText(line, now))
}

function priorityScore(task, now = new Date()) {
  const base = PRIORITY_SCALE[task.priority] || PRIORITY_SCALE.low
  if (!task.deadline) return base * 10

  const daysLeft = diffDays(task.deadline, now)
  if (daysLeft <= 0) return base * 10 + 40
  if (daysLeft <= 1) return base * 10 + 25
  if (daysLeft <= 3) return base * 10 + 15
  return base * 10 + 5
}

export function generateDailyPlan(tasks, {
  date = new Date(),
  energy = 'medium',
  capacityMinutes = 240,
} = {}) {
  const multiplier = energy === 'high' ? 1.15 : energy === 'low' ? 0.8 : 1
  const adjusted = Math.floor(capacityMinutes * multiplier)

  const pending = tasks
    .filter((task) => task.status !== 'done')
    .sort((a, b) => priorityScore(b, date) - priorityScore(a, date))

  const selected = []
  let left = adjusted

  pending.forEach((task) => {
    const blocked = task.dependencies.some((depId) => {
      const dep = tasks.find((candidate) => candidate.id === depId)
      return dep && dep.status !== 'done'
    })

    if (blocked) return
    if (task.estimatedMinutes > left) return

    selected.push({
      id: task.id,
      title: task.title,
      minutes: task.estimatedMinutes,
      priority: task.priority,
      category: task.category,
    })

    left -= task.estimatedMinutes
  })

  return {
    date: formatDate(date),
    energy,
    capacityMinutes: adjusted,
    usedMinutes: adjusted - left,
    remainingMinutes: left,
    blocks: selected,
  }
}

export function detectOverload(tasks, { date = new Date(), capacityMinutes = 300 } = {}) {
  const day = formatDate(date)
  const active = tasks.filter(
    (task) =>
      task.status !== 'done' &&
      (!task.suggestedStartDate || task.suggestedStartDate <= day),
  )

  const totalMinutes = active.reduce((sum, task) => sum + task.estimatedMinutes, 0)
  return {
    overloaded: totalMinutes > capacityMinutes,
    totalMinutes,
    capacityMinutes,
    overflowMinutes: Math.max(0, totalMinutes - capacityMinutes),
  }
}

export function rescheduleOverdueTasks(tasks, now = new Date()) {
  const today = formatDate(now)
  const tomorrow = formatDate(addDays(now, 1))

  return tasks.map((task) => {
    if (task.status === 'done' || !task.deadline) return task

    const overdue = diffDays(task.deadline, now) < 0
    if (!overdue) return task

    return {
      ...task,
      deadline: tomorrow,
      suggestedStartDate: today,
      priority: 'critical',
      updatedAt: new Date().toISOString(),
    }
  })
}

export function calculateMetrics(tasks) {
  const total = tasks.length
  const completed = tasks.filter((task) => task.status === 'done').length
  const estimate = tasks.reduce((sum, task) => sum + task.estimatedMinutes, 0)
  const actual = tasks.reduce((sum, task) => sum + task.actualMinutes, 0)

  const completionRate = total ? Math.round((completed / total) * 100) : 0
  const accuracyRate = estimate ? Math.round((actual / estimate) * 100) : 0

  const byCategory = tasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1
    return acc
  }, {})

  return {
    total,
    completed,
    completionRate,
    estimate,
    actual,
    accuracyRate,
    byCategory,
  }
}

export function weeklyHeatmap(tasks, reference = new Date()) {
  const start = addDays(startOfDay(reference), -6)
  return Array.from({ length: 7 }, (_, index) => {
    const day = addDays(start, index)
    const key = formatDate(day)

    const minutes = tasks
      .filter((task) => task.status !== 'done')
      .filter((task) => !task.deadline || task.deadline >= key)
      .reduce((sum, task) => sum + task.estimatedMinutes / 7, 0)

    const level = minutes > 220 ? 'high' : minutes > 120 ? 'medium' : 'low'
    return { day: key, minutes: Math.round(minutes), level }
  })
}
