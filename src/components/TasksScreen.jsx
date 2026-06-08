import { useState } from 'react'

const TasksScreen = ({ appData, saveAppData }) => {
  const [filter, setFilter] = useState('All')
  const [newTask, setNewTask] = useState({ text: '', category: 'Misc', month: 'Oct' })
  const [delegateTaskId, setDelegateTaskId] = useState(null)
  const [delegateName, setDelegateName] = useState('')
  const [delegateNote, setDelegateNote] = useState('')

  const categories = ['Beauty', 'Travel', 'Attire', 'Decor', 'Rehearsal', 'Venue', 'Food', 'Music', 'Ceremony', 'Misc', 'Guests']
  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct']
  const statusIcons = { todo: '⭕', doing: '🔄', done: '✅' }

  const filteredTasks = appData.todos.filter(t => {
    if (filter === 'All') return true
    if (filter === 'Todo') return t.status === 'todo'
    if (filter === 'Doing') return t.status === 'doing'
    if (filter === 'Done') return t.status === 'done'
  })

  const tasksByMonth = months.reduce((acc, month) => {
    acc[month] = filteredTasks.filter(t => t.month === month)
    return acc
  }, {})

  const handleAddTask = () => {
    if (!newTask.text.trim()) return
    const updatedTodos = [...appData.todos, {
      id: Date.now(),
      ...newTask,
      status: 'todo',
      delegated: null
    }]
    saveAppData({ ...appData, todos: updatedTodos })
    setNewTask({ text: '', category: 'Misc', month: 'Oct' })
  }

  const handleStatusCycle = (taskId) => {
    const statuses = ['todo', 'doing', 'done']
    const task = appData.todos.find(t => t.id === taskId)
    const currentIndex = statuses.indexOf(task.status)
    const newStatus = statuses[(currentIndex + 1) % statuses.length]
    
    const updatedTodos = appData.todos.map(t =>
      t.id === taskId ? { ...t, status: newStatus } : t
    )
    saveAppData({ ...appData, todos: updatedTodos })
  }

  const handleDelegate = (taskId) => {
    if (!delegateName.trim()) return
    
    const updatedTodos = appData.todos.map(t =>
      t.id === taskId ? { ...t, delegated: delegateName, delegateNote } : t
    )
    saveAppData({ ...appData, todos: updatedTodos })
    setDelegateTaskId(null)
    setDelegateName('')
    setDelegateNote('')
  }

  const handleUndelegate = (taskId) => {
    const updatedTodos = appData.todos.map(t =>
      t.id === taskId ? { ...t, delegated: null, delegateNote: '' } : t
    )
    saveAppData({ ...appData, todos: updatedTodos })
  }

  return (
    <div className="w-full max-w-md mx-auto bg-warm-white min-h-screen px-6 py-6">
      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['All', 'Todo', 'Doing', 'Done'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-serif transition-colors whitespace-nowrap ${
              filter === f
                ? 'bg-burgundy text-white'
                : 'bg-blush-light bg-opacity-30 text-text-mid hover:bg-opacity-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Add Task Card */}
      <div className="bg-blush-light bg-opacity-20 rounded-2xl p-4 mb-6 space-y-3">
        <h3 className="font-serif text-sm text-text-mid">Add Task</h3>
        <input
          type="text"
          value={newTask.text}
          onChange={(e) => setNewTask({ ...newTask, text: e.target.value })}
          placeholder="Task description..."
          className="w-full px-3 py-2 border border-blush rounded-lg text-sm focus:outline-none focus:border-burgundy"
        />
        <div className="grid grid-cols-3 gap-2">
          <select
            value={newTask.category}
            onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
            className="px-2 py-2 border border-blush rounded-lg text-xs focus:outline-none focus:border-burgundy"
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select
            value={newTask.month}
            onChange={(e) => setNewTask({ ...newTask, month: e.target.value })}
            className="px-2 py-2 border border-blush rounded-lg text-xs focus:outline-none focus:border-burgundy"
          >
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <button
            onClick={handleAddTask}
            className="px-3 py-2 bg-burgundy text-white rounded-lg text-xs font-serif hover:bg-burgundy-light transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Tasks by Month */}
      {months.map(month => {
        const monthTasks = tasksByMonth[month]
        if (monthTasks.length === 0) return null

        return (
          <div key={month} className="mb-6">
            <h3 className="font-serif text-lg text-burgundy mb-3">{month} {month === 'Oct' ? '🎃' : ''}</h3>
            <div className="space-y-2">
              {monthTasks.map(task => (
                <div key={task.id}>
                  {delegateTaskId === task.id ? (
                    <div className="bg-blush-light bg-opacity-30 rounded-lg p-4 space-y-2">
                      <p className="font-serif text-sm text-text-mid font-bold mb-3">📞 {task.text}</p>
                      <input
                        type="text"
                        value={delegateName}
                        onChange={(e) => setDelegateName(e.target.value)}
                        placeholder="Who's taking this?"
                        className="w-full px-3 py-2 border border-blush rounded-lg text-sm focus:outline-none focus:border-burgundy"
                      />
                      <textarea
                        value={delegateNote}
                        onChange={(e) => setDelegateNote(e.target.value)}
                        placeholder="Any notes?"
                        className="w-full px-3 py-2 border border-blush rounded-lg text-sm focus:outline-none focus:border-burgundy resize-none h-16"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelegate(task.id)}
                          className="flex-1 px-3 py-2 bg-burgundy text-white rounded-lg text-xs font-serif hover:bg-burgundy-light"
                        >
                          Delegate ✓
                        </button>
                        <button
                          onClick={() => setDelegateTaskId(null)}
                          className="flex-1 px-3 py-2 bg-text-light text-white rounded-lg text-xs font-serif hover:bg-text-mid"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-blush-light rounded-lg p-3 flex items-center justify-between group">
                      <div className="flex-1">
                        <button
                          onClick={() => handleStatusCycle(task.id)}
                          className="text-2xl hover:scale-110 transition-transform"
                        >
                          {statusIcons[task.status]}
                        </button>
                        <p className={`font-serif text-sm ${task.status === 'done' ? 'line-through text-text-light' : 'text-text-mid'}`}>
                          {task.text}
                        </p>
                        <p className="text-xs text-text-light mt-1">{task.category} • {task.month}</p>
                      </div>
                      
                      {task.delegated ? (
                        <div className="ml-2 text-right">
                          <p className="text-xs font-bold text-rust">👤 {task.delegated}</p>
                          <button
                            onClick={() => handleUndelegate(task.id)}
                            className="text-xs text-text-light hover:text-text-mid"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDelegateTaskId(task.id)}
                          className="ml-2 px-3 py-1 bg-blush-light bg-opacity-50 text-burgundy rounded text-xs font-serif opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          📞
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TasksScreen
