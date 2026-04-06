import BrainDumpPanel from '../brainDump/BrainDumpPanel.jsx'
import TaskPanel from '../tasks/TaskPanel.jsx'

function TasksScreen({
  tasks,
  onAddTasks,
  onUpdateTask,
  onDeleteTask,
  onGenerateSubtasks,
}) {
  return (
    <div className="screen screen--tasks">
      <header className="screen__header">
        <h1>Tasks & Brain Dump</h1>
        <p>Capture tasks and manage your to-do list</p>
      </header>

      <div className="screen__content">
        <div className="grid grid--top">
          <BrainDumpPanel onAddTasks={onAddTasks} />
        </div>

        <div className="grid grid--middle">
          <TaskPanel
            tasks={tasks}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            onGenerateSubtasks={onGenerateSubtasks}
          />
        </div>
      </div>
    </div>
  )
}

export default TasksScreen
