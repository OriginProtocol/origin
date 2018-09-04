import { OnboardingConstants } from 'actions/Onboarding'
import steps from 'components/onboarding-modal/steps'

function getCurrentStep() {
  try {
    return localStorage.getItem('onboarding.currentStep')
  } catch(e) {
    console.log('IT DID NOT GET', e)
    return ''
  }
}
const getStoredStep = ({ steps }) => {
  const currentStep = getCurrentStep()

  return steps.find((step) => step.name === currentStep)
}
function setCurrentStep(currentStep) {
  //maybe store the whole object
  try {
    // const onboarding = { currentStep,  }
    localStorage.setItem('onboarding.currentStep', JSON.stringify(currentStep))
  } catch(e) {
    console.log('IT WAS NOT SET', e)
  }

  return currentStep
}

const updateStep = (incompleteStep, fetch=false) => (step) => {
  if (step.name == incompleteStep.name && !fetch) {
    if (step.complete) return { ...step, subStepComplete: true }
    return { ...step, complete: true }
  }
  return step
}

const updateAllSteps = (incompleteStep, steps, fetch) => steps.map(updateStep(incompleteStep, fetch))


const updateCurrentStep = (incompleteStep, steps) => {
  const { complete, subStep } = incompleteStep
  const nextStep = steps.find((step) => step.position === incompleteStep.position+1)

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
  splitPanel: false
}

export default function Onboarding(state = initialState, action = {}) {
  switch (action.type) {
  case OnboardingConstants.UPDATE_STEPS:
    return {
      ...state,
      currentStep: updateCurrentStep(action.incompleteStep, state.steps),
      steps: updateAllSteps(action.incompleteStep, state.steps),
      progress: true
    }
  case OnboardingConstants.FETCH_STEPS:
    const fetchedStep = getStoredStep(state) || steps[0]
    const progress = fetchedStep !== steps[0]
    return {
      ...state,
      currentStep: fetchedStep,
      steps: updateAllSteps(fetchedStep, state.steps, true),
      progress
    }
  case OnboardingConstants.SPLIT_PANEL:
    return { ...state, progress: true, learnMore: false, splitPanel: action.show }
  case OnboardingConstants.LEARN_MORE:
    return { ...state, learnMore: action.show, splitPanel: false }
  default:
    return state
  }
}
