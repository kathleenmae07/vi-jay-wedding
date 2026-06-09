import { useState } from 'react'

const MoreScreen = ({ appData, saveAppData }) => {
  const [tab, setTab] = useState('budget')
  const [newCategory, setNewCategory] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [photoPosition, setPhotoPosition] = useState(appData.settings?.photoPosition || 'center')
  const [openImageUrl, setOpenImageUrl] = useState(null)

  const positions = ['Top', 'Upper', 'Center-Up', 'Center', 'Center-Low', 'Bottom']

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('photo', file)

    try {
      await fetch('/api/photo', { method: 'POST', body: formData })
      setPhotoFile(null)
      // Update app data with a new photoVersion to bust cache, then refresh
      saveAppData({ ...appData, settings: { ...appData.settings, photoVersion: Date.now() } })
      window.location.reload()
    } catch (err) {
      console.error('Photo upload failed:', err)
    }
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('logo', file)

    try {
      await fetch('/api/logo', { method: 'POST', body: formData })
      setLogoFile(null)
      // Update app data with a new logoVersion to bust cache, then refresh
      saveAppData({ ...appData, settings: { ...appData.settings, logoVersion: Date.now(), logoUploaded: true } })
      window.location.reload()
    } catch (err) {
      console.error('Logo upload failed:', err)
    }
  }

  const handlePositionChange = (newPosition) => {
    setPhotoPosition(newPosition)
    saveAppData({
      ...appData,
      settings: { ...appData.settings, photoPosition: newPosition }
    })
  }

  const handleBudgetChange = (id, field, value) => {
    const updatedBudget = appData.budget.map(b =>
      b.id === id ? { ...b, [field]: Number(value) } : b
    )
    saveAppData({ ...appData, budget: updatedBudget })
  }

  const handleAddCategory = () => {
    const name = newCategory.trim()
    if (!name) return
    const maxId = appData.budget.reduce((m, b) => Math.max(m, b.id || 0), 0)
    const newItem = { id: maxId + 1, category: name, budget: 0, spent: 0, receipts: [] }
    saveAppData({ ...appData, budget: [...appData.budget, newItem] })
    setNewCategory('')
  }

  const handleRemoveCategory = (id) => {
    if (!window.confirm('Remove this budget category?')) return
    saveAppData({ ...appData, budget: appData.budget.filter(b => b.id !== id) })
  }

  const fileUrl = (key) => (key ? `/api/file/${encodeURIComponent(key)}?ts=${Date.now()}` : null)

  const handleReceiptUpload = async (itemId, event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const fileKey = `budget-receipt-${itemId}-${Date.now()}`
    const formData = new FormData()
    formData.append('file', file)
    formData.append('key', fileKey)
    formData.append('category', 'receipts')

    try {
      await fetch('/api/file', { method: 'POST', body: formData })
      const updatedBudget = appData.budget.map((item) =>
        item.id === itemId ? { ...item, receiptKey: fileKey } : item
      )
      saveAppData({ ...appData, budget: updatedBudget })
    } catch (err) {
      console.error('Receipt upload failed:', err)
    }
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      fetch('/api/reset', { method: 'POST' })
        .then(() => {
          alert('App reset! Refreshing...')
          window.location.reload()
        })
        .catch(err => console.error('Reset failed:', err))
    }
  }

  const totalBudget = appData.budget.reduce((sum, b) => sum + b.budget, 0)
  const totalSpent = appData.budget.reduce((sum, b) => sum + b.spent, 0)

  return (
    <div className="w-full max-w-md mx-auto bg-warm-white min-h-screen">
      {/* Tab Navigation */}
      <div className="flex border-b border-blush-light bg-white sticky top-0 z-10">
        <button
          onClick={() => setTab('budget')}
          className={`flex-1 py-4 font-serif text-sm transition-colors ${
            tab === 'budget'
              ? 'text-burgundy border-b-2 border-burgundy'
              : 'text-text-light hover:text-text-mid'
          }`}
        >
          💰 Budget
        </button>
        <button
          onClick={() => setTab('settings')}
          className={`flex-1 py-4 font-serif text-sm transition-colors ${
            tab === 'settings'
              ? 'text-burgundy border-b-2 border-burgundy'
              : 'text-text-light hover:text-text-mid'
          }`}
        >
          ⚙️ Settings
        </button>
      </div>

      <div className="px-6 py-6">
        {/* Budget Tab */}
        {tab === 'budget' && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3 bg-burgundy rounded-2xl text-white p-4">
              <div className="text-center">
                <p className="text-xs opacity-80">Total</p>
                <p className="text-lg font-bold">${totalBudget.toLocaleString()}</p>
              </div>
              <div className="text-center border-l border-r border-white border-opacity-30">
                <p className="text-xs opacity-80">Spent</p>
                <p className="text-lg font-bold">${totalSpent.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs opacity-80">Remaining</p>
                <p className="text-lg font-bold">${(totalBudget - totalSpent).toLocaleString()}</p>
              </div>
            </div>

            {/* Add Category */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                placeholder="New category name..."
                className="flex-1 px-3 py-2 border border-blush rounded-lg text-xs focus:outline-none focus:border-burgundy"
              />
              <button
                onClick={handleAddCategory}
                disabled={!newCategory.trim()}
                className="px-4 py-2 bg-burgundy text-white rounded-lg text-xs font-serif hover:bg-burgundy/90 transition-colors disabled:opacity-40"
              >
                + Add
              </button>
            </div>

            {/* Budget Items */}
            <div className="space-y-4">
              {appData.budget.map(item => {
                const percent = (item.spent / item.budget) * 100
                const isOver = item.spent > item.budget

                return (
                  <div key={item.id} className="bg-white border border-blush-light rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-serif text-sm text-text-mid font-bold">{item.category}</p>
                      <button
                        onClick={() => handleRemoveCategory(item.id)}
                        className="text-xs text-rust hover:text-rust/70 transition-colors"
                        title="Remove category"
                      >
                        ✕ Remove
                      </button>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-blush-light bg-opacity-30 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${isOver ? 'bg-rust' : 'bg-olive'}`}
                          style={{ width: Math.min(percent, 100) + '%' }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-text-light">
                        <span>${item.spent.toLocaleString()} / ${item.budget.toLocaleString()}</span>
                        <span>{Math.round(percent)}%</span>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-text-light font-serif pl-1">Budget</label>
                        <input
                          type="number"
                          value={item.budget}
                          onChange={(e) => handleBudgetChange(item.id, 'budget', e.target.value)}
                          placeholder="0"
                          className="px-3 py-2 border border-blush rounded-lg text-xs focus:outline-none focus:border-burgundy"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-text-light font-serif pl-1">Spent</label>
                        <input
                          type="number"
                          value={item.spent}
                          onChange={(e) => handleBudgetChange(item.id, 'spent', e.target.value)}
                          placeholder="0"
                          className="px-3 py-2 border border-blush rounded-lg text-xs focus:outline-none focus:border-burgundy"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <label className="inline-flex items-center gap-2 rounded-2xl border border-dashed border-blush-light bg-blush-light/30 px-3 py-2 text-xs text-text-mid cursor-pointer hover:border-burgundy">
                        📷 Receipt
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleReceiptUpload(item.id, e)}
                          className="hidden"
                        />
                      </label>
                      {item.receiptKey && (
                        <button
                          type="button"
                          onClick={() => setOpenImageUrl(fileUrl(item.receiptKey))}
                          className="rounded-2xl border border-blush-light bg-white px-3 py-2 text-xs text-burgundy"
                        >
                          View Receipt
                        </button>
                      )}
                    </div>
                    {item.receiptKey && (
                      <div className="mt-3 rounded-3xl overflow-hidden border border-blush-light bg-blush-light">
                        <img
                          src={fileUrl(item.receiptKey)}
                          alt="Budget receipt"
                          className="h-24 w-full object-cover cursor-pointer"
                          onClick={() => setOpenImageUrl(fileUrl(item.receiptKey))}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {tab === 'settings' && (
          <div className="space-y-6">
            {/* Change Hero Photo */}
            <div className="bg-blush-light bg-opacity-20 rounded-2xl p-4 space-y-3">
              <h3 className="font-serif text-sm text-text-mid font-bold">📸 Change Hero Photo</h3>
              <label className="block px-4 py-3 bg-white border-2 border-dashed border-blush rounded-lg cursor-pointer hover:border-burgundy transition-colors text-center text-sm">
                <span className="text-text-mid font-serif">Tap to upload photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              {/* Photo Position */}
              <div>
                <p className="text-xs text-text-mid font-serif mb-2">Photo Position</p>
                <div className="grid grid-cols-3 gap-2">
                  {positions.map(pos => (
                    <button
                      key={pos}
                      onClick={() => handlePositionChange(pos)}
                      className={`px-2 py-2 rounded-lg text-xs font-serif transition-colors ${
                        photoPosition === pos
                          ? 'bg-burgundy text-white'
                          : 'bg-blush-light bg-opacity-50 text-text-mid hover:bg-opacity-70'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Upload J&V Logo */}
            <div className="bg-blush-light bg-opacity-20 rounded-2xl p-4 space-y-3">
              <h3 className="font-serif text-sm text-text-mid font-bold">💍 Upload J&V Logo</h3>
              <label className="block px-4 py-3 bg-white border-2 border-dashed border-blush rounded-lg cursor-pointer hover:border-burgundy transition-colors text-center text-sm">
                <span className="text-text-mid font-serif">Tap to upload custom logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Push Notifications */}
            <div className="bg-blush-light bg-opacity-20 rounded-2xl p-4 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={appData.settings?.notificationsEnabled || false}
                  onChange={(e) => {
                    saveAppData({
                      ...appData,
                      settings: { ...appData.settings, notificationsEnabled: e.target.checked }
                    })
                    if (e.target.checked && 'serviceWorker' in navigator) {
                      navigator.serviceWorker.ready.then(reg => {
                        // Register for push notifications
                      })
                    }
                  }}
                  className="w-5 h-5 accent-burgundy"
                />
                <div>
                  <p className="font-serif text-sm text-text-mid">🔔 Push Notifications</p>
                  <p className="text-xs text-text-light">Get reminders and milestones</p>
                </div>
              </label>
            </div>

            {/* Reset App */}
            <button
              onClick={handleReset}
              className="w-full px-4 py-3 bg-rust text-white rounded-lg font-serif hover:bg-opacity-90 transition-colors text-sm"
            >
              🔄 Reset All Data
            </button>

            <p className="text-xs text-text-light text-center italic">
              This action cannot be undone. All your wedding planning data will be cleared.
            </p>
          </div>
        )}
      </div>
      {openImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpenImageUrl(null)}
        >
          <img src={openImageUrl} alt="Receipt preview" className="max-h-full max-w-full rounded-3xl shadow-2xl" />
        </div>
      )}
    </div>
  )
}

export default MoreScreen
