const DelegateScreen = ({ appData, saveAppData }) => {
  const delegatedTasks = appData.todos.filter(t => t.delegated && t.status !== 'done')

  // Group by delegate
  const groupedByDelegate = delegatedTasks.reduce((acc, task) => {
    const key = task.delegated
    if (!acc[key]) acc[key] = []
    acc[key].push(task)
    return acc
  }, {})

  const handleMarkDone = (taskId) => {
    const updatedTodos = appData.todos.map(t =>
      t.id === taskId ? { ...t, status: 'done' } : t
    )
    saveAppData({ ...appData, todos: updatedTodos })
  }

  if (Object.keys(groupedByDelegate).length === 0) {
    return (
      <div className="w-full max-w-md mx-auto bg-warm-white min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-3xl mb-4">📞</p>
        <h2 className="font-serif text-2xl text-burgundy mb-4">Phone a Friend</h2>
        <p className="text-text-mid text-sm mb-8">
          No delegated tasks yet. Go to the Tasks tab and tap the 📞 button to assign tasks to your friends and family!
        </p>
        <p className="text-xs text-text-light italic">Teamwork makes the dream work! 💕</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto bg-warm-white min-h-screen px-6 py-6">
      <h2 className="font-serif text-2xl text-burgundy mb-6">📞 Phone a Friend</h2>

      {Object.entries(groupedByDelegate).map(([delegate, tasks]) => (
        <div key={delegate} className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blush flex items-center justify-center text-white font-serif font-bold">
              {delegate.charAt(0).toUpperCase()}
            </div>
            <h3 className="font-serif text-base text-burgundy">{delegate}</h3>
          </div>

          <div className="space-y-2 ml-13">
            {tasks.map(task => (
              <div key={task.id} className="bg-white border border-blush-light rounded-lg p-3 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-serif text-sm text-text-mid">{task.text}</p>
                  {task.delegateNote && (
                    <p className="text-xs text-text-light italic mt-1">💬 {task.delegateNote}</p>
                  )}
                  <p className="text-xs text-text-light mt-1">{task.category} • {task.month}</p>
                </div>
                <button
                  onClick={() => handleMarkDone(task.id)}
                  className="px-3 py-2 bg-olive text-white rounded-lg text-xs font-serif hover:bg-opacity-90 transition-colors whitespace-nowrap"
                >
                  Done ✓
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default DelegateScreen
