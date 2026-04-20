import { useState, useMemo } from 'react'
import '../../styles/kanban.css'
import KanbanSidebar from '../../components/kanban/KanbanSidebar'
import KanbanTopbar from '../../components/kanban/KanbanTopbar'
import KanbanBoard from '../../components/kanban/KanbanBoard'
import KanbanRightPanel from '../../components/kanban/KanbanRightPanel'
import ProductivityDashboardBoard from '../../components/kanban/ProductivityDashboardBoard'
import TaskModal from '../../components/kanban/TaskModal'
import SettingsModal from '../../components/kanban/SettingsModal'
import BrainDumpModal from '../../components/kanban/BrainDumpModal'

const HELP_STEPS = [
  {
    title: 'Welcome to Planit',
    body: 'This quick tour will walk you through the main areas so you can start planning fast.',
    screen: null,
  },
  {
    title: 'Sidebar Navigation',
    body: 'Use the left sidebar to switch between My Board and Dashboard. Quick Actions let you add tasks and open Brain Dump.',
    screen: 'board',
  },
  {
    title: 'My Board Workflow',
    body: 'On My Board, tasks are organized by status columns. You can create, edit, move, and complete tasks from here.',
    screen: 'board',
  },
  {
    title: 'Top Controls',
    body: 'Use search, filter, and Add Task in the top bar to quickly manage what you are working on.',
    screen: 'board',
  },
  {
    title: 'Dashboard Overview',
    body: 'Dashboard combines focus timer, goals, habits, analytics, and history to help you track progress.',
    screen: 'dashboard',
  },
  {
    title: 'Focus Mode',
    body: 'Open Focus Mode for a distraction-free timer session. You can close it with the close button, click outside, or Esc.',
    screen: 'dashboard',
  },
  {
    title: 'You are Ready',
    body: 'That is the core flow. Start with Add Task, process tasks on My Board, then review progress on Dashboard.',
    screen: null,
  },
]

