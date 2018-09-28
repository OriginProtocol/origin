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
      type: 'for-sale',
      translationName: {
        id: 'schema.forSale',
        defaultMessage: 'For Sale'
      },
      img: 'for-sale.jpg'
    },
    {
      type: 'housing',
      translationName: {
        id: 'schema.housing',
        defaultMessage: 'Housing'
      },
      img: 'housing.jpg'
    },
    {
      type: 'transportation',
      translationName: {
        id: 'schema.transportation',
        defaultMessage: 'Transportation'
      },
      img: 'transportation.jpg'
    },
    {
      type: 'tickets',
      translationName: {
        id: 'schema.tickets',
        defaultMessage: 'Tickets'
      },
      img: 'tickets.jpg'
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
