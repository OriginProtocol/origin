import moment from 'moment'

export default {
  transactions: [
    {
      createdAt: moment().subtract(1, 'second').toDate(),
      from: '0x12Be343B94f860124dC4fEe278FDCBD38C102D88',
      to: '0x34Be343B94f860124dC4fEe278FDCBD38C102D88',
      message: 'Matt L. has purchased your listing Super Lambo',
    },
    {
      createdAt: moment().subtract(1, 'minute').toDate(),
      to: '0x12Be343B94f860124dC4fEe278FDCBD38C102D88',
      from: '0x34Be343B94f860124dC4fEe278FDCBD38C102D88',
      message: 'You purchased a listing Giant Racing Chickens',
    },
    {
      createdAt: moment().subtract(1, 'hour').toDate(),
      from: '0x12Be343B94f860124dC4fEe278FDCBD38C102D88',
      to: '0x34Be343B94f860124dC4fEe278FDCBD38C102D88',
      message: 'Josh F. left a review and confirmed receipt of something',
    },
    {
      createdAt: moment().subtract(1, 'day').toDate(),
      to: '0x12Be343B94f860124dC4fEe278FDCBD38C102D88',
      from: '0x34Be343B94f860124dC4fEe278FDCBD38C102D88',
      message: 'You marked something as shipped',
    },
  ],
}
