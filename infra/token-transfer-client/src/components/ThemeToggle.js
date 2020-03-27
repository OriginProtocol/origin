import React, { useEffect, useState } from 'react'

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
        className={`btn btn-xs my-2 ${
          theme === 'dark' ? 'btn-primary' : 'btn-light'
        }`}
        onClick={onDark}
      >
        Dark
      </button>
      <button
        type="button"
        className={`btn btn-xs my-2 ${
          theme === 'light' ? 'btn-primary' : 'btn-light'
        }`}
        onClick={onLight}
      >
        Light
      </button>
    </div>
  )
}

export default ThemeToggle
