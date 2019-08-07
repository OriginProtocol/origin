import React, { useState } from 'react'
import { fbt } from 'fbt-runtime'

// import Modal from 'components/Modal'
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
    <React.Fragment>
      {isMobile ? (
        <React.Fragment>
          <a
            className="sortButtonBar"
            href="#"
            onClick={e => {
              e.preventDefault()
              handleSortVisible(true)
            }}
          >
            Sort by
          </a>
          {RenderMobileSort()}
        </React.Fragment>
      ) : (
        <SortDropdown
          onChange={onChange}
          selectedOption={selectedOption}
          sortVisible={sortVisible}
          handleSortVisible={handleSortVisible}
          isMobile={isMobile}
        />
      )}
    </React.Fragment>
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
          className="nav-link sortButton"
          href="#"
          onClick={e => {
            e.preventDefault()
            handleSortVisible(true)
          }}
          role="button"
          aria-haspopup="true"
          aria-expanded="false"
        >
          Sort by
        </a>
      </Dropdown>
    )
  }
}

const SortContent = ({ selectedOption, onChange, isMobile }) => {
  const containerClass = isMobile
    ? ''
    : 'dropdown-menu dropdown-menu-left show sortDropDown'
  return (
    <div className={containerClass}>
      <form className="sortForm">
        <div>
          <label className="sortRadioLabel">
            <input
              type="radio"
              className="sortRadioButton"
              value=":"
              checked={selectedOption === ':'}
              onChange={onChange}
            />
            Default
          </label>
        </div>
        <div>
          <label className="sortRadioLabel">
            <input
              type="radio"
              className="sortRadioButton"
              value="price.amount:asc"
              checked={selectedOption === 'price.amount:asc'}
              onChange={onChange}
            />
            Price: Low to High
          </label>
        </div>
        <div>
          <label className="sortRadioLabel">
            <input
              type="radio"
              className="sortRadioButton"
              value="price.amount:desc"
              onChange={onChange}
              checked={selectedOption === 'price.amount:desc'}
            />
            Price: High to Low
          </label>
        </div>
      </form>
    </div>
  )
}

export default withIsMobile(SortMenu)

require('react-styl')(`
  .sortButtonBar
    display: flex;
    justify-content: flex-end;
    padding: 1rem;
    font-size: medium
    width: 100%
  .sortButton
    color: var(--dusk)
    font-size: 14px;
    font-weight: bold;
    font-style: normal;
  .sortButton:hover
    color: var(--dusk)
  .sortDropDown
    padding: 0;
    position: absolute !important;
    margin-top: 0;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
    border-radius: 0 0 5px 5px;
    border: 1px solid var(--light);
    font-weight: normal;
    min-width: 12rem
  .sortForm
    padding: 0.625rem;
  .sortRadioLabel
    padding: 0.1rem 0rem;
    display: flex;
    align-items: center;
    font-size: 0.9rem
  .sortRadioButton
    margin-right: 0.5rem
    padding: 0;
    height: 1.1rem;
    width: 1.1rem;
    box-sizing: border-box;
`)
