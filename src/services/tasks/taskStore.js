import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { auth, db, ensureAnonymousAuth, hasFirebaseConfig } from '../firebase/client.js'

const STORAGE_KEY = 'planit.tasks.v1'

function readLocalTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocalTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

async function getUserId() {
  if (!hasFirebaseConfig || !auth || !db) return null
  const user = await ensureAnonymousAuth()
  return user?.uid || null
}

function userTaskCollection(uid) {
  return collection(db, 'users', uid, 'tasks')
}

export async function loadTasks() {
  const localTasks = readLocalTasks()

  const uid = await getUserId()
  if (!uid) return localTasks

  try {
    const snapshot = await getDocs(userTaskCollection(uid))
    const remoteTasks = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }))

    if (remoteTasks.length > 0) {
      writeLocalTasks(remoteTasks)
      return remoteTasks
    }

    if (localTasks.length > 0) {
      await Promise.all(
        localTasks.map((task) =>
          setDoc(doc(db, 'users', uid, 'tasks', task.id), {
            ...task,
            syncedAt: new Date().toISOString(),
          }),
        ),
      )
    }

    return localTasks
  } catch {
    return localTasks
  }
}

export async function upsertTask(task) {
  const tasks = readLocalTasks()
  const index = tasks.findIndex((item) => item.id === task.id)

  if (index >= 0) {
    tasks[index] = task
  } else {
    tasks.push(task)
  }

  writeLocalTasks(tasks)

  const uid = await getUserId()
  if (!uid) return task

  try {
    await setDoc(doc(db, 'users', uid, 'tasks', task.id), {
      ...task,
      syncedAt: new Date().toISOString(),
    })
  } catch {
    return task
  }

  return task
}

export async function patchTask(taskId, updates) {
  const tasks = readLocalTasks()
  const index = tasks.findIndex((item) => item.id === taskId)
  if (index < 0) return null

  const task = {
    ...tasks[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  tasks[index] = task
  writeLocalTasks(tasks)

  const uid = await getUserId()
  if (!uid) return task

  try {
    await updateDoc(doc(db, 'users', uid, 'tasks', taskId), {
      ...updates,
      updatedAt: task.updatedAt,
      syncedAt: new Date().toISOString(),
    })
  } catch {
    return task
  }

  return task
}

export async function removeTask(taskId) {
  const tasks = readLocalTasks().filter((task) => task.id !== taskId)
  writeLocalTasks(tasks)

  const uid = await getUserId()
  if (!uid) return true

  try {
    await deleteDoc(doc(db, 'users', uid, 'tasks', taskId))
  } catch {
    return true
  }

  return true
}

export async function replaceAllTasks(tasks) {
  writeLocalTasks(tasks)

  const uid = await getUserId()
  if (!uid) return tasks

  try {
    await Promise.all(
      tasks.map((task) =>
        setDoc(doc(db, 'users', uid, 'tasks', task.id), {
          ...task,
          syncedAt: new Date().toISOString(),
        }),
      ),
    )
  } catch {
    return tasks
  }

  return tasks
}
