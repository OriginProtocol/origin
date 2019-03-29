import React, { Component } from 'react'
import Action from 'pages/growth/Action'
import { fbt } from 'fbt-runtime'

class ActionList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      filter: 'all',
      actionsToDisplay: props.actions
    }
    this.animationLock = false
  }

  renderFilter(filterText, filterName) {
    const currentFilter = this.state.filter
    return (
      <button
        className={`ml-3 filter ${
          currentFilter === filterName ? 'selected' : ''
        }`}
        onClick={async () => await this.handleFilterClick(filterName)}
      >
        {filterText}
      </button>
    )
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async handleFilterClick(filterName) {
    let renderImmediately = false
    // wait for previous animation to finish
    while (this.animationLock) {
      /* When user rapidlu clicks on filter buttons we want prevent multiple animations
       * rendering one after another. Just render immediately every subsequent animation.
       */
      renderImmediately = true
      await this.sleep(30)
    }

    this.animationLock = true
    this.setState({
      filter: filterName,
      actionsToDisplay: []
    })

    const actionCompleted = action => {
      return ['Exhausted', 'Completed'].includes(action.status)
    }
    const actions = this.props.actions
    const completedActions = actions.filter(action => actionCompleted(action))
    const lockedActions = actions.filter(action => action.status === 'Inactive')
    const activeActions = actions.filter(action => action.status === 'Active')

    let filteredActions = actions
    if (filterName === 'unlocked') {
      filteredActions = activeActions
    } else if (filterName === 'locked') {
      filteredActions = lockedActions
    } else if (filterName === 'completed') {
      filteredActions = completedActions
    }

    for (let i = 0; i < filteredActions.length; i++) {
      if (!renderImmediately) {
        await this.sleep(70)
      }
      this.setState({
        actionsToDisplay: [...this.state.actionsToDisplay, filteredActions[i]]
      })
    }
    this.animationLock = false
  }

  render() {
    const {
      title,
      decimalDivision,
      handleNavigationChange
    } = this.props

    const { actionsToDisplay } = this.state

    return (
      <div className="action-list">
        <div className="filters d-flex">
          <div className="show">
            <fbt desc="growth.action-list.show">Show</fbt>
          </div>
          {this.renderFilter(fbt('All', 'growth.action-list.all'), 'all')}
          {this.renderFilter(
            fbt('Unlocked', 'growth.action-list.unlocked'),
            'unlocked'
          )}
          {this.renderFilter(
            fbt('Locked', 'growth.action-list.locked'),
            'locked'
          )}
          {this.renderFilter(
            fbt('Completed', 'growth.action-list.completed'),
            'completed'
          )}
        </div>
        <div className="d-flex flex-column">
          {title !== undefined && <div className="action-title">{title}</div>}
          {actionsToDisplay.map(action => {
            return (
              <Action
                action={action}
                decimalDivision={decimalDivision}
                key={`${action.type}:${action.status}`}
                handleNavigationChange={handleNavigationChange}
              />
            )
          })}
        </div>
      </div>
    )
  }
}

export default ActionList

require('react-styl')(`
  .action-list
    margin-top: 50px
    .filters
      font-size: 18px
      .show
        font-weight: bold
        color: var(--dusk)
        font-size: 14px
      .filter
        font-weight: bold
        font-size: 14px
        color: var(--clear-blue)
        border-radius: 15px
        background-color: white
        border: 0px
        min-width: 110px
        &:hover
          background-color: var(--pale-grey-four)
      .filter.selected
        background-color: var(--pale-grey)
        color: var(--dusk)
`)
