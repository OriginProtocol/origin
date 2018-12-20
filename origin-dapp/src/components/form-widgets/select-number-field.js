import React, { Component } from 'react'
import Dropdown from 'components/dropdown'

class SelectNumberField extends Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
      selectedNumber: 1
    }

    this.onChange = this.onChange.bind(this)
    this.onClick = this.onClick.bind(this)
  }

  componentDidMount() {
    // If a selectedNumber is passed in, we must call the onChange callback
    // to set the selectedNumber in the parent form
    // Unfortunately, the setTimeout is needed to allow the parent
    // form to render and be ready to handle the onChange event
    const { selectedNumber } = this.state
    if (selectedNumber) {
      setTimeout(() => {
        this.props.onChange(selectedNumber)
      })
    }
  }

  onChange(selectedNumber) {
    if (selectedNumber >= this.props.minNum && selectedNumber <= this.props.maxNum){
      this.setState(
        {
          selectedNumber: selectedNumber,
          open: false
        },
        () => this.props.onChange(selectedNumber)
      )
    }
  }

  onClick() {
    this.setState({ open: !this.state.open })
  }

  render() {
    const { selectedNumber, open } = this.state
    const { minNum, maxNum } = this.props
    const selectNumRange = [...Array(maxNum - minNum + 1).keys()].map(i => i + minNum)

    return (
      <Dropdown
        className="select-number"
        open={open}
        onClose={() => this.setState({ open: false })}
      >
        <a
          id="connectivityDropdown"
          onClick={this.onClick}
          role="button"
          aria-haspopup="true"
          aria-expanded="false"
          ga-category="top_nav"
          ga-label="connectivity"
        >
        {selectedNumber}
          <img
            src="images/caret-grey.svg"
            className="caret ml-2 mb-1"
            alt="caret down"
          />
        </a>
        <div
          className={`dropdown-menu flex-column dropdown-menu-right${open ? ' d-flex' : ' d-none'}`}
        >
        {selectNumRange.map(selectNum => 
          <a
            key={selectNum}
            className="number-to-select"
            onClick={() => this.onChange(selectNum)}
          >
            {selectedNumber === selectNum ? '✓ ' : ''}&nbsp;{selectNum}
          </a>
        )}
        </div>
      </Dropdown>
    )
  }
}

export default SelectNumberField