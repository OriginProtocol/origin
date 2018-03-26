export default {
  notifications: [
    {
      _id: '1foo2',
      transactionType: 'purchased',
      address: '0x12Be343B94f860124dC4fEe278FDCBD38C102D88',
      name: 'Matt L',
      product: 'Super Lambo',
      readAt: null,
      role: 'sell',
    },
    {
      _id: '3bar4',
      transactionType: 'confirmed-receipt',
      address: '0x34Be343B94f860124dC4fEe278FDCBD38C102D88',
      name: 'Josh F',
      product: 'Wholesale Chicken',
      readAt: new Date(),
      role: 'sell',
    },
    {
      _id: '5baz6',
      transactionType: 'completed',
      address: '0x56Be343B94f860124dC4fEe278FDCBD38C102D88',
      name: 'Micah A',
      product: 'Blue Suede Shoes',
      readAt: null,
      role: 'buy',
    },
    {
      _id: '7qux8',
      transactionType: 'confirmed-withdrawal',
      address: '0x78Be343B94f860124dC4fEe278FDCBD38C102D88',
      readAt: new Date(),
      role: 'buy',
    },
  ],
}
