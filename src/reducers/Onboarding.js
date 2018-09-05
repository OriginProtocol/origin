import { OnboardingConstants } from 'actions/Onboarding'
import steps from 'components/onboarding-modal/steps'

function getCurrentStep() {
  try {
    return JSON.parse(localStorage.getItem('onboarding.currentStep')) || {}
  } catch(e) {
    console.log('IT DID NOT GET CURRENT STEP', e)
    return {}
  }
}
const getStoredStep = (steps) => {
  const currentStep = getCurrentStep()

  return steps.find((step) => step.name === currentStep.name)
}

const getStepsCompleted = () => {
  try {
    return JSON.parse(localStorage.getItem('onboarding.stepsCompleted')) || false
  } catch(e) {
    console.log('IT DID NOT GET STEPS COMPLETED', e)
    return false
  }
}

function getSteps(steps=[]) {
  try {
    localStorage.setItem('onboarding.steps', JSON.stringify(steps))
  } catch(e) {
    return console.log('IT WAS NOT SET', e)
  }
}

function saveSteps(steps=[]) {
  try {
    localStorage.setItem('onboarding.steps', JSON.stringify(steps))
  } catch(e) {
    return console.log('IT WAS NOT SET', e)
  }
}

function setCurrentStep(currentStep={}) {
  try {
    localStorage.setItem('onboarding.currentStep', JSON.stringify(currentStep))
  } catch(e) {
    return console.log('IT WAS NOT SET', e)
  }

  return currentStep
}


function saveStepsCompleted(stepsCompleted=false) {
  try {
    localStorage.setItem('onboarding.stepsCompleted', stepsCompleted)
  } catch(e) {
    return console.log('IT WAS NOT SET', e)
  }

  return stepsCompleted
}

const updateStep = (incompleteStep, fetch=false) => (step, i) => {
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

  if (i === steps.indexOf(incompleteStep)) {
    if (step.subStep) {
      return completedStep
    }
  }

  return step
}

const updateAllSteps = (incompleteStep, steps, fetch) => steps && steps.map(updateStep(incompleteStep, fetch))


const updateCurrentStep = (incompleteStep, steps) => {
  const { complete, subStep } = incompleteStep
  const nextStep = steps.find((step) => step.position === incompleteStep.position+1)

  if (!nextStep) setCurrentStep({ ...incompleteStep, complete: true })
  if (!complete && subStep) {
    return setCurrentStep({ ...incompleteStep, complete: true })
  }
  return setCurrentStep(nextStep)
}

const initialState = {
  currentStep: steps[0],
  steps,
  progress: false,
  learnMore: false,
  splitPanel: false,
  stepsCompleted: false
}

export default function Onboarding(state = initialState, action = {}) {
  switch (action.type) {
  case OnboardingConstants.UPDATE_STEPS:
    const updatedSteps = updateAllSteps(action.incompleteStep, state.steps)
    saveSteps(updatedSteps)
    return {
      ...state,
      currentStep: updateCurrentStep(action.incompleteStep, state.steps),
      steps: updatedSteps,
      progress: true,
      stepsCompleted: saveStepsCompleted(action.stepsCompleted)
    }
  case OnboardingConstants.FETCH_STEPS:
    const fetchedSteps = getSteps() || state.steps
    const fetchedStep = getStoredStep(state.steps) || steps[0]
    const progress = fetchedStep !== steps[0]
    const newSteps = updateAllSteps(fetchedStep, fetchedSteps, true)

    return {
      ...state,
      steps: updateAllSteps(fetchedStep, fetchedSteps, true),
      currentStep: newSteps.find((step) => step.name === fetchedStep.name),
      progress,
      stepsCompleted: getStepsCompleted()
    }
  case OnboardingConstants.SPLIT_PANEL:
    return { ...state, progress: true, learnMore: false, splitPanel: action.show }
  case OnboardingConstants.LEARN_MORE:
    return { ...state, learnMore: action.show, splitPanel: false }
  default:
    return state
  }
}
