import useCountdown from '../hooks/useCountdown'

const SplashScreen = ({ appData, onContinue }) => {
  const weddingDate = '2026-10-31T16:30:00'
  const countdown = useCountdown(weddingDate)
  const photoVersion = appData?.settings?.photoVersion || Date.now()
  const logoVersion = appData?.settings?.logoVersion || Date.now()

  return (
    <div className="h-screen w-full flex flex-col items-center justify-between bg-gradient-to-br from-burgundy via-rust to-burgundy text-center text-warm-white overflow-hidden">
      {/* Hero Photo */}
        <div className="w-full h-64 rounded-2xl overflow-hidden bg-cover bg-center opacity-40 absolute top-0 left-0" style={{ backgroundImage: `url(/api/photo?ts=${photoVersion})` }}></div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-burgundy"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-6 px-6">
          {/* J&V Logo */}
          <div className="w-24 h-24 flex items-center justify-center">
            <img src={`/api/logo?ts=${logoVersion}`} alt="J&V logo" className="w-20 h-20 object-contain" style={{ mixBlendMode: 'screen' }} />
          </div>
        
        {/* Main Title */}
        <h1 className="text-6xl font-script text-white drop-shadow-lg">Vi & Jay</h1>
        
        {/* Date */}
        <p className="text-xl tracking-widest uppercase text-blush-light">October 31, 2026</p>
        
        {/* Countdown Card */}
        <div className="bg-white bg-opacity-95 rounded-3xl px-8 py-6 shadow-xl mt-4">
          <div className="flex gap-6 items-center justify-center">
            <div className="text-center">
              <p className="text-4xl font-bold text-burgundy">{countdown.days}</p>
              <p className="text-sm text-text-mid font-serif">Days</p>
            </div>
            <div className="w-1 h-12 bg-blush-light rounded-full"></div>
            <div className="text-center">
              <p className="text-4xl font-bold text-burgundy">{countdown.weeks}</p>
              <p className="text-sm text-text-mid font-serif">Weeks</p>
            </div>
          </div>
        </div>
        
        {/* CTA Button */}
        <button
          onClick={onContinue}
          className="mt-8 px-8 py-3 bg-white text-burgundy font-serif text-lg rounded-full hover:bg-blush-light transition-colors shadow-lg"
        >
          Let's get planning ✨
        </button>
        
        {/* Charley Stamp */}
        <p className="mt-auto text-sm text-blush-light">🐾 Charley approved</p>
      </div>
    </div>
  )
}

export default SplashScreen
