import { useState, useEffect } from 'react'

const useCountdown = (targetDate) => {
  const [countdown, setCountdown] = useState({ days: 0, weeks: 0, hours: 0 })

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date()
      const target = new Date(targetDate)
      const diff = target - now
      
      const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
      const weeks = Math.max(0, Math.floor(days / 7))
      const hours = Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)))
      
      setCountdown({ days, weeks, hours })
    }

    calculateCountdown()
    const interval = setInterval(calculateCountdown, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [targetDate])

  return countdown
}

export default useCountdown
