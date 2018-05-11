import moment from 'moment'

export default {
  notifications: [
    {
      _id: '1foo2',
      eventType: 'soldAt',
      counterpartyAddress: '0x12Be343B94f860124dC4fEe278FDCBD38C102D88',
      counterpartyName: 'Matt L',
      listingId: '1foo2',
      listingImageURL: 'images/temp-lambo.jpg',
      listingName: 'Super Lambo',
      perspective: 'seller',
      readAt: null,
    },
    {
      _id: '3bar4',
      eventType: 'fulfilledAt',
      counterpartyAddress: '0x34Be343B94f860124dC4fEe278FDCBD38C102D88',
      counterpartyName: 'Josh F',
      listingId: '1foo2',
      listingImageURL: 'images/temp-chicken.jpg',
      listingName: 'Wholesale Chicken',
      perspective: 'buyer',
      readAt: new Date(),
    },
    {
      _id: '5baz6',
      eventType: 'receivedAt',
      counterpartyAddress: '0x56Be343B94f860124dC4fEe278FDCBD38C102D88',
      counterpartyName: 'Micah A',
      listingId: '1foo2',
      listingImageURL: 'images/temp-shoes.jpg',
      listingName: 'Blue Suede Shoes',
      perspective: 'seller',
      readAt: null,
    },
    {
      _id: '7qux8',
      eventType: 'withdrawnAt',
      counterpartyAddress: '0x78Be343B94f860124dC4fEe278FDCBD38C102D88',
      listingId: '1foo2',
      listingName: 'Something Else',
      perspective: 'buyer',
      readAt: new Date(),
    },
    // notification may be unrelated to a listing
    {
      _id: '9nil0',
      message: 'A message from Origin that does not involve a listing',
      readAt: null,
    },
  ],
  reviews: [
    {
      _id: '1foo2',
      content: "These chicks are HOT! I mean, ever since I got my baby chicken in the mail it's been non-stop phone calls from all my friends and neighbors and family. Everyone wants a piece of me now. I used to be quite the anti-social but, honestly, I think these baby chickens are just the boost my social life needed. Lovin' life!",
      createdAt: new Date(),
      reviewerAddress: '0x627306090abaB3A6e1400e9345bC60c78a8BEf57',
      score: Math.floor(Math.random() * 6),
    },
    {
      _id: '3bar4',
      content: "I must admit I've always had a thing for baby chickens. I think it goes back to my childhood. Growing up all I ever really had access to were regular baby chickens so you can imagine when I saw this listing I totally flipped! I mean, how cute are these little guys?? I would highly recommend you purchase one for yourself and see what all the fuss is about.",
      createdAt: new Date(),
      reviewerAddress: '0x627306090abaB3A6e1400e9345bC60c78a8BEf57',
      score: Math.floor(Math.random() * 6),
    }
  ],
}
