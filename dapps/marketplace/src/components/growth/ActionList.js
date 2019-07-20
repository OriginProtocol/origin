import React, { Component, Fragment } from 'react'
import { fbt } from 'fbt-runtime'

import Action from 'components/growth/Action'
import Modal from 'components/Modal'

class ActionList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      filter: 'all',
      actionsToDisplay: props.actions,
      modalOpen: false
    }
    this.animationLock = false
  }

  renderFilter(filterText, filterName, isMobile) {
    const currentFilter = this.state.filter
    return (
      <button
        className={`${isMobile ? '' : 'ml-3'} filter ${
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
    const { title, decimalDivision, isMobile } = this.props

    const { actionsToDisplay, modalOpen, modalText } = this.state

    return (
      <Fragment>
        {modalOpen && (
          <Modal
            className={`action-list-modal`}
            onClose={() => {
              this.setState({
                modalOpen: false
              })
            }}
          >
            <Fragment>
              <div>{modalText}</div>
              <button
                className="btn btn-outline-light mt-3 mb-2"
                onClick={() => {
                  this.setState({
                    modalOpen: false
                  })
                }}
                children={fbt('Ok', 'Ok')}
              />
            </Fragment>
          </Modal>
        )}
        <div
          className={`action-list ${
            isMobile ? 'mobile' : ''
          } d-flex flex-column`}
        >
          {title !== undefined && <div className="action-title">{title}</div>}
          {actionsToDisplay.map(action => {
            return (
              <Action
                action={action}
                decimalDivision={decimalDivision}
                key={`${action.type}:${action.status}:${
                  action.listingId ? action.listingId : '0'
                }`}
                isMobile={isMobile}
                onMobileLockClick={requirementText => {
                  this.setState({
                    modalOpen: true,
                    modalText: requirementText
                  })
                }}
              />
            )
          })}
        </div>
      </Fragment>
    )
  }
}

export default ActionList

require('react-styl')(`
  .action-list-modal.pl-modal .pl-modal-table .pl-modal-cell .action-list-modal
    max-width: 25rem
  .action-list
    .with-border
      &:not(:last-of-type)
        border-bottom: 1px solid #c0cbd4
    margin-top: 1rem
    .action-title
      font-size: 18px
      font-weight: normal
      font-family: Lato
      margin-left: 5px
      font-family: Lato
      border-bottom: 1px solid #c0cbd4
      padding-bottom: 10px
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
        min-width: 6.875rem
        &:hover
          background-color: var(--pale-grey-four)
      .filter.selected
        background-color: var(--pale-grey)
        color: var(--dusk)
  .action-list.mobile
    margin-top: 1rem
    .action-title
      font-size: 14px
    .filters
      .filter
        min-width: 5.31rem
`)
