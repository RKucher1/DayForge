import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/',          icon: '◫', label: 'Day'       },
  { to: '/week',      icon: '⊞', label: 'Week'      },
  { to: '/dashboard', icon: '▦', label: 'Stats'     },
  { to: '/settings',  icon: '⚙', label: 'Settings'  },
]

export default function Sidebar() {
  return (
    <div
      className="flex flex-col items-center w-14 h-screen py-4 flex-shrink-0 border-r"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center select-none">
        <span className="text-base font-black tracking-tight leading-none" style={{ color: 'var(--teal)' }}>D</span>
        <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--copper)' }}>F</span>
      </div>

      <nav className="flex flex-col items-center gap-1 w-full flex-1">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            title={label}
            className={({ isActive }) =>
              `group w-full flex flex-col items-center justify-center h-12 text-lg transition-all relative ${
                isActive ? '' : 'hover:opacity-80'
              }`
            }
            style={({ isActive }) => ({
              color: isActive ? 'var(--teal)' : 'var(--text-secondary)',
              borderLeft: isActive ? '2px solid var(--copper)' : '2px solid transparent',
            })}
          >
            <span className="text-xl leading-none">{icon}</span>
            <span className="text-[9px] mt-0.5 font-medium uppercase tracking-wide opacity-70">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom hint */}
      <div className="text-[9px] text-center leading-tight select-none" style={{ color: 'var(--text-disabled)' }}>
        <div>Ctrl+/</div>
        <div>AI</div>
      </div>
    </div>
  )
}
