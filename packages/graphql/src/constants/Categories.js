const root = [
  ['schema.forSale', 'For Sale'],
  ['schema.forRent', 'For Rent'],
  ['schema.services', 'Services'],
  ['schema.announcements', 'Announcements']
]

const forSale = [
  ['schema.antiques', 'Antiques'],
  ['schema.appliances', 'Appliances'],
  ['schema.artsCrafts', 'Arts and Crafts'],
  ['schema.atvsUtvsSnowmobiles', 'Atvs, Utvs, Snowmobiles'],
  ['schema.autoParts', 'Auto Parts'],
  ['schema.autoWheelsTires', 'Auto Wheels and Tires'],
  ['schema.babyKidStuff', 'Baby and Kid Stuff'],
  ['schema.bicycleParts', 'Bicycle Parts'],
  ['schema.bicycles', 'Bicycles'],
  ['schema.boatPartsAccessories', 'Boat Parts and Accessories'],
  ['schema.boats', 'Boats'],
  ['schema.booksMagazines', 'Books and Magazines'],
  ['schema.businesses', 'Businesses'],
  ['schema.carsTrucks', 'Cars and Trucks'],
  ['schema.cdsDvdsVhs', 'CDs, DVDs, VHS'],
  ['schema.cellPhones', 'Cell Phones'],
  ['schema.clothingAccessories', 'Clothing and Accessories'],
  ['schema.collectibles', 'Collectibles'],
  ['schema.computerParts', 'Computer Parts'],
  ['schema.computers', 'Computers'],
  ['schema.electronics', 'Electronics'],
  ['schema.farmGarden', 'Farm and Garden'],
  ['schema.furniture', 'Furniture'],
  ['schema.giftCards', 'Gift Cards'],
  ['schema.healthBeauty', 'Health and Beauty'],
  ['schema.heavyEquipment', 'Heavy Equipment'],
  ['schema.householdItems', 'Household Items'],
  ['schema.jewelry', 'Jewelry'],
  ['schema.materials', 'Materials'],
  ['schema.motorcyclePartsAccessories', 'Motorcycle Parts and Accessories'],
  ['schema.motorcyclesScooters', 'Motorcycles and Scooters'],
  ['schema.musicalInstruments', 'Musical Instruments'],
  ['schema.other', 'Other'],
  ['schema.photoVideo', 'Photo and Video'],
  ['schema.realEstate', 'Real Estate'],
  ['schema.recreationalVehicles', 'Recreational Vehicles'],
  ['schema.sportingGoods', 'Sporting Goods'],
  ['schema.tickets', 'Tickets'],
  ['schema.tools', 'Tools'],
  ['schema.toysGames', 'Toys and Games'],
  ['schema.trailers', 'Trailers'],
  ['schema.videoGaming', 'Video Gaming']
]

const forRent = [
  ['schema.appliances', 'Appliances'],
  ['schema.atvsUtvsSnowmobiles', 'Atvs, Utvs, Snowmobiles'],
  ['schema.babyKidStuff', 'Baby and Kid Stuff'],
  ['schema.bicycles', 'Bicycles'],
  ['schema.boats', 'Boats'],
  ['schema.carsTrucks', 'Cars and Trucks'],
  ['schema.cellPhones', 'Cell Phones'],
  ['schema.clothingAccessories', 'Clothing and Accessories'],
  ['schema.computers', 'Computers'],
  ['schema.electronics', 'Electronics'],
  ['schema.farmGarden', 'Farm and Garden'],
  ['schema.furniture', 'Furniture'],
  ['schema.healthBeauty', 'Health and Beauty'],
  ['schema.heavyEquipment', 'Heavy Equipment'],
  ['schema.householdItems', 'Household Items'],
  ['schema.housing', 'Housing'],
  ['schema.jewelry', 'Jewelry'],
  ['schema.motorcyclesScooters', 'Motorcycles and Scooters'],
  ['schema.musicalInstruments', 'Musical Instruments'],
  ['schema.other', 'Other'],
  ['schema.parking', 'Parking'],
  ['schema.recreationalVehicles', 'Recreational Vehicles'],
  ['schema.sportingGoods', 'Sporting Goods'],
  ['schema.storage', 'Storage'],
  ['schema.tools', 'Tools'],
  ['schema.toysGames', 'Toys and Games'],
  ['schema.trailers', 'Trailers'],
  ['schema.videoGaming', 'Video Gaming']
]

const services = [
  ['schema.counseling', 'Counseling'],
  ['schema.design', 'Design'],
  ['schema.dogWalking', 'Dog Walking'],
  ['schema.musicLessons', 'Music Lessons'],
  ['schema.other', 'Other'],
  ['schema.photography', 'Photography'],
  ['schema.salon', 'Salon'],
  ['schema.spa', 'Spa'],
  ['schema.transportation', 'Transportation']
]

const announcements = [
  ['schema.activities', 'Activities'],
  ['schema.artists', 'Artists'],
  ['schema.barter', 'Barter'],
  ['schema.childcare', 'Childcare'],
  ['schema.classes', 'Classes'],
  ['schema.freeStuff', 'Free Stuff'],
  ['schema.garageMovingSales', 'Garage and Moving Sales'],
  ['schema.general', 'General'],
  ['schema.groups', 'Groups'],
  ['schema.localNews', 'Local News'],
  ['schema.lostFound', 'Lost and Found'],
  ['schema.marketing', 'Marketing'],
  ['schema.musicians', 'Musicians'],
  ['schema.other', 'Other'],
  ['schema.personals', 'Personals'],
  ['schema.pets', 'Pets'],
  ['schema.politics', 'Politics'],
  ['schema.resumes', 'Resumes'],
  ['schema.volunteers', 'Volunteers']
]

// Convenience category / sub-category lookup object
const lookup = [
  ...root,
  ...forSale,
  ...forRent,
  ...services,
  ...announcements
].reduce((m, o) => {
  m[o[0]] = o[1]
  return m
}, {})

export default {
  root: root,
  lookup: lookup,
  'schema.forSale': forSale,
  'schema.forRent': forRent,
  'schema.services': services,
  'schema.announcements': announcements
}
