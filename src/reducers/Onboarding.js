import { OnboardingConstants } from 'actions/Onboarding'
import steps from 'components/onboarding-modal/steps'

function getStorageItem(name, defaultValue) {
  try {
    const item = localStorage.getItem(`onboarding${name}`)
    return item ? JSON.parse(item) : defaultValue
  } catch (e) {
    return defaultValue
  }
}

function saveStorageItem(name, item, defaultValue) {
  try {
    localStorage.setItem(`onboarding${name}`, JSON.stringify(item))
  } catch (e) {
    return defaultValue || item
  }
  return item
}

const updateCurrentStep = (steps, { selectedStep, incompleteStep }) => {
  if (selectedStep) return { ...selectedStep, selected: true }
  return steps.find(step => step.position === incompleteStep.position + 1)
}

const updateStep = (steps, { selectedStep, incompleteStep }) => (step) => {
  const completedStep = { ...step, complete: true }
  const matchingName = step.name == ((incompleteStep && incompleteStep.name) || selectedStep && selectedStep.name)
  if (matchingName) {
    if (!selectedStep) {
      return step.complete ? step : completedStep
    }
    return { ...step, selected: true }
  }

  return { ...step, selected: false }
}

const updateAllSteps = (steps, action) => {
  return steps && steps.map(updateStep(steps, action))
}

const initialState = {
  /*
   * This is currently a redundant inverse of state.app.betaModalDismissed
   * but may depend on other variables in the future.
   */
  blocked: true,
  currentStep: steps[0],
  steps,
  progress: false,
  learnMore: null,
  splitPanel: false,
  stepsCompleted: false
}

export default function Onboarding(state = initialState, action = {}) {
  switch (action.type) {
  case OnboardingConstants.UNBLOCK:
    return {
      ...state,
      blocked: false
    }
  case OnboardingConstants.SELECT_STEP:
    const steps = updateAllSteps(state.steps, action.selectedStep)

    return {
      ...state,
      steps,
      currentStep: updateCurrentStep(steps, action)
    }
  case OnboardingConstants.UPDATE_STEPS:
    const updatedSteps = updateAllSteps(state.steps, action.incompleteStep)

    return {
      ...state,
      currentStep: updateCurrentStep(updatedSteps, action),
      steps: updateAllSteps(state.steps, action),
      progress: true,
      stepsCompleted: saveStorageItem(
        '.stepsCompleted',
        action.stepsCompleted
      )
    }
  case OnboardingConstants.SPLIT_PANEL:
    return {
      ...state,
      progress: true,
      learnMore: false,
      splitPanel: action.show
    }
  case OnboardingConstants.LEARN_MORE:
    return { ...state, learnMore: action.show, splitPanel: false }
  case OnboardingConstants.FETCH_STEPS:
    return { ...state, stepsCompleted: getStorageItem('.stepsCompleted', state.stepsCompleted) }
  default:
    return state
  }
}
