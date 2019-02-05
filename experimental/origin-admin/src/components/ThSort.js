import React, { Component } from 'react'
import { Button, Popover, Menu } from '@blueprintjs/core'

class ThSort extends Component {
  state = { open: false }
  render() {
    return (
      <th className={`th-sortable${this.state.open ? ' active' : ''}`}>
        <div>
          {this.props.children}
          <div className="blend">
            <Popover
              onOpening={() => this.setState({ open: true })}
              onClosing={() => this.setState({ open: false })}
              content={
                <Menu>
                  <Menu.Item
                    onClick={() => this.props.onSort()}
                    icon="sort-asc"
                    text="Sort Ascending"
                  />
                  <Menu.Item
                    onClick={() => this.props.onSort()}
                    icon="sort-desc"
                    text="Sort Descending"
                  />
                </Menu>
              }
            >
              <Button small={true} icon="chevron-down" />
            </Popover>
          </div>
        </div>
      </th>
    )
  }
}

export default ThSort

require('react-styl')(`
  .th-sortable
    padding: 0 !important
    > div
      padding: 6px 11px
      position: relative
      .blend
        opacity: 0
        background-image: linear-gradient(90deg, rgba(255, 255, 255, 0), #fff 80%);
        padding: 5px 6px 0 0
        position: absolute
        right: 0
        top: 0
        bottom: 0
        left: 0
        text-align: right
        .bp3-button
          min-width: 20px
          min-height: 20px

    &:hover,&.active
      > div .blend
        opacity: 1
  `)
