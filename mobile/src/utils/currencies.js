const IMAGES_PATH = '../../assets/images/'

export default currencies = {
  dai: {
    color: '#fec100',
    icon: require(`${IMAGES_PATH}dai-icon.png`),
    name: 'Maker Dai',
    priceToUSD: 0.95,
  },
  eth: {
    color: '#a27cff',
    icon: require(`${IMAGES_PATH}eth-icon.png`),
    name: 'Ethereum',
    priceToUSD: 164.53,
  },
  ogn: {
    color: '#007fff',
    icon: require(`${IMAGES_PATH}ogn-icon.png`),
    name: 'Origin Token',
  },
}
