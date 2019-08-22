import request from 'superagent'

const agent = request
  .agent()
  .withCredentials(true)
  .on('error', error => {
    if (
      error.status === 401 &&
      !error.response.error.url.includes('verify_totp')
    ) {
      // Redirect to login on auth error, unless it is a TOTP verification call
      // in which case an error should be displayed in the form
      window.location = '/'
    }
  })

export default agent
