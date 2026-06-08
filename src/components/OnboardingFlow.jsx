import { useState } from 'react'

// Default task texts used to prevent AI duplicates
const DEFAULT_TASK_TEXTS = [
  'book hair makeup artist',
  'finalize honeymoon destination dates',
  'final dress fitting',
  'confirm ribbon escort display vendor colors',
  'confirm wedding party attire',
  'rehearsal dinner guest list',
  'final headcount to venue',
  'finalize menu',
  'confirm ceremony music dj',
  'write vows',
  'hair makeup trial run',
  'send final payments to vendors',
  'create seating chart',
  'rehearsal dinner confirm venue details',
  'confirm all vendor arrival times',
  'deliver ribbon escort display materials',
  'final dress pickup',
  'rehearsal dinner',
  'send final invitations',
]

const normalize = (s) =>
  s.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()

const isDuplicate = (taskText) => {
  const n = normalize(taskText)
  return DEFAULT_TASK_TEXTS.some((d) => {
    const dn = normalize(d)
    // Duplicate if either contains the other (first 4+ words overlap)
    const nWords = n.split(' ').slice(0, 4).join(' ')
    const dWords = dn.split(' ').slice(0, 4).join(' ')
    return n === dn || nWords === dWords
  })
}

const OnboardingFlow = ({ onComplete }) => {
  const [step, setStep] = useState(0)
  const [calendarChecked, setCalendarChecked] = useState(false)
  const [priorities, setPriorities] = useState([])
  const [brainDump, setBrainDump] = useState('')
  const [aiTasks, setAiTasks] = useState([])
  const [skippedIds, setSkippedIds] = useState(new Set())

  const priorityOptions = [
    { label: 'Tasks', icon: '✅' },
    { label: 'Countdown', icon: '⏰' },
    { label: 'Vendors', icon: '📋' },
    { label: 'Budget', icon: '💰' },
    { label: 'Brain Dump', icon: '🧠' },
    { label: 'Phone a Friend', icon: '📞' },
  ]

  const handlePriorityToggle = (label) => {
    setPriorities((prev) =>
      prev.includes(label) ? prev.filter((p) => p !== label) : [...prev, label]
    )
  }

  // ── Brain dump submit: call AI or skip to celebrate ──────────────────────
  const handleBrainDumpSubmit = async () => {
    if (!brainDump.trim()) {
      // No brain dump → skip AI, go straight to celebrate with 0 AI tasks
      setAiTasks([])
      setStep('celebrate')
      return
    }

    setStep('loading')

    try {
      const prompt = `Vi is planning her wedding to Jay on October 31, 2026 at Crème de la Crème, Youngsville, LA. She wrote these brain dump notes during onboarding:

"${brainDump}"

Based on these notes, generate 5–8 personalized wedding planning tasks for her. Focus on tasks SPECIFIC to what she mentioned. Do NOT repeat generic tasks like booking hair/makeup, dress fitting, writing vows, seating chart, confirming vendors, or honeymoon — those are already in her list.

Return ONLY a valid JSON array with no explanation, markdown, or extra text — just the raw JSON:
[{"text": "task description", "category": "Category", "month": "Mon"}]

Categories to use: Beauty, Travel, Attire, Decor, Venue, Food, Music, Ceremony, Guests, Rehearsal, Misc
Months: Jul, Aug, Sep, Oct`

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ from: 'user', text: prompt }],
          brainDump,
        }),
      })

      if (!res.ok) throw new Error('API error')
      const { reply } = await res.json()

      // Extract the JSON array from the reply
      let parsed = []
      try {
        const match = reply.match(/\[[\s\S]*?\]/)
        if (match) parsed = JSON.parse(match[0])
      } catch {
        parsed = []
      }

      // Deduplicate against defaults and assign stable IDs
      const unique = parsed
        .filter((t) => t && typeof t.text === 'string' && !isDuplicate(t.text))
        .map((t, i) => ({
          id: 100 + i,
          text: t.text,
          category: t.category || 'Misc',
          month: t.month || 'Aug',
          status: 'todo',
          delegated: null,
        }))

      setAiTasks(unique)
      setStep('review')
    } catch (err) {
      console.error('AI task generation failed:', err)
      // Silently fall through with empty list
      setAiTasks([])
      setStep('review')
    }
  }

  const handleSkipTask = (id) =>
    setSkippedIds((prev) => new Set([...prev, id]))

  const handleUnskipTask = (id) =>
    setSkippedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })

  const selectedTasks = aiTasks.filter((t) => !skippedIds.has(t.id))

  const handleFinishReview = () => setStep('celebrate')

  const handleComplete = () => {
    onComplete({
      brainDump,
      calendarConfirmed: calendarChecked,
      priorities,
      aiTasks: selectedTasks,
    })
  }

  // ── Loading screen ────────────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-burgundy via-rust to-burgundy px-8 text-center">
        <div className="space-y-8">
          <div className="relative">
            <div className="text-6xl animate-spin" style={{ animationDuration: '3s' }}>✨</div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-serif text-blush-light tracking-wide uppercase text-sm">
              Just a moment...
            </h2>
            <h1 className="text-3xl font-serif text-white leading-snug">
              Building your personal<br />
              <span className="font-script text-4xl text-blush-light">wedding plan</span>
            </h1>
          </div>

          <div className="flex gap-2 justify-center items-center">
            {[0, 150, 300].map((delay) => (
              <div
                key={delay}
                className="w-3 h-3 rounded-full bg-blush-light animate-pulse"
                style={{ animationDelay: `${delay}ms`, animationDuration: '1.2s' }}
              />
            ))}
          </div>

          <p className="text-blush-light text-sm font-serif opacity-75">
            Analyzing your notes with AI ✦ creating your personalized checklist
          </p>
        </div>
      </div>
    )
  }

  // ── Task review screen ────────────────────────────────────────────────────
  if (step === 'review') {
    return (
      <div className="min-h-screen w-full bg-warm-white flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-burgundy to-rust px-6 pt-10 pb-6 flex-shrink-0">
          <div className="text-2xl mb-2">✨</div>
          <h1 className="text-2xl font-serif text-white">
            {aiTasks.length > 0 ? 'Your suggested tasks' : 'Your task list is ready!'}
          </h1>
          <p className="text-blush-light text-sm mt-1 font-serif">
            {aiTasks.length > 0
              ? 'Based on your notes — add what resonates!'
              : 'Your default wedding checklist is all set.'}
          </p>
        </div>

        {/* Task cards */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {aiTasks.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <p className="text-5xl">🌸</p>
              <p className="font-serif text-text-mid">Your default checklist is loaded and ready.</p>
              <p className="text-sm text-text-light">You can add custom tasks anytime from the Tasks tab!</p>
            </div>
          ) : (
            aiTasks.map((task) => {
              const isSkipped = skippedIds.has(task.id)
              return (
                <div
                  key={task.id}
                  className={`rounded-2xl border-2 p-4 transition-all duration-200 ${
                    isSkipped
                      ? 'border-blush-light bg-white opacity-40'
                      : 'border-blush bg-white shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-serif text-sm leading-relaxed ${
                          isSkipped ? 'line-through text-text-light' : 'text-text-mid'
                        }`}
                      >
                        {task.text}
                      </p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="text-xs bg-blush-light bg-opacity-50 text-burgundy px-2 py-0.5 rounded-full">
                          {task.category}
                        </span>
                        <span className="text-xs bg-rust text-white px-2 py-0.5 rounded-full">
                          {task.month}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 pt-0.5">
                      {isSkipped ? (
                        <button
                          onClick={() => handleUnskipTask(task.id)}
                          className="text-xs px-3 py-1.5 bg-burgundy text-white rounded-full font-serif hover:bg-burgundy-light transition-colors"
                        >
                          Add +
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSkipTask(task.id)}
                          className="text-xs px-3 py-1.5 bg-blush-light bg-opacity-50 text-text-mid rounded-full font-serif hover:bg-opacity-70 transition-colors"
                        >
                          ✕ Skip
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer CTA */}
        <div className="flex-shrink-0 px-4 pb-8 pt-3 bg-warm-white border-t border-blush-light">
          {aiTasks.length > 0 && (
            <p className="text-center text-xs text-text-light font-serif mb-3">
              {selectedTasks.length} of {aiTasks.length} tasks selected
            </p>
          )}
          <button
            onClick={handleFinishReview}
            className="w-full py-4 bg-burgundy text-white rounded-full font-serif text-lg hover:bg-burgundy-light transition-colors shadow-md"
          >
            {aiTasks.length === 0
              ? "Let's Go! ✨"
              : selectedTasks.length === 0
              ? 'Skip all ✨'
              : `Add ${selectedTasks.length} task${selectedTasks.length !== 1 ? 's' : ''} ✨`}
          </button>
        </div>
      </div>
    )
  }

  // ── Celebration screen ────────────────────────────────────────────────────
  if (step === 'celebrate') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-burgundy via-rust to-burgundy px-8 text-center">
        <div className="space-y-7 max-w-sm w-full">
          <div className="text-7xl animate-bounce">💍</div>

          <h1 className="text-3xl font-serif text-white leading-snug">
            Your wedding HQ is ready, Vi!
          </h1>

          <div className="bg-white bg-opacity-20 rounded-3xl px-6 py-5 space-y-1">
            {selectedTasks.length > 0 ? (
              <>
                <p className="text-5xl font-bold text-blush-light">{selectedTasks.length}</p>
                <p className="text-white font-serif">
                  personalized task{selectedTasks.length !== 1 ? 's' : ''} added
                </p>
              </>
            ) : (
              <p className="text-white font-serif">
                Your default wedding checklist is ready to go! 🌸
              </p>
            )}
          </div>

          <p className="text-blush-light font-serif text-lg">Let's do this! 🎉</p>

          <button
            onClick={handleComplete}
            className="w-full py-4 bg-white text-burgundy font-serif text-lg rounded-full hover:bg-blush-light transition-colors shadow-lg"
          >
            Open Wedding HQ →
          </button>
        </div>
      </div>
    )
  }

  // ── Standard steps 0–3 ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-warm-white px-6 py-12 overflow-y-auto">

      {/* Step 0: Welcome */}
      {step === 0 && (
        <div className="max-w-sm w-full space-y-8 text-center">
          <div className="text-6xl font-script text-burgundy">Vi &amp; Jay</div>
          <h1 className="text-4xl font-serif text-burgundy">Hey Vi! 💍</h1>

          <div className="bg-blush-light bg-opacity-30 rounded-2xl p-6 space-y-4">
            <div>
              <p className="text-2xl font-bold text-burgundy">147 Days</p>
              <p className="text-sm text-text-mid">until the wedding 🎉</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-rust">149 Days</p>
              <p className="text-sm text-text-mid">until rehearsal dinner 🎭</p>
            </div>
          </div>

          <p className="text-text-mid font-serif">Let&apos;s make this the best day ever!</p>
          <button
            onClick={() => setStep(1)}
            className="w-full py-3 bg-burgundy text-white rounded-full font-serif hover:bg-burgundy-light transition-colors"
          >
            Continue →
          </button>
        </div>
      )}

      {/* Step 1: Calendar Tip */}
      {step === 1 && (
        <div className="max-w-sm w-full space-y-6">
          <h2 className="text-3xl font-serif text-burgundy text-center">📅 Calendar Tip</h2>

          <p className="text-center text-text-mid text-sm font-serif">
            Keep your wedding events separate from your work schedule! Create a dedicated wedding
            calendar in Google or Apple Calendar — it takes 2 minutes.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl bg-blush-light bg-opacity-20 p-4 text-sm">
              <h3 className="mb-3 text-base font-semibold text-burgundy">Google Calendar</h3>
              <ol className="list-decimal list-inside space-y-2 text-text-mid text-xs leading-relaxed">
                <li>Open Google Calendar</li>
                <li>Click + next to Other calendars</li>
                <li>Name it Vi &amp; Jay Wedding</li>
                <li>Choose burgundy color</li>
              </ol>
            </div>
            <div className="rounded-3xl bg-blush-light bg-opacity-20 p-4 text-sm">
              <h3 className="mb-3 text-base font-semibold text-burgundy">Apple Calendar</h3>
              <ol className="list-decimal list-inside space-y-2 text-text-mid text-xs leading-relaxed">
                <li>Open Calendar on iPhone</li>
                <li>Tap Calendars at bottom</li>
                <li>Tap Add Calendar</li>
                <li>Name it Vi &amp; Jay Wedding</li>
              </ol>
            </div>
          </div>

          <label className="flex items-center gap-3 p-4 bg-olive bg-opacity-10 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={calendarChecked}
              onChange={(e) => setCalendarChecked(e.target.checked)}
              className="w-5 h-5 accent-olive"
            />
            <span className="text-text-mid font-serif">Got it — I&apos;ll set that up! ✓</span>
          </label>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(0)}
              className="flex-1 py-3 bg-blush-light bg-opacity-50 text-burgundy rounded-full font-serif hover:bg-opacity-70 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 bg-burgundy text-white rounded-full font-serif hover:bg-burgundy-light transition-colors"
            >
              I already have one ✓
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Priorities */}
      {step === 2 && (
        <div className="max-w-sm w-full space-y-6">
          <h2 className="text-3xl font-serif text-burgundy text-center">
            What&apos;s important to you?
          </h2>

          <p className="text-center text-text-mid text-sm">Select at least one priority</p>

          <div className="grid grid-cols-2 gap-3">
            {priorityOptions.map((opt) => (
              <button
                key={opt.label}
                onClick={() => handlePriorityToggle(opt.label)}
                className={`p-4 rounded-2xl font-serif transition-all ${
                  priorities.includes(opt.label)
                    ? 'bg-burgundy text-white shadow-lg scale-105'
                    : 'bg-blush-light bg-opacity-30 text-text-mid hover:bg-opacity-50'
                }`}
              >
                <div className="text-2xl mb-2">{opt.icon}</div>
                <div className="text-sm">{opt.label}</div>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 bg-blush-light bg-opacity-50 text-burgundy rounded-full font-serif hover:bg-opacity-70 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={priorities.length === 0}
              className="flex-1 py-3 bg-burgundy text-white rounded-full font-serif hover:bg-burgundy-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Brain Dump */}
      {step === 3 && (
        <div className="max-w-sm w-full space-y-6">
          <h2 className="text-3xl font-serif text-burgundy text-center">Brain Dump 🧠</h2>

          <p className="text-center text-text-mid text-sm font-serif">
            What&apos;s swirling in your head? Your notes become your personalized task list!
          </p>

          <textarea
            value={brainDump}
            onChange={(e) => setBrainDump(e.target.value)}
            placeholder="Colors... ribbon... pho... Charley's outfit... anything!"
            className="w-full h-44 p-4 border-2 border-blush rounded-2xl font-serif text-text-mid focus:outline-none focus:border-burgundy resize-none text-sm leading-relaxed"
          />

          <p className="text-xs text-text-light text-center font-serif">
            ✨ AI will turn your notes into personalized tasks
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 bg-blush-light bg-opacity-50 text-burgundy rounded-full font-serif hover:bg-opacity-70 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handleBrainDumpSubmit}
              className="flex-1 py-3 bg-burgundy text-white rounded-full font-serif hover:bg-burgundy-light transition-colors"
            >
              {brainDump.trim() ? 'Generate Tasks ✨' : "Skip for now →"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default OnboardingFlow
