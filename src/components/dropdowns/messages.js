import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'

import DialogueListItem from '../dialogue-list-item'

import data from '../../data'

// may not be necessary when using real data
const groupByArray = (xs, key) => {
  return xs.reduce((rv, x) => {
    let v = key instanceof Function ? key(x) : x[key]
    let el = rv.find((r) => r && r.key === v)

    if (el) {
      el.values.push(x)
    } else {
      rv.push({ key: v, values: [x] })
    }

    return rv
  }, [])
}

class MessagesDropdown extends Component {
  constructor(props) {
    super(props)

    const dialogues = groupByArray(data.messages, 'dialogueId')
    const mostRecent = dialogues[0] || {}

    this.state = { dialogues }
  }

  render() {
    const { history } = this.props
    const { dialogues } = this.state

    return (
      <div className="nav-item messages dropdown">
        <a className="nav-link active dropdown-toggle" id="messagesDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <div className="unread-indicator"></div>
          <img src="images/messages-icon.svg" className="messages" alt="Messages" />
          <img src="images/messages-icon-selected.svg" className="messages selected" alt="Messages" />
        </a>
        <div className="dropdown-menu dropdown-menu-right" aria-labelledby="messagesDropdown">
          <div className="triangle-container d-flex justify-content-end"><div className="triangle"></div></div>
          <div className="actual-menu">
            <header className="d-flex">
              <div className="count">
                <div className="d-inline-block">0</div>
              </div>
              <h3>
                <FormattedMessage
                  id={ 'messagesDropdown.messagesHeading' }
                  defaultMessage={ 'Unread Messages' }
                />
              </h3>
            </header>
            <div className="messages-list">
              {dialogues.map(d => {
                return (
                  <DialogueListItem key={d.key} dialogue={d} active={false} handleDialogueSelect={() => history.push(`/messages/${d.key}`)} />
                )
              })}
            </div>
            <footer>
              <Link to="/messages">
                <FormattedMessage
                  id={ 'messagesDropdown.viewAll' }
                  defaultMessage={ 'View All' }
                />
              </Link>
            </footer>
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(MessagesDropdown)
