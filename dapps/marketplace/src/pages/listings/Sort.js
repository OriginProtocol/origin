import React, { useState } from 'react'
import { fbt } from 'fbt-runtime'

// import Modal from 'components/Modal'
import Dropdown from 'components/DropDown'
import MobileModal from 'components/MobileModal'

import withIsMobile from 'hoc/withIsMobile'

const Sort = ({
  onClose,
  sortVisible,
  isMobile,
  onChange,
  sort,
  handleSortVisible
}) => {
  const [closeModal, setCloseModal] = useState(false)
  console.log('sort - ', sort)

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
          <SortContent onChange={onChange} sort={sort} isMobile={isMobile} />
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
          sort={sort}
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
      sort,
      handleSortVisible,
      isMobile
    } = this.props

    const content = (
      <SortContent sort={sort} onChange={onChange} isMobile={isMobile} />
    )

    return (
      <Dropdown
        el="li"
        className="nav-item notifications d-none d-md-flex"
        open={sortVisible}
        onClose={() => handleSortVisible(false)}
        onChange={onChange}
        content={content}
        sort={sort}
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

const SortContent = ({ sort, onChange, isMobile }) => {
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
    </div>
  )
}

export default withIsMobile(Sort)

require('react-styl')(`
  .timeZone
    font-size: 14px
    margin-bottom: 1rem
`)
