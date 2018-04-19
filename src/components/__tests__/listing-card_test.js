import React from 'react';
import fetchMock from 'fetch-mock';
import { expect } from 'chai';
import { shallow, mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import { BrowserRouter as Router, } from 'react-router-dom'
// otherwise get err: "Invariant Violation: You should not use <Link> outside a <Router>"

import ListingCard from '../listing-card.js';

configure({ adapter: new Adapter() });

const listindId = 1
const peggedPrices = { USD: 546.61, EUR: 441.53 } // as returned from CryptoCompare

const URL = 'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=' 

describe('<ListingCard />', () => {

  describe('retrieveConversion', () => {

    const wrapper = shallow(<ListingCard listingId={listindId} />);
    const instance = wrapper.instance();

    instance.setState({ price: 5 })

    afterEach(() => {
      fetchMock.restore() // else watchman hangs!!!
    })

    it('sets approxPrice if no currency passed in', async () => {
      const currencyCode = 'USD'
      fetchMock.mock(URL + currencyCode, { USD: peggedPrices[currencyCode] })
      await instance.retrieveConversion();
      const estimatedPrice = peggedPrices[currencyCode] * instance.state.price;
      expect(instance.state.approxPrice).to.equal(estimatedPrice);
    });

    it('sets approxPrice for given currency', async () => {
      const currencyCode = 'EUR'
      fetchMock.mock(URL + currencyCode, { EUR: peggedPrices[currencyCode] })
      await instance.retrieveConversion(currencyCode);
      const estimatedPrice = peggedPrices[currencyCode] * instance.state.price;
      expect(instance.state.approxPrice).to.equal(estimatedPrice);
    });
  });

});
