import { useEffect, useMemo, useState } from 'react'

function FocusPanel({ tasks, onTrackMinutes }) {
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) || null,
    [selectedTaskId, tasks],
  )

  useEffect(() => {
    if (!running) return undefined

    const timerId = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timerId)
          setRunning(false)
          if (selectedTaskId) {
            onTrackMinutes(selectedTaskId, 25)
          }
          return 25 * 60
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [onTrackMinutes, running, selectedTaskId])

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')

  return (
    <section className="panel">
      <div className="panel__header-row">
        <h2>Focus Mode</h2>
        <span className="status-chip">Pomodoro</span>
      </div>

      <select value={selectedTaskId} onChange={(event) => setSelectedTaskId(event.target.value)}>
        <option value="">Select task</option>
        {tasks
          .filter((task) => task.status !== 'done')
          .map((task) => (
            <option key={task.id} value={task.id}>
              {task.title}
            </option>
          ))}
      </select>

      <div className="focus-timer">{mm}:{ss}</div>
      <p className="focus-task">{selectedTask ? selectedTask.title : 'No active task selected.'}</p>

      <div className="button-row">
        <button className="btn btn--primary" onClick={() => setRunning(true)} disabled={!selectedTaskId || running}>
          Start
        </button>
        <button className="btn" onClick={() => setRunning(false)} disabled={!running}>
          Pause
        </button>
        <button
          className="btn btn--ghost"
          onClick={() => {
            setRunning(false)
            setSecondsLeft(25 * 60)
          }}
        >
          Reset
        </button>
      </div>
    </section>
  )
}

export default FocusPanel
