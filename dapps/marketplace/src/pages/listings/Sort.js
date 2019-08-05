import React, { useState } from 'react'
import { fbt } from 'fbt-runtime'

import Modal from 'components/Modal'
import MobileModal from 'components/MobileModal'

import withIsMobile from 'hoc/withIsMobile'

const Sort = ({ onClose, openSort, isMobile }) => {
  const [closeModal, setCloseModal] = useState(false)

  const ModalComp = isMobile ? MobileModal : Modal
  return (
    <>
      {openSort && (
        <ModalComp
          title={fbt('Sort by', 'Sort by')}
          className="availability-modal"
          shouldClose={closeModal}
          lightMode={true}
          onClose={() => {
            setCloseModal(false)
            onClose()
          }}
        >
          <>
            <form>
              <div className="radio">
                <label>
                  <input
                    type="radio"
                    name="sort"
                    value="default"
                    checked={true}
                  />
                  Default
                </label>
              </div>
              <div className="radio">
                <label>
                  <input type="radio" name="sort" value="price:asc" />
                  Price: Low to High
                </label>
              </div>
              <div className="radio">
                <label>
                  <input type="radio" name="sort" value="price:desc" />
                  Price: High to Low
                </label>
              </div>
            </form>
          </>
        </ModalComp>
      )}
    </>
  )
}
export default withIsMobile(Sort)

require('react-styl')(`
  .timeZone
    font-size: 14px
    margin-bottom: 1rem
`)
