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
      img: 'for-sale.svg'
    },
    {
      type: 'forRent',
      translationName: {
        id: 'schema.forRent',
        defaultMessage: 'For Rent'
      },
      img: 'for-rent.svg'
    },
    {
      type: 'services',
      translationName: {
        id: 'schema.services',
        defaultMessage: 'Services'
      },
      img: 'services.svg'
    },
    {
      type: 'announcements',
      translationName: {
        id: 'schema.announcements',
        defaultMessage: 'Announcements'
      },
      img: 'announcements.svg'
    }
  ],
  listingSchemasByCategory: {
    announcements: [
      {
        schema: 'announcements-activities_1.0.0.json',
        translationName: {
          id: 'schema.activities',
          defaultMessage: 'Activities'
        },
      },
      {
        schema: 'announcements-artists_1.0.0.json',
        translationName: {
          id: 'schema.artists',
          defaultMessage: 'Artists'
        },
      },
      {
        schema: 'announcements-barter_1.0.0.json',
        translationName: {
          id: 'schema.barter',
          defaultMessage: 'Barter'
        },
      },
      {
        schema: 'announcements-childcare_1.0.0.json',
        translationName: {
          id: 'schema.childcare',
          defaultMessage: 'Childcare'
        },
      },
      {
        schema: 'announcements-classes_1.0.0.json',
        translationName: {
          id: 'schema.classes',
          defaultMessage: 'Classes'
        },
      },
      {
        schema: 'announcements-freeStuff_1.0.0.json',
        translationName: {
          id: 'schema.freeStuff',
          defaultMessage: 'Free Stuff'
        },
      },
      {
        schema: 'announcements-garageMovingSales_1.0.0.json',
        translationName: {
          id: 'schema.garageMovingSales',
          defaultMessage: 'Garage and Moving Sales'
        },
      },
      {
        schema: 'announcements-general_1.0.0.json',
        translationName: {
          id: 'schema.general',
          defaultMessage: 'General'
        },
      },
      {
        schema: 'announcements-groups_1.0.0.json',
        translationName: {
          id: 'schema.groups',
          defaultMessage: 'Groups'
        },
      },
      {
        schema: 'announcements-localNews_1.0.0.json',
        translationName: {
          id: 'schema.localNews',
          defaultMessage: 'Local News'
        },
      },
      {
        schema: 'announcements-lostFound_1.0.0.json',
        translationName: {
          id: 'schema.lostFound',
          defaultMessage: 'Lost and Found'
        },
      },
      {
        schema: 'announcements-marketing_1.0.0.json',
        translationName: {
          id: 'schema.marketing',
          defaultMessage: 'Marketing'
        },
      },
      {
        schema: 'announcements-musicians_1.0.0.json',
        translationName: {
          id: 'schema.musicians',
          defaultMessage: 'Musicians'
        },
      },
      {
        schema: 'announcements-other_1.0.0.json',
        translationName: {
          id: 'schema.other',
          defaultMessage: 'Other'
        },
      },
      {
        schema: 'announcements-personals_1.0.0.json',
        translationName: {
          id: 'schema.personals',
          defaultMessage: 'Personals'
        },
      },
      {
        schema: 'announcements-pets_1.0.0.json',
        translationName: {
          id: 'schema.pets',
          defaultMessage: 'Pets'
        },
      },
      {
        schema: 'announcements-politics_1.0.0.json',
        translationName: {
          id: 'schema.politics',
          defaultMessage: 'Politics'
        },
      },
      {
        schema: 'announcements-resumes_1.0.0.json',
        translationName: {
          id: 'schema.resumes',
          defaultMessage: 'Resumes'
        },
      },
      {
        schema: 'announcements-volunteers_1.0.0.json',
        translationName: {
          id: 'schema.volunteers',
          defaultMessage: 'Volunteers'
        },
      },
    ],
    forRent: [
      {
        schema: 'forRent-appliances_1.0.0.json',
        translationName: {
          id: 'schema.appliances',
          defaultMessage: 'Appliances'
        }
      },
      {
        schema: 'forRent-atvsUtvsSnowmobiles_1.0.0.json',
        translationName: {
          id: 'schema.atvsUtvsSnowmobiles',
          defaultMessage: 'Atvs, Utvs, Snowmobiles'
        }
      },
      {
        schema: 'forRent-babyKidStuff_1.0.0.json',
        translationName: {
          id: 'schema.babyKidStuff',
          defaultMessage: 'Baby and Kid Stuff'
        }
      },
      {
        schema: 'forRent-bicycles_1.0.0.json',
        translationName: {
          id: 'schema.bicycles',
          defaultMessage: 'Bicycles'
        }
      },
      {
        schema: 'forRent-boats_1.0.0.json',
        translationName: {
          id: 'schema.boats',
          defaultMessage: 'Boats'
        }
      },
      {
        schema: 'forRent-carsTrucks_1.0.0.json',
        translationName: {
          id: 'schema.carsTrucks',
          defaultMessage: 'Cars and Trucks'
        }
      },
      {
        schema: 'forRent-cellPhones_1.0.0.json',
        translationName: {
          id: 'schema.cellPhones',
          defaultMessage: 'Cell Phones'
        }
      },
      {
        schema: 'forRent-clothingAccessories_1.0.0.json',
        translationName: {
          id: 'schema.clothingAccessories',
          defaultMessage: 'Clothing and Accessories'
        }
      },
      {
        schema: 'forRent-computers_1.0.0.json',
        translationName: {
          id: 'schema.computers',
          defaultMessage: 'Computers'
        }
      },
      {
        schema: 'forRent-electronics_1.0.0.json',
        translationName: {
          id: 'schema.electronics',
          defaultMessage: 'Electronics'
        }
      },
      {
        schema: 'forRent-farmGarden_1.0.0.json',
        translationName: {
          id: 'schema.farmGarden',
          defaultMessage: 'Farm and Garden'
        }
      },
      {
        schema: 'forRent-furniture_1.0.0.json',
        translationName: {
          id: 'schema.furniture',
          defaultMessage: 'Furniture'
        }
      },
      {
        schema: 'forRent-healthBeauty_1.0.0.json',
        translationName: {
          id: 'schema.healthBeauty',
          defaultMessage: 'Health and Beauty'
        }
      },
      {
        schema: 'forRent-heavyEquipment_1.0.0.json',
        translationName: {
          id: 'schema.heavyEquipment',
          defaultMessage: 'Heavy Equipment'
        }
      },
      {
        schema: 'forRent-householdItems_1.0.0.json',
        translationName: {
          id: 'schema.householdItems',
          defaultMessage: 'Household Items'
        }
      },
      {
        schema: 'forRent-housing_2.0.0.json',
        translationName: {
          id: 'schema.housing',
          defaultMessage: 'Housing'
        }
      },
      {
        schema: 'forRent-jewelry_1.0.0.json',
        translationName: {
          id: 'schema.jewelry',
          defaultMessage: 'Jewelry'
        }
      },
      {
        schema: 'forRent-motorcyclesScooters_1.0.0.json',
        translationName: {
          id: 'schema.motorcyclesScooters',
          defaultMessage: 'Motorcycles and Scooters'
        }
      },
      {
        schema: 'forRent-musicalInstruments_1.0.0.json',
        translationName: {
          id: 'schema.musicalInstruments',
          defaultMessage: 'Musical Instruments'
        }
      },
      {
        schema: 'forRent-other_1.0.0.json',
        translationName: {
          id: 'schema.other',
          defaultMessage: 'Other'
        }
      },
      {
        schema: 'forRent-parking_1.0.0.json',
        translationName: {
          id: 'schema.parking',
          defaultMessage: 'Parking'
        }
      },
      {
        schema: 'forRent-recreationalVehicles_1.0.0.json',
        translationName: {
          id: 'schema.recreationalVehicles',
          defaultMessage: 'Recreational Vehicles'
        }
      },
      {
        schema: 'forRent-sportingGoods_1.0.0.json',
        translationName: {
          id: 'schema.sportingGoods',
          defaultMessage: 'Sporting Goods'
        }
      },
      {
        schema: 'forRent-storage_1.0.0.json',
        translationName: {
          id: 'schema.storage',
          defaultMessage: 'Storage'
        }
      },
      {
        schema: 'forRent-tools_1.0.0.json',
        translationName: {
          id: 'schema.tools',
          defaultMessage: 'Tools'
        }
      },
      {
        schema: 'forRent-toysGames_1.0.0.json',
        translationName: {
          id: 'schema.toysGames',
          defaultMessage: 'Toys and Games'
        }
      },
      {
        schema: 'forRent-trailers_1.0.0.json',
        translationName: {
          id: 'schema.trailers',
          defaultMessage: 'Trailers'
        }
      },
      {
        schema: 'forRent-videoGaming_1.0.0.json',
        translationName: {
          id: 'schema.videoGaming',
          defaultMessage: 'Video Gaming'
        }
      },
    ],
    forSale: [
      {
        schema: 'forSale-antiques_1.0.0.json',
        translationName: {
          id: 'schema.antiques',
          defaultMessage: 'Antiques'
        }
      },
      {
        schema: 'forSale-appliances_1.0.0.json',
        translationName: {
          id: 'schema.appliances',
          defaultMessage: 'Appliances'
        }
      },
      {
        schema: 'forSale-artsCrafts_1.0.0.json',
        translationName: {
          id: 'schema.artsCrafts',
          defaultMessage: 'Arts and Crafts'
        }
      },
      {
        schema: 'forSale-atvsUtvsSnowmobiles_1.0.0.json',
        translationName: {
          id: 'schema.atvsUtvsSnowmobiles',
          defaultMessage: 'Atvs, Utvs, Snowmobiles'
        }
      },
      {
        schema: 'forSale-autoParts_1.0.0.json',
        translationName: {
          id: 'schema.autoParts',
          defaultMessage: 'Auto Parts'
        }
      },
      {
        schema: 'forSale-autoWheelsTires_1.0.0.json',
        translationName: {
          id: 'schema.autoWheelsTires',
          defaultMessage: 'Auto Wheels and Tires'
        }
      },
      {
        schema: 'forSale-babyKidStuff_1.0.0.json',
        translationName: {
          id: 'schema.babyKidStuff',
          defaultMessage: 'Baby and Kid Stuff'
        }
      },
      {
        schema: 'forSale-bicycleParts_1.0.0.json',
        translationName: {
          id: 'schema.bicycleParts',
          defaultMessage: 'Bicycle Parts'
        }
      },
      {
        schema: 'forSale-bicycles_1.0.0.json',
        translationName: {
          id: 'schema.bicycles',
          defaultMessage: 'Bicycles'
        }
      },
      {
        schema: 'forSale-boatPartsAccessories_1.0.0.json',
        translationName: {
          id: 'schema.boatPartsAccessories',
          defaultMessage: 'Boat Parts and Accessories'
        }
      },
      {
        schema: 'forSale-boats_1.0.0.json',
        translationName: {
          id: 'schema.boats',
          defaultMessage: 'Boats'
        }
      },
      {
        schema: 'forSale-booksMagazines_1.0.0.json',
        translationName: {
          id: 'schema.booksMagazines',
          defaultMessage: 'Books and Magazines'
        }
      },
      {
        schema: 'forSale-businesses_1.0.0.json',
        translationName: {
          id: 'schema.businesses',
          defaultMessage: 'Businesses'
        }
      },
      {
        schema: 'forSale-carsTrucks_1.0.0.json',
        translationName: {
          id: 'schema.carsTrucks',
          defaultMessage: 'Cars and Trucks'
        }
      },
      {
        schema: 'forSale-cdsDvdsVhs_1.0.0.json',
        translationName: {
          id: 'schema.cdsDvdsVhs',
          defaultMessage: 'CDs, DVDs, VHS'
        }
      },
      {
        schema: 'forSale-cellPhones_1.0.0.json',
        translationName: {
          id: 'schema.cellPhones',
          defaultMessage: 'Cell Phones'
        }
      },
      {
        schema: 'forSale-clothingAccessories_1.0.0.json',
        translationName: {
          id: 'schema.clothingAccessories',
          defaultMessage: 'Clothing and Accessories'
        }
      },
      {
        schema: 'forSale-collectibles_1.0.0.json',
        translationName: {
          id: 'schema.collectibles',
          defaultMessage: 'Collectibles'
        }
      },
      {
        schema: 'forSale-computerParts_1.0.0.json',
        translationName: {
          id: 'schema.computerParts',
          defaultMessage: 'Computer Parts'
        }
      },
      {
        schema: 'forSale-computers_1.0.0.json',
        translationName: {
          id: 'schema.computers',
          defaultMessage: 'Computers'
        }
      },
      {
        schema: 'forSale-electronics_1.0.0.json',
        translationName: {
          id: 'schema.electronics',
          defaultMessage: 'Electronics'
        }
      },
      {
        schema: 'forSale-farmGarden_1.0.0.json',
        translationName: {
          id: 'schema.farmGarden',
          defaultMessage: 'Farm and Garden'
        }
      },
      {
        schema: 'forSale-furniture_1.0.0.json',
        translationName: {
          id: 'schema.furniture',
          defaultMessage: 'Furniture'
        }
      },
      {
        schema: 'forSale-healthBeauty_1.0.0.json',
        translationName: {
          id: 'schema.healthBeauty',
          defaultMessage: 'Health and Beauty'
        }
      },
      {
        schema: 'forSale-heavyEquipment_1.0.0.json',
        translationName: {
          id: 'schema.heavyEquipment',
          defaultMessage: 'Heavy Equipment'
        }
      },
      {
        schema: 'forSale-householdItems_1.0.0.json',
        translationName: {
          id: 'schema.householdItems',
          defaultMessage: 'Household Items'
        }
      },
      {
        schema: 'forSale-jewelry_1.0.0.json',
        translationName: {
          id: 'schema.jewelry',
          defaultMessage: 'Jewelry'
        }
      },
      {
        schema: 'forSale-materials_1.0.0.json',
        translationName: {
          id: 'schema.materials',
          defaultMessage: 'Materials'
        }
      },
      {
        schema: 'forSale-motorcyclePartsAccessories_1.0.0.json',
        translationName: {
          id: 'schema.motorcyclePartsAccessories',
          defaultMessage: 'Motorcycle Parts and Accessories'
        }
      },
      {
        schema: 'forSale-motorcyclesScooters_1.0.0.json',
        translationName: {
          id: 'schema.motorcyclesScooters',
          defaultMessage: 'Motorcycles and Scooters'
        }
      },
      {
        schema: 'forSale-musicalInstruments_1.0.0.json',
        translationName: {
          id: 'schema.musicalInstruments',
          defaultMessage: 'Musical Instruments'
        }
      },
      {
        schema: 'forSale-other_1.0.0.json',
        translationName: {
          id: 'schema.other',
          defaultMessage: 'Other'
        }
      },
      {
        schema: 'forSale-photoVideo_1.0.0.json',
        translationName: {
          id: 'schema.photoVideo',
          defaultMessage: 'Photo and Video'
        }
      },
      {
        schema: 'forSale-realEstate_1.0.0.json',
        translationName: {
          id: 'schema.realEstate',
          defaultMessage: 'Real Estate'
        }
      },
      {
        schema: 'forSale-recreationalVehicles_1.0.0.json',
        translationName: {
          id: 'schema.recreationalVehicles',
          defaultMessage: 'Recreational Vehicles'
        }
      },
      {
        schema: 'forSale-sportingGoods_1.0.0.json',
        translationName: {
          id: 'schema.sportingGoods',
          defaultMessage: 'Sporting Goods'
        }
      },
      {
        schema: 'forSale-tickets_1.0.0.json',
        translationName: {
          id: 'schema.tickets',
          defaultMessage: 'Tickets'
        }
      },
      {
        schema: 'forSale-tools_1.0.0.json',
        translationName: {
          id: 'schema.tools',
          defaultMessage: 'Tools'
        }
      },
      {
        schema: 'forSale-toysGames_1.0.0.json',
        translationName: {
          id: 'schema.toysGames',
          defaultMessage: 'Toys and Games'
        }
      },
      {
        schema: 'forSale-trailers_1.0.0.json',
        translationName: {
          id: 'schema.trailers',
          defaultMessage: 'Trailers'
        }
      },
      {
        schema: 'forSale-videoGaming_1.0.0.json',
        translationName: {
          id: 'schema.videoGaming',
          defaultMessage: 'Video Gaming'
        }
      }
    ],
    services: [
      {
        schema: 'services-counseling_1.0.0.json',
        translationName: {
          id: 'schema.counseling',
          defaultMessage: 'Counseling'
        }
      },
      {
        schema: 'services-design_1.0.0.json',
        translationName: {
          id: 'schema.design',
          defaultMessage: 'Design'
        }
      },
      {
        schema: 'services-dogWalking_1.0.0.json',
        translationName: {
          id: 'schema.dogWalking',
          defaultMessage: 'Dog Walking'
        }
      },
      {
        schema: 'services-musicLessons_1.0.0.json',
        translationName: {
          id: 'schema.musicLessons',
          defaultMessage: 'Music Lessons'
        }
      },
      {
        schema: 'services-other_1.0.0.json',
        translationName: {
          id: 'schema.other',
          defaultMessage: 'Other'
        }
      },
      {
        schema: 'services-photography_1.0.0.json',
        translationName: {
          id: 'schema.photography',
          defaultMessage: 'Photography'
        }
      },
      {
        schema: 'services-salon_1.0.0.json',
        translationName: {
          id: 'schema.salon',
          defaultMessage: 'Salon'
        }
      },
      {
        schema: 'services-spa_1.0.0.json',
        translationName: {
          id: 'schema.spa',
          defaultMessage: 'Spa'
        }
      },
      {
        schema: 'services-transportation_1.0.0.json',
        translationName: {
          id: 'schema.transportation',
          defaultMessage: 'Transportation'
        }
      }
    ]
  }
}

export default listingSchemaMetadata
