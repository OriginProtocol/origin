import keyMirror from 'utils/keyMirror'

export const OnboardingConstants = keyMirror(
  {
    FETCH_STEPS: null,
    LEARN_MORE: false,
    SPLIT_PANEL: false,
    UNBLOCK: null,
    UPDATE_STEPS: null,
    SELECT_STEP: null
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

export function unblock() {
  return { type: OnboardingConstants.UNBLOCK }
}

export function updateSteps({ incompleteStep }) {
  return {
    type: OnboardingConstants.UPDATE_STEPS,
    incompleteStep
  }
}

export function selectStep({ selectedStep }) {
  return {
    type: OnboardingConstants.SELECT_STEP,
    selectedStep
  }
}
