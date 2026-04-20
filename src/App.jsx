import { useEffect, useState } from 'react'
import KanbanScreen from './features/screens/KanbanScreen.jsx'
import { initAnalytics, signInWithGoogle, signOutUser, getCurrentUser } from './services/firebase/client.js'
import { loadTasks, patchTask, removeTask, replaceAllTasks, upsertTask } from './services/tasks/taskStore.js'
import { rescheduleOverdueTasks } from './utils/taskEngine.js'
import './styles/global-new.css'

function App() {
  const [tasks, setTasks] = useState([])
  const [activeScreen, setActiveScreen] = useState(() => {
    return window.localStorage.getItem('planit-active-screen') || 'board'
  })
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Initialize app - load tasks and check auth
  useEffect(() => {
    async function initializeApp() {
      try {
        // Do not block first paint on analytics setup.
        initAnalytics().catch((error) => {
          console.error('Analytics initialization failed:', error)
        })

        const [currentUser, loadedTasks] = await Promise.all([getCurrentUser(), loadTasks()])

        if (currentUser) {
          setIsLoggedIn(true)
          setUserEmail(currentUser.email)
        }

        setTasks(Array.isArray(loadedTasks) ? loadedTasks : [])
      } catch (error) {
        console.error('Failed to initialize app:', error)
      }
    }

    initializeApp()
  }, [])

  // Reschedule overdue tasks every minute
  useEffect(() => {
    const intervalId = window.setInterval(async () => {
      setTasks((current) => {
        const next = rescheduleOverdueTasks(current)
        if (JSON.stringify(next) !== JSON.stringify(current)) {
          replaceAllTasks(next)
          return next
        }
        return current
      })
    }, 60 * 1000)

    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    window.localStorage.setItem('planit-active-screen', activeScreen)
  }, [activeScreen])

  // Task management handlers

  // Task management handlers
  async function handleAddTasks(newTasks) {
    const stamped = newTasks.map((task) => ({
      ...task,
      id: task.id || crypto.randomUUID(),
      updatedAt: new Date().toISOString(),
      createdAt: task.createdAt || new Date().toISOString(),
      dependencies: task.dependencies || [],
      subtasks: task.subtasks || [],
      tags: task.tags || [],
      status: task.status || 'todo',
      actualMinutes: task.actualMinutes || 0,
    }))

    setTasks((current) => [...stamped, ...current])
    await Promise.all(stamped.map((task) => upsertTask(task)))
  }

  async function handleUpdateTask(taskId, updates) {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    )
    await patchTask(taskId, updates)
  }

  async function handleDeleteTask(taskId) {
    setTasks((current) => current.filter((task) => task.id !== taskId))
    await removeTask(taskId)
  }

  async function handleClearAllTasks() {
    if (!window.confirm('Are you absolutely sure? This will delete ALL tasks and cannot be undone.')) {
      return
    }
    setTasks([])
    await replaceAllTasks([])
  }

  // Auth handlers

  async function handleSignIn() {
    setIsLoggingIn(true)
    try {
      const user = await signInWithGoogle()
      if (user) {
        setIsLoggedIn(true)
        setUserEmail(user.email)
      }
    } catch (error) {
      console.error('Sign-in failed:', error)
      alert('Failed to sign in. Please try again.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  async function handleSignOut() {
    try {
      await signOutUser()
      setIsLoggedIn(false)
      setUserEmail(null)
    } catch (error) {
      console.error('Sign-out failed:', error)
    }
  }

  // Render app immediately and hydrate auth/tasks in background.
  return (
    <KanbanScreen
      tasks={tasks}
      onAddTasks={handleAddTasks}
      onUpdateTask={handleUpdateTask}
      onDeleteTask={handleDeleteTask}
      onClearAllTasks={handleClearAllTasks}
      isLoggedIn={isLoggedIn}
      userEmail={userEmail}
      onSignIn={handleSignIn}
      onSignOut={handleSignOut}
      isLoggingIn={isLoggingIn}
      activeScreen={activeScreen}
      onChangeScreen={setActiveScreen}
    />
  )
}

export default App
