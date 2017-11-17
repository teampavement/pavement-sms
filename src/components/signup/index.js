import React, { Component } from 'react';
import './signup.css';
import StreetToString from '../../common/street-to-string';

class Signup extends Component {
  constructor(props) {
    super(props);
  }



  render() {
    let content, rightButton;
    if (this.props.highlightedStreet) {
      if (!this.props.streetSelected ) {
        // just highlighted
        content = <div>
          <div>{this.props.canPark ? 'You can park here right now' : 'No parking here right now'}</div>
          <div className="signup-card-description-text">
            {/* {StreetToString.rules(this.props.highlightedStreet)} */}
            {this.props.highlightedStreet.properties.sign_summary_text}
          </div>
        </div>;
        rightButton = <button className='signup-button' onClick={this.props.handleStreetSelected}>
          <div className="glyphicon glyphicon-bell" aria-hidden="true"></div>
          <div className="signup-button-text">Remind me</div>
        </button>
      } else {
        // highlighted and selected

        if (this.props.smsPending) {
          content = <div>
            <div className="signup-card-main-text">Sending...</div>
          </div>;
        } else if (this.props.smsSent) {
          content = <div>
            <div className="signup-card-main-text">You'll get a text message reminder at {this.props.phoneNumber} a few hours before you need to move your car.</div>
          </div>;
        } else {
          content = <div>
            <div className="signup-card-help-text"></div>
            <div className="signup-card-phone-number">
              <label htmlFor="telNo">Cell number:</label>
              <input
                id="telNo"
                name="telNo"
                type="tel"
                value={this.props.phoneNumber}
                onChange={this.props.handlePhoneNumberChanged} />
            </div>
          </div>;
          rightButton = <button className='signup-button' onClick={this.props.handleScheduleSMS}>
            <div className="glyphicon glyphicon-send" aria-hidden="true"></div>
            <div className="signup-button-text">Schedule text</div>
          </button>
        }
      }
    } else {
      content = <div>
        <div className="signup-card-main-text">
          Zoom all the way in a highlighted region
          to select a curb.
        </div>
      </div>;
    }

    let signupCardClassName = this.props.highlightedStreet ?
      this.props.canPark ?
        "signup-card-parking"
        : "signup-card-no-parking"
      : "signup-card";

    let signupButtonClassName = this.props.canPark ?
      'signup-button-container'
      : 'signup-button-container-disabled'

    return (
      <div className="signup-container">
        {/*
          1) zoomed out, instructions to zoom in
          2) zoomed in, highlighted
          3) selected, enter phone number
          4) entered, show confirmation screen
        */}

        <div className={signupCardClassName}>
          {content}
        </div>
        {rightButton &&
          <div className={signupButtonClassName}>
            {rightButton}
          </div>
        }
      </div>
    );
  }
}

export default Signup;
