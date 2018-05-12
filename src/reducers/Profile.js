import { ProfileConstants } from '../actions/Profile'

const initialState = {
  user: {
    profile: {},
    attestations: []
  },
  name: 'Unnamed User',
  published: {
    firstName: '',
    lastName: '',
    description: '',
    pic: '/images/avatar-unnamed.svg',
    email: false,
    facebook: false,
    phone: false,
    twitter: false
  },
  hasChanges: false,
  provisionalProgress: 0,
  publishedProgress: 0,
  strength: 0,
  status: null
}
initialState.provisional = { ...initialState.published }

const progressPct = {
  firstName: 15,
  lastName: 15,
  description: 10,
  email: 20,
  phone: 20,
  facebook: 10,
  twitter: 10
}

function hasChanges(state) {
  var provisionalProgress = 0,
    publishedProgress = 0

  Object.keys(progressPct).forEach(k => {
    const pct = progressPct[k]
    if (state.published[k] && pct) {
      publishedProgress += pct
    } else if (state.provisional[k] && pct) {
      provisionalProgress += pct
    }
  })

  return {
    ...state,
    provisionalProgress,
    publishedProgress,
    strength: provisionalProgress + publishedProgress,
    hasChanges:
      JSON.stringify(state.provisional) !== JSON.stringify(state.published)
  }
}

function unpackUser(state) {
  var user = state.user || {},
    profile = user.profile || {},
    attestations = user.attestations || [],
    firstName = profile.firstName,
    lastName = profile.lastName,
    description = profile.description,
    pic = profile.avatar

  if (firstName) {
    state.provisional.firstName = state.published.firstName = firstName
  }
  if (lastName) {
    state.provisional.lastName = state.published.lastName = lastName
  }
  if (description) {
    state.provisional.description = state.published.description = description
  }
  if (pic) {
    state.provisional.pic = state.published.pic = pic
  }
  attestations.forEach(attestation => {
    if (attestation.service === 'facebook') {
      state.provisional.facebook = state.published.facebook = true
    }
    if (attestation.service === 'twitter') {
      state.provisional.twitter = state.published.twitter = true
    }
    if (attestation.service === 'email') {
      state.provisional.email = state.published.email = true
    }
    if (attestation.service === 'phone') {
      state.provisional.phone = state.published.phone = true
    }
  })

  if (firstName && lastName) {
    var name = `${firstName} ${lastName}`.trim()
    if (name) {
      state.name = name
    }
  }

  return hasChanges(state)
}

export default function Profile(state = initialState, action = {}) {
  switch (action.type) {
    case ProfileConstants.FETCH_SUCCESS:
      return unpackUser({ ...state, user: action.user })

    case ProfileConstants.ADD_ATTESTATION:
      var toAdd = {}
      if (action.attestation.claimType === 3) {
        toAdd.facebook = action.attestation
      } else if (action.attestation.claimType === 4) {
        toAdd.twitter = action.attestation
      } else if (action.attestation.claimType === 11) {
        toAdd.email = action.attestation
      } else if (action.attestation.claimType === 10) {
        toAdd.phone = action.attestation
      }
      return hasChanges({
        ...state,
        provisional: { ...state.provisional, ...toAdd }
      })

    case ProfileConstants.UPDATE:
      return hasChanges({
        ...state,
        provisional: {
          ...state.provisional,
          ...action.data
        }
      })

    case ProfileConstants.DEPLOY:
      return { ...state, status: 'confirming' }

    case ProfileConstants.DEPLOY_ERROR:
      return { ...state, status: 'error' }

    case ProfileConstants.DEPLOY_SUCCESS:
      return hasChanges({
        ...state,
        status: 'success',
        published: state.provisional
      })

    case ProfileConstants.DEPLOY_RESET:
      return { ...state, status: null }
  }

  return state
}
