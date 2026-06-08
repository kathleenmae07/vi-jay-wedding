import { useState, useEffect } from 'react'

const useAppData = () => {
  const [appData, setAppData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const debounceTimer = {}

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data')
        if (!response.ok) throw new Error('Failed to fetch app data')
        const data = await response.json()
        setAppData(data)
        setError(null)
      } catch (err) {
        setError(err.message)
        console.error('Failed to load app data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const saveAppData = (updatedData) => {
    setAppData(updatedData)
    
    // Debounce save to avoid too many requests
    if (debounceTimer.save) clearTimeout(debounceTimer.save)
    debounceTimer.save = setTimeout(() => {
      fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      }).catch(err => console.error('Save error:', err))
    }, 500)
  }

  return { appData, setAppData, isLoading, error, saveAppData }
}

export default useAppData
