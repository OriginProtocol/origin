import React from 'react'

import withNews from '../../hoc/withNews'
import NewsCard from '../NewsCard'

const News = props => (
  <div>
    <h1>News</h1>
    <div className="row">
      <div className="col">
        <NewsCard {...props.news[0]} feature={true} />
      </div>
    </div>
    <div className="row">
      {props.news.slice(1, 4).map(item => (
        <div className="col" key={item.title}>
          <NewsCard
            {...item}
            description={item.description.substr(0, 120) + '...'}
          />
        </div>
      ))}
    </div>
  </div>
)

export default withNews(News)
