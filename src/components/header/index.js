import React, { Component } from 'react';

import './header.css';

class Header extends Component {
  render() {
    return (
      <div className="header">
        <span className="header-about">About</span>
        <span className="header-text">Pavement</span>
        <span className="header-link">
          <a href="https://goo.gl/forms/Hh7bxW2HbFIeGsuL2" target="blank">
            Feedback?
          </a>
        </span>
      </div>
    );
  }
}

export default Header;
