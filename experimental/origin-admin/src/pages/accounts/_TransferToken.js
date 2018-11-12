import React from 'react'
import { Mutation } from 'react-apollo'
import { Button, Tooltip } from '@blueprintjs/core'

import { TransferTokenMutation } from '../../mutations'

import Toaster from '../../Toaster'

// import fragments from '../../fragments'

// mutation sendFromNode($from: String, $to: String, $value: String) {
//   sendFromNode(from: $from, to: $to, value: $value) {
//     fromAccount
//     toAccount
//   }
// }
// { "from": "0xBECf244F615D69AaE9648E4bB3f32161A87caFF1",
//  "to": "0x25A7ACe6bD49f1dB57B11ae005EF40ae30195Ef6",
//  "value": "1"}

const SendFromNodeBtn = ({ token, from, to, value }) => (
  <Mutation mutation={TransferTokenMutation} onError={error => {
    Toaster.show({ message: `Error ${error}`})
  }}>
    {(transferToken, { loading }) => (
      <Tooltip content="Fund with 0.5 ETH">
        <Button
          icon="dollar"
          loading={loading}
          onClick={() =>
            transferToken({ variables: { token, from, to, value } })
          }
        />
      </Tooltip>
    )}
  </Mutation>
)

export default SendFromNodeBtn
