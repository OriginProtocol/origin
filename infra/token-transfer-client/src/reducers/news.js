import {
  FETCH_NEWS_PENDING,
  FETCH_NEWS_SUCCESS,
  FETCH_NEWS_ERROR
} from '../actions/news'

const initialState = {
  isLoading: true,
  news: [],
  error: null
}

export default function newsReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_NEWS_PENDING:
      return {
        ...state,
        isLoading: true
      }
    case FETCH_NEWS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        news: action.payload,
        error: null
      }
    case FETCH_NEWS_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.error
      }
    default:
      return state
  }
}

const convertHtmlEntities = html => {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = html
  return textarea.value
}

export const getNews = state => {
  return state.news.map(item => {
    const tagIndex = item.description.indexOf('<img')
    const srcIndex =
      item.description.substring(tagIndex).indexOf('src=') + tagIndex
    const srcStart = srcIndex + 5
    const srcEnd = item.description.substring(srcStart).indexOf('"') + srcStart
    const imgSrc = item.description.substring(srcStart, srcEnd)
    const description =
      item.description.replace(/<[^>]*>?/gm, '').substr(0, 320) + '...'

    return {
      title: convertHtmlEntities(item.title),
      description: convertHtmlEntities(description),
      image: imgSrc,
      link: item.link
    }
  })
}
export const getIsLoading = state => state.isLoading
