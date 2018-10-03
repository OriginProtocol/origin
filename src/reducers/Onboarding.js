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

const updateStep = (steps, incompleteStep) => (step, i) => {
  const completedStep = { ...step, complete: true }

  if (step.name == incompleteStep.name) {
    if (step.complete) return step
    return completedStep
  }

  if (i < steps.indexOf(incompleteStep)) return completedStep

  return step
}

const updateCurrentStep = (steps, incompleteStep) => {
  const { complete, subStep } = incompleteStep
  return steps.find(step => step.position === incompleteStep.position + 1)
}

const updateAllSteps = (steps, incompleteStep) => {
  return steps && steps.map(updateStep(steps, incompleteStep))
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

  case OnboardingConstants.UPDATE_STEPS:
    const updatedSteps = updateAllSteps(state.steps, action.incompleteStep)

    return {
      ...state,
      currentStep: updateCurrentStep(updatedSteps, action.incompleteStep),
      steps: updatedSteps,
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
  default:
    return state
  }
}
