import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'

import { editUser } from '@/actions/user'
import { getIsEditing as getUserIsEditing } from '@/reducers/user'
import { getNextOnboardingPage } from '@/utils'

const RevisedTerms = ({ editUser, user, userIsEditing }) => {
  const [accepted, setAccepted] = useState(false)
  const [redirectTo, setRedirectTo] = useState(null)

  const handleSubmit = async () => {
    const result = await editUser({
      revisedScheduleAgreedAt: moment()
    })
    if (result.type === 'EDIT_USER_SUCCESS') {
      setRedirectTo(getNextOnboardingPage(result.payload))
    }
  }

  const renderStrategicAmendments = () => {
    return (
      <>
        <p>
          <strong>
            AMENDMENT TO SIMPLE AGREEMENTS FOR FUTURE TOKENS (SERIES 2018-25%)
          </strong>
        </p>

        <p>
          This AMENDMENT TO SIMPLE AGREEMENTS FOR FUTURE TOKENS (this
          &ldquo;Amendment&rdquo;) is made on and as of 9/1/2019 and amends the
          Simple Agreements for Future Tokens (Series 2018-25%) (each, a
          &ldquo;SAFT&rdquo; and collectively, the &ldquo;SAFTs&rdquo;), by and
          between Origin Protocol, Inc., a Delaware corporation (the
          &ldquo;Company&rdquo;) and the purchasers identified therein
          (collectively, the &ldquo;Purchasers&rdquo;), and has been executed by
          the Company and the Purchasers who are signatories hereto,
          collectively constituting the requisite parties required to effect an
          amendment under Section 6(a) of the SAFTs. Capitalized terms used but
          not defined herein have the respective meanings ascribed to them in
          the SAFTs.
        </p>

        <p>
          <strong>RECITAL:</strong>
        </p>

        <p>
          The Company desires to amend the terms of the SAFTs on the terms set
          forth herein, and the signatories hereto desire to approve this
          Amendment.
        </p>

        <p>
          <strong>AGREEMENT:</strong>
        </p>

        <p>
          NOW, THEREFORE, in consideration of the foregoing, and for other good
          and valuable consideration, the receipt and sufficiency of which are
          hereby acknowledged, the parties hereto, being the requisite
          signatories required to amend the SAFTs, hereby agree that all of the
          SAFTs are amended as set forth below:
        </p>

        <p>
          1. Amendment to Section 1(a). The last sentence of Section 1(a) is
          amended and restated in its entirety to reads as follows: &ldquo;The
          Company, or an affiliate thereof (the &ldquo;Issuer&rdquo;), will
          deliver the applicable Tokens to the Purchaser in eight (8) equal
          quarterly installments (rounded down to the nearest whole Token,
          except for the last installment) beginning on the date that is four
          (4) months following the date of the Application Launch, provided that
          the Issuer may accelerate delivery of the Tokens in its sole
          discretion.&rdquo;
        </p>

        <p>
          2. Amendment to Section 6(d). The following is added to the end of the
          last sentence of Section 6(d): &ldquo;or to an affiliate of the
          Company.&rdquo;
        </p>

        <p>
          3. Remaining Provisions. Upon the effectiveness of this Amendment,
          each reference in the SAFTs to &ldquo;this SAFT,&rdquo;
          &ldquo;hereunder,&rdquo; &ldquo;hereof,&rdquo; &ldquo;herein,&rdquo;
          or words of like import shall mean and be a reference to the SAFT as
          amended hereby, and each reference to the SAFT in any other document,
          instrument or agreement executed or delivered in connection with the
          SAFT shall mean and be a reference to the SAFT as amended hereby. All
          provisions of the SAFT not specifically amended by this Amendment
          shall remain in full force and effect.
        </p>

        <p>
          4. Miscellaneous. This Amendment may be executed in one or more
          counterparts (including facsimile, PDF, or other electronic
          counterparts), each of which, when taken together, shall constitute
          but one and the same agreement. This Amendment shall be binding on all
          parties to the SAFTs (including those who are not signatories of this
          Amendment) pursuant to the applicable provisions of the SAFTs.
        </p>
      </>
    )
  }

  const renderCoinListAmendments = () => {
    return (
      <>
        <p>
          <strong>
            AMENDMENT TO PURCHASE AGREEMENTS FOR THE RIGHT TO RECEIVE TOKENS
            (SERIES 2018-CL)
          </strong>
        </p>

        <p>
          This AMENDMENT TO PURCHASE AGREEMENTS FOR THE RIGHT TO RECEIVE TOKENS
          (this &ldquo;Amendment&rdquo;) is made on and as of October 2, 2019
          and amends the Purchase Agreements for the Right to Receive Tokens
          (Series 2018-CL) (each, a &ldquo;Purchase Agreement&rdquo; and
          collectively, the &ldquo;Purchase Agreements&rdquo;), by and between
          Origin Protocol, Inc., a Delaware corporation (the
          &ldquo;Company&rdquo;) and the purchasers identified therein
          (collectively, the &ldquo;Purchasers&rdquo;), and has been executed by
          the Company and the Purchasers who are signatories hereto,
          collectively constituting the requisite parties required to effect an
          amendment under Section 6(a) of the Purchase Agreements. Capitalized
          terms used but not defined herein have the respective meanings
          ascribed to them in the Purchase Agreements.
        </p>

        <p>
          <strong>RECITAL:</strong>
        </p>

        <p>
          The Company desires to amend the terms of the Purchase Agreements on
          the terms set forth herein, and the signatories hereto desire to
          approve this Amendment.
        </p>

        <p>
          <strong>AGREEMENT:</strong>
        </p>

        <p>
          NOW, THEREFORE, in consideration of the foregoing, and for other good
          and valuable consideration, the receipt and sufficiency of which are
          hereby acknowledged, the parties hereto, being the requisite
          signatories required to amend the Purchase Agreements, hereby agree
          that all of the Purchase Agreements are amended as set forth below:{' '}
        </p>

        <p>
          1. Amendment to Section 1(a). The first clause of the first sentence
          of the last paragraph of Section 1(a) is amended and restated in its
          entirety to reads as follows: &ldquo;The Issuer will deliver the
          applicable Tokens to the Purchaser in eight (8) equal quarterly
          installments (rounded down to the nearest whole Token, except for the
          last installment) beginning on the date that is four (4) months
          following the date of the Application Launch (as defined below),
          provided that the Issuer may accelerate delivery of the Tokens in its
          sole discretion;&rdquo;
        </p>

        <p>
          2. Remaining Provisions. Upon the effectiveness of this Amendment,
          each reference in the Purchase Agreements to &ldquo;this Purchase
          Agreement,&rdquo; &ldquo;hereunder,&rdquo; &ldquo;hereof,&rdquo;
          &ldquo;herein,&rdquo; or words of like import shall mean and be a
          reference to the Purchase Agreement as amended hereby, and each
          reference to the Purchase Agreement in any other document, instrument
          or agreement executed or delivered in connection with the Purchase
          Agreement shall mean and be a reference to the Purchase Agreement as
          amended hereby. All provisions of the Purchase Agreement not
          specifically amended by this Amendment shall remain in full force and
          effect.
        </p>

        <p>
          3. Miscellaneous. This Amendment may be executed in one or more
          counterparts (including facsimile, PDF, or other electronic
          counterparts), each of which, when taken together, shall constitute
          but one and the same agreement. This Amendment shall be binding on all
          parties to the Purchase Agreements (including those who are not
          signatories of this Amendment) pursuant to the applicable provisions
          of the Purchase Agreements.{' '}
        </p>
      </>
    )
  }

  if (redirectTo) {
    return <Redirect push to={redirectTo} />
  }

  return (
    <>
      <div className="action-card">
        <h1>Investor Amendment Agreement</h1>
        <p>
          Please agree to the investor amendment below to use the Origin
          Investor Portal.
        </p>
        <div className="form-group">
          <div className="terms-wrapper">
            {user.investorType === 'CoinList'
              ? renderCoinListAmendments()
              : renderStrategicAmendments()}
          </div>
        </div>
        <p>
          If you do not agree with the proposed amendment, you can contact
          Origin Investor Relations at{' '}
          <a href="mailto:investor-relations@originprotocol.com">
            investor-relations@originprotocol.com
          </a>
        </p>
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="acceptCheck"
            onClick={e => setAccepted(e.target.checked)}
            defaultChecked
          />
          <label className="form-check-label mt-0" htmlFor="acceptCheck">
            I have read and agree to the Revised Token Unlock Schedule Agreement
          </label>
        </div>
        <button
          className="btn btn-secondary btn-lg mt-5"
          onClick={handleSubmit}
          disabled={!accepted || userIsEditing}
        >
          Accept Agreement
        </button>
      </div>
    </>
  )
}

const mapStateToProps = ({ user }) => {
  return {
    userIsEditing: getUserIsEditing(user)
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      editUser: editUser
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RevisedTerms)
