import { useMemo, useState } from 'react'

const categories = ['Florals', 'Decor', 'Attire', 'Venue', 'Food', 'Other']

const VisionScreen = ({ appData, saveAppData }) => {
  const [filter, setFilter] = useState('All')
  const [newTitle, setNewTitle] = useState('')
  const [newNote, setNewNote] = useState('')
  const [newCategory, setNewCategory] = useState('Florals')
  const [newFile, setNewFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [openImageUrl, setOpenImageUrl] = useState(null)
  const [saving, setSaving] = useState(false)

  const logoVersion = appData.settings?.logoVersion || Date.now()
  const visionItems = appData.vision || []

  const dreamItems = useMemo(
    () => visionItems.filter((item) => item.status === 'dream' && (filter === 'All' || item.category === filter)),
    [visionItems, filter]
  )
  const confirmedItems = useMemo(
    () => visionItems.filter((item) => item.status === 'confirmed'),
    [visionItems]
  )

  const uploadFile = async (file, key, category) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('key', key)
    formData.append('category', category)
    const response = await fetch('/api/file', {
      method: 'POST',
      body: formData,
    })
    if (!response.ok) {
      throw new Error('Upload failed')
    }
    return key
  }

  const handleNewImage = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setNewFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleAddInspiration = async () => {
    if (!newTitle.trim()) return
    setSaving(true)
    try {
      let imageKey = null
      if (newFile) {
        const id = `vision-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        imageKey = `vision-image-${id}`
        await uploadFile(newFile, imageKey, 'inspo')
      }

      const newItem = {
        id: `vision-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: newTitle.trim(),
        note: newNote.trim(),
        category: newCategory,
        status: 'dream',
        link: '',
        imageKey,
        assetKey: null,
        createdAt: new Date().toISOString(),
      }

      saveAppData({ ...appData, vision: [newItem, ...visionItems] })
      setNewTitle('')
      setNewNote('')
      setNewCategory('Florals')
      setNewFile(null)
      setPreviewUrl(null)
    } catch (error) {
      console.error('Vision upload failed:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleLinkChange = (itemId, value) => {
    const updated = visionItems.map((item) =>
      item.id === itemId ? { ...item, link: value } : item
    )
    saveAppData({ ...appData, vision: updated })
  }

  const handleAssetUpload = async (itemId, event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const assetKey = `vision-asset-${itemId}`
    try {
      await uploadFile(file, assetKey, 'inspo')
      const updated = visionItems.map((item) =>
        item.id === itemId ? { ...item, assetKey } : item
      )
      saveAppData({ ...appData, vision: updated })
    } catch (error) {
      console.error('Asset upload failed:', error)
    }
  }

  const handleConfirmItem = (itemId) => {
    const updated = visionItems.map((item) =>
      item.id === itemId ? { ...item, status: 'confirmed' } : item
    )
    saveAppData({ ...appData, vision: updated })
  }

  const handleRevertToDream = (itemId) => {
    const updated = visionItems.map((item) =>
      item.id === itemId ? { ...item, status: 'dream' } : item
    )
    saveAppData({ ...appData, vision: updated })
  }

  const handleDeleteConfirmed = (itemId) => {
    saveAppData({ ...appData, vision: visionItems.filter((item) => item.id !== itemId) })
  }

  const fileUrl = (key) => (key ? `/api/file/${encodeURIComponent(key)}?ts=${Date.now()}` : null)

  // Resolve the best display image for an item:
  // 1. uploaded file via imageKey  2. pre-loaded public asset via publicImage
  const itemImageUrl = (item) => fileUrl(item.imageKey) || item.publicImage || null

  return (
    <div className="relative w-full max-w-md mx-auto min-h-screen bg-cream py-6 px-4">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url(/api/logo?ts=${logoVersion})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '180px',
          opacity: 0.05,
          mixBlendMode: 'screen',
        }}
      />
      <div className="relative z-10 space-y-6">
        <div className="rounded-3xl bg-white/90 border border-blush-light p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-burgundy font-bold">Vision</p>
              <h2 className="text-2xl font-serif text-text-dark">Dream Board</h2>
            </div>
            <div className="rounded-full bg-burgundy px-3 py-2 text-sm text-white">Inspiration</div>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Title"
                className="w-full rounded-2xl border border-blush-light px-3 py-3 text-sm focus:border-burgundy focus:outline-none"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full rounded-2xl border border-blush-light px-3 py-3 text-sm focus:border-burgundy focus:outline-none"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Note"
              className="w-full rounded-2xl border border-blush-light px-3 py-3 text-sm resize-none focus:border-burgundy focus:outline-none"
              rows={3}
            />
            <label className="block rounded-3xl border border-dashed border-blush-light bg-blush-light bg-opacity-20 px-4 py-4 text-center text-sm text-text-mid cursor-pointer hover:border-burgundy">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="mx-auto h-28 object-cover rounded-2xl" />
              ) : (
                'Upload image from phone'
              )}
              <input type="file" accept="image/*" onChange={handleNewImage} className="hidden" />
            </label>
            <button
              onClick={handleAddInspiration}
              disabled={saving}
              className="w-full rounded-2xl bg-burgundy px-4 py-3 text-sm font-semibold text-white hover:bg-burgundy/90 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Add to Dream Board'}
            </button>
          </div>
        </div>

        <div className="rounded-3xl bg-white/90 border border-blush-light p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-xl font-serif text-text-dark">Dream Board</h3>
              <p className="text-sm text-text-mid">Browse inspiration by category.</p>
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-2xl border border-blush-light bg-white px-3 py-2 text-sm focus:border-burgundy focus:outline-none"
            >
              <option value="All">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {dreamItems.length === 0 ? (
              <div className="col-span-2 rounded-3xl border border-blush-light bg-blush-light/50 p-6 text-center text-sm text-text-mid">
                No inspiration found for this category yet.
              </div>
            ) : (
              dreamItems.map((item) => (
                <div key={item.id} className="relative rounded-3xl border border-blush-light bg-warm-white p-3 shadow-sm">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="rounded-full bg-blush px-2 py-1 text-[10px] uppercase text-burgundy">{item.category}</span>
                    <button
                      onClick={() => handleConfirmItem(item.id)}
                      className="rounded-full bg-burgundy px-3 py-1 text-[10px] font-bold text-white"
                    >
                      Save as Confirmed
                    </button>
                  </div>
                  <div className="mb-3 h-28 overflow-hidden rounded-3xl bg-blush-light">
                    {itemImageUrl(item) ? (
                      <img
                        src={itemImageUrl(item)}
                        alt={item.title}
                        className="h-full w-full object-cover cursor-pointer"
                        onClick={() => setOpenImageUrl(itemImageUrl(item))}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-text-light">No image yet</div>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-burgundy">{item.title}</p>
                  <p className="mt-1 text-xs text-text-mid">{item.category}</p>
                  <p className="mt-2 text-xs text-text-light">{item.note || 'Add notes for this idea.'}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-white/90 border border-blush-light p-4 shadow-sm">
          <div className="mb-4">
            <h3 className="text-xl font-serif text-text-dark">Done & Confirmed</h3>
            <p className="text-sm text-text-mid">Everything locked in with links and assets.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {confirmedItems.length === 0 ? (
              <div className="col-span-2 rounded-3xl border border-blush-light bg-blush-light/50 p-6 text-center text-sm text-text-mid">
                Nothing confirmed yet.
              </div>
            ) : (
              confirmedItems.map((item) => (
                <div key={item.id} className="rounded-3xl border border-blush-light bg-warm-white p-3 shadow-sm">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="rounded-full bg-olive/10 px-2 py-1 text-[10px] uppercase text-olive">Confirmed ✓</span>
                    <span className="rounded-full bg-blush px-2 py-1 text-[10px] uppercase text-burgundy">{item.category}</span>
                  </div>
                  <div className="mb-3 h-28 overflow-hidden rounded-3xl bg-blush-light">
                    {itemImageUrl(item) ? (
                      <img
                        src={itemImageUrl(item)}
                        alt={item.title}
                        className="h-full w-full object-cover cursor-pointer"
                        onClick={() => setOpenImageUrl(itemImageUrl(item))}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-text-light">Add inspiration image</div>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-burgundy">{item.title}</p>
                  {item.note ? <p className="mt-1 text-xs text-text-light">{item.note}</p> : null}
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 flex items-center gap-1 rounded-2xl bg-burgundy px-3 py-2 text-xs font-semibold text-white hover:bg-burgundy/90"
                    >
                      <span>🎨</span> View in Canva
                    </a>
                  ) : null}
                  <input
                    value={item.link || ''}
                    onChange={(e) => handleLinkChange(item.id, e.target.value)}
                    placeholder="Canva or asset link"
                    className="mt-2 w-full rounded-2xl border border-blush-light px-3 py-2 text-xs text-text-mid focus:border-burgundy focus:outline-none"
                  />
                  <label className="mt-3 block rounded-2xl border border-dashed border-blush-light bg-blush-light/30 px-3 py-2 text-center text-xs text-text-mid cursor-pointer hover:border-burgundy">
                    Upload asset/file
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleAssetUpload(item.id, e)}
                    />
                  </label>
                  {item.assetKey && (
                    <a
                      href={fileUrl(item.assetKey)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-xs text-burgundy underline"
                    >
                      View uploaded asset
                    </a>
                  )}
                  <button
                    onClick={() => handleDeleteConfirmed(item.id)}
                    className="mt-3 w-full rounded-2xl border border-blush-light bg-white px-3 py-2 text-xs text-text-light hover:border-rust hover:text-rust transition-colors"
                  >
                    🗑 Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {openImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpenImageUrl(null)}
        >
          <img src={openImageUrl} alt="Preview" className="max-h-full max-w-full rounded-3xl shadow-2xl" />
        </div>
      )}
    </div>
  )
}

export default VisionScreen
