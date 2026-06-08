import { useState } from 'react'

const VendorsScreen = ({ appData, saveAppData }) => {
  const [newVendor, setNewVendor] = useState({ name: '', role: '', contact: '', notes: '', status: 'not booked' })
  const [editingId, setEditingId] = useState(null)
  const [openImageUrl, setOpenImageUrl] = useState(null)

  const statusOptions = ['not booked', 'in progress', 'confirmed']
  const statusColors = {
    'not booked': 'text-text-light bg-text-light bg-opacity-10',
    'in progress': 'text-rust bg-rust bg-opacity-10',
    'confirmed': 'text-olive bg-olive bg-opacity-10'
  }

  const handleAddVendor = () => {
    if (!newVendor.name.trim()) return

    const updatedVendors = [...appData.vendors, {
      id: Date.now(),
      ...newVendor
    }]

    saveAppData({ ...appData, vendors: updatedVendors })
    setNewVendor({ name: '', role: '', contact: '', notes: '', status: 'not booked' })
  }

  const handleUpdateVendor = (id, updates) => {
    const updatedVendors = appData.vendors.map(v =>
      v.id === id ? { ...v, ...updates } : v
    )
    saveAppData({ ...appData, vendors: updatedVendors })
  }

  const fileUrl = (key) => (key ? `/api/file/${encodeURIComponent(key)}?ts=${Date.now()}` : null)

  const handleVendorUpload = async (vendorId, event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const fileKey = `vendor-${vendorId}-${Date.now()}`
    const formData = new FormData()
    formData.append('file', file)
    formData.append('key', fileKey)
    formData.append('category', 'vendors')

    try {
      await fetch('/api/file', { method: 'POST', body: formData })
      handleUpdateVendor(vendorId, { photoKey: fileKey })
    } catch (err) {
      console.error('Vendor upload failed:', err)
    }
  }

  const handleDeleteVendor = (id) => {
    const updatedVendors = appData.vendors.filter(v => v.id !== id)
    saveAppData({ ...appData, vendors: updatedVendors })
  }

  return (
    <div className="w-full max-w-md mx-auto bg-warm-white min-h-screen px-6 py-6">
      {/* Add Vendor Form */}
      <div className="bg-blush-light bg-opacity-20 rounded-2xl p-4 mb-6 space-y-3">
        <h3 className="font-serif text-sm text-text-mid font-bold">Add Vendor</h3>
        
        <input
          type="text"
          value={newVendor.name}
          onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
          placeholder="Vendor name..."
          className="w-full px-3 py-2 border border-blush rounded-lg text-sm focus:outline-none focus:border-burgundy"
        />

        <input
          type="text"
          value={newVendor.role}
          onChange={(e) => setNewVendor({ ...newVendor, role: e.target.value })}
          placeholder="Role (e.g., Photographer)..."
          className="w-full px-3 py-2 border border-blush rounded-lg text-sm focus:outline-none focus:border-burgundy"
        />

        <input
          type="text"
          value={newVendor.contact}
          onChange={(e) => setNewVendor({ ...newVendor, contact: e.target.value })}
          placeholder="Contact info..."
          className="w-full px-3 py-2 border border-blush rounded-lg text-sm focus:outline-none focus:border-burgundy"
        />

        <textarea
          value={newVendor.notes}
          onChange={(e) => setNewVendor({ ...newVendor, notes: e.target.value })}
          placeholder="Notes..."
          className="w-full px-3 py-2 border border-blush rounded-lg text-sm focus:outline-none focus:border-burgundy resize-none h-16"
        />

        <select
          value={newVendor.status}
          onChange={(e) => setNewVendor({ ...newVendor, status: e.target.value })}
          className="w-full px-3 py-2 border border-blush rounded-lg text-sm focus:outline-none focus:border-burgundy"
        >
          {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>

        <button
          onClick={handleAddVendor}
          className="w-full px-3 py-2 bg-burgundy text-white rounded-lg text-sm font-serif hover:bg-burgundy-light transition-colors"
        >
          Add Vendor ✓
        </button>
      </div>

      {/* Vendors List */}
      <div className="space-y-3">
        {appData.vendors.map(vendor => (
          <div key={vendor.id} className="bg-white border border-blush-light rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <h3 className="font-serif text-base text-burgundy">{vendor.name}</h3>
                <p className="text-xs text-text-light">{vendor.role}</p>
              </div>
              <button
                onClick={() => handleDeleteVendor(vendor.id)}
                className="text-text-light hover:text-rust text-lg"
              >
                ✕
              </button>
            </div>

            {/* Status Dropdown */}
            <select
              value={vendor.status}
              onChange={(e) => handleUpdateVendor(vendor.id, { status: e.target.value })}
              className={`w-full px-3 py-2 border border-current rounded-lg text-xs font-serif transition-all ${statusColors[vendor.status]}`}
            >
              {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>

            <div className="mt-3 flex items-center gap-3">
              <label className="inline-flex items-center gap-2 rounded-2xl border border-dashed border-blush-light bg-blush-light/30 px-3 py-2 text-xs text-text-mid cursor-pointer hover:border-burgundy">
                📷 Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleVendorUpload(vendor.id, e)}
                  className="hidden"
                />
              </label>
              {vendor.photoKey && (
                <button
                  type="button"
                  onClick={() => setOpenImageUrl(fileUrl(vendor.photoKey))}
                  className="rounded-2xl border border-blush-light bg-white px-3 py-2 text-xs text-burgundy"
                >
                  View Photo
                </button>
              )}
            </div>
            {vendor.photoKey && (
              <div className="mt-3 rounded-3xl overflow-hidden border border-blush-light bg-blush-light">
                <img
                  src={fileUrl(vendor.photoKey)}
                  alt={vendor.name}
                  className="h-24 w-full object-cover cursor-pointer"
                  onClick={() => setOpenImageUrl(fileUrl(vendor.photoKey))}
                />
              </div>
            )}

            {/* Contact Info */}
            {vendor.contact && (
              <div className="text-xs text-text-mid">
                <p className="font-serif font-bold mb-1">Contact:</p>
                <input
                  type="text"
                  value={vendor.contact}
                  onChange={(e) => handleUpdateVendor(vendor.id, { contact: e.target.value })}
                  className="w-full px-2 py-1 border border-blush rounded text-xs focus:outline-none focus:border-burgundy"
                />
              </div>
            )}

            {/* Notes */}
            {vendor.notes && (
              <div className="text-xs text-text-mid">
                <p className="font-serif font-bold mb-1">Notes:</p>
                <textarea
                  value={vendor.notes}
                  onChange={(e) => handleUpdateVendor(vendor.id, { notes: e.target.value })}
                  className="w-full px-2 py-1 border border-blush rounded text-xs focus:outline-none focus:border-burgundy resize-none h-12"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {appData.vendors.length === 0 && (
        <div className="text-center py-12 text-text-light">
          <p className="text-sm italic">No vendors yet. Add your first one above! ✨</p>
        </div>
      )}
      {openImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpenImageUrl(null)}
        >
          <img src={openImageUrl} alt="Vendor photo" className="max-h-full max-w-full rounded-3xl shadow-2xl" />
        </div>
      )}
    </div>
  )
}

export default VendorsScreen
