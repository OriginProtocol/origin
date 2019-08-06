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
  // console.log(`sort -${sort}- order -${order}-`)
  const selectedOption = `${sort}:${order}`
  console.log(`selectedOption -${selectedOption}-`)

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
            className="nav-link"
            href="#"
            onClick={e => {
              e.preventDefault()
              handleSortVisible(true)
            }}
          >
            Sort
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
  state = {}
  // componentDidUpdate(prevProps) {
  //   // if (unread > prevUnread && !prevProps.open) {
  //   //   this.props.onOpen()
  //   // }
  //   // if (this.state.redirect) {
  //   //   this.setState({ redirect: false })
  //   // }
  // }

  render() {
    // if (this.state.redirect) {
    //   return <Redirect to={`/purchases/${this.state.redirect.offer.id}`} push />
    // }

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
        className="nav-item notifications d-none d-md-flex"
        open={sortVisible}
        onClose={() => handleSortVisible(false)}
        onChange={onChange}
        content={content}
        title={'TEST'}
      >
        <a
          className="nav-link"
          href="#"
          onClick={e => {
            e.preventDefault()
            handleSortVisible(true)
          }}
          role="button"
          aria-haspopup="true"
          aria-expanded="false"
        >
          Sort
        </a>
      </Dropdown>
    )
  }
}

const SortContent = ({ selectedOption, onChange, isMobile }) => {
  const title = fbt('listings.sort', 'Sort by')
  const containerClass = isMobile ? '' : 'dropdown-menu dropdown-menu-left show'
  return (
    <div className={containerClass}>
      <div className="title">{title}</div>
      <form>
        <div className="radio">
          <label>
            <input
              type="radio"
              value=":"
              checked={selectedOption === ':'}
              onChange={onChange}
            />
            Default
          </label>
        </div>
        <div className="radio">
          <label>
            <input
              type="radio"
              value="price.amount:asc"
              checked={selectedOption === 'price.amount:asc'}
              onChange={onChange}
            />
            Price: Low to High
          </label>
        </div>
        <div className="radio">
          <label>
            <input
              type="radio"
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
  .timeZone
    font-size: 14px
    margin-bottom: 1rem
`)
