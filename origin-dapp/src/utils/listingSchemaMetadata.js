const listingSchemaMetadata = {
  listingTypeAll: {
    type: 'all',
    translationName: {
      id: 'searchbar.all',
      defaultMessage: 'All'
    }
  },
  listingTypes: [
    {
      type: 'forSale',
      translationName: {
        id: 'schema.forSale',
        defaultMessage: 'For Sale'
      },
      img: 'for-sale.jpg'
    },
    {
      type: 'forRent',
      translationName: {
        id: 'schema.forRent',
        defaultMessage: 'For Rent'
      },
      img: 'for-rent.jpg'
    },
    {
      type: 'services',
      translationName: {
        id: 'schema.services',
        defaultMessage: 'Services'
      },
      img: 'services.jpg'
    },
    {
      type: 'announcements',
      translationName: {
        id: 'schema.announcements',
        defaultMessage: 'Announcements'
      },
      img: 'announcements.jpg'
    }
  ]
}

export default listingSchemaMetadata
