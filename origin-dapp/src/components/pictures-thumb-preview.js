import React, { Component } from 'react'
import { injectIntl } from 'react-intl'

class PicturesThumbPreview extends Component {
  constructor(props){
    super(props)
    this.state = {
      featuredImageIdx: 0
    }
    this.setFeaturedImage = this.setFeaturedImage.bind(this)
  }

  setFeaturedImage(idx) {
    this.setState({
      featuredImageIdx: idx
    })
  }

  render(){
    const featuredImageIdx = this.state.featuredImageIdx
    const { pictures, wrapClassName } = this.props

    return (
      <div className={ wrapClassName }>
        <img
          className="featured-image"
          src={pictures[featuredImageIdx]}
        />
        {pictures.length > 1 &&
          <div className="photo-row">
            {pictures.map((pictureUrl, idx) => (
              <img
                onClick={() => this.setFeaturedImage(idx)}
                src={pictureUrl}
                key={idx}
                role="presentation"
                className={featuredImageIdx === idx ? 'featured-thumb' : ''}
              />
            ))}
          </div>
        }
      </div>
    )
  }
}

export default injectIntl(PicturesThumbPreview)