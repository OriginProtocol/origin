import React from 'react'
import { useHistory } from 'react-router-dom'
import { useToasts } from 'react-toast-notifications'

import CollectionForm from 'components/Edit/CollectionForm'
import store from '@/store'

const CollectionAdd = () => {
  const history = useHistory()
  const { addToast } = useToasts()

  const handleSave = collection => {
    store.update(s => {
      s.collections.push(collection)
    })

    addToast('Collection added!', { appearance: 'success', autoDismiss: true })

    goBack()
  }

  const goBack = () => {
    if (history.length > 1) {
      history.goBack()
    } else {
      history.go('/edit/collections')
    }
  }

  return (
    <>
      <div className="d-flex justify-content-between">
        <h3>Add Collection</h3>
      </div>

      <a
        onClick={e => {
          e.preventDefault()
          goBack()
        }}
      >
        Back
      </a>

      <CollectionForm onSave={collection => handleSave(collection)} />
    </>
  )
}

export default CollectionAdd
