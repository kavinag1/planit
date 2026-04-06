import { useEffect, useMemo, useState } from 'react'
import { parseBrainDumpAI } from '../../services/openai/parser.js'

function BrainDumpPanel({ onAddTasks }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [previewTasks, setPreviewTasks] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!text.trim()) {
      setPreviewTasks([])
      return undefined
    }

    const timeoutId = window.setTimeout(async () => {
      setLoading(true)
      setError('')
      try {
        const parsed = await parseBrainDumpAI(text)
        setPreviewTasks(parsed)
      } catch {
        setError('AI parser could not process the input right now.')
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => window.clearTimeout(timeoutId)
  }, [text])

  const wordCount = useMemo(() => text.trim().split(/\s+/).filter(Boolean).length, [text])

  function handleCommitTasks() {
    if (previewTasks.length === 0) return
    onAddTasks(previewTasks)
    setText('')
    setPreviewTasks([])
  }

  return (
    <section className="panel panel--brain">
      <div className="panel__header-row">
        <h2>Brain Dump</h2>
        <p className="status-chip">Live AI parsing</p>
      </div>

      <textarea
        className="brain-textarea"
        placeholder="Type anything: EE draft due tomorrow, buy headphones in 2 days, schedule gym..."
        value={text}
        onChange={(event) => setText(event.target.value)}
      />

      <div className="brain-meta">
        <span>{wordCount} words</span>
        <span>{loading ? 'Analyzing...' : `${previewTasks.length} tasks detected`}</span>
      </div>

      {error ? <p className="panel-error">{error}</p> : null}

      <div className="preview-list">
        {previewTasks.map((task) => (
          <article className="preview-item" key={task.id}>
            <h4>{task.title}</h4>
            <p>
              {task.category} • {task.priority} • {task.estimatedMinutes}m
              {task.deadline ? ` • due ${task.deadline}` : ''}
            </p>
          </article>
        ))}
      </div>

      <button className="btn btn--primary" onClick={handleCommitTasks} disabled={!previewTasks.length}>
        Add Parsed Tasks
      </button>
    </section>
  )
}

export default BrainDumpPanel
