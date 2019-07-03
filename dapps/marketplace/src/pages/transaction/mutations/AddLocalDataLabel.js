import React, { Component } from 'react'
import { Mutation } from 'react-apollo'

import AddLocalDataLabelMutation from 'mutations/AddLocalDataLabel'

class AddLocalDataLabel extends Component {
  render() {
    return (
      <Mutation
        mutation={AddLocalDataLabelMutation}
        onCompleted={() => {
          if (this.props.refetch) {
            this.props.refetch()
          }
        }}
      >
        {addLocalDataLabel => (
          <button
            className={this.props.className}
            onClick={async () => {
              addLocalDataLabel(this.getVars())
              if (this.props.onClick) {
                await this.props.onClick()
              }
            }}
            children={this.props.children}
          />
        )}
      </Mutation>
    )
  }

  getVars() {
    return {
      variables: {
        objectID: String(this.props.objectId),
        label: String(this.props.dataLabelText)
      }
    }
  }
}

export default AddLocalDataLabel
