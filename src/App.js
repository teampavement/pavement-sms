import React, { Component } from 'react';
import './App.css';
import MapView from './components/map-view';
import Signup from './components/signup';
import Header from './components/header';

import pointToLineDistance from '@turf/point-to-line-distance';
import {point, lineString} from '@turf/helpers';

import geojsonApi from './services/geojson-api';
import rulesEngineAPI from './services/rules-engine-api';
import smsAPI from './services/sms-api';
const jc = geojsonApi();

const DEFAULT_CENTER = {
  lat: 40.719263904730404,
  lng: -74.0474224090576,
};

const DEFAULT_ZOOM = 13;

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
      highlightedStreet: {},
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

  handleViewportChange = (viewport, mapRef) => {
    if (this.state.streetSelected) {
      this.setState({
        streetSelected: false
      });
    }
    if (viewport.zoom !== 18) {
      this.setState({
        highlightedStreet: {}
      })
    }
    this.setState({
      viewport,
      latLngBounds: mapRef.leafletElement.getBounds()
    });
  }

  handleViewportChanged = (viewport, mapRef) => {
    if (this.state.streetSelected) {
      this.setState({
        streetSelected: false
      });
    }
    if (viewport.zoom !== 18) {
      this.setState({
        highlightedStreet: {}
      })
    }
    this.setState({
      viewport,
      latLngBounds: mapRef.leafletElement.getBounds()
    });
  }

  findNearestLine () {
    if (this.state.viewport.zoom !== 18) {
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

    // calculate canPark
    let canPark = rulesEngineAPI(streetNearestToCenter, new Date());

    this.setState({
      highlightedStreet: streetNearestToCenter,
      canPark
    });
  }

  handleStreetSelected() {
    this.setState({
      streetSelected: true
    });
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
    smsAPI();
    // change to sent
    this.setState({
      smsSent: true
    });
  }

  handleGeoLocation() {
    const setNewCenter = (self, position) => {
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
