import request from 'superagent'

const agent = request
  .agent()
  .withCredentials(true)
  .on('error', error => {
    if (error.status === 401) {
      // Redirect to login on auth error
      window.location = '/'
    }
  })

export default agent
