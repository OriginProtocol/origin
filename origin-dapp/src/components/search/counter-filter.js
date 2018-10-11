import React, { Component } from 'react'
import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import {
  VALUE_TYPE_FLOAT,
  FILTER_OPERATOR_GREATER_OR_EQUAL
} from 'components/search/constants'

class CounterFilter extends Component {
  constructor(props) {
    super(props)

    this.defaultValue = this.props.defaultValue ? this.props.defaultValue : 1
    this.state = {
      counter: this.defaultValue
    }

    this.handleOnClickAdd = this.handleOnClickAdd.bind(this)
    this.handleOnClickSubtract = this.handleOnClickSubtract.bind(this)
  }

  handleOnClickAdd() {
    this.setState({ counter: this.state.counter + 1 })
  }

  handleOnClickSubtract() {
    this.setState({ counter: Math.max(this.state.counter - 1, 0) })
  }

  componentWillUnmount() {
    this.props.onChildUnMounted(this)
  }

  componentDidMount() {
    this.props.onChildMounted(this)
  }

  componentDidUpdate(previousProps) {
    // When new search is triggered, search filters get reset, so component should reset their state
    if (this.props.generalSearchId !== previousProps.generalSearchId)
      this.onClear()
  }

  // Called by filter-group
  async getFilters() {
    return [
      {
        name: this.props.filter.searchParameterName,
        value: this.state.counter,
        valueType: VALUE_TYPE_FLOAT,
        operator: FILTER_OPERATOR_GREATER_OR_EQUAL
      }
    ]
  }

  // Called by filter-group
  onClear(callback) {
    this.setState({ counter: this.defaultValue }, callback)
  }

  render() {
    const title = this.props.intl.formatMessage(this.props.filter.title)

    return (
      <div className="d-flex flex-row" key={title}>
        <div className="label mr-auto">{title}</div>
        <img
          src="images/search-filter-subtract-icon.svg"
          onMouseDown={event =>
            event.target.setAttribute(
              'src',
              'images/search-filter-subtract-icon.svg'
            )
          }
          onMouseUp={event =>
            event.target.setAttribute(
              'src',
              'images/search-filter-subtract-icon.svg'
            )
          }
          onMouseOver={event =>
            event.target.setAttribute(
              'src',
              'images/search-filter-subtract-icon.svg'
            )
          }
          onMouseOut={event =>
            event.target.setAttribute(
              'src',
              'images/search-filter-subtract-icon.svg'
            )
          }
          onClick={this.handleOnClickSubtract}
          className="p-2"
        />
        <div className="label">{this.state.counter}</div>
        <img
          src="images/search-filter-add-icon.svg"
          onMouseDown={event =>
            event.target.setAttribute(
              'src',
              'images/search-filter-add-icon.svg'
            )
          }
          onMouseUp={event =>
            event.target.setAttribute(
              'src',
              'images/search-filter-add-icon.svg'
            )
          }
          onMouseOver={event =>
            event.target.setAttribute(
              'src',
              'images/search-filter-add-icon.svg'
            )
          }
          onMouseOut={event =>
            event.target.setAttribute(
              'src',
              'images/search-filter-add-icon.svg'
            )
          }
          onClick={this.handleOnClickAdd}
          className="p-2"
        />
      </div>
    )
  }
}

const mapStateToProps = state => ({
  filters: state.search.filters,
  generalSearchId: state.search.generalSearchId
})

const mapDispatchToProps = () => ({})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(CounterFilter))
