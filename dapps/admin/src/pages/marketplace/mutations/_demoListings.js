// These are mutations (`CreateListingMutation`) for creating sample listings.

// House, Fractional Nightly
const HawaiiHouse = {
  from: '0xf17f52151EbEF6C7334FAD080c5704D77216b732',
  deposit: '0',
  depositManager: '0xf17f52151EbEF6C7334FAD080c5704D77216b732',
  autoApprove: true,
  data: {
    typename: 'FractionalListing',
    title: 'Mamalahoa Estate',
    description:
      "Built on the slopes of Hualalai Mountain in Kailua, Hawaii, the Mamalahoa Estate knows how to make a first impression. You enter the property through a grove of citrus and macadamia trees. A floating walkway takes you across a koi pond, surrounded by lush greenery and a waterfall. Once inside, the 5,391-square-foot home is comprised of a master and two guest suites, each with a private staircase leading down to the garden courtyard. A chef's kitchen with koa cabinetry looks onto a double-height living area. Flanked by sliding doors, the room opens to a veranda that overlooks two swimming pools and the Kona coastline. Consisting of 90 acres, the grounds also feature a driving range, tennis court, bocce courts, and a three-car garage.",
    category: 'schema.forRent',
    subCategory: 'schema.housing',
    media: [
      {
        contentType: 'image/jpeg',
        url: 'ipfs://QmUr6VYTKF22p3PSziFrjZHgynWRhzZkndL1gPpeZjZeE6'
      },
      {
        contentType: 'image/jpeg',
        url: 'ipfs://QmPmeEjfddDsd9fuwNLUBNBaE1LJVyY3adin3bZDecCaEY'
      },
      {
        contentType: 'image/jpeg',
        url: 'ipfs://QmVucfvfY5R2yScsW6Kcrpi7uUk6q1Bo9RGZG3oTkGnNed'
      },
      {
        contentType: 'image/jpeg',
        url: 'ipfs://QmSWiY4pjrfRKYstU5gPYNwwijrwzjXfQ9E9AR4bSD63k1'
      },
      {
        contentType: 'image/jpeg',
        url: 'ipfs://QmQgsAUu691HTshkmkW3t2iiwJZRRxokSUvrVSm5fArjg6'
      }
    ],
    price: {
      amount: '2.0',
      currency: 'ETH'
    },
    commissionPerUnit: '50',
    marketplacePublisher: ''
  },
  fractionalData: {
    weekendPrice: {
      amount: '2.5',
      currency: 'ETH'
    },
    workingHours: [],
    timeZone: '',
    unavailable: [
      '2019-01-1/2019-01-3',
      '2019-02-1/2019-02-3',
      '2019-03-1/2019-03-3',
      '2019-04-1/2019-04-3',
      '2019-05-1/2019-05-3',
      '2019-06-1/2019-06-3',
      '2019-07-1/2019-07-3',
      '2019-08-1/2019-08-3',
      '2019-09-1/2019-09-3',
      '2019-10-1/2019-10-3',
      '2019-11-1/2019-11-3',
      '2019-12-1/2019-12-3',
      '2020-01-1/2020-01-3',
      '2020-02-1/2020-02-3',
      '2020-03-1/2020-03-3',
      '2020-04-1/2020-04-3',
      '2020-05-1/2020-05-3',
      '2020-06-1/2020-06-3',
      '2020-07-1/2020-07-3',
      '2020-08-1/2020-08-3',
      '2020-09-1/2020-09-3',
      '2020-10-1/2020-10-3',
      '2020-11-1/2020-11-3',
      '2020-12-1/2020-12-3',
      '2021-01-1/2021-01-3',
      '2021-02-1/2021-02-3',
      '2021-03-1/2021-03-3',
      '2021-04-1/2021-04-3',
      '2021-05-1/2021-05-3',
      '2021-06-1/2021-06-3',
      '2021-07-1/2021-07-3',
      '2021-08-1/2021-08-3',
      '2021-09-1/2021-09-3',
      '2021-10-1/2021-10-3',
      '2021-11-1/2021-11-3',
      '2021-12-1/2021-12-3'
    ],
    customPricing: [
      '2019-01-21/2019-01-24:4',
      '2019-02-21/2019-02-24:4',
      '2019-03-21/2019-03-24:4',
      '2019-04-21/2019-04-24:4',
      '2019-05-21/2019-05-24:4',
      '2019-06-21/2019-06-24:4',
      '2019-07-21/2019-07-24:4',
      '2019-08-21/2019-08-24:4',
      '2019-09-21/2019-09-24:4',
      '2019-10-21/2019-10-24:4',
      '2019-11-21/2019-11-24:4',
      '2019-12-21/2019-12-24:4',
      '2020-01-21/2020-01-24:4',
      '2020-02-21/2020-02-24:4',
      '2020-03-21/2020-03-24:4',
      '2020-04-21/2020-04-24:4',
      '2020-05-21/2020-05-24:4',
      '2020-06-21/2020-06-24:4',
      '2020-07-21/2020-07-24:4',
      '2020-08-21/2020-08-24:4',
      '2020-09-21/2020-09-24:4',
      '2020-10-21/2020-10-24:4',
      '2020-11-21/2020-11-24:4',
      '2020-12-21/2020-12-24:4',
      '2021-01-21/2021-01-24:4',
      '2021-02-21/2021-02-24:4',
      '2021-03-21/2021-03-24:4',
      '2021-04-21/2021-04-24:4',
      '2021-05-21/2021-05-24:4',
      '2021-06-21/2021-06-24:4',
      '2021-07-21/2021-07-24:4',
      '2021-08-21/2021-08-24:4',
      '2021-09-21/2021-09-24:4',
      '2021-10-21/2021-10-24:4',
      '2021-11-21/2021-11-24:4',
      '2021-12-21/2021-12-24:4'
    ],
    booked: []
  }
}

