import React, { useState } from 'react'
import { fbt } from 'fbt-runtime'

import Dropdown from 'components/DropDown'
import MobileModal from 'components/MobileModal'

import withIsMobile from 'hoc/withIsMobile'

const SortMenu = ({
  onClose,
  sortVisible,
  isMobile,
  onChange,
  sort,
  order,
  handleSortVisible
}) => {
  const [closeModal, setCloseModal] = useState(false)
  const selectedOption = `${sort}:${order}`

  const RenderMobileSort = () => {
    if (sortVisible) {
      return (
        <MobileModal
          title={fbt('Sort by', 'Sort by')}
          className="availability-modal"
          shouldClose={closeModal}
          lightMode={true}
          onClose={() => {
            setCloseModal(false)
            onClose()
          }}
        >
          <SortContent
            onChange={onChange}
            selectedOption={selectedOption}
            isMobile={isMobile}
          />
        </MobileModal>
      )
    }
  }

  return (
    <>
      {isMobile ? (
        <>
          <a
            className="sort-button-bar"
            href="#"
            onClick={e => {
              e.preventDefault()
              handleSortVisible(true)
            }}
          >
            <fbt desc="Sort by">Sort By</fbt>
          </a>
          {RenderMobileSort()}
        </>
      ) : (
        <div className="container">
          <SortDropdown
            onChange={onChange}
            selectedOption={selectedOption}
            sortVisible={sortVisible}
            handleSortVisible={handleSortVisible}
            isMobile={isMobile}
          />
        </div>
      )}
    </>
  )
}

class SortDropdown extends React.Component {
  render() {
    const {
      sortVisible,
      onChange,
      selectedOption,
      handleSortVisible,
      isMobile
    } = this.props

    const content = (
      <SortContent
        selectedOption={selectedOption}
        onChange={onChange}
        isMobile={isMobile}
      />
    )

    return (
      <Dropdown
        el="li"
        className="d-md-flex"
        open={sortVisible}
        onClose={() => handleSortVisible(false)}
        onChange={onChange}
        content={content}
      >
        <a
          className="nav-link sort-button"
          href="#"
          onClick={e => {
            e.preventDefault()
            handleSortVisible(true)
          }}
          role="button"
          aria-haspopup="true"
          aria-expanded="false"
        >
          <fbt desc="Sort by">Sort By</fbt>
        </a>
      </Dropdown>
    )
  }
}

const SortContent = ({ selectedOption, onChange, isMobile }) => {
  const containerClass = isMobile
    ? ''
    : 'dropdown-menu dropdown-menu-left show sort-dropdown'
  return (
    <div className={containerClass}>
      <form className="sort-form">
        <div>
          <label className="sort-radio-label">
            <input
              type="radio"
              className="sort-radio-button"
              value=":"
              checked={selectedOption === ':'}
              onChange={onChange}
            />
            <fbt desc="Default">Default</fbt>
          </label>
        </div>
        <div>
          <label className="sort-radio-label">
            <input
              type="radio"
              className="sort-radio-button"
              value="price.amount:asc"
              checked={selectedOption === 'price.amount:asc'}
              onChange={onChange}
            />
            <fbt desc="Price: Low to High">Price: Low to High</fbt>
          </label>
        </div>
        <div>
          <label className="sort-radio-label">
            <input
              type="radio"
              className="sort-radio-button"
              value="price.amount:desc"
              onChange={onChange}
              checked={selectedOption === 'price.amount:desc'}
            />
            <fbt desc="Price: High to Low">Price: High to Low</fbt>
          </label>
        </div>
      </form>
    </div>
  )
}

export default withIsMobile(SortMenu)

require('react-styl')(`
  .sort-button-bar
    display: flex;
    justify-content: flex-end;
    padding: 1rem;
    font-size: medium
    width: 100%
  .sort-button
    color: var(--dusk)
    font-size: 14px;
    font-weight: bold;
    font-style: normal;
    /* padding-left: 0rem; */
  .sort-button:hover
    color: var(--dusk)
  .sort-dropdown
    padding: 0;
    position: absolute !important;
    margin-top: 0;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
    border-radius: 0 0 5px 5px;
    border: 1px solid var(--light);
    font-weight: normal;
    min-width: 12rem
  .sort-form
    padding: 0.625rem;
  .sort-radio-label
    padding: 0.1rem 0rem;
    display: flex;
    align-items: center;
    font-size: 0.9rem
  .sort-radio-button
    margin-right: 0.5rem
    padding: 0;
    height: 1.1rem;
    width: 1.1rem;
    box-sizing: border-box;
`)
