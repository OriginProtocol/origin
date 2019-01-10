import { Position, Toaster } from '@blueprintjs/core'
import Styl from 'react-styl'

export default Toaster.create({
  position: Position.TOP_RIGHT
})

Styl(`
  .bp3-toast-container
    margin-top: 45px
`)
