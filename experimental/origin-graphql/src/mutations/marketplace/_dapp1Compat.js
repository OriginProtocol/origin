// TODO: Remove after dapp1 deprecated

export default function dapp1FractionalCompat(ipfsData) {
  ipfsData.dappSchemaId = [
    'https://dapp.originprotocol.com/schemas/',
    ipfsData.category.replace('schema.', ''),
    '-',
    ipfsData.subCategory.replace('schema.', ''),
    '_1.0.0.json'
  ].join('')

  if (ipfsData.listingType === 'fractional') {
    ipfsData.unitsTotal = 1
    ipfsData.slotLength = 1
    ipfsData.slotLengthUnit = 'schema.days'
    ipfsData.availability = [
      'vcalendar',
      [['version', {}, 'text', '1.0'], ['prodid', {}, 'text', 'origin.js']],
      [
        'vevent',
        ['uid', {}, 'text', '1c228eac-eb5f-4b31-b53e-079fc6fe477a'],
        [
          'dtstart',
          {
            tzid: '/US/Eastern'
          },
          'date-time',
          '2019-02-17T07:00:00.000Z'
        ],
        [
          'dtend',
          {
            tzid: '/US/Eastern'
          },
          'date-time',
          '2019-02-22T06:59:58.999Z'
        ],
        ['rrule', {}, 'text', 'FREQ=WEEKLY;'],
        ['x-currency', {}, 'text', 'ETH'],
        ['x-price', {}, 'text', ipfsData.price.amount],
        ['x-is-available', {}, 'boolean', true],
        ['x-priority', {}, 'integer', 1]
      ],
      [
        'vevent',
        ['uid', {}, 'text', 'ff68360f-5006-4c64-bf37-1d9a1407977b'],
        [
          'dtstart',
          {
            tzid: '/US/Eastern'
          },
          'date-time',
          '2019-02-22T07:00:00.000Z'
        ],
        [
          'dtend',
          {
            tzid: '/US/Eastern'
          },
          'date-time',
          '2019-02-24T06:59:58.999Z'
        ],
        ['rrule', {}, 'text', 'FREQ=WEEKLY;'],
        ['x-currency', {}, 'text', 'ETH'],
        // Deliberately break weekend pricing as the schemas are incompatible...
        ['x-price', {}, 'text', ipfsData.weekendPrice],
        ['x-is-available', {}, 'boolean', true],
        ['x-priority', {}, 'integer', 1]
      ]
    ]
  }
}
