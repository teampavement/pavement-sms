import React, { Component } from 'react';
import './signup.css';
import Street from '../../common/street';

class Signup extends Component {
  constructor(props) {
    super(props);
  }



  render() {
    let content, rightButton;
    if (Object.keys(this.props.highlightedStreet).length > 0) {
      let street = new Street(this.props.highlightedStreet);
      if (!this.props.streetSelected ) {
        // just highlighted
        content = <div>
          <div class="signup-card-main-text">{street.geoJSON.properties && street.fullStreetName()}</div>
          <div class="signup-card-description-text">{street.geoJSON.properties && street.streetsBetweenNames()}</div>
        </div>;
        rightButton = <button onClick={this.props.handleStreetSelected}>
          <div class="glyphicon glyphicon-bell" aria-hidden="true"></div>
          <div class="signup-button-text">Remind me</div>
        </button>
      } else {
        // highlighted and selected

        if (this.props.smsPending) {
          content = <div>
            <div class="signup-card-main-text">sending</div>
          </div>;
        } else if (this.props.smsSent) {
          content = <div>
            <div class="signup-card-main-text">sent</div>
          </div>;
        } else {
          content = <div>
            <div class="signup-card-main-text">{street.geoJSON.properties && street.fullStreetName()}</div>
            <div class="signup-card-description-text">{street.geoJSON.properties && street.streetsBetweenNames()}</div>
            <div class="signup-card-phone-number">
              <label htmlFor="telNo">Phone number:</label>
              <input
                id="telNo"
                name="telNo"
                type="tel"
                value={this.props.phoneNumber}
                onChange={this.props.handlePhoneNumberChanged} />
            </div>
          </div>;
          rightButton = <button onClick={this.props.handleScheduleSMS}>
            <div class="glyphicon glyphicon-send" aria-hidden="true"></div>
            <div class="signup-button-text">Schedule text</div>
          </button>
        }
      }
    } else {
      content = <div>
        <div class="signup-card-main-text">
          Zoom all the way into a highlighted region
          to select a curb.
        </div>
      </div>;

      rightButton = <button onClick={this.props.handleScheduleSMS}>
        <div class="glyphicon glyphicon-arrow-left" aria-hidden="true"></div>
      </button>
    }
    return (
      <div className="signup-container">
        {/*
          1) zoomed out, instructions to zoom in
          2) zoomed in, highlighted
          3) selected, enter phone number
          4) entered, show confirmation screen
        */}
        <div className="signup-card">
          {content}
        </div>
        <div className="signup-button">
          {rightButton}
        </div>
      </div>
    );
  }
}

export default Signup;
