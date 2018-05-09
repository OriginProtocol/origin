import React from 'react';
import { shallow } from 'enzyme';
import Footer from '../footer.js'

describe('Footer Component', () => {
  test('render', () => {
    const wrapper = shallow(<Footer />)
    expect(wrapper.exists()).toBe(true)
  })
});
