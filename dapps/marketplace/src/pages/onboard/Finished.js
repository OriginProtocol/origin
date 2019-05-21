import React, { useState } from 'react'

import Redirect from 'components/Redirect'
import UserProfileCreated from 'components/_UserProfileCreated'

const Finished = ({ linkPrefix, redirectto }) => {
  const continueTo = redirectto ? redirectto : `${linkPrefix}/onboard/back`

  const [finished, setFinished] = useState(false)

  if (finished) {
    return <Redirect to={continueTo} />
  }

  return (
    <div className="finished">
      <UserProfileCreated
        onCompleted={() => {
          setFinished(true)
        }}
      />
    </div>
  )
  // return (
  //   <div className="finished">
  //     <h1>
  //       <fbt desc="onboard.Finished.congrats">Congratulations</fbt>
  //     </h1>
  //     <div className="help">
  //       <fbt desc="onboard.Finished.success">
  //         You’ve successfully activated your account. You’re now ready to
  //         continue your journey in the Origin Marketplace.
  //       </fbt>
  //     </div>
  //     <div className="lists">
  //       <div className="list-box completed">
  //         <fbt desc="onboard.Finished.stepsCompleted">
  //           <b>You have now completed the following:</b>
  //           <ul className="list-unstyled">
  //             <li>Wallet Creation</li>
  //             <li>Messaging Enabled</li>
  //             <li>Desktop Notifications Enabled</li>
  //           </ul>
  //         </fbt>
  //       </div>
  //       <div className="list-box remaining">
  //         <fbt desc="onboard.Finished.remainingSepts">
  //           <b>Remaining steps:</b>
  //           <ul className="list-unstyled">
  //             <li>Fund your wallet</li>
  //             <li>Complete your Profile</li>
  //           </ul>
  //         </fbt>
  //       </div>
  //     </div>

  //     <Link
  //       to={continueTo}
  //       className={`btn btn-primary`}
  //       children={fbt('OK', 'OK')}
  //     />
  //   </div>
  // )
}

export default Finished

require('react-styl')(`
  .onboard .finished
    max-width: 475px
    margin: 0 auto
    .profile-created
      .info
        text-align: center
        border-radius: 5px
        border: solid 1px var(--bluey-grey)
        background-color: rgba(152, 167, 180, 0.1)
        font-family: Lato
        font-size: 14px
        color: black
        padding: 10px
        margin-top: 1rem
        .title
          display: block
          font-weight: bold
          margin-bottom: 3px
          & ~ a
            margin-left: 5px
        &.white
          border: solid 1px #c2cbd3
          background-color: white
          display: flex
          text-align: left
          .image
            flex: auto 0 0
            img
              margin-right: 1rem
          .content
            flex: auto 1 1
`)
