import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useStoreState } from 'pullstate'
import { useToasts } from 'react-toast-notifications'

import CollectionForm from 'components/Edit/CollectionForm'
import store from '@/store'

const CollectionEdit = () => {
  const collections = useStoreState(store, s => s.collections)
  const history = useHistory()
  const { addToast } = useToasts()

  const { collectionId } = useParams()
  const collection = collections[collectionId]

  const handleSave = updatedCollection => {
    store.update(s => {
      s.collections = [
        ...collections.slice(0, Number(collectionId)),
        updatedCollection,
        ...collections.slice(Number(collectionId) + 1)
      ]
    })

    addToast('Collection edited!', { appearance: 'success', autoDismiss: true })

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
        <h3>Edit Collection</h3>
      </div>

      <a
        onClick={e => {
          e.preventDefault()
          goBack()
        }}
      >
        Back
      </a>

      {collection && (
        <CollectionForm
          collection={collection}
          onSave={collection => handleSave(collection)}
        />
      )}
    </>
  )
}

export default CollectionEdit
