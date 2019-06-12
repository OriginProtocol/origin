import React, { Component } from 'react'
import { Button, Menu, MenuItem, Popover } from '@blueprintjs/core'

import { query } from '../../utils/discovery'

const ALL_TAGS = [
  { tag: 'Super Featured', icon: 'clean' },
  { tag: 'Featured', icon: 'star' },
  { tag: 'High Quality', icon: 'thumbs-up' },
  { tag: 'Normal', icon: 'circle' },
  { tag: 'Low Quality', icon: 'thumbs-down' },
  { tag: 'Hide', icon: 'ban-circle' },
  { tag: 'Super Hide', icon: 'ban-circle' }
]

const SCORING_QUERY = `
query ($id: ID!){
  listing(id:$id){
        id
        scoreTags
    }
}
`

const SCORING_TAG_MUTATION = `
mutation($id: ID!, $scoreTags: [String!]) {
  listingSetScoreTags(
    id: $id,
    scoreTags: $scoreTags
  ){
    id,
    scoreTags
  }
}`

class EditScoring extends Component {
  constructor(props) {
    super(props)
    this.state = {
      scoreTags: [],
      hasScoresFromServer: false,
      isSending: false
    }
    this.listingId = props.listing.id
    this.loadTags()
  }

  async loadTags() {
    const data = await query(SCORING_QUERY, { id: this.listingId })
    const listing = data.data.listing
    this.setState({
      hasScoresFromServer: true,
      scoreTags: listing.scoreTags
    })
  }

  async setTag(tagName) {
    const tags = [tagName]
    this.setState({
      tags,
      isLoading: true
    })
    const variables = {
      id: this.listingId,
      scoreTags: tags
    }
    const data = await query(SCORING_TAG_MUTATION, variables)
    const listing = data.data.listingSetScoreTags
    this.setState({
      scoreTags: listing.scoreTags,
      isLoading: false
    })
  }

  render() {
    const currentTags = this.state.scoreTags
    const activeTag = ALL_TAGS.find(x => currentTags.indexOf(x.tag) !== -1)
    if (!this.state.hasScoresFromServer) {
      return <div>Loading...</div>
    }
    const isLoading = this.state.isSending
    const menu = (
      <Menu>
        {ALL_TAGS.map(t => (
          <MenuItem
            text={t.tag}
            icon={t.icon}
            key={t.tag}
            onClick={() => {
              this.setTag(t.tag)
            }}
          />
        ))}
      </Menu>
    )
    return (
      <div>
        <Popover content={menu}>
          {activeTag ? (
            <Button
              text={activeTag.tag}
              icon={activeTag.icon}
              active={isLoading}
            />
          ) : (
            <Button text="Moderate..." />
          )}
        </Popover>
      </div>
    )
  }
}

export default EditScoring
