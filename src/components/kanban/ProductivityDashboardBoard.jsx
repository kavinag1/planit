import { useEffect, useMemo, useState } from 'react'

const DASH_QUOTES = [
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Focus on being productive instead of busy.', author: 'Tim Ferriss' },
  { text: "It always seems impossible until it's done.", author: 'Nelson Mandela' },
  { text: 'Done is better than perfect.', author: 'Sheryl Sandberg' },
  { text: "Your time is limited, so don't waste it.", author: 'Steve Jobs' },
  { text: 'Small steps every day lead to big results.', author: 'Unknown' },
]

const MODE_CONFIG = {
  focus: { label: 'Focus Session', minutes: 25, color: '#d4802a' },
  short: { label: 'Short Break', minutes: 5, color: '#2a90d4' },
  long: { label: 'Long Break', minutes: 15, color: '#2ab070' },
}

const FOCUS_THEMES = {
  amber: {
    label: 'Amber',
    overlay: 'radial-gradient(circle at 20% 20%, rgba(232,184,75,0.25), rgba(12,8,4,0.92) 60%)',
    accent: '#e8b84b',
  },
  ocean: {
    label: 'Ocean',
    overlay: 'radial-gradient(circle at 20% 20%, rgba(42,144,212,0.28), rgba(4,10,18,0.92) 60%)',
    accent: '#63c3ff',
  },
  forest: {
    label: 'Forest',
    overlay: 'radial-gradient(circle at 20% 20%, rgba(42,176,112,0.25), rgba(5,14,10,0.92) 60%)',
    accent: '#6be4a7',
  },
}

const CIRCUMFERENCE = 2 * Math.PI * 90
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const GOAL_COLORS = ['green', 'blue', 'orange', 'purple']

const DEFAULT_GOALS = [
  { id: crypto.randomUUID(), label: 'Focus Sessions', current: 2, target: 8, color: 'green' },
  { id: crypto.randomUUID(), label: 'Tasks Completed', current: 3, target: 7, color: 'blue' },
]

const DEFAULT_HABITS = [
  { id: crypto.randomUUID(), name: 'Exercise', days: [false, false, false, false, false, false, false] },
  { id: crypto.randomUUID(), name: 'Read', days: [false, false, false, false, false, false, false] },
]

function loadJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

function formatTimer(totalSeconds) {
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0')
  const s = String(totalSeconds % 60).padStart(2, '0')
  return `${m}:${s}`
}

