import { WalletEventsConstants } from 'actions/WalletEvents'

const initialState = {
  active_event: null,
  pending_events: [],
  processed_events: []
}

function _addToEvents(matcher, event, events) {
  return [event, ...events.filter(i => !matcher(i))]
}

function _matchUpdate(matcher, update) {
  return i => {
    if (matcher(i)) {
      return { ...i, ...update }
    }

    return i
  }
}

function _findEvent(matcher, list) {
  for (let i of list) {
    if (matcher(i)) {
      return i
    }
  }
}

function _updateAndMove(matcher, update, new_event, events_from, events_to) {
  let event = new_event || _findEvent(matcher, events_from)

  if (!event) {
    return [events_from, events_to]
  }

  event = { ...event, ...update }

  const new_events_from = events_from.filter(i => !matcher(i))

  return [new_events_from, _addToEvents(matcher, event, events_to)]
}

export default function WalletEvents(state = initialState, action = {}) {
  switch (action.type) {
    case WalletEventsConstants.NEW_EVENT:
      return {
        ...state,
        pending_events: _addToEvents(
          action.matcher,
          action.event,
          state.pending_events
        )
      }

    case WalletEventsConstants.PROCESSED_EVENT:
      const [pending_events, processed_events] = _updateAndMove(
        action.matcher,
        action.update,
        action.new_event,
        state.pending_events,
        state.processed_events
      )
      return { ...state, pending_events, processed_events }

    case WalletEventsConstants.SET_ACTIVE_EVENT:
      return { ...state, active_event: action.event }

    case WalletEventsConstants.UPDATE_EVENT:
      return {
        ...state,
        pending_events: state.pending_events.map(
          _matchUpdate(action.matcher, action.update)
        ),
        processed_events: state.processed_events.map(
          _matchUpdate(action.matcher, action.update)
        )
      }
  }

  return state
}
