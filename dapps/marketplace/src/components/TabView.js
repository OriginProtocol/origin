import React, { Component } from 'react'
import get from 'lodash/get'

// TBD: Notify Domen about this component
class TabView extends Component {
  constructor(props) {
    super(props)

    const selectedTabId =
      props.selectedTabId !== undefined
        ? props.selectedTabId
        : get(props, 'tabs[0].id')

    this.state = {
      selectedTabId
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.selectedTabId !== prevProps.selectedTabId) {
      this.setState({
        selectedTabId: this.props.selectedTabId
      })
    } else if (!this.state.selectedTabId && get(this.props, 'tabs.length')) {
      this.setState({
        selectedTabId: get(this.props, 'tabs[0].id')
      })
    }

    if (
      this.props.onTabChanged &&
      this.state.selectedTabId !== prevState.selectedTabId
    ) {
      this.props.onTabChanged(this.state.selectedTabId)
    }
  }

  render() {
    const { tabs, className } = this.props
    const { selectedTabId } = this.state

    if (!tabs || tabs.length === 0) {
      return null
    }

    return (
      <div className={`tab-view${className ? ' ' + className : ''}`}>
        <div className="tab-headers">
          {tabs.map(({ id, title }) => {
            const tabHeaderId = `tab-header__${id}`
            return (
              <a
                key={tabHeaderId}
                className={`tab-header ${tabHeaderId}${
                  selectedTabId === id ? ' selected' : ''
                }`}
                onClick={() => {
                  this.setState({
                    selectedTabId: id
                  })
                }}
              >
                {title}
              </a>
            )
          })}
        </div>
        <div className="tab-content-container">
          {tabs.map(({ id, component }) => {
            const tabId = `tab-component__${id}`
            return (
              <div
                key={tabId}
                className={`tab ${tabId}${
                  selectedTabId === id ? '' : ' d-none'
                }`}
              >
                {component}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}

export default TabView

require('react-styl')(`
  .tab-view
    .tab-headers
      display: flex
      box-shadow: 0 1px 0 0 rgba(0, 0, 0, 0.12)
      background-color: white
      .tab-header
        flex: auto 1 1
        text-align: center
        font-family: Lato
        font-size: 0.9rem
        font-weight: normal
        font-style: normal
        font-stretch: normal
        line-height: 1.93
        letter-spacing: normal
        color: var(--bluey-grey)
        padding: 5px 0
        &.selected
          border-bottom: 5px solid var(--clear-blue)
          color: #0d1d29
    .tab-content-container
      padding: 15px
`)