// Car, Fractional Hourly
const Car = {
  from: '0xf17f52151EbEF6C7334FAD080c5704D77216b732',
  deposit: '0',
  depositManager: '0xf17f52151EbEF6C7334FAD080c5704D77216b732',
  autoApprove: true,
  data: {
    typename: 'FractionalHourlyListing',
    title: '1977 International Scout II',
    description:
      "Introduced in 1971, the International Scout II rode on a stretched-wheelbase version of the rugged Scout chassis as a competitor to trucks like the larger Chevrolet Blazer. The highly customizable Scout was popular for work and racing, taking home a class win in the 1977 Baja 1000. This restored beautifully restored 1977 Scout II's customizations run more than skin deep, with a 6.0-liter GM engine and transmission to go along with the wheels and suspension lift.",
    category: 'schema.forRent',
    subCategory: 'schema.carsTrucks',
    media: [
      {
        contentType: 'image/jpeg',
        url: 'ipfs://QmUBTPFWw69XJ4zKySJg3sS672nBzfkexEvijPk7BfwJJD'
      },
      {
        contentType: 'image/jpeg',
        url: 'ipfs://QmXkceEJtmPsdNQF5R1b5XF8fMLhpckCPJZB4dMUpkz8z5'
      },
      {
        contentType: 'image/jpeg',
        url: 'ipfs://QmZWiwb6Tm5AGeDoocs7aZn73XpQYftcqDJdBMoLxNgunH'
      },
      {
        contentType: 'image/jpeg',
        url: 'ipfs://QmVBqmMYH25TacoT1a8yKDcEb3iPsEf8XuAfHNRnK4GxM9'
      }
    ],
    price: {
      amount: '2.0',
      currency: 'ETH'
    },
    commissionPerUnit: '50',
    marketplacePublisher: ''
  },
  fractionalData: {
    workingHours: [
      '',
      '09:00:00/17:00:00',
      '09:00:00/17:00:00',
      '09:00:00/17:00:00',
      '09:00:00/17:00:00',
      '09:00:00/12:00:00',
      ''
    ],
    timeZone: '',
    unavailable: [],
    customPricing: [],
    booked: []
  }
}

