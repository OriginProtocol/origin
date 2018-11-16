export const HomeshareListing = { // Unencrypted
  listingType: 'Home Share',
  title: 'Home For Rent',
  price: '85',
  currencyId: 'DAI',
  deposit: '50',
  description: 'A lovely home close to downtown Boulder',
  approxLocation: '40.017,-105.306',

  pricePerDay: 100,
  weekendPrice: 140,
  cleaningFee: 50,
  weeklyDiscount: '5%',
  monthlyDiscount: '8%',
  extraGuestCharge: 10,
  taxes: '0.5% + 10',
  currency: 'USD',
  acceptedCoins: ['DAI', 'USDT'],

  commission: '5%',

  available: '2018/08/01-2019/04/01',
  unavailable: [
    '2018/09/01-2018/11/27',
    '2018/12/23-2018/12/26',
    '2019/02/13-2019/02/15'
  ],

  bedrooms: 4,
  bathrooms: 4,
  maxGuests: 8,
  petsAllowed: false,
  checkinTime: '4pm',
  checkoutTime: '10am',

  contactMethods: ['Telegram', 'PGP', 'Email'],
  publicKey: 'ssh-rsa KH93Ud5FPUfQ+lht1UhFtM4ysVOxM...'
}

export const HomeshareOffer = { // Encrypted with seller's public key
  checkin: '2019/01/12',
  checkout: '2019/01/14',
  offeredPrice: '250',
  currency: 'DAI',
  numberOfGuests: 2,
  specialRequests: 'I will be checking in late',
}

export const HomeshareOfferAccepted = { // Encrypted with buyer's public key
  message: 'Please text me when you arrive so I can give you the key'
}

export const HomeshareOfferFinalized = { // Unencrypted
  rating: '5/5',
  review: 'Lovely home'
}



export const ForSaleListing = { // Unencrypted
  listingType: 'For Sale',
  title: 'Bike For Sale',
  description: 'Good condition',
  approxLocation: '40.017,-105.306',
  price: '50',
  currencyId: 'DAI',
  acceptedCoins: ['ETH', 'BTC', 'DAI'],
  contactMethods: [{ type: 'Telegram', channel: '0xabc123' }, { type: 'Email' }],
  publicKey: 'ssh-rsa KH93Ud5FPUfQ+lht1UhFtM4ysVOxM...',
  image: 'Qmcgwn3ADR482jPnuVtJbZTEfcaZw7hdLyzshSm2qNkLAW'
}

export const ForSaleOffer = { // Encrypted with seller's public key
  title: 'Shiny kids bike',
  description: 'Good condition',
  approxLocation: '40.017,-105.306',
  offeredPrice: 150,
  currency: 'USD',
  acceptedCoins: ['ETH', 'BTC']
}

export const ForSaleOfferAccepted = { // Encrypted with buyer's public key
  message: 'Address is 123 Fake St. Please come by tomorrow between 5pm and 7pm to pick it up - thanks.'
}

export const ForSaleOfferFinalized = { // Unencrypted
  rating: '5/5',
  review: 'No complaints'
}



export const RideShareListing = { // Unencrypted
  listingType: 'Car Share',
  title: 'Driver For Hire',
  price: '10',
  currencyId: 'DAI',
  approxLocation: '40.017,-105.306',
  carManufacturer: 'Telsa',
  carModel: 'Model S P100D',
  year: '2017',
  availability: 'ipfsPubSub://0x123456',
  commission: '7%',
  pricePerMile: 5,
  minCharge: 10,
  airportFixedPrice: 60,
  currency: 'USD',
  acceptedCoins: ['DAI']
}

export const RideShareOffer = { // Encrypted with seller's public key
  pickup: '40.017,-105.306',
  pickupTime: 'ASAP (10:31am)',
  destination: '40.181,-105.209',
  offeredPrice: 20,
  currency: 'USD',
  acceptedCoins: ['ETH', 'BTC']
}

export const RideShareOfferAccepted = { // Encrypted with buyer's public key
  approxPickupTime: '10:35am'
}

export const RideShareOfferFinalized = { // Unencrypted
  rating: '5/5',
  review: 'Good driver'
}



export const TicketedEventListing = { // Unencrypted
  listingType: 'Ticket',
  title: 'Ticket For Sale',
  price: '60',
  currencyId: 'DAI',
  artist: 'Radiohead',
  venue: 'The Roundhouse, London, UK',
  date: '2018/09/01 7:00pm',
  priceTiers: [
    {
      tier: 'General Admission',
      price: 100,
      availability: 500
    },
    {
      tier: 'VIP',
      price: 500,
      availability: 25
    }
  ],
  currency: 'USD',
  acceptedCoins: ['DAI'],
  deliveryOptions: [
    { name: 'Will Call', price: 0 },
    { name: 'Email', price: 0 },
    { name: 'US Mail', price: 2 }
  ]
}

export const TicketedEventOffer = { // Encrypted with seller's public key
  name: 'Bill Smith',
  tier: 'VIP',
  quantity: 2,
  price: 1000,
  pickup: 'Will Call'
}

export const TicketedEventOfferAccepted = { // Encrypted with buyer's public key
  seats: [{ row: 'C', seat: '16' }, { row: 'C', seat: '17' }]
}

export const TicketedEventFinalized = { // Unencrypted
  rating: '5/5',
  review: 'Awesome show, great venue'
}
