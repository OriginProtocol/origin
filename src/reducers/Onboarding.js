import { OnboardingConstants } from 'actions/Onboarding'
import steps from 'components/onboarding-modal/steps'

function getStorageItem(name, defaultValue) {
  try {
    return JSON.parse(localStorage.getItem(`onboarding${name}`))
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

const getStoredStep = steps => {
  const currentStep = getStorageItem('.currentStep', {})
  const { name: { props: { defaultMessage } } } = currentStep

  return steps.find(
    step => (step && step.name.props.defaultMessage) === (currentStep && defaultMessage)
  )
}

const updateStep = (incompleteStep, steps, fetch = false) => (step, i) => {
  const completedStep = { ...step, complete: true }
  if (step.name == incompleteStep.name && !fetch) {
    if (step.complete) return { ...step, subStepComplete: true }
    return completedStep
  }

  if (i < steps.indexOf(incompleteStep)) {
    if (step.subStep) {
      return { ...completedStep, subStepComplete: true }
    }
    return completedStep
  }

  const incompleteIndex = steps.indexOf(incompleteStep)
  if (i === incompleteIndex) {
    if (step.subStep && steps[incompleteIndex].complete) {
      return completedStep
    }
    return step
  }

  return step
}

const updateAllSteps = (incompleteStep, steps, fetch) => {
  return steps && steps.map(updateStep(incompleteStep, steps, fetch))
}

const updateCurrentStep = (incompleteStep, steps) => {
  const { complete, subStep } = incompleteStep
  const nextStep = steps.find(
    step => step.position === incompleteStep.position + 1
  )

  if (!nextStep)
    saveStorageItem('.currentStep', { ...incompleteStep, complete: true })
  if (!complete && subStep) {
    return saveStorageItem('.currentStep', {
      ...incompleteStep,
      complete: true
    })
  }
  return saveStorageItem('.currentStep', nextStep)
}

const initialState = {
  currentStep: steps[0],
  steps,
  progress: false,
  learnMore: null,
  splitPanel: false,
  stepsCompleted: false
}

export default function Onboarding(state = initialState, action = {}) {
  switch (action.type) {
  case OnboardingConstants.UPDATE_STEPS:
    const updatedSteps = updateAllSteps(action.incompleteStep, state.steps)
    saveStorageItem('.steps', updatedSteps)

    return {
      ...state,
      currentStep: updateCurrentStep(action.incompleteStep, updatedSteps),
      steps: updatedSteps,
      progress: true,
      stepsCompleted: saveStorageItem(
        '.stepsCompleted',
        action.stepsCompleted
      )
    }
  case OnboardingConstants.FETCH_STEPS:
    const fetchedStep = getStoredStep(state.steps) || steps[0]
    const progress = fetchedStep !== steps[0]
    const newSteps = updateAllSteps(fetchedStep, state.steps, true)

    return {
      ...state,
      steps: updateAllSteps(fetchedStep, state.steps, true),
      currentStep: newSteps.find(step => step.name === fetchedStep.name),
      progress,
      stepsCompleted: getStorageItem('.stepsCompleted', false)
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
  default:
    return state
  }
}