// Tickets, Mutli-Unit
const TaylorSwiftTickets = {
  from: '0xf17f52151EbEF6C7334FAD080c5704D77216b732',
  deposit: '5',
  depositManager: '0x821aEa9a577a9b44299B9c15c88cf3087F3b5544',
  autoApprove: true,
  data: {
    title: "Taylor Swift's Reputation Tour",
    description:
      "Taylor Swift's Reputation Stadium Tour is the fifth world concert tour by American singer-songwriter Taylor Swift, in support of her sixth studio album, Reputation.",
    category: 'schema.forSale',
    subCategory: 'schema.tickets',
    media: [
      {
        url: 'ipfs://QmU2NeZjiJZ7TyFCwqHp2bd7MH1bSyZbSAgGxNSR2iUQ3M',
        contentType: 'image/jpeg'
      },
      {
        url: 'ipfs://QmSXucmB6BHgFUW6wZyXknD3HrAtXvAy2t7JHMgXXNU79n',
        contentType: 'image/jpeg'
      },
      {
        url: 'ipfs://QmZLxmJBPY3ae9PNqKZhWZX6oF764sxXAQw3y3fJu2xgw1',
        contentType: 'image/jpeg'
      },
      {
        url: 'ipfs://QmQJymkfuCCPFnRDvi6jJALhBTqBRToJ5gGay2sPBEHFtY',
        contentType: 'image/jpeg'
      },
      {
        url: 'ipfs://QmRPJzi5wDVkrwqGVDqVoYsJr6AonysisjszuMbEbJAD8w',
        contentType: 'image/jpeg'
      }
    ],
    price: {
      amount: '0.3',
      currency: 'ETH'
    },
    commission: '10',
    commissionPerUnit: '2'
  },
  unitData: {
    unitsTotal: 10
  }
}

// House, Fractional Nightly
const LakeHouse = {
  from: '0xf17f52151EbEF6C7334FAD080c5704D77216b732',
  deposit: '0',
  depositManager: '0xf17f52151EbEF6C7334FAD080c5704D77216b732',
  autoApprove: true,
  data: {
    typename: 'FractionalListing',
    title: 'Casa Wolf',
    description:
      'Overlooking Lake Llanquihue, Casa Wulf is inspired by the terrain. The home sits on a steep slope. This lead to its three-story design, creating a natural balcony facing the water. Among the levels, the main living area is at the center, with the bedrooms above and a basement workshop below. Each floor was constructed using a different system, resulting in a range of facades. Their orientation takes advantage of the incoming sunlight and while also exposing the interiors to the surrounding landscape.',
    category: 'schema.forRent',
    subCategory: 'schema.housing',
    media: [
      {
        contentType: 'image/jpeg',
        url: 'ipfs://QmTTNxNNQYUupKpbxRu5yUruSCasadBAeyNsw2RrRtG83S'
      },
      {
        contentType: 'image/jpeg',
        url: 'ipfs://QmcDrQANRcL4pUpGxiaAVi36MpJ22QMCNKr4wAHSgYyTiF'
      },
      {
        contentType: 'image/jpeg',
        url: 'ipfs://QmTouE2NfAKB2AeVHf1u58181Uqb24Tj2zntrqjVz8BJL6'
      }
    ],
    price: {
      amount: '1.5',
      currency: 'ETH'
    },
    commissionPerUnit: '50',
    marketplacePublisher: ''
  },
  fractionalData: {
    weekendPrice: {
      amount: '2.5',
      currency: 'ETH'
    },
    workingHours: [],
    timeZone: '',
    unavailable: [],
    customPricing: [],
    booked: []
  }
}

