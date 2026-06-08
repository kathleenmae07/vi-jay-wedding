const ACTIVE_COLOR = '#5C1A2E'

const tabs = [
  {
    id: 'home',
    name: 'Home',
    inactiveColor: '#1D7A8A',
    icon: (size, color) => (
      <svg width={size} height={size} viewBox="0 0 22 22" fill="none" stroke={color}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Roof */}
        <polyline points="2,10 11,2 20,10" />
        {/* Walls */}
        <rect x="5" y="10" width="12" height="10" rx="1" />
        {/* Door */}
        <rect x="8.5" y="14" width="5" height="6" rx="0.5" />
      </svg>
    ),
  },
  {
    id: 'tasks',
    name: 'Tasks',
    inactiveColor: '#C4447A',
    icon: (size, color) => (
      <svg width={size} height={size} viewBox="0 0 22 22" fill="none" stroke={color}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Boxes */}
        <rect x="3" y="4.5" width="4" height="4" rx="0.5" />
        <rect x="3" y="11" width="4" height="4" rx="0.5" />
        {/* Check in bottom box */}
        <polyline points="4,13 5,14.5 6.5,12.5" />
        {/* Lines */}
        <line x1="10" y1="6.5" x2="19" y2="6.5" />
        <line x1="10" y1="13" x2="19" y2="13" />
        <line x1="10" y1="17" x2="15" y2="17" />
      </svg>
    ),
  },
  {
    id: 'vision',
    name: 'Vision',
    inactiveColor: '#6B7A3A',
    icon: (size, color) => (
      <svg width={size} height={size} viewBox="0 0 22 22" fill="none" stroke={color}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Diamond */}
        <polygon points="11,2 20,11 11,20 2,11" />
        {/* Inner detail line */}
        <line x1="2" y1="11" x2="20" y2="11" />
        <line x1="7" y1="4" x2="15" y2="4" />
      </svg>
    ),
  },
  {
    id: 'chat',
    name: 'Chat',
    inactiveColor: '#B85A1A',
    icon: (size, color) => (
      <svg width={size} height={size} viewBox="0 0 22 22" fill="none" stroke={color}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Bubble body */}
        <path d="M3,4 Q3,2 5,2 L17,2 Q19,2 19,4 L19,13 Q19,15 17,15 L8,15 L4,19 L4,15 Q3,15 3,13 Z" />
        {/* Dots */}
        <circle cx="8" cy="8.5" r="0.7" fill={color} stroke="none" />
        <circle cx="11" cy="8.5" r="0.7" fill={color} stroke="none" />
        <circle cx="14" cy="8.5" r="0.7" fill={color} stroke="none" />
      </svg>
    ),
  },
  {
    id: 'vendors',
    name: 'Vendors',
    inactiveColor: '#E8A89C',
    icon: (size, color) => (
      <svg width={size} height={size} viewBox="0 0 22 22" fill="none" stroke={color}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Base rectangle */}
        <rect x="3" y="10" width="16" height="10" rx="1" />
        {/* Awning */}
        <path d="M2,10 Q5.5,6 11,8 Q16.5,6 20,10" />
        {/* Door */}
        <rect x="9" y="14" width="4" height="6" rx="0.5" />
        {/* Sign bar */}
        <line x1="3" y1="10" x2="19" y2="10" />
      </svg>
    ),
  },
  {
    id: 'delegate',
    name: 'Delegate',
    inactiveColor: '#8B2A45',
    icon: (size, color) => (
      <svg width={size} height={size} viewBox="0 0 22 22" fill="none" stroke={color}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Back person head + body */}
        <circle cx="14" cy="7" r="3" />
        <path d="M9,20 Q9,14 14,14 Q19,14 19,20" />
        {/* Front person head + body */}
        <circle cx="8" cy="8" r="3.2" />
        <path d="M2,21 Q2,15 8,15 Q14,15 14,21" />
      </svg>
    ),
  },
  {
    id: 'more',
    name: 'More',
    inactiveColor: '#C4B5AD',
    icon: (size, color) => (
      <svg width={size} height={size} viewBox="0 0 22 22" fill="none" stroke={color}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="5"  cy="11" r="1.2" fill={color} stroke="none" />
        <circle cx="11" cy="11" r="1.2" fill={color} stroke="none" />
        <circle cx="17" cy="11" r="1.2" fill={color} stroke="none" />
      </svg>
    ),
  },
]

const TabBar = ({ currentTab, setCurrentTab }) => (
  <div
    className="fixed bottom-0 left-0 right-0 max-w-md mx-auto"
    style={{
      background: '#FDF6F0',
      borderTop: '1.5px solid #F2C9C2',
      boxShadow: '0 -4px 16px rgba(92,26,46,0.06)',
    }}
  >
    <div className="flex justify-around items-center" style={{ height: '60px' }}>
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id
        const color    = isActive ? ACTIVE_COLOR : tab.inactiveColor
        const size     = isActive ? 24 : 22

        return (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className="relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-all"
            title={tab.name}
          >
            {/* Active top pip */}
            {isActive && (
              <span
                className="absolute top-0 left-1/2"
                style={{
                  width: '24px',
                  height: '2px',
                  background: ACTIVE_COLOR,
                  borderRadius: '0 0 3px 3px',
                  transform: 'translateX(-50%)',
                }}
              />
            )}

            {tab.icon(size, color)}

            <span
              style={{
                fontSize: '9px',
                fontWeight: isActive ? 600 : 400,
                color,
                letterSpacing: '0.04em',
                fontFamily: 'DM Sans, sans-serif',
                marginTop: '1px',
              }}
            >
              {tab.name}
            </span>
          </button>
        )
      })}
    </div>
    {/* iOS safe-area inset */}
    <div style={{ height: 'env(safe-area-inset-bottom, 0px)', background: '#FDF6F0' }} />
  </div>
)

export default TabBar