export default function KanbanScreen({
  tasks,
  onUpdateTask,
  onDeleteTask,
  onAddTasks,
  onClearAllTasks,
  isLoggedIn,
  userEmail,
  onSignIn,
  onSignOut,
  isLoggingIn,
  activeScreen,
  onChangeScreen,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isBrainDumpOpen, setIsBrainDumpOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [isHelpTourOpen, setIsHelpTourOpen] = useState(false)
  const [helpStepIndex, setHelpStepIndex] = useState(0)

  // Organize tasks by status
  const tasksByStatus = useMemo(() => {
    const filtered = searchQuery
      ? tasks.filter(
          (task) =>
            task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : tasks

    return {
      todo: filtered.filter((task) => task.status === 'todo'),
      'in-progress': filtered.filter((task) => task.status === 'in-progress'),
      review: filtered.filter((task) => task.status === 'review'),
      done: filtered.filter((task) => task.status === 'done'),
    }
  }, [tasks, searchQuery])

  const overdueTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (task.status === 'done') return false
      if (!task.deadline) return false
      return new Date(task.deadline) < new Date()
    })
  }, [tasks])

  const handleOpenAddTask = () => {
    setEditingTask(null)
    setIsTaskModalOpen(true)
  }

  const handleOpenEditTask = (task) => {
    setEditingTask(task)
    setIsTaskModalOpen(true)
  }

  const handleTaskSubmit = (formData) => {
    if (editingTask) {
      // Update existing task
      onUpdateTask(editingTask.id, formData)
    } else {
      // Create new task
      const newTask = {
        ...formData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subtasks: [],
      }
      onAddTasks([newTask])
    }
    setIsTaskModalOpen(false)
    setEditingTask(null)
  }

  const handleDeleteTaskWithConfirm = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDeleteTask(taskId)
    }
  }

  const handleBrainDumpTasksGenerated = (generatedTasks) => {
    // Add generated tasks to the board
    const tasksWithIds = generatedTasks.map((task) => ({
      ...task,
      id: task.id || crypto.randomUUID(),
      createdAt: task.createdAt || new Date().toISOString(),
      updatedAt: task.updatedAt || new Date().toISOString(),
      status: task.status || 'todo',
      subtasks: task.subtasks || [],
    }))
    onAddTasks(tasksWithIds)
    setIsBrainDumpOpen(false)
  }

  const currentHelpStep = HELP_STEPS[helpStepIndex]

  const startHelpTour = () => {
    setHelpStepIndex(0)
    setIsHelpTourOpen(true)
  }

  const closeHelpTour = () => {
    setIsHelpTourOpen(false)
  }

  const goToHelpStep = (nextIndex) => {
    const boundedIndex = Math.max(0, Math.min(HELP_STEPS.length - 1, nextIndex))
    const step = HELP_STEPS[boundedIndex]
    if (step?.screen) {
      onChangeScreen(step.screen)
    }
    setHelpStepIndex(boundedIndex)
  }

  return (
    <div className="kanban-container">
      <KanbanSidebar
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenAddTask={handleOpenAddTask}
        onOpenBrainDump={() => setIsBrainDumpOpen(true)}
        isLoggedIn={isLoggedIn}
        activeScreen={activeScreen}
        onChangeScreen={onChangeScreen}
      />

      <main className="kanban-main">
        <KanbanTopbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddNote={handleOpenAddTask}
          activeScreen={activeScreen}
          onOpenHelp={startHelpTour}
        />

        {activeScreen === 'dashboard' ? (
          <ProductivityDashboardBoard
            tasks={tasks}
            onUpdateTask={onUpdateTask}
            onOpenAddTask={handleOpenAddTask}
          />
        ) : (
          <KanbanBoard
            tasksByStatus={tasksByStatus}
            onUpdateTask={onUpdateTask}
            onDeleteTask={handleDeleteTaskWithConfirm}
            onEditTask={handleOpenEditTask}
            onAddTasks={onAddTasks}
          />
        )}
      </main>

      <KanbanRightPanel tasks={tasks} overdueTasks={overdueTasks} />

      {/* MODALS */}
      <TaskModal
        key={`task-modal-${isTaskModalOpen}-${editingTask?.id || 'new'}`}
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false)
          setEditingTask(null)
        }}
        onSubmit={handleTaskSubmit}
        task={editingTask}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        isLoggedIn={isLoggedIn}
        userEmail={userEmail}
        onSignIn={onSignIn}
        onSignOut={onSignOut}
        onClearAllTasks={onClearAllTasks}
        isLoggingIn={isLoggingIn}
      />

      <BrainDumpModal
        isOpen={isBrainDumpOpen}
        onClose={() => setIsBrainDumpOpen(false)}
        onTasksGenerated={handleBrainDumpTasksGenerated}
      />

      {isHelpTourOpen && (
        <div className="help-tour-overlay" onClick={closeHelpTour}>
          <div className="help-tour-card" onClick={(event) => event.stopPropagation()}>
            <div className="help-tour-step">Step {helpStepIndex + 1} of {HELP_STEPS.length}</div>
            <h3 className="help-tour-title">{currentHelpStep.title}</h3>
            <p className="help-tour-body">{currentHelpStep.body}</p>

            <div className="help-tour-actions">
              <button
                className="kanban-btn kanban-btn--ghost"
                onClick={() => goToHelpStep(helpStepIndex - 1)}
                disabled={helpStepIndex === 0}
              >
                Back
              </button>

              {helpStepIndex < HELP_STEPS.length - 1 ? (
                <button className="kanban-btn kanban-btn--primary" onClick={() => goToHelpStep(helpStepIndex + 1)}>
                  Next
                </button>
              ) : (
                <button className="kanban-btn kanban-btn--primary" onClick={closeHelpTour}>
                  Finish
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
