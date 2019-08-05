import React, { useState } from 'react'
import { fbt } from 'fbt-runtime'

import Modal from 'components/Modal'
import MobileModal from 'components/MobileModal'

import withIsMobile from 'hoc/withIsMobile'

const Sort = ({ onClose, openSort, isMobile, onChange, sort }) => {
  const [closeModal, setCloseModal] = useState(false)

  const ModalComp = isMobile ? MobileModal : Modal
  console.log('sort - ', sort)

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
                    value="default"
                    checked={sort === 'default'}
                    onChange={onChange}
                  />
                  Default
                </label>
              </div>
              <div className="radio">
                <label>
                  <input
                    type="radio"
                    value="price:asc"
                    checked={sort === 'price:asc'}
                    onChange={onChange}
                  />
                  Price: Low to High
                </label>
              </div>
              <div className="radio">
                <label>
                  <input
                    type="radio"
                    value="price:desc"
                    onChange={onChange}
                    checked={sort === 'price:desc'}
                  />
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
