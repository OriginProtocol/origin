import React from 'react'

import withNews from '../hoc/withNews'

const NewsHeadlinesCard = () => (
  <div className="card-wrapper">
    <div className="row header">
      <div className="col">
        <h2>News</h2>
      </div>
    </div>
  </div>
)

export default withNews(NewsHeadlinesCard)

require('react-styl')(`
`)
