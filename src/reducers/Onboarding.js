import { OnboardingConstants } from 'actions/Onboarding'
import steps from 'components/onboarding-modal/steps'

const hasKeys = (obj) => obj && Object.keys(obj).length

function getCurrentStep() {
  try {
    return localStorage.getItem('onboarding.currentStep')
  } catch(e) {
    console.log("IT DID NOT GET", e)
    return ''
  }
}
const getStoredStep = ({ steps }) => {
  const currentStep = getCurrentStep()

  return steps.find((step) => step.name === currentStep)
}
function setCurrentStep(step) {
  //maybe store the whole object
  try {
    localStorage.setItem('onboarding.currentStep', step.name)
  } catch(e) {
    console.log("IT WAS NOT SET", e)
  }

  return step
}

const updateStep = (incompleteStep, fetch=false) => (step) => {
  const incompleteName = hasKeys(incompleteStep) ? incompleteStep.name : incompleteStep

  if (step.name == incompleteName && !fetch) {
    if (step.complete) return { ...step, subStepComplete: true }
    return { ...step, complete: true }
  }
  return step
}

const updateAllSteps = (incompleteStep, steps, fetch) => steps.map(updateStep(incompleteStep, fetch))


const updateCurrentStep = (incompleteStep, steps) => {
  const { complete, subStep } = incompleteStep
  const currentIndex = steps.indexOf(incompleteStep)
  const nextStep = steps[currentIndex+1]
  if (!complete && subStep) {
    return setCurrentStep({ ...incompleteStep, complete: true })
  }

  return setCurrentStep(nextStep)
}

const initialState = {
  currentStep: steps[0],
  steps
}

export default function Onboarding(state = initialState, action = {}) {
  switch (action.type) {
    case OnboardingConstants.UPDATE_STEPS:
      return {
        ...state,
        currentStep: updateCurrentStep(action.incompleteStep, state.steps),
        steps: updateAllSteps(action.incompleteStep, state.steps)
      }
    case OnboardingConstants.FETCH_STEPS:
      const fetchedStep = getStoredStep(state) || steps[0]
      return { ...state, currentStep: fetchedStep, steps: updateAllSteps(fetchedStep, state.steps, true) }
  default:
    return state
  }
}
