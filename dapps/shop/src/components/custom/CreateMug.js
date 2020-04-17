import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'

import useConfig from 'utils/useConfig'
import useIsMobile from 'utils/useIsMobile'
import Modal from 'components/custom/ModalMug'

const CreateMug = () => {
  const { config } = useConfig()
  const [modal, showModal] = useState(false)
  const [done, setDone] = useState(false)
  const [uploadError, setUploadError] = useState(false)
  const [url, setUrl] = useState('')
  // 'https://twitter.com/realDonaldTrump/status/1222487526780346370'
  const [tweetId, setTweetId] = useState()
  const [error, setError] = useState('')
  const history = useHistory()
  const isMobile = useIsMobile()

  if (config.fullTitle !== 'Tweet Shop') {
    return null
  }

  let content = (
    <>
      <label className="mr-2">Paste a Tweet URL:</label>
      <div style={{ flex: 1 }} className="mr-2 input-wrap">
        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          className={`form-control${error ? ' is-invalid' : ''} w-100`}
          placeholder="eg https://twitter.com/elonmusk/status/1012783222386712576"
        />
        {!error ? null : <div className="invalid-feedback">{error}</div>}
      </div>
      <button type="submit" className="btn btn-primary">
        Create Custom Mug!
      </button>
    </>
  )
  if (isMobile) {
    content = (
      <>
        <label>Paste a Tweet URL to create your own mug:</label>
        <div style={{ flex: 1 }} className="mr-2 input-wrap input-group">
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            className={`form-control${error ? ' is-invalid' : ''} w-100`}
            placeholder="eg https://twitter.com/elonmusk/status/1012783222386712576"
          />
          <div className="input-group-append">
            <button type="submit" className="btn btn-primary">
              Go
            </button>
          </div>
          {!error ? null : <div className="invalid-feedback">{error}</div>}
        </div>
      </>
    )
  }

  return (
    <>
      <form
        onSubmit={e => {
          e.preventDefault()
          const match = url.match(
            /^https:\/\/twitter.com\/.*\/status\/([0-9]+)/
          )
          if (!url) {
            setError('')
          } else if (!match || !match[1]) {
            setError('Please paste a valid Twitter Status URL')
          } else {
            showModal(true)
            setTweetId(match[1])
            fetch(`${config.customBackend}/upload/${match[1]}`)
              .then(() => {
                setDone(true)
              })
              .catch(() => {
                setUploadError(true)
              })
          }
        }}
        className="create-mug form-inline"
      >
        {content}
      </form>
      {modal ? (
        <Modal
          done={done}
          error={uploadError}
          onDone={() => {
            history.push(`/products/tweet-${tweetId}`)
          }}
          onClose={() => showModal(false)}
        />
      ) : null}
    </>
  )
}

export default CreateMug

require('react-styl')(`
  .create-mug
    margin-top: -1rem
    margin-bottom: 2rem
    align-items: start
  @media (min-width: 767.98px)
    .create-mug
      label
        height: 2.25rem
  @media (max-width: 767.98px)
    .create-mug
      margin-top: -2rem
      margin-bottom: 1rem
      flex-direction: column
      label
        margin-bottom: 0.25rem
      .input-wrap
        width: 100%
      button
        align-self: flex-end
      > *
        margin-bottom: 0.75rem
`)
