import React, { Component } from 'react'

import Dropdown from 'components/Dropdown'

import CountryCodes from './_countryCodes'

const TopCountries = ['us', 'gb', 'cn', 'kr', 'it', 'fr', 'es']
const SortedCountryCodes = [
  ...TopCountries.map(id => CountryCodes.find(c => c.code === id)),
  ...CountryCodes.filter(c => TopCountries.indexOf(c.code) < 0)
]

const Row = ({ country, onClick }) => (
  <a
    href="#"
    className="dropdown-item"
    onClick={e => {
      e.preventDefault()
      onClick(country)
    }}
    style={{ backgroundImage: `url(images/flags/${country.code}.svg)` }}
  >
    <div className="name">{country.name}</div>
    <div className="prefix">{`+${country.prefix}`}</div>
  </a>
)

class CountryDropdown extends Component {
  state = { open: false }
  render() {
    const backgroundImage = `url(images/flags/${this.props.active}.svg)`
    return (
      <Dropdown
        className="country-code"
        content={
          <div className="dropdown-menu show">
            {SortedCountryCodes.map(country => (
              <Row
                key={country.code}
                country={country}
                onClick={active => {
                  this.setState({ open: false })
                  this.props.onChange(active)
                }}
              />
            ))}
          </div>
        }
        open={this.state.open}
        onClose={() => this.setState({ open: false })}
      >
        <div
          className="active-country"
          style={{ backgroundImage }}
          onClick={() => this.setState({ open: !this.state.open })}
        />
      </Dropdown>
    )
  }
}

export default CountryDropdown

require('react-styl')(`

  .country-code
    cursor: pointer
    background-color: var(--dark-two)
    border-radius: var(--default-radius)
    padding: 0.5rem
    margin-right: 0.5rem
    display: flex
    &.show
      background-color: var(--dark)
    .active-country
      background-image: url(images/flags/us.svg);
      width: 3rem;
      background-size: 2rem;
      background-position: center;
      background-repeat: no-repeat;

    .dropdown-menu
      overflow: auto
      max-height: 200px
      max-width: 320px
      background-color: var(--dark-two)
      .dropdown-item
        color: var(--white)
        display: flex
        background-size: 2rem;
        background-repeat: no-repeat;
        background-position: 1rem center;
        padding-left: 4rem;
        font-size: 18px
        &:hover
          background-color: var(--dark)
          color: var(--white)
        .name
          flex: 1
          overflow: hidden
          text-overflow: ellipsis
        .prefix
          color: var(--dusk)
`)
