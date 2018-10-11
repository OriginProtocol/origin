import React from 'react'
import { FormattedMessage } from 'react-intl'

const NotFound = () => {
  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <h1 className="error-page-header">
            <FormattedMessage
              id={'not-found.heading'}
              defaultMessage={'How did I get here?'}
            />
          </h1>
        </div>
      </div>
      <div className="row">
        <div className="col-12 col-md-6">
          <div className="indented">
            <FormattedMessage
              id={'not-found.content'}
              defaultMessage={
                'The page you’re looking for is no longer here, maybe it was never here in the first place. In any case, we sincerely apologize if it’s us and we forgive you if it’s you :)'
              }
            />
          </div>
        </div>
      </div>
      <div className="error-content-section">
        <div className="images-container">
          <img src="/images/mask.svg" alt="background mask" className="mask" />
          <img src="/images/404.svg" alt="status code" className="code" />
          <img src="/images/blocks-1.svg" alt="blocks" className="blocks-1" />
          <img src="/images/blocks-2.svg" alt="blocks" className="blocks-2" />
          <img src="/images/dude.svg" alt="dude" className="dude" />
        </div>
      </div>
    </div>
  )
}

export default NotFound
