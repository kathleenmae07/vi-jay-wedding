import { useState, useEffect } from 'react'
import useAppData from './hooks/useAppData'
import SplashScreen from './components/SplashScreen'
import OnboardingFlow from './components/OnboardingFlow'
import HomeScreen from './components/HomeScreen'
import TasksScreen from './components/TasksScreen'
import BrainDumpScreen from './components/BrainDumpScreen'
import VendorsScreen from './components/VendorsScreen'
import DelegateScreen from './components/DelegateScreen'
import VisionScreen from './components/VisionScreen'
import MoreScreen from './components/MoreScreen'
import TabBar from './components/TabBar'
import './App.css'

function App() {
  const [currentTab, setCurrentTab] = useState('home')
  const [showSplash, setShowSplash] = useState(true)
  const { appData, isLoading, saveAppData } = useAppData()

  useEffect(() => {
    if (!isLoading && appData && appData.settings?.onboardComplete) {
      const splashTimer = setTimeout(() => setShowSplash(false), 2500)
      return () => clearTimeout(splashTimer)
    }
  }, [isLoading, appData])

  if (isLoading || !appData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-burgundy via-cream to-blush">
        <div className="animate-pulse text-burgundy text-lg font-serif">Getting your wedding HQ ready... 💍</div>
      </div>
    )
  }

  if (showSplash && !appData.settings?.onboardComplete) {
    return <SplashScreen appData={appData} onContinue={() => setShowSplash(false)} />
  }

  if (!appData.settings?.onboardComplete) {
    return (
      <OnboardingFlow
        appData={appData}
        onComplete={({ aiTasks = [], brainDump = '', calendarConfirmed, priorities }) => {
          // Append AI-generated tasks to the default todo list, avoiding ID conflicts
          const maxId = appData.todos.reduce((m, t) => Math.max(m, t.id || 0), 0)
          const numberedAiTasks = aiTasks.map((t, i) => ({ ...t, id: maxId + i + 1 }))
          saveAppData({
            ...appData,
            todos: [...appData.todos, ...numberedAiTasks],
            brain_dump: brainDump,
            settings: {
              ...appData.settings,
              onboardComplete: true,
              calendarConfirmed,
              priorities,
            },
          })
        }}
      />
    )
  }

  if (showSplash) {
    return <SplashScreen onContinue={() => setShowSplash(false)} />
  }

  const renderScreen = () => {
    switch (currentTab) {
      case 'home':
        return <HomeScreen appData={appData} saveAppData={saveAppData} />
      case 'tasks':
        return <TasksScreen appData={appData} saveAppData={saveAppData} />
      case 'chat':
        return <BrainDumpScreen appData={appData} saveAppData={saveAppData} />
      case 'vendors':
        return <VendorsScreen appData={appData} saveAppData={saveAppData} />
      case 'delegate':
        return <DelegateScreen appData={appData} saveAppData={saveAppData} />
      case 'vision':
        return <VisionScreen appData={appData} saveAppData={saveAppData} />
      case 'more':
        return <MoreScreen appData={appData} saveAppData={saveAppData} />
      default:
        return <HomeScreen appData={appData} saveAppData={saveAppData} />
    }
  }

  return (
    <div className="mobile-app bg-warm-white">
      <div className="app-content min-h-screen pb-20">
        {renderScreen()}
      </div>
      <TabBar currentTab={currentTab} setCurrentTab={setCurrentTab} />
    </div>
  )
}

export default App

