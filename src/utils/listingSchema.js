const listingSchema = {
	listingTypes: [
		{
			type: 'for-sale',
			translationName: {
        id: 'listing-create.forSaleLabel',
        defaultMessage: 'For Sale'
      },
      img: 'for-sale.jpg'
		},
		{
			type: 'housing',
			translationName: {
        id: 'listing-create.housingLabel',
        defaultMessage: 'Housing'
      },
      img: 'housing.jpg'
		},
		{
			type: 'transportation',
			translationName: {
        id: 'listing-create.transportation',
        defaultMessage: 'Transportation'
      },
      img: 'transportation.jpg'
		},
		{
			type: 'tickets',
			translationName: {
        id: 'listing-create.tickets',
        defaultMessage: 'Tickets'
      },
      img: 'tickets.jpg'
		},
		{
			type: 'services',
			translationName: {
        id: 'listing-create.services',
        defaultMessage: 'Services'
      },
      img: 'services.jpg'
		},
		{
			type: 'announcements',
			translationName: {
        id: 'listing-create.announcements',
        defaultMessage: 'Announcements'
      },
      img: 'announcements.jpg'
		}
	]
}

export default listingSchema