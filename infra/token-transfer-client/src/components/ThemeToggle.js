import React, { useEffect, useState } from 'react'

import SunIcon from '-!react-svg-loader!@/assets/sun-icon.svg'
import MoonIcon from '-!react-svg-loader!@/assets/moon-icon.svg'

const ThemeToggle = () => {
  const [theme, setTheme] = useState(window.localStorage.theme || 'light')

  useEffect(() => {
    if (window.localStorage.theme === 'dark') {
      onDark()
    } else {
      onLight()
    }
  }, [])

  useEffect(() => {
    window.localStorage.theme = theme
  }, [theme])

  const onDark = () => {
    document.documentElement.setAttribute('data-theme', 'dark')
    setTheme('dark')
  }

  const onLight = () => {
    document.documentElement.setAttribute('data-theme', 'light')
    setTheme('light')
  }

  return (
    <div className="btn-group mr-4" role="group" aria-label="Mode toggle">
      <button
        type="button"
        className={`btn btn-xs rounded-left my-2 ${
          theme === 'light' ? 'btn-primary' : 'btn-grey'
        }`}
        onClick={onLight}
      >
        <SunIcon />
      </button>
      <button
        type="button"
        className={`btn btn-xs rounded-right my-2 ${
          theme === 'dark' ? 'btn-primary' : 'btn-grey'
        }`}
        onClick={onDark}
      >
        <MoonIcon />
      </button>
    </div>
  )
}

export default ThemeToggle
