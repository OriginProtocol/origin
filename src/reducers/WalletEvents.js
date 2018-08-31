import { WalletEventsConstants } from '../actions/WalletEvents'

const initialState = {
  events: [],
  processed_events: [],
  active_event: null
}

function _matchUpdate(matcher, update)
{
  return i => {
    if (matcher(i)) {
      return {...i, ...update}
    }
    return i
  }
}

function _findEvent(matcher, list){
  for (let i of list)
  {
    if (matcher(i)){
      return i
    }
  }
}

function _addToEvents(matcher, event, events){
    return [event, ...events.filter(i => !matcher(i))]
}

function _updateAndMove(matcher, update, new_event, events_from, events_to) {
  let event = new_event || _findEvent(matcher, events_from)
  if (!event)
  {
    return events_from, events_to
  }
  event = {...event, ...update}
  const new_events_from = events_from.filter(i => !matcher(i))
  return [new_events_from, _addToEvents(matcher, event, events_to)]
}

export default function WalletEvents(state = initialState, action = {}) {
  switch (action.type) {
    case WalletEventsConstants.NEW_EVENT:
      return { ...state, events:_addToEvents(action.matcher, action.event, state.events)}

    case WalletEventsConstants.UPDATE_EVENT:
      return {...state, events: state.events.map(_matchUpdate(action.matcher, action.update)),
                processed_events: state.processed_events.map(_matchUpdate(action.matcher, action.update))}

    case WalletEventsConstants.PROCESSED_EVENT:
      const [events, processed_events] = _updateAndMove(action.matcher, action.update, action.new_event, state.events, state.processed_events)
      return { ...state, events, processed_events}

    case WalletEventsConstants.SET_ACTIVE_EVENT:
      return {...state, active_event:action.event}
  }
  return state
}
