import React, { Component } from 'react';
import { render } from 'react-dom';

class NavigationBar extends Component {
  render() {
    return (
      <nav className="navbar navbar-default">
        <div className="container">
          <div className="navbar-header">
            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#nav-links" aria-expanded="false">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <a className="navbar-brand" href="/">
              0rigin
            </a>
          </div>

          <div className="collapse navbar-collapse" id="nav-links">
            <ul className="nav navbar-nav navbar-right">
              <li><a href="/about"><div>About</div></a></li>
              <li><a href="/faqs"><div>FAQs</div></a></li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }
}

export default NavigationBar;
