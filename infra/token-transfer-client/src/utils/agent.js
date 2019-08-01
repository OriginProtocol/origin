import request from 'superagent'

const agent = request.agent().withCredentials(true)

export default agent
