import V00_MarkeplaceAdapter from '../v00/marketplace_adapter'

class V01_MarkeplaceAdapter extends V00_MarkeplaceAdapter {
  constructor() {
    super(...arguments)
    this.contractName = 'V01_Marketplace'
  }
}

export default V01_MarkeplaceAdapter
