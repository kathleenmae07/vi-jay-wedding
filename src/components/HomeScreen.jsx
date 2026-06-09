import useCountdown from '../hooks/useCountdown'

const HomeScreen = ({ appData, saveAppData }) => {
  const weddingDate = '2026-10-31T16:30:00'
  const rehearsalDate = '2026-10-29T18:00:00'
  const countdown = useCountdown(weddingDate)
  const rehearsalCountdown = useCountdown(rehearsalDate)

  const doneTasks = appData.todos.filter(t => t.status === 'done').length
  const completionPercent = Math.round((doneTasks / appData.todos.length) * 100)
  
  const upNextTasks = appData.todos
    .filter(t => t.status !== 'done')
    .slice(0, 3)

  const delegatedTasks = appData.todos.filter(t => t.delegated && t.status !== 'done')

  const handleBrainDumpSave = (text) => {
    saveAppData({
      ...appData,
      brain_dump: text
    })
  }

  const handlePhotoPosition = (newPosition) => {
    saveAppData({
      ...appData,
      settings: { ...appData.settings, photoPosition: newPosition }
    })
  }

  const positionMap = {
    'Top': 'top-0',
    'Upper': 'top-1/4',
    'Center-Up': 'top-2/5',
    'Center': 'top-1/2',
    'Center-Low': 'top-3/5',
    'Bottom': 'top-3/4'
  }

  return (
    <div className="w-full max-w-md mx-auto bg-warm-white min-h-screen">
      {/* Hero Photo Section */}
      <div className="relative h-96 bg-gradient-to-b from-burgundy via-rust to-blush overflow-hidden">
        <img
          src={`/api/photo?ts=${appData.settings?.photoVersion || Date.now()}`}
          alt="Wedding Hero"
          className="w-full h-full object-cover"
          style={{ objectPosition: '50% ' + (appData.settings?.photoPosition || 'center') }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-burgundy opacity-80"></div>
        
        {/* J&V Logo */}
        <div
          className="absolute left-1/2 top-[15%] transform -translate-x-1/2 -translate-y-1/2 w-[90px] h-[90px] flex items-center justify-center overflow-hidden"
        >
          <img
            src={`/api/logo?ts=${appData.settings?.logoVersion || Date.now()}`}
            alt="J&V logo"
            className="w-20 h-20 object-contain"
            style={{ mixBlendMode: 'screen' }}
          />
        </div>

        {/* Title & Countdown Card Overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 flex justify-between items-end gap-4">
          <div className="text-white">
            <h1 className="text-4xl font-script mb-1">Vi & Jay</h1>
            <p className="text-sm font-serif text-blush-light">Wedding HQ</p>
          </div>
          
          <div className="bg-white bg-opacity-95 rounded-2xl px-4 py-3 shadow-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-burgundy">{countdown.days}</p>
              <p className="text-xs text-text-mid font-serif">days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="px-6 py-6 space-y-6">
        
        {/* Countdown Card */}
        <div className="bg-gradient-to-r from-burgundy to-rust text-white rounded-2xl p-6 shadow-md">
          <h3 className="font-serif text-lg mb-3">The Big Day</h3>
          <div className="space-y-2 text-sm">
            <p>📍 Crème de la Crème, Youngsville, LA</p>
            <p>⏰ 4:30 PM Ceremony • 6:00 PM Reception</p>
          </div>
          
          <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Progress</span>
              <span className="font-bold">{completionPercent}%</span>
            </div>
            <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
              <div className="bg-white h-2 rounded-full transition-all" style={{ width: completionPercent + '%' }}></div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white border-opacity-30 text-sm">
            <p>🎭 Rehearsal: Oct 29 @ 6 PM</p>
          </div>
        </div>

        {/* Up Next Tasks */}
        <div className="space-y-2">
          <h3 className="font-serif text-lg text-burgundy">Up Next</h3>
          {upNextTasks.length > 0 ? (
            <div className="space-y-2">
              {upNextTasks.map(task => (
                <div key={task.id} className="bg-blush-light bg-opacity-30 rounded-lg p-3 text-sm">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-text-mid font-serif flex-1">{task.text}</p>
                    {task.delegated && <span className="text-xs bg-rust text-white px-2 py-1 rounded-full">👤 {task.delegated}</span>}
                  </div>
                  <p className="text-xs text-text-light mt-1">{task.category} • {task.month}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-light text-sm italic">All caught up! 🎉</p>
          )}
        </div>

        {/* Delegated Tasks */}
        {delegatedTasks.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-serif text-lg text-burgundy">Delegated</h3>
            <div className="space-y-2">
              {delegatedTasks.map(task => (
                <div key={task.id} className="bg-olive bg-opacity-10 rounded-lg p-3 text-sm">
                  <p className="text-text-mid font-serif">{task.text}</p>
                  <p className="text-xs text-olive mt-1">👤 {task.delegated}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vi's Wins */}
        <div className="bg-olive bg-opacity-10 rounded-2xl p-6 text-center">
          <h3 className="font-serif text-lg text-olive mb-2">✨ Vi's Wins</h3>
          <p className="text-3xl font-bold text-olive">{doneTasks}</p>
          <p className="text-sm text-text-mid">tasks completed</p>
        </div>

      </div>
    </div>
  )
}

export default HomeScreen
