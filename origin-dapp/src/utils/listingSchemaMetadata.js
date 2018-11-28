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
      type: 'announcements',
      translationName: {
        id: 'schema.announcements',
        defaultMessage: 'Announcements'
      },
      img: 'announcements.jpg'
    },
    {
      type: 'for-rent',
      translationName: {
        id: 'schema.forRent',
        defaultMessage: 'For Rent'
      },
      img: 'for-rent.jpg'
    },
    {
      type: 'for-sale',
      translationName: {
        id: 'schema.forSale',
        defaultMessage: 'For Sale'
      },
      img: 'for-sale.jpg'
    },
    {
      type: 'services',
      translationName: {
        id: 'schema.services',
        defaultMessage: 'Services'
      },
      img: 'services.jpg'
    }
  ]
}

export default listingSchemaMetadata
