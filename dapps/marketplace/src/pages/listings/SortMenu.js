import React, { useState } from 'react'
import { fbt } from 'fbt-runtime'

import Dropdown from 'components/Dropdown'
import MobileModal from 'components/MobileModal'

import withIsMobile from 'hoc/withIsMobile'

const SORT_OPTIONS = [
  {
    value: ':',
    label: <fbt desc="Featured">Featured</fbt>
  },
  {
    value: 'price.amount:asc',
    label: <fbt desc="Price: Low to High">Price: Low to High</fbt>
  },
  {
    value: 'price.amount:desc',
    label: <fbt desc="Price: High to Low">Price: High to Low</fbt>
  }
]

const SortMenu = ({ onClose, isMobile, onChange, sort, order }) => {
  const [closeModal, setCloseModal] = useState(false)
  const [modal, setModal] = useState(false)
  const selectedOption = sort && order ? `${sort}:${order}` : ':'

  const selectedOptionObj = SORT_OPTIONS.find(x => x.value === selectedOption)

  let textContent =
    !selectedOptionObj || selectedOption === ':' ? (
      <fbt desc="Sort">Sort</fbt>
    ) : (
      <fbt desc="Sort.sortedBy">
        Sort: <fbt:param name="selectedOp">{selectedOptionObj.label}</fbt:param>
      </fbt>
    )

  return (
    <>
      {isMobile ? (
        <>
          <button
            type="button"
            className="btn btn-link sort-button"
            onClick={() => {
              setModal(true)
            }}
          >
            {textContent}
          </button>
          {modal && (
            <MobileModal
              title={fbt('Sort by', 'Sort by')}
              className="sort-modal"
              shouldClose={closeModal}
              lightMode={true}
              onClose={() => {
                setCloseModal(false)
                setModal(false)
                onClose()
              }}
            >
              <SortContent
                onChange={e => {
                  onChange(e)
                }}
                selectedOption={selectedOption}
                isMobile={isMobile}
              />
            </MobileModal>
          )}
        </>
      ) : (
        <div className="container">
          <SortDropdown
            onChange={onChange}
            selectedOption={selectedOption}
            isMobile={isMobile}
            content={textContent}
          />
        </div>
      )}
    </>
  )
}

const SortDropdown = ({
  onChange,
  selectedOption,
  isMobile,
  content: textContent
}) => {
  const [open, setOpen] = useState(false)

  const content = (
    <SortContent
      selectedOption={selectedOption}
      onChange={args => {
        onChange(args)
        setOpen(false)
      }}
      isMobile={isMobile}
    />
  )

  return (
    <Dropdown
      el="li"
      className="d-md-flex dropdown"
      open={open}
      onClose={() => setOpen(false)}
      content={content}
    >
      <button
        type="button"
        className="btn btn-link sort-button"
        onClick={() => {
          setOpen(true)
        }}
        aria-haspopup="true"
        aria-expanded="false"
      >
        {textContent}
      </button>
    </Dropdown>
  )
}

const SortContent = ({ selectedOption, onChange, isMobile }) => {
  const containerClass = isMobile
    ? ''
    : 'dropdown-menu dropdown-menu-left show sort-dropdown'
  return (
    <div className={containerClass}>
      <form className="sort-form">
        {SORT_OPTIONS.map((sortOption, index) => (
          <div key={index}>
            <label
              className={`sort-radio-label${
                (selectedOption || ':') === sortOption.value ? ' checked' : ''
              }`}
            >
              <input
                type="radio"
                className="sort-radio-button"
                value={sortOption.value}
                checked={selectedOption === sortOption.value}
                onChange={onChange}
              />
              {sortOption.label}
            </label>
          </div>
        ))}
      </form>
    </div>
  )
}

export default withIsMobile(SortMenu)

require('react-styl')(`
  .sort-modal
    &.modal-content
      min-height: auto
    &.modal-header
      .modal-title
        display: flex
        div
          flex: 1
        .clear-button, .close-button
          font-size: 12px
          flex: auto 0 0
          cursor: pointer
          font-weight: 300
        .close-button
          content: ''
          display: inline-block
          background-image: url('images/close-icon.svg')
          background-position: center
          background-repeat: no-repeat
          background-size: 1rem
          height: 2rem
          width: 2rem
        .clear-button
          text-decoration: none
          color: var(--bright-blue)
          &:hover
            color: var(--bright-blue)
  @media (max-width: 767.98px)
    .sort-modal
      padding: 1rem
      &.modal-content
        padding: 0 1rem
        .sort-form
          padding: 0
          label
            border: solid 1px #c2cbd3
            border-radius: 10px
            position: relative
            padding: 0.75rem 1rem
            input
              display: none
            &.checked:after
              content: ''
              display: inline-block
              background-image: url('images/checkmark-icon.svg')
              background-position: center
              background-repeat: no-repeat
              background-size: 1.75rem
              position: absolute
              top: 0
              bottom: 0
              right: 0
              width: 3rem

  .dropdown
    width: 75px
  .sort-dropdown
    padding: 0
    position: absolute !important
    margin-top: 0
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1)
    border-radius: 5px
    border: 1px solid var(--light)
    font-weight: normal
    min-width: 12rem
  .sort-form
    padding: 0.625rem
  .sort-radio-label
    padding: 0.1rem 0rem
    display: flex
    align-items: flex-end
    font-size: 0.9rem
  .sort-radio-button
    margin-right: 0.5rem
    padding: 0
    height: 1.1rem
    width: 1.1rem
    box-sizing: border-box
    vertical-align: middle
    margin-bottom: 1px
  .btn.sort-button
    font-weight: normal
    white-space: nowrap
`)
