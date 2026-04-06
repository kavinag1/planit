import { useState, useMemo } from 'react'
import '../../styles/kanban.css'
import KanbanSidebar from '../../components/kanban/KanbanSidebar'
import KanbanTopbar from '../../components/kanban/KanbanTopbar'
import KanbanBoard from '../../components/kanban/KanbanBoard'
import KanbanRightPanel from '../../components/kanban/KanbanRightPanel'
import TaskModal from '../../components/kanban/TaskModal'
import SettingsModal from '../../components/kanban/SettingsModal'
import BrainDumpModal from '../../components/kanban/BrainDumpModal'

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
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isBrainDumpOpen, setIsBrainDumpOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

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

  return (
    <div className="kanban-container">
      <KanbanSidebar
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenAddTask={handleOpenAddTask}
        onOpenBrainDump={() => setIsBrainDumpOpen(true)}
        isLoggedIn={isLoggedIn}
      />

      <main className="kanban-main">
        <KanbanTopbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddNote={handleOpenAddTask}
        />

        <KanbanBoard
          tasksByStatus={tasksByStatus}
          onUpdateTask={onUpdateTask}
          onDeleteTask={handleDeleteTaskWithConfirm}
          onEditTask={handleOpenEditTask}
          onAddTasks={onAddTasks}
        />
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
    </div>
  )
}
