import keyMirror from 'utils/keyMirror'

export const OnboardingConstants = keyMirror(
  {
    UPDATE_STEPS: null,
    FETCH_STEPS: null
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
