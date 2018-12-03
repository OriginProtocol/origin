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
  ],
  listingSchemasByCategory: {
    announcements: [
      'announcements-activities_1-0-0',
      'announcements-artists_1-0-0',
      'announcements-barter_1-0-0',
      'announcements-childcare_1-0-0',
      'announcements-classes_1-0-0',
      'announcements-freeStuff_1-0-0',
      'announcements-garageMovingSales_1-0-0',
      'announcements-general_1-0-0',
      'announcements-groups_1-0-0',
      'announcements-localNews_1-0-0',
      'announcements-lostFound_1-0-0',
      'announcements-marketing_1-0-0',
      'announcements-musicians_1-0-0',
      'announcements-other_1-0-0',
      'announcements-personals_1-0-0',
      'announcements-pets_1-0-0',
      'announcements-politics_1-0-0',
      'announcements-resumes_1-0-0',
      'announcements-volunteers_1-0-0'
    ],
    forRent: [
      'forRent-appliances_1-0-0',
      'forRent-atvsUtvsSnowmobiles_1-0-0',
      'forRent-babyKidStuff_1-0-0',
      'forRent-bicycles_1-0-0',
      'forRent-boats_1-0-0',
      'forRent-carsTrucks_1-0-0',
      'forRent-cellPhones_1-0-0',
      'forRent-clothingAccessories_1-0-0',
      'forRent-computers_1-0-0',
      'forRent-electronics_1-0-0',
      'forRent-farmGarden_1-0-0',
      'forRent-furniture_1-0-0',
      'forRent-healthBeauty_1-0-0',
      'forRent-heavyEquipment_1-0-0',
      'forRent-householdItems_1-0-0',
      'forRent-housing_1-0-0',
      'forRent-jewelry_1-0-0',
      'forRent-motorcyclesScooters_1-0-0',
      'forRent-musicalInstruments_1-0-0',
      'forRent-other_1-0-0',
      'forRent-parking_1-0-0',
      'forRent-recreationalVehicles_1-0-0',
      'forRent-sportingGoods_1-0-0',
      'forRent-storage_1-0-0',
      'forRent-tools_1-0-0',
      'forRent-toysGames_1-0-0',
      'forRent-trailers_1-0-0',
      'forRent-videoGaming_1-0-0'
    ],
    forSale: [
      'forSale-antiques_1-0-0',
      'forSale-appliances_1-0-0',
      'forSale-artsCrafts_1-0-0',
      'forSale-atvsUtvsSnowmobiles_1-0-0',
      'forSale-autoParts_1-0-0',
      'forSale-autoWheelsTires_1-0-0',
      'forSale-babyKidStuff_1-0-0',
      'forSale-bicycleParts_1-0-0',
      'forSale-bicycles_1-0-0',
      'forSale-boatPartsAccessories_1-0-0',
      'forSale-boats_1-0-0',
      'forSale-booksMagazines_1-0-0',
      'forSale-businesses_1-0-0',
      'forSale-carsTrucks_1-0-0',
      'forSale-cdsDvdsVhs_1-0-0',
      'forSale-cellPhones_1-0-0',
      'forSale-clothingAccessories_1-0-0',
      'forSale-collectibles_1-0-0',
      'forSale-computerParts_1-0-0',
      'forSale-computers_1-0-0',
      'forSale-electronics_1-0-0',
      'forSale-farmGarden_1-0-0',
      'forSale-furniture_1-0-0',
      'forSale-healthBeauty_1-0-0',
      'forSale-heavyEquipment_1-0-0',
      'forSale-householdItems_1-0-0',
      'forSale-jewelry_1-0-0',
      'forSale-materials_1-0-0',
      'forSale-motorcyclePartsAccessories_1-0-0',
      'forSale-motorcyclesScooters_1-0-0',
      'forSale-musicalInstruments_1-0-0',
      'forSale-other_1-0-0',
      'forSale-photoVideo_1-0-0',
      'forSale-realEstate_1-0-0',
      'forSale-recreationalVehicles_1-0-0',
      'forSale-sportingGoods_1-0-0',
      'forSale-tickets_1-0-0',
      'forSale-tools_1-0-0',
      'forSale-toysGames_1-0-0',
      'forSale-trailers_1-0-0',
      'forSale-videoGaming_1-0-0'
    ],
    services: [
      'services-counseling_1-0-0',
      'services-design_1-0-0',
      'services-dogWalking_1-0-0',
      'services-musicLessons_1-0-0',
      'services-other_1-0-0',
      'services-photography_1-0-0',
      'services-salon_1-0-0',
      'services-spa_1-0-0',
      'services-transportation_1-0-0'
    ]
  }
}

export default listingSchemaMetadata