// House, Fractional Nightly
const ZincHouse = {
  from: '0xf17f52151EbEF6C7334FAD080c5704D77216b732',
  deposit: '0',
  depositManager: '0xf17f52151EbEF6C7334FAD080c5704D77216b732',
  autoApprove: true,
  data: {
    typename: 'FractionalListing',
    title: 'Zinc House',
    description:
      'Overlooking Lake Llanquihue, Casa Wulf is inspired by the terrain. The home sits on a steep slope. This lead to its three-story design, creating a natural balcony facing the water. Among the levels, the main living area is at the center, with the bedrooms above and a basement workshop below. Each floor was constructed using a different system, resulting in a range of facades. Their orientation takes advantage of the incoming sunlight and while also exposing the interiors to the surrounding landscape.',
    category: 'schema.forRent',
    subCategory: 'schema.housing',
    media: [
      {
        contentType: 'image/jpeg',
        url: 'ipfs://QmQyKBQtqH5yDd4nrksUANyrBDFJdcF8TdAcaY6cNnSNu1'
      },
      {
        contentType: 'image/jpeg',
        url: 'ipfs://QmaD8rxktZRTt9pLyRbrprd5V7Xj1nZA4HVriREoGFCgbk'
      },
      {
        contentType: 'image/jpeg',
        url: 'ipfs://QmWPa92BRqyPuJf3c6SzSkFNUkjQEdPsasxzLddbjq6ZfW'
      },
      {
        contentType: 'image/jpeg',
        url: 'ipfs://QmPkHiyUHmdbjaew895fKXirrh5LckH3yMwQ33ehgoRm7F'
      },
      {
        contentType: 'image/jpeg',
        url: 'ipfs://QmRqE53MUnhHyVE7MNMwf7nuxwcAKAiMgLQ3QXu34EExSm'
      },
      {
        contentType: 'image/jpeg',
        url: 'ipfs://QmSZ9MQMfqS4oPeCAhZCtYch8hpjHnbvtbVXtYju6WtPh3'
      },
      {
        contentType: 'image/jpeg',
        url: 'ipfs://QmTxqZmLCEeAeEAzoVjBdYtSxAvBwbtUFDPGxSMVNVRQFV'
      },
      {
        contentType: 'image/jpeg',
        url: 'ipfs://QmPwHv9RfvFy6ZyqTv5zoAGeGzmk6emXbhoY2Bpob2yDKY'
      },
      {
        contentType: 'image/jpeg',
        url: 'ipfs://QmfBmhBN1CXkbJ6Fp5ZFnwV5G7DgasaXaxmqrtjiaLJVb9'
      }
    ],
    price: {
      amount: '1',
      currency: 'ETH'
    },
    commissionPerUnit: '50',
    marketplacePublisher: ''
  },
  fractionalData: {
    weekendPrice: {
      amount: '2',
      currency: 'ETH'
    },
    workingHours: [],
    timeZone: '',
    unavailable: [],
    customPricing: [],
    booked: []
  }
}

// T-Shirt, Single Unit
const Spaceman = {
  from: '0xf17f52151EbEF6C7334FAD080c5704D77216b732',
  deposit: '5',
  depositManager: '0x821aEa9a577a9b44299B9c15c88cf3087F3b5544',
  autoApprove: true,
  data: {
    title: 'Origin Spaceman Shirt',
    description:
      'The amazing Origin Spaceman shirt. Available exclusively on the Origin Marketplace. These shirts are 90% cotton and 10% polyester and 100% amazing.',
    category: 'schema.forSale',
    subCategory: 'schema.clothingAccessories',
    media: [
      {
        url: 'ipfs://QmdjjwsF7bbejYJ7CecAmMpGB9RMNtFN1Gbs79KmKSGdHD',
        contentType: 'image/jpeg'
      }
    ],
    price: {
      amount: '0.12',
      currency: 'ETH'
    },
    commission: '10',
    commissionPerUnit: '0',
    marketplacePublisher: '0x627306090abab3a6e1400e9345bc60c78a8bef57'
  },
  unitData: {
    unitsTotal: 1
  }
}

export default [
  Spaceman,
  Car,
  LakeHouse,
  ZincHouse,
  HawaiiHouse,
  TaylorSwiftTickets
]
