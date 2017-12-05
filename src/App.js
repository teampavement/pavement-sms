import React, { Component } from 'react';

import pointToLineDistance from '@turf/point-to-line-distance';
import {point, lineString} from '@turf/helpers';
import './App.css';

import MapView from './components/map-view';
import Signup from './components/signup';
import Header from './components/header';

import StreetToString from './common/street-to-string';

import geojsonApi from './services/geojson-api';
import canParkAPI from './services/rules-engine-api/can-park';
import setReminderAPI from './services/rules-engine-api/set-reminder';
import smsAPI from './services/sms-api';
const jc = geojsonApi();

const DEFAULT_CENTER = {
  lat: 40.719263904730404,
  lng: -74.0474224090576,
};

const DEFAULT_ZOOM = 14;

const DEFAULT_VIEWPORT = {
  center: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
  zoom: DEFAULT_ZOOM
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      viewport: DEFAULT_VIEWPORT,
      latLngBounds: {},
      selectedStreet: {},
      highlightedStreet: null,
      canPark: false,
      streetSelected: false,
      phoneNumber: "",
      smsPending: false,
      smsSent: false
    };
    this.handleViewportChange = this.handleViewportChange.bind(this);
    this.handleViewportChanged = this.handleViewportChanged.bind(this);
    this.findNearestLine = this.findNearestLine.bind(this);
    this.handleStreetSelected = this.handleStreetSelected.bind(this);
    this.handleScheduleSMS = this.handleScheduleSMS.bind(this);
    this.handlePhoneNumberChanged = this.handlePhoneNumberChanged.bind(this);
    this.handleGeoLocation = this.handleGeoLocation.bind(this);
  }

  componentDidMount() {
    window.analytics.page();
  }

  handleViewportChange = (viewport, mapRef) => {
    if (this.state.streetSelected) {
      this.setState({
        streetSelected: false
      });
    }
    if (viewport.zoom !== 18) {
      this.setState({
        highlightedStreet: null
      })
    }
    this.setState({
      viewport,
      latLngBounds: mapRef.leafletElement.getBounds()
    });
  }

  handleViewportChanged = (viewport, mapRef) => {
    window.analytics.track('map viewport changed', {
      viewport: viewport
    });
    if (this.state.streetSelected) {
      this.setState({
        streetSelected: false
      });
    }
    if (viewport.zoom !== 18) {
      this.setState({
        highlightedStreet: null
      })
    } else {
      // call canPark
    }

    this.setState({
      viewport,
      latLngBounds: mapRef.leafletElement.getBounds()
    });
  }

  findNearestLine () {
    if (this.state.viewport.zoom < 17) {
      return;
    }
    let viewportCenterFlipped = [this.state.viewport.center[1], this.state.viewport.center[0]];
    // need to do this hack to make the distance matching make sense
    // since geojson is in [long, lat] format
    // even though leaflet returns [lat, long] for its viewport center

    let centerPoint = point(viewportCenterFlipped);
    let minDistance = Number.MAX_SAFE_INTEGER;
    let minDistanceIndex = -1;
    jc.features.map((line, index) => {
      let distance = pointToLineDistance(centerPoint, line, {mercator: true});
      if (distance < minDistance) {
        minDistance = distance;
        minDistanceIndex = index;
      }
    });

    const streetNearestToCenter = jc.features[minDistanceIndex];
    if (streetNearestToCenter === this.state.highlightedStreet) {
      return;
    }
    // calculate canPark
    let canPark = canParkAPI({
      streetNearestToCenter
    });

    window.analytics.track('street highlighted', {
      street: streetNearestToCenter
    });

    this.setState({
      highlightedStreet: streetNearestToCenter,
      canPark
    });
  }

  handleStreetSelected() {
    window.analytics.track('street selected', {
      street: this.state.highlightedStreet
    });
    if (this.state.canPark) {
      this.setState({
        streetSelected: true
      });
    }
  }

  handlePhoneNumberChanged(e) {
    this.setState({
      phoneNumber: e.target.value
    });
  }

  handleScheduleSMS() {
    // change to pending
    // TODO - show pending state
    // this.setState({
    //   smsPending: true
    // });
    // fire api call
    smsAPI('', 'POST', {
      phone: this.state.phoneNumber,
      street: this.state.highlightedStreet
    }).then(() => {
      // change to sent
      this.setState({
        smsSent: true
      });
    }, () => {

    });
  }

  handleGeoLocation() {
    window.analytics.track('geolocation called', {
    });

    const setNewCenter = (self, position) => {
      window.analytics.track('geolocation returned', {
        position: position
      });
      self.setState({
        viewport: {
          center: [position.coords.latitude, position.coords.longitude]
        }
      });
    }

    if ("geolocation" in navigator) {
      ((self) => {
        navigator.geolocation.getCurrentPosition((position) => setNewCenter(self, position));
      })(this);
    } else {
      // can't geolocate
    }
  }

  render() {
    return (
      <div className="App">
        <Header />
        <MapView
          className="map-container"
          {...this.state}
          handleViewportChange={this.handleViewportChange}
          handleViewportChanged={this.handleViewportChanged}
          handleGeoLocation={this.handleGeoLocation}
          findNearestLine={this.findNearestLine}
          geoJSONData={jc}
        />
        <div class="signup-card-main-text">
          {
            this.state.highlightedStreet &&
            this.state.highlightedStreet.properties &&
            StreetToString.fullStreetName(this.state.highlightedStreet)
          }
        </div>
        <div className="signup-card-help-text">
          <p><b>Drag the map. The curb closest to the center will be highlighted automatically.</b></p>
          Make sure to select the exact curb where you're parked!
        </div>
        <Signup
          {...this.state}
          handleStreetSelected={this.handleStreetSelected}
          handleScheduleSMS={this.handleScheduleSMS}
          handlePhoneNumberChanged={this.handlePhoneNumberChanged}
        />
      </div>
    );
  }
}

export default App;
