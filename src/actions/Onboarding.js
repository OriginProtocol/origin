import keyMirror from 'utils/keyMirror'

export const OnboardingConstants = keyMirror(
  {
    UPDATE_STEPS: null,
    FETCH_STEPS: null,
    SPLIT_PANEL: false,
    LEARN_MORE: false
  },
  'ONBOARDING'
)

export function updateSteps(incompleteStep) {
  return {
    type: OnboardingConstants.UPDATE_STEPS,
    incompleteStep
  }
}

export function fetchSteps() {
  return { type: OnboardingConstants.FETCH_STEPS }
}

export function toggleSplitPanel(show) {
  return { type: OnboardingConstants.SPLIT_PANEL, show }
}

export function toggleLearnMore(show) {
  return { type: OnboardingConstants.LEARN_MORE, show }
}
