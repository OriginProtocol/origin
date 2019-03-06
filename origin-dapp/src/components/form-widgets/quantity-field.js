import React, { Component } from 'react'

class QuantityField extends Component {
  constructor(props) {
    super(props)
    this.state = {
      quantity: props.formData && parseInt(props.formData) || 1
    }

    this.onChange = this.onChange.bind(this)
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

  render() {
    const { quantity } = this.state

    return (
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
      </div>
    )
  }
}

export default QuantityField
