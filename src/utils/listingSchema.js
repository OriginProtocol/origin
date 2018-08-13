const listingSchema = {
	listingTypes: {
		forSale: {
			type: 'for-sale',
			translationName: {
        id: 'listing-create.forSaleLabel',
        defaultMessage: 'For Sale'
      },
      img: 'for-sale.jpg'
		},
		housing: {
			type: 'housing',
			translationName: {
        id: 'listing-create.housingLabel',
        defaultMessage: 'Housing'
      },
      img: 'housing.jpg'
		},
		transportation: {
			type: 'transportation',
			translationName: {
        id: 'listing-create.transportation',
        defaultMessage: 'Transportation'
      },
      img: 'transportation.jpg'
		},
		tickets: {
			type: 'tickets',
			translationName: {
        id: 'listing-create.tickets',
        defaultMessage: 'Tickets'
      },
      img: 'tickets.jpg'
		},
		services: {
			type: 'services',
			translationName: {
        id: 'listing-create.services',
        defaultMessage: 'Services'
      },
      img: 'services.jpg'
		},
		announcements: {
			type: 'announcements',
			translationName: {
        id: 'listing-create.announcements',
        defaultMessage: 'Announcements'
      },
      img: 'announcements.jpg'
		}
	}
}

export default listingSchema