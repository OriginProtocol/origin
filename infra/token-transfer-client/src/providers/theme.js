import React, { createContext, useEffect, useState, useMemo } from 'react'

export const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(window.localStorage.theme || 'light')

  window.localStorage.theme = theme
  document.documentElement.setAttribute('data-theme', theme)

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
