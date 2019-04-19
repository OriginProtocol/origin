'use strict'

import expect from 'jest'
import renderer from 'react-test-renderer'

import React from 'react'
import App from './src/App'

it('renders without crashing', () => {
  const rendered = renderer.create(<App />).toJSON()
  expect(rendered).toBeTruthy()
})
