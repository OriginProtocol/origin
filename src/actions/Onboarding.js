import keyMirror from 'utils/keyMirror'

export const OnboardingConstants = keyMirror(
  {
    FETCH_STEPS: null,
    LEARN_MORE: false,
    SPLIT_PANEL: false,
    UPDATE_STEPS: null
  },
  'ONBOARDING'
)

export function fetchSteps() {
  return { type: OnboardingConstants.FETCH_STEPS }
}

export function toggleLearnMore(show) {
  return { type: OnboardingConstants.LEARN_MORE, show }
}

export function toggleSplitPanel(show) {
  return { type: OnboardingConstants.SPLIT_PANEL, show }
}

export function updateSteps({ incompleteStep, stepsCompleted = false }) {
  return {
    type: OnboardingConstants.UPDATE_STEPS,
    incompleteStep,
    stepsCompleted
  }
}
