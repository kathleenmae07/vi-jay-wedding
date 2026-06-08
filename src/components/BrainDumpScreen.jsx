import { useState } from 'react'

const BrainDumpScreen = ({ appData, saveAppData }) => {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [noteInput, setNoteInput] = useState(appData.brainDump || '')

  const handleSendMessage = async () => {
    if (!input.trim()) return

    setError(null)
    const newMessages = [
      ...(appData.chatMessages || []),
      { from: 'user', text: input, createdAt: new Date().toISOString() }
    ]

    saveAppData({ ...appData, chatMessages: newMessages })
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          brainDump: appData.brainDump || ''
        })
      })

      if (!response.ok) throw new Error('Failed to send message')
      const data = await response.json()

      const updatedMessages = [
        ...newMessages,
        { from: 'assistant', text: data.reply, createdAt: new Date().toISOString() }
      ]

      saveAppData({ ...appData, chatMessages: updatedMessages })
    } catch (err) {
      setError('Could not connect to your bestie. Check your connection and try again.')
      console.error('Chat error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotes = () => {
    saveAppData({ ...appData, brainDump: noteInput })
  }

  return (
    <div className="w-full max-w-md mx-auto bg-warm-white h-screen flex flex-col">
      {/* Wedding Bestie Chat */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-blush-light from-5% via-warm-white">
        <h2 className="font-serif text-lg text-burgundy mb-4">💕 Wedding Bestie Chat</h2>
        
        {(appData.chatMessages || []).length === 0 ? (
          <div className="text-center py-8 text-text-light">
            <p className="text-sm">Start chatting with your wedding bestie!</p>
            <p className="text-xs mt-2">She's here to help with planning, brainstorming, and pep talks ✨</p>
          </div>
        ) : (
          (appData.chatMessages || []).map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs rounded-2xl px-4 py-2 text-sm font-serif ${
                  msg.from === 'user'
                    ? 'bg-burgundy text-white rounded-br-sm'
                    : 'bg-blush-light bg-opacity-50 text-text-mid rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-blush-light bg-opacity-50 text-text-mid rounded-2xl px-4 py-2 text-sm">
              ✨ bestie is thinking...
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-rust bg-opacity-10 border border-rust rounded-lg p-3 text-rust text-sm font-serif">
            {error}
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="bg-white border-t border-blush-light p-4 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask your bestie..."
            disabled={loading}
            className="flex-1 px-4 py-3 border border-blush rounded-full text-sm focus:outline-none focus:border-burgundy disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || loading}
            className="px-4 py-3 bg-burgundy text-white rounded-full hover:bg-burgundy-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ↑
          </button>
        </div>
      </div>

      {/* My Notes Section */}
      <div className="border-t border-blush-light bg-blush-light bg-opacity-10 p-4">
        <div className="space-y-2 max-h-40 overflow-y-auto">
          <label className="block">
            <p className="font-serif text-sm text-burgundy mb-2">📝 My Notes</p>
            <textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Your personal notes and ideas..."
              className="w-full h-24 p-3 border border-blush rounded-lg text-xs focus:outline-none focus:border-burgundy resize-none"
            />
          </label>
          <button
            onClick={handleSaveNotes}
            className="w-full px-3 py-2 bg-olive text-white rounded-lg text-xs font-serif hover:bg-opacity-90 transition-colors"
          >
            Save Notes
          </button>
        </div>
      </div>
    </div>
  )
}

export default BrainDumpScreen
