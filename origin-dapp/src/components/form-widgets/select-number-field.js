import React, { Component } from 'react'
import Dropdown from 'components/dropdown'

class SelectNumberField extends Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
      quantity: props.formData && parseInt(props.formData) || 1
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

  onChange(event) {
    const value = event.target.value
    const isNan = value === '' || isNaN(value)
    let valueNum = isNan ? value : parseInt(value)
    valueNum = valueNum <= 0 ? '' : valueNum
    this.setState(
      {
        quantity: valueNum
      },
      () => this.props.onChange(valueNum)
    )
  }

  onClick(e) {
    console.log("ON CLICK")
    this.setState({ open: !this.state.open })
  }

  render() {
    const { quantity, open } = this.state

    return (
      <Dropdown
        className="nav-item connectivity"
        open={open}
        onClose={() => this.setState({ open: false })}
      >
        <a
          className="nav-link active dropdown-toggle"
          id="connectivityDropdown"
          onClick={this.onClick}
          role="button"
          aria-haspopup="true"
          aria-expanded="false"
          ga-category="top_nav"
          ga-label="connectivity"
        >
        {"YOYOYOYOYO"}
        </a>
        <div
          className={`dropdown-menu dropdown-menu-right${open ? ' show' : ''}`}
          aria-labelledby="connectivityDropdown"
        >
        WHAT IS UP YO BROOO???
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