import { useState } from 'react'
import '../kanban/KanbanModal.css'
import { parseBrainDumpAI } from '../../services/openai/parser.js'

export default function BrainDumpModal({ isOpen, onClose, onTasksGenerated }) {
  const [braindumpText, setBraindumpText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [parsedTasks, setParsedTasks] = useState(null)
  const [step, setStep] = useState('input') // 'input' or 'review'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!braindumpText.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      // Parse the brain dump text using AI
      const tasks = await parseBrainDumpAI(braindumpText)

      if (!tasks || tasks.length === 0) {
        setError('No tasks found. Try describing your tasks more clearly.')
        setIsLoading(false)
        return
      }

      // Store parsed tasks for review
      setParsedTasks(tasks)
      setStep('review')
    } catch (err) {
      console.error('Error parsing brain dump:', err)
      setError('Failed to process brain dump. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = () => {
    if (parsedTasks) {
      // Call the callback with generated tasks
      onTasksGenerated(parsedTasks)

      // Reset form
      setBraindumpText('')
      setParsedTasks(null)
      setStep('input')
      onClose()
    }
  }

  const handleEdit = () => {
    setStep('input')
    setParsedTasks(null)
  }

  if (!isOpen) return null

  return (
    <div className="kanban-modal-overlay" onClick={onClose}>
      <div className="kanban-modal" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        {step === 'input' ? (
          <>
            <div className="kanban-modal__header">
              <h2>Brain Dump</h2>
              <button className="kanban-modal__close" onClick={onClose}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="kanban-modal__form">
              <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '16px', fontSize: '13px' }}>
                Dump all your tasks here! Write them naturally, and our AI will organize them into actionable tasks with deadlines, categories, tags, and more.
              </p>

              <div className="form-group">
                <label>Your Tasks (Natural Language)</label>
                <textarea
                  value={braindumpText}
                  onChange={(e) => setBraindumpText(e.target.value)}
                  placeholder="Example: Design landing page by Friday, then fix critical API bug, write documentation next week, and schedule team meeting..."
                  rows="8"
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: '14px',
                    resize: 'vertical',
                  }}
                ></textarea>
              </div>

              {error && (
                <div
                  style={{
                    background: 'rgba(214, 48, 49, 0.15)',
                    border: '1px solid rgba(214, 48, 49, 0.3)',
                    color: '#ff9999',
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '16px',
                    fontSize: '13px',
                  }}
                >
                  ❌ {error}
                </div>
              )}

              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>
                💡 Tip: Mention deadlines ("by Friday", "next week"), priorities ("urgent", "critical"), and time estimates for better results.
              </div>

              <div className="kanban-modal__footer">
                <button type="button" className="kanban-btn kanban-btn--ghost" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="kanban-btn kanban-btn--primary" disabled={isLoading || !braindumpText.trim()}>
                  {isLoading ? 'Analyzing...' : 'Parse Tasks'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="kanban-modal__header">
              <h2>Review Parsed Tasks</h2>
              <button className="kanban-modal__close" onClick={onClose}>
                ✕
              </button>
            </div>

            <div style={{ padding: '20px', color: '#fff' }}>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '20px', fontSize: '14px' }}>
                AI parsed {parsedTasks?.length || 0} task(s) from your brain dump. Review and adjust if needed:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '55vh', overflowY: 'auto' }}>
                {parsedTasks?.map((task, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      padding: '16px',
                    }}
                  >
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                        {task.title}
                      </div>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '13px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.6)' }}>📁 {task.category || 'personal'}</span>
                        <span
                          style={{
                            background:
                              task.priority === 'critical'
                                ? 'rgba(214, 48, 49, 0.3)'
                                : task.priority === 'high'
                                  ? 'rgba(255, 152, 0, 0.3)'
                                  : task.priority === 'medium'
                                    ? 'rgba(33, 150, 243, 0.3)'
                                    : 'rgba(76, 175, 80, 0.3)',
                            color:
                              task.priority === 'critical'
                                ? '#ff9999'
                                : task.priority === 'high'
                                  ? '#ffb74d'
                                  : task.priority === 'medium'
                                    ? '#64b5f6'
                                    : '#81c784',
                            padding: '4px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          {task.priority || 'medium'}
                        </span>
                        {task.deadline && (
                          <span style={{ color: 'rgba(255,255,255,0.6)' }}>{task.deadline}</span>
                        )}
                        {task.estimatedMinutes && (
                          <span style={{ color: 'rgba(255,255,255,0.6)' }}>~{task.estimatedMinutes}m</span>
                        )}
                      </div>
                    </div>

                    {task.tags && task.tags.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {task.tags.map((tag, tidx) => (
                            <span
                              key={tidx}
                              style={{
                                background: 'rgba(100, 181, 246, 0.2)',
                                color: '#64b5f6',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                              }}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {task.subtasks && task.subtasks.length > 0 && (
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                        <div style={{ marginBottom: '6px', fontWeight: '500' }}>Subtasks:</div>
                        <div style={{ paddingLeft: '12px' }}>
                          {task.subtasks.map((subtask, sidx) => (
                            <div key={sidx} style={{ marginBottom: '4px' }}>
                              • {subtask.title}
                              {subtask.deadline && <span style={{ color: 'rgba(255,255,255,0.5)' }}> ({subtask.deadline})</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="kanban-modal__footer" style={{ marginTop: '20px' }}>
                <button className="kanban-btn kanban-btn--ghost" onClick={handleEdit}>
                  ← Edit Text
                </button>
                <button className="kanban-btn kanban-btn--primary" onClick={handleConfirm}>
                  Create {parsedTasks?.length} Task{parsedTasks?.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
