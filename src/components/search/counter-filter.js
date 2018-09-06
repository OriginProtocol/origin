import React, { Component } from 'react'
import { injectIntl } from 'react-intl'

class CounterFilter extends Component {
  constructor(props) {
    super(props)

    this.state = {
      counter: this.props.defaultValue ? this.props.defaultValue : 1
    }

    this.handleOnClickAdd = this.handleOnClickAdd.bind(this)
    this.handleOnClickSubstract = this.handleOnClickSubstract.bind(this)
  }

  handleOnClickAdd() {
    this.setState({counter: this.state.counter + 1})
  }

  handleOnClickSubstract() {
    this.setState({counter: Math.max(this.state.counter - 1, 0)})
  }

  componentWillUnmount() {
    this.props.onChildUnMounted(this)
  }

  componentDidMount() {
    this.props.onChildMounted(this)
  }

  // Called by filter-group
  onClear() {

  }

  render() {
    const title = this.props.intl.formatMessage(this.props.filter.title)

    return (
      <div className="d-flex flex-row" key={title}>
        <div className="label mr-auto">{title}</div>
        <img
          src="images/search-filter-substract-icon.svg"
          onMouseDown={event => event.target.setAttribute('src', 'images/search-filter-substract-icon.svg')}
          onMouseUp={event => event.target.setAttribute('src', 'images/search-filter-substract-icon.svg')}
          onMouseOver={event => event.target.setAttribute('src', 'images/search-filter-substract-icon.svg')}
          onMouseOut={event => event.target.setAttribute('src', 'images/search-filter-substract-icon.svg')}
          onClick={this.handleOnClickSubstract}
          className="p-2"
        />
        <div className="label">{this.state.counter}</div>
        <img
          src="images/search-filter-add-icon.svg"
          onMouseDown={event => event.target.setAttribute('src', 'images/search-filter-add-icon.svg')}
          onMouseUp={event => event.target.setAttribute('src', 'images/search-filter-add-icon.svg')}
          onMouseOver={event => event.target.setAttribute('src', 'images/search-filter-add-icon.svg')}
          onMouseOut={event => event.target.setAttribute('src', 'images/search-filter-add-icon.svg')}
          onClick={this.handleOnClickAdd}
          className="p-2"
        />
      </div>
    )
  }
}

export default injectIntl(CounterFilter)
