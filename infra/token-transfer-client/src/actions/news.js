import request from 'superagent'

export const FETCH_NEWS_PENDING = 'FETCH_NEWS_PENDING'
export const FETCH_NEWS_SUCCESS = 'FETCH_NEWS_SUCCESS'
export const FETCH_NEWS_ERROR = 'FETCH_NEWS_ERROR'

function fetchNewsPending() {
  return {
    type: FETCH_NEWS_PENDING
  }
}

function fetchNewsSuccess(payload) {
  return {
    type: FETCH_NEWS_SUCCESS,
    payload
  }
}

function fetchNewsError(error) {
  return {
    type: FETCH_NEWS_ERROR,
    error
  }
}

export function fetchNews() {
  return dispatch => {
    dispatch(fetchNewsPending())

    const mediumUrl = 'https://medium.com/feed/originprotocol'
    request.get(
      `https://api.rss2json.com/v1/api.json?rss_url=${mediumUrl}`
    )
      .then(response => dispatch(fetchNewsSuccess(response.body.items)))
      .catch(error => {
        dispatch(fetchNewsError(error))
        throw error
      })
  }
}
