let pageTitle
if (window.location.hostname.includes('team')) {
  pageTitle = 'Origin Team Portal'
} else {
  pageTitle = 'Origin Investor Portal'
}

let apiUrl
if (process.env.NODE_ENV === 'production') {
  if (window.location.hostname.includes('team')) {
    apiUrl = process.env.TEAM_API_URL
  } else {
    apiUrl = process.env.INVESTOR_API_URL
  }
} else {
  apiUrl = process.env.API_URL || 'http://localhost:5000'
}

export { apiUrl, pageTitle }
