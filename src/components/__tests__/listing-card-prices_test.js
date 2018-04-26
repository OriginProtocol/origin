import React from 'react';
import fetchMock from 'fetch-mock';
import { expect } from 'chai';
import { mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import ListingCardPrices from '../listing-card-prices.js';

configure({ adapter: new Adapter() });

const arbitraryListingId = 1
const peggedPrices = { USD: 546.61, EUR: 441.5 } // as returned from CryptoCompare
const URL = 'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms='

describe('<ListingCardPrices />', () => {

  describe('retrieveConversion', () => {

    const wrapper = mount(<ListingCardPrices />);
    const instance = wrapper.instance();


    afterEach(() => {
      fetchMock.restore() // else watchman hangs!!!
    })

    describe('no currency passed in', () => {

      const currencyCode = 'USD'

      beforeEach(() => {
        instance.setState({ price: 0.0001 })
        fetchMock.mock(URL + currencyCode, { USD: peggedPrices[currencyCode] })
      })

      it('sets exchangeRate', async () => {
        await instance.retrieveConversion();
        expect(instance.state.exchangeRate).to.equal(peggedPrices[currencyCode]);
      });

      it('renders approxPrice correctly', async () => {
        await instance.retrieveConversion();
        expect(wrapper.text()).to.include('~' + instance.formatApproxPrice() + ' ' + currencyCode);
      });

    });

    describe('currency passed in', () => {

      const currencyCode = 'EUR'

      beforeEach(() => {
        instance.setState({ price: 0.0001, currencyCode: currencyCode })
        fetchMock.mock(URL + currencyCode, { EUR: peggedPrices[currencyCode] })
      })

      it('sets exchangeRate', async () => {
        await instance.retrieveConversion(currencyCode);
        expect(instance.state.exchangeRate).to.equal(peggedPrices[currencyCode]);
      });

      it('renders approxPrice correctly', async () => {
        await instance.retrieveConversion(currencyCode);
        expect(wrapper.text()).to.include('~' + instance.formatApproxPrice() + ' ' + currencyCode);
      });

    });

  });

});
