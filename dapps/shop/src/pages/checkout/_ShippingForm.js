import React from 'react'

import { Countries, CountriesDefaultInfo } from 'data/Countries'

import CountrySelect from 'components/CountrySelect'
import ProvinceSelect from 'components/ProvinceSelect'
import get from 'lodash/get'
import upperFirst from 'lodash/upperFirst'

const ShippingForm = ({ prefix = '', state, setState, input, Feedback }) => {
  const field = name => (prefix ? `${prefix}${upperFirst(name)}` : name)
  const country = Countries[state[field('country')] || 'United States']

  return (
    <>
      <div className="form-row">
        <div className="form-group col-md-6">
          <input placeholder="First Name" {...input(field('firstName'))} />
          {Feedback(field('firstName'))}
        </div>
        <div className="form-group col-md-6">
          <input placeholder="Last Name" {...input(field('lastName'))} />
          {Feedback(field('lastName'))}
        </div>
      </div>
      <div className="form-group">
        <input placeholder="Address" {...input(field('address1'))} />
        {Feedback(field('address1'))}
      </div>
      <div className="form-group">
        <input
          placeholder="Apartment, suite, etc. (optional)"
          {...input(field('address2'))}
        />
        {Feedback(field('address2'))}
      </div>
      <div className="form-group">
        <input placeholder="City" {...input(field('city'))} />
        {Feedback(field('city'))}
      </div>

      <div className="form-row">
        <div className="form-group col-md">
          <CountrySelect
            className="form-control"
            value={state[field('country')]}
            onChange={e => {
              const provinces = get(Countries[e.target.value], 'provinces')
              setState({
                [field('country')]: e.target.value,
                [field('province')]: provinces ? Object.keys(provinces)[0] : ''
              })
            }}
          />
        </div>
        {!country.provinces ? null : (
          <div className="form-group col-md">
            <ProvinceSelect
              className="form-control"
              country={country}
              {...input(field('province'))}
            />
            {Feedback(field('province'))}
          </div>
        )}
        <div className="form-group col-md">
          <input
            type="text"
            className="form-control"
            placeholder={get(
              country,
              'labels.zip',
              CountriesDefaultInfo.labels.zip
            )}
            {...input(field('zip'))}
          />
          {Feedback(field('zip'))}
        </div>
      </div>
    </>
  )
}

export default ShippingForm
