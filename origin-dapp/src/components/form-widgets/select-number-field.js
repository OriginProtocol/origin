import React, { Component } from 'react'
import Dropdown from 'components/dropdown'

class SelectNumberField extends Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
      quantity: 1
    }

    this.onChange = this.onChange.bind(this)
    this.onClick = this.onClick.bind(this)
  }

  componentDidMount() {
    // If a quantity is passed in, we must call the onChange callback
    // to set the quantity in the parent form
    // Unfortunately, the setTimeout is needed to allow the parent
    // form to render and be ready to handle the onChange event
    const { quantity } = this.state
    if (quantity) {
      setTimeout(() => {
        this.props.onChange(quantity)
      })
    }
  }

  onChange(selectedNumber) {
    if (selectedNumber >= this.props.minNum && selectedNumber <= this.props.maxNum){
      this.setState(
        {
          quantity: selectedNumber,
          open: false
        },
        () => this.props.onChange(selectedNumber)
      )
    }
  }

  onClick(e) {
    this.setState({ open: !this.state.open })
  }

  render() {
    const { quantity, open } = this.state
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
        {quantity}
          <img
            src="images/caret-grey.svg"
            className="caret ml-2 mb-1"
            alt="caret down"
          />
        </a>
        <div
          className={`dropdown-menu flex-column dropdown-menu-right${open ? ' d-flex' : ' d-none'}`}
          aria-labelledby="quantitySelectDropdown"
        >
        {selectNumRange.map(selectNum => 
          <a
            key={selectNum}
            className="number-to-select"
            onClick={() => this.onChange(selectNum)}
          >
            {selectNum}
          </a>
        )}
        </div>
      {/*
      <div className="quantity-field">
        <label className="control-label" htmlFor="root_quantity">
          {this.props.schema.title}
          {this.props.required && <span className="required">*</span>}
        </label>
        <div className="row">
          <div className="col-12">
            <div className="quality-field-container">
              <input
                type="number"
                id="root_quantity"
                step="1"
                className="form-control"
                defaultValue={quantity}
                onChange={this.onChange}
                required={this.props.required}
              />
            </div>
          </div>
        </div>
      </div>*/}
      </Dropdown>
    )
  }
}

export default SelectNumberField