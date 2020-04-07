import React, { useContext } from 'react'

import SunIcon from '@/assets/sun-icon.svg'
import MoonIcon from '@/assets/moon-icon.svg'
import { ThemeContext } from '@/providers/theme'

const ThemeToggle = () => {
  const { theme, setTheme } = useContext(ThemeContext)

  return (
    <div className="btn-group mr-4" role="group" aria-label="Mode toggle">
      <button
        type="button"
        className={`btn btn-xs rounded-left my-2 ${
          theme === 'light' ? 'btn-primary' : 'btn-grey'
        }`}
        onClick={() => setTheme('light')}
      >
        <SunIcon />
      </button>
      <button
        type="button"
        className={`btn btn-xs rounded-right my-2 ${
          theme === 'dark' ? 'btn-primary' : 'btn-grey'
        }`}
        onClick={() => setTheme('dark')}
      >
        <MoonIcon />
      </button>
    </div>
  )
}

export default ThemeToggle