export default function ProductivityDashboardBoard({ tasks, onUpdateTask, onOpenAddTask }) {
  const [viewTab, setViewTab] = useState('Focus')
  const [isEditMode, setIsEditMode] = useState(false)

  const [mode, setMode] = useState('focus')
  const [focusMinutes, setFocusMinutes] = useState(25)
  const [shortBreakMinutes, setShortBreakMinutes] = useState(5)
  const [longBreakMinutes, setLongBreakMinutes] = useState(15)
  const [focusTheme, setFocusTheme] = useState('amber')
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [isFocusOverlayOpen, setIsFocusOverlayOpen] = useState(false)

  const [quoteIdx, setQuoteIdx] = useState(0)

  const [goals, setGoals] = useState(() => loadJSON('planit-dashboard-goals', DEFAULT_GOALS))
  const [habits, setHabits] = useState(() => loadJSON('planit-dashboard-habits', DEFAULT_HABITS))

  function getModeMinutes(targetMode) {
    if (targetMode === 'focus') return focusMinutes
    if (targetMode === 'short') return shortBreakMinutes
    return longBreakMinutes
  }

  useEffect(() => {
    if (!isRunning) return undefined

    const intervalId = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          setIsRunning(false)
          if (mode === 'focus') {
            setSessionsCompleted((count) => count + 1)
            setMode('short')
            return shortBreakMinutes * 60
          }
          setMode('focus')
          return focusMinutes * 60
        }
        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [isRunning, mode, focusMinutes, shortBreakMinutes])

  useEffect(() => {
    window.localStorage.setItem('planit-dashboard-goals', JSON.stringify(goals))
  }, [goals])

  useEffect(() => {
    window.localStorage.setItem('planit-dashboard-habits', JSON.stringify(habits))
  }, [habits])

  useEffect(() => {
    if (!isFocusOverlayOpen) return undefined

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setIsFocusOverlayOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isFocusOverlayOpen])

  const today = new Date()
  const activeTasks = useMemo(() => tasks.filter((task) => task.status !== 'done'), [tasks])
  const doneTasks = useMemo(() => tasks.filter((task) => task.status === 'done'), [tasks])

  // Mirror board tasks live: show only active tasks from the same source as My Board.
  const displayTasks = useMemo(() => {
    return [...tasks]
      .filter((task) => task.status !== 'done')
      .sort((a, b) => {
        const dateA = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER
        const dateB = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER
        if (dateA !== dateB) return dateA - dateB
        return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)
      })
      .slice(0, 6)
  }, [tasks])

  const completedPercent = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0
  const deepWorkMinutes = sessionsCompleted * focusMinutes
  const deepWorkPercent = Math.min(100, Math.round((deepWorkMinutes / 240) * 100))
  const habitDoneCount = habits.reduce((total, habit) => total + habit.days.filter(Boolean).length, 0)
  const habitTotal = habits.reduce((total, habit) => total + habit.days.length, 0)
  const habitPercent = habitTotal > 0 ? Math.round((habitDoneCount / habitTotal) * 100) : 0

  const overdueCount = useMemo(
    () =>
      tasks.filter((task) => task.status !== 'done' && task.deadline && new Date(task.deadline) < new Date())
        .length,
    [tasks],
  )

  const priorityBreakdown = useMemo(() => {
    return tasks.reduce(
      (acc, task) => {
        const priority = task.priority || 'none'
        acc[priority] = (acc[priority] || 0) + 1
        return acc
      },
      { critical: 0, high: 0, medium: 0, low: 0, none: 0 },
    )
  }, [tasks])

  const statusBreakdown = useMemo(() => {
    const total = Math.max(1, tasks.length)
    const counts = {
      todo: tasks.filter((task) => task.status === 'todo').length,
      inProgress: tasks.filter((task) => task.status === 'in-progress').length,
      review: tasks.filter((task) => task.status === 'review').length,
      done: tasks.filter((task) => task.status === 'done').length,
    }

    return [
      { key: 'todo', label: 'To Do', value: counts.todo, percent: Math.round((counts.todo / total) * 100) },
      {
        key: 'in-progress',
        label: 'In Progress',
        value: counts.inProgress,
        percent: Math.round((counts.inProgress / total) * 100),
      },
      {
        key: 'review',
        label: 'Review',
        value: counts.review,
        percent: Math.round((counts.review / total) * 100),
      },
      { key: 'done', label: 'Done', value: counts.done, percent: Math.round((counts.done / total) * 100) },
    ]
  }, [tasks])

  const recentlyUpdatedTasks = useMemo(() => {
    return [...tasks]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
      .slice(0, 8)
  }, [tasks])

  const goalsWithComputed = useMemo(() => {
    return goals.map((goal, index) => {
      if (goal.label === 'Focus Sessions') {
        return {
          ...goal,
          color: goal.color || GOAL_COLORS[index % GOAL_COLORS.length],
          current: sessionsCompleted,
        }
      }

      if (goal.label === 'Tasks Completed') {
        return {
          ...goal,
          color: goal.color || GOAL_COLORS[index % GOAL_COLORS.length],
          current: doneTasks.length,
        }
      }

      return {
        ...goal,
        color: goal.color || GOAL_COLORS[index % GOAL_COLORS.length],
      }
    })
  }, [goals, sessionsCompleted, doneTasks.length])

  const ringOffset = CIRCUMFERENCE * (timeLeft / (getModeMinutes(mode) * 60))

  function handleModeChange(nextMode) {
    setMode(nextMode)
    setTimeLeft(getModeMinutes(nextMode) * 60)
    setIsRunning(false)
  }

  function handleSkip() {
    if (mode === 'focus') {
      setSessionsCompleted((count) => count + 1)
      handleModeChange('short')
      return
    }
    handleModeChange('focus')
  }

  function toggleTask(task) {
    const nextStatus = task.status === 'done' ? 'todo' : 'done'
    onUpdateTask(task.id, { status: nextStatus })
  }

  function toggleHabit(habitId, dayIndex) {
    setHabits((current) =>
      current.map((habit) =>
        habit.id === habitId
          ? { ...habit, days: habit.days.map((value, idx) => (idx === dayIndex ? !value : value)) }
          : habit,
      ),
    )
  }

  function closeFocusOverlay() {
    setIsFocusOverlayOpen(false)
  }

  function addGoal() {
    setGoals((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        label: 'New Goal',
        current: 0,
        target: 5,
        color: GOAL_COLORS[current.length % GOAL_COLORS.length],
      },
    ])
  }

  function updateGoal(goalId, updates) {
    setGoals((current) => current.map((goal) => (goal.id === goalId ? { ...goal, ...updates } : goal)))
  }

  function removeGoal(goalId) {
    setGoals((current) => current.filter((goal) => goal.id !== goalId))
  }

  function addHabit() {
    setHabits((current) => [...current, { id: crypto.randomUUID(), name: 'New Habit', days: Array(7).fill(false) }])
  }

  function updateHabitName(habitId, name) {
    setHabits((current) => current.map((habit) => (habit.id === habitId ? { ...habit, name } : habit)))
  }

  function removeHabit(habitId) {
    setHabits((current) => current.filter((habit) => habit.id !== habitId))
  }

  function applyFocusPreset(minutes) {
    setFocusMinutes(minutes)
    if (mode === 'focus') {
      setTimeLeft(minutes * 60)
      setIsRunning(false)
    }
  }

  function nudgeDuration(type, delta, min, max) {
    if (type === 'focus') {
      const next = Math.min(max, Math.max(min, focusMinutes + delta))
      setFocusMinutes(next)
      if (mode === 'focus') {
        setTimeLeft(next * 60)
        setIsRunning(false)
      }
      return
    }

    if (type === 'short') {
      const next = Math.min(max, Math.max(min, shortBreakMinutes + delta))
      setShortBreakMinutes(next)
      if (mode === 'short') {
        setTimeLeft(next * 60)
        setIsRunning(false)
      }
      return
    }

    const next = Math.min(max, Math.max(min, longBreakMinutes + delta))
    setLongBreakMinutes(next)
    if (mode === 'long') {
      setTimeLeft(next * 60)
      setIsRunning(false)
    }
  }

  const quote = DASH_QUOTES[quoteIdx]

  return (
    <>
      <div
        className={`dashboard-focus-overlay ${isFocusOverlayOpen ? 'show' : ''}`}
        style={{ background: FOCUS_THEMES[focusTheme].overlay }}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            closeFocusOverlay()
          }
        }}
      >
        <div className="dashboard-focus-shell">
          <div className="dashboard-focus-topbar">
            <div>
              <div className="dashboard-focus-label">{MODE_CONFIG[mode].label}</div>
              <div className="dashboard-focus-subtitle">Stay in flow. Press Esc to close any time.</div>
            </div>
            <button className="dashboard-focus-x" onClick={closeFocusOverlay} aria-label="Close focus mode">
              Close
            </button>
          </div>
          <div className="dashboard-focus-timer" style={{ color: FOCUS_THEMES[focusTheme].accent }}>
            {formatTimer(timeLeft)}
          </div>

          <div className="dashboard-focus-presets">
            {[15, 25, 45].map((minutes) => (
              <button
                key={minutes}
                className={`dashboard-focus-pill ${focusMinutes === minutes ? 'active' : ''}`}
                onClick={() => applyFocusPreset(minutes)}
              >
                {minutes}m Focus
              </button>
            ))}
          </div>

          <div className="dashboard-focus-actions">
            <button className="dashboard-focus-close" onClick={() => setIsRunning((running) => !running)}>
              {isRunning ? 'Pause' : 'Start'}
            </button>
            <button className="dashboard-focus-close" onClick={() => handleModeChange('focus')}>
              Reset
            </button>
            <button className="dashboard-focus-close" onClick={closeFocusOverlay}>
              Exit Focus
            </button>
          </div>

          <div className="dashboard-focus-customizer">
            <div className="dashboard-focus-row">
              <span>Focus</span>
              <div>
                <button className="dashboard-focus-step" onClick={() => nudgeDuration('focus', -5, 15, 60)}>-</button>
                <strong>{focusMinutes}m</strong>
                <button className="dashboard-focus-step" onClick={() => nudgeDuration('focus', 5, 15, 60)}>+</button>
              </div>
            </div>
            <div className="dashboard-focus-row">
              <span>Short Break</span>
              <div>
                <button className="dashboard-focus-step" onClick={() => nudgeDuration('short', -1, 3, 15)}>-</button>
                <strong>{shortBreakMinutes}m</strong>
                <button className="dashboard-focus-step" onClick={() => nudgeDuration('short', 1, 3, 15)}>+</button>
              </div>
            </div>
            <div className="dashboard-focus-row">
              <span>Long Break</span>
              <div>
                <button className="dashboard-focus-step" onClick={() => nudgeDuration('long', -2, 10, 30)}>-</button>
                <strong>{longBreakMinutes}m</strong>
                <button className="dashboard-focus-step" onClick={() => nudgeDuration('long', 2, 10, 30)}>+</button>
              </div>
            </div>
            <div className="dashboard-focus-theme-row">
              {Object.entries(FOCUS_THEMES).map(([key, theme]) => (
                <button
                  key={key}
                  className={`dashboard-theme-chip ${focusTheme === key ? 'active' : ''}`}
                  onClick={() => setFocusTheme(key)}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="dashboard-board-area">
        <div className="dashboard-board-header">
          <div>
            <h2 className="dashboard-title">My Dashboard</h2>
            <p className="dashboard-subtitle">
              {today.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
              {' · '}
              {activeTasks.length} tasks active
            </p>
          </div>
          <div className="dashboard-header-controls">
            {viewTab === 'Focus' && (
              <button className="dashboard-edit-toggle" onClick={() => setIsEditMode((value) => !value)}>
                {isEditMode ? 'Done Editing' : 'Edit Widgets'}
              </button>
            )}
            <div className="dashboard-view-tabs">
              {['Focus', 'Analytics', 'History'].map((tab) => (
                <button
                  key={tab}
                  className={`dashboard-view-tab ${viewTab === tab ? 'active' : ''}`}
                  onClick={() => setViewTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {viewTab === 'Focus' && (
          <div className="dashboard-main-grid">
            <div className="dashboard-column">
              <article className="dashboard-note dashboard-note-yellow">
                <h3 className="dashboard-note-title">Pomodoro Timer</h3>

                <div className="dashboard-pom-modes">
                  <button
                    className={`dashboard-pom-mode ${mode === 'focus' ? 'active' : ''}`}
                    onClick={() => handleModeChange('focus')}
                  >
                    Focus ({focusMinutes}m)
                  </button>
                  <button
                    className={`dashboard-pom-mode ${mode === 'short' ? 'active' : ''}`}
                    onClick={() => handleModeChange('short')}
                  >
                    Short Break ({shortBreakMinutes}m)
                  </button>
                  <button
                    className={`dashboard-pom-mode ${mode === 'long' ? 'active' : ''}`}
                    onClick={() => handleModeChange('long')}
                  >
                    Long Break ({longBreakMinutes}m)
                  </button>
                </div>

                <div className="dashboard-timer-ring">
                  <svg className="dashboard-timer-svg" viewBox="0 0 200 200">
                    <circle className="dashboard-ring-track" cx="100" cy="100" r="90" />
                    <circle
                      className="dashboard-ring-progress"
                      cx="100"
                      cy="100"
                      r="90"
                      style={{
                        stroke: MODE_CONFIG[mode].color,
                        strokeDasharray: CIRCUMFERENCE,
                        strokeDashoffset: ringOffset,
                      }}
                    />
                  </svg>
                  <div className="dashboard-timer-inner">
                    <div className="dashboard-timer-digits">{formatTimer(timeLeft)}</div>
                    <div className="dashboard-timer-label">{MODE_CONFIG[mode].label}</div>
                  </div>
                </div>

                <div className="dashboard-pom-controls">
                  <button className="dashboard-pom-small" onClick={handleSkip}>
                    Skip
                  </button>
                  <button className="dashboard-pom-main" onClick={() => setIsRunning((running) => !running)}>
                    {isRunning ? 'Pause' : 'Start'}
                  </button>
                  <button className="dashboard-pom-small" onClick={() => handleModeChange(mode)}>
                    Reset
                  </button>
                </div>

                <div className="dashboard-session-dots">
                  {[0, 1, 2, 3].map((dot) => (
                    <div key={dot} className={`dashboard-session-dot ${(sessionsCompleted % 4) > dot ? 'done' : ''}`} />
                  ))}
                </div>

                <div className="dashboard-pom-stats">
                  <div className="dashboard-mini-stat">
                    <strong>{sessionsCompleted}</strong>
                    <span>Sessions</span>
                  </div>
                  <div className="dashboard-mini-stat">
                    <strong>{deepWorkMinutes >= 60 ? `${Math.floor(deepWorkMinutes / 60)}h` : `${deepWorkMinutes}m`}</strong>
                    <span>Focus Time</span>
                  </div>
                  <div className="dashboard-mini-stat">
                    <strong>{habitPercent}%</strong>
                    <span>Habits</span>
                  </div>
                </div>
              </article>

              <article className="dashboard-note dashboard-note-blue">
                <h3 className="dashboard-note-title">Today's Focus Tasks</h3>
                <div className="dashboard-task-list">
                  {displayTasks.length > 0 ? (
                    displayTasks.map((task) => (
                      <button key={task.id} className="dashboard-task-item" onClick={() => toggleTask(task)}>
                        <span className={`dashboard-task-cb ${task.status === 'done' ? 'done' : ''}`}></span>
                        <span className={`dashboard-task-text ${task.status === 'done' ? 'done' : ''}`}>
                          {task.title || 'Untitled task'}
                        </span>
                        <span className="dashboard-task-tag">{task.priority || 'task'}</span>
                      </button>
                    ))
                  ) : (
                    <p className="dashboard-history-empty">No active tasks on My Board yet.</p>
                  )}
                </div>
                <button className="dashboard-add-task" onClick={onOpenAddTask}>
                  + add a task...
                </button>
              </article>
            </div>

            <div className="dashboard-column">
              <article className="dashboard-note dashboard-note-green">
                <h3 className="dashboard-note-title">Today's Goals</h3>

                {goalsWithComputed.map((goal) => {
                  const target = Math.max(1, Number(goal.target) || 1)
                  const currentValue = Math.min(target, Math.max(0, Number(goal.current) || 0))
                  const pct = Math.min(100, Math.round((currentValue / target) * 100))

                  return (
                    <div key={goal.id} className="dashboard-goal-edit-card">
                      {isEditMode ? (
                        <>
                          <div className="dashboard-goal-edit-header">
                            <input
                              className="dashboard-inline-input"
                              value={goal.label}
                              onChange={(e) => updateGoal(goal.id, { label: e.target.value })}
                            />
                            <button className="dashboard-remove-btn" onClick={() => removeGoal(goal.id)}>
                              Remove
                            </button>
                          </div>
                          <div className="dashboard-goal-input-row">
                            <label>
                              Current
                              <input
                                type="number"
                                className="dashboard-number-input"
                                value={goal.current}
                                onChange={(e) => updateGoal(goal.id, { current: Number(e.target.value) || 0 })}
                              />
                            </label>
                            <label>
                              Target
                              <input
                                type="number"
                                className="dashboard-number-input"
                                value={goal.target}
                                onChange={(e) => updateGoal(goal.id, { target: Number(e.target.value) || 1 })}
                              />
                            </label>
                          </div>
                        </>
                      ) : (
                        <div className="dashboard-progress-label-row">
                          <span>{goal.label}</span>
                          <span>{currentValue} / {target}</span>
                        </div>
                      )}

                      <div className="dashboard-progress-row">
                        <div className="dashboard-progress-label-row">
                          <span>{isEditMode ? 'Progress' : 'Completion'}</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="dashboard-progress-track">
                          <div className={`dashboard-progress-fill ${goal.color}`} style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {isEditMode && (
                  <button className="dashboard-add-inline" onClick={addGoal}>
                    + Add Goal
                  </button>
                )}

                <div className="dashboard-progress-row">
                  <div className="dashboard-progress-label-row">
                    <span>Deep Work Hours</span>
                    <span>{Math.min(4, Math.round((deepWorkMinutes / 60) * 10) / 10)} / 4 hrs</span>
                  </div>
                  <div className="dashboard-progress-track">
                    <div className="dashboard-progress-fill orange" style={{ width: `${deepWorkPercent}%` }}></div>
                  </div>
                </div>
              </article>

              <article className="dashboard-note dashboard-note-green">
                <h3 className="dashboard-note-title">Habit Tracker</h3>
                {habits.map((habit) => (
                  <div key={habit.id} className="dashboard-habit-row">
                    {isEditMode ? (
                      <input
                        className="dashboard-inline-input dashboard-habit-input"
                        value={habit.name}
                        onChange={(e) => updateHabitName(habit.id, e.target.value)}
                      />
                    ) : (
                      <div className="dashboard-habit-name">{habit.name}</div>
                    )}

                    <div className="dashboard-habit-days">
                      {habit.days.map((isDone, idx) => (
                        <button
                          key={`${habit.id}-${idx}`}
                          className={`dashboard-habit-day ${isDone ? 'done' : ''} ${idx === 3 ? 'today' : ''}`}
                          onClick={() => toggleHabit(habit.id, idx)}
                        >
                          {DAYS[idx]}
                        </button>
                      ))}
                    </div>

                    {isEditMode && (
                      <button className="dashboard-remove-btn" onClick={() => removeHabit(habit.id)}>
                        Remove
                      </button>
                    )}
                  </div>
                ))}

                {isEditMode && (
                  <button className="dashboard-add-inline" onClick={addHabit}>
                    + Add Habit
                  </button>
                )}
              </article>

              <article className="dashboard-note dashboard-note-purple">
                <h3 className="dashboard-note-title">Quote</h3>
                <p className="dashboard-quote">"{quote.text}"</p>
                <p className="dashboard-quote-author">- {quote.author}</p>
                <button className="dashboard-quote-btn" onClick={() => setQuoteIdx((idx) => (idx + 1) % DASH_QUOTES.length)}>
                  New quote
                </button>
              </article>

            </div>
          </div>
        )}

        {viewTab === 'Analytics' && (
          <div className="dashboard-analytics-grid">
            <article className="dashboard-note dashboard-note-blue">
              <h3 className="dashboard-note-title">Task Analytics</h3>
              <div className="dashboard-kpi-grid">
                <div className="dashboard-kpi-box"><strong>{tasks.length}</strong><span>Total Tasks</span></div>
                <div className="dashboard-kpi-box"><strong>{activeTasks.length}</strong><span>Active</span></div>
                <div className="dashboard-kpi-box"><strong>{doneTasks.length}</strong><span>Done</span></div>
                <div className="dashboard-kpi-box"><strong>{overdueCount}</strong><span>Overdue</span></div>
              </div>
              <div className="dashboard-progress-row" style={{ marginTop: '12px' }}>
                <div className="dashboard-progress-label-row">
                  <span>Completion Rate</span>
                  <span>{completedPercent}%</span>
                </div>
                <div className="dashboard-progress-track">
                  <div className="dashboard-progress-fill blue" style={{ width: `${completedPercent}%` }}></div>
                </div>
              </div>
            </article>

            <article className="dashboard-note dashboard-note-green">
              <h3 className="dashboard-note-title">Status Breakdown</h3>
              {statusBreakdown.map((status) => (
                <div key={status.key} className="dashboard-progress-row">
                  <div className="dashboard-progress-label-row">
                    <span>{status.label}</span>
                    <span>{status.value} ({status.percent}%)</span>
                  </div>
                  <div className="dashboard-progress-track">
                    <div className="dashboard-progress-fill green" style={{ width: `${status.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </article>

            <article className="dashboard-note dashboard-note-purple">
              <h3 className="dashboard-note-title">Priority Breakdown</h3>
              {Object.entries(priorityBreakdown).map(([priority, count]) => (
                <div key={priority} className="dashboard-priority-row">
                  <span>{priority}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </article>
          </div>
        )}

        {viewTab === 'History' && (
          <div className="dashboard-history-wrap">
            <article className="dashboard-note dashboard-note-yellow">
              <h3 className="dashboard-note-title">Recent Task Activity</h3>
              {recentlyUpdatedTasks.length > 0 ? (
                <div className="dashboard-history-list">
                  {recentlyUpdatedTasks.map((task) => (
                    <div key={task.id} className="dashboard-history-item">
                      <div>
                        <div className="dashboard-history-title">{task.title || 'Untitled task'}</div>
                        <div className="dashboard-history-meta">Status: {task.status || 'todo'}</div>
                      </div>
                      <div className="dashboard-history-meta">
                        {new Date(task.updatedAt || task.createdAt || today.getTime()).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="dashboard-history-empty">No activity yet.</p>
              )}
            </article>
          </div>
        )}
      </section>

      <button className="dashboard-focus-trigger" onClick={() => setIsFocusOverlayOpen(true)}>
        Focus Mode
      </button>
    </>
  )
}
