import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/app'

import {contractService, ipfsService, originService} from 'origin'

// console.log(contractService)
// console.log(ipfsService)
// console.log(originService)
// debugger

ReactDOM.render(<App />, document.getElementById('root'))
