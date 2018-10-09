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

const updateStep = (steps, { selectedStep, incompleteStep }) => (step) => {
  const completedStep = { ...step, complete: true }
  const matchingName = step.name === (
    (incompleteStep && incompleteStep.name) || selectedStep && selectedStep.name
  )

  if (matchingName) {
    if (!selectedStep) {
      return step.complete ? step : completedStep
    }
    return { ...step, selected: true }
  }

  return { ...step, selected: false }
}

const updateAllSteps = (steps = [], action) => steps.map(updateStep(steps, action))
const findIncompleteStep = (steps = []) => steps.find((step) => !step.complete)
const findNextStep = (incompleteStep) => (step) => step.position === incompleteStep.position + 1

const updateCurrentStep = (state, action, stepsCompleted = false) => {
  const { steps, currentStep } = state
  if (stepsCompleted) return { ...currentStep, complete: true, selected: true }

  const { selectedStep, incompleteStep } = action
  const updatedSteps = updateAllSteps(steps, action)

  if (selectedStep) return { ...selectedStep, selected: true }
  const nextStep = updatedSteps.find(findNextStep(incompleteStep))
  return nextStep ? nextStep : findIncompleteStep(updatedSteps)
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
    return {
      ...state,
      currentStep: updateCurrentStep(state, action)
    }
  case OnboardingConstants.UPDATE_STEPS:
    const updatedSteps = updateAllSteps(state.steps, action)
    const stepsCompleted = !findIncompleteStep(updatedSteps)

    return {
      ...state,
      currentStep: updateCurrentStep(state, action, stepsCompleted),
      progress: true,
      steps: updatedSteps,
      stepsCompleted: saveStorageItem('.stepsCompleted', stepsCompleted)
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
