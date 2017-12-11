import React, { Component } from 'react';

import pointToLineDistance from '@turf/point-to-line-distance';
import {point, lineString} from '@turf/helpers';
import './App.css';
import pin from './pin-white.png';

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

const DEFAULT_ZOOM = 16;

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
    this.handleClick = this.handleClick.bind(this);
    this.findNearestLine = this.findNearestLine.bind(this);
    this.handleStreetSelected = this.handleStreetSelected.bind(this);
    this.handleScheduleSMS = this.handleScheduleSMS.bind(this);
    this.handlePhoneNumberChanged = this.handlePhoneNumberChanged.bind(this);
    this.handleGeoLocation = this.handleGeoLocation.bind(this);
  }

  componentDidMount() {
    if (process.env.NODE_ENV === 'production' && !process.env.REACT_APP_DEV) {
      window.analytics.page();
    }
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
    if (process.env.NODE_ENV === 'production' && !process.env.REACT_APP_DEV) {
      window.analytics.track('map viewport changed', {
        viewport: viewport
      });
    }

    this.setState({
      viewport,
      latLngBounds: mapRef.leafletElement.getBounds()
    });
  }

  handleClick = (latlng, mapRef) => {
    if (process.env.NODE_ENV === 'production' && !process.env.REACT_APP_DEV) {
      window.analytics.track('map clicked', {
      });
    }
    if (this.state.streetSelected) {
      this.setState({
        streetSelected: false
      });
    }
    if (this.state.viewport.zoom < 17) {
      const newCenter = [latlng.lat, latlng.lng];
      this.setState({
        viewport: {
          center: newCenter,
          zoom: 18
        }
      });
    }

    // zoom in?
  }

  findNearestLine (clickedPoint = null) {
    if (!clickedPoint && this.state.viewport.zoom < 17) {
      return;
    }
    let viewportCenterFlipped = [this.state.viewport.center[1], this.state.viewport.center[0]];
    // need to do this hack to make the distance matching make sense
    // since geojson is in [long, lat] format
    // even though leaflet returns [lat, long] for its viewport center

    let initialPoint = clickedPoint ?
      point([clickedPoint.lng, clickedPoint.lat])
      : point(viewportCenterFlipped);
    let minDistance = Number.MAX_SAFE_INTEGER;
    let minDistanceIndex = -1;
    jc.features.map((line, index) => {
      let distance = pointToLineDistance(initialPoint, line, {mercator: true});
      if (distance < minDistance) {
        minDistance = distance;
        minDistanceIndex = index;
      }
    });

    const streetNearestToClick = jc.features[minDistanceIndex];
    if (streetNearestToClick === this.state.highlightedStreet) {
      return;
    }
    // calculate canPark
    let canPark = canParkAPI({
      street: streetNearestToClick
    });

    if (process.env.NODE_ENV === 'production' && !process.env.REACT_APP_DEV) {
      window.analytics.track('street highlighted', {
        street: streetNearestToClick
      });
    }

    this.setState({
      highlightedStreet: streetNearestToClick,
      canPark
    });
  }

  handleStreetSelected() {
    if (process.env.NODE_ENV === 'production' && !process.env.REACT_APP_DEV) {
      window.analytics.track('street selected', {
        street: this.state.highlightedStreet
      });
    }
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
    if (process.env.NODE_ENV === 'production' && !process.env.REACT_APP_DEV) {
      window.analytics.track('geolocation called', {
      });
    }

    const setNewCenter = (self, position) => {
      if (process.env.NODE_ENV === 'production' && !process.env.REACT_APP_DEV) {
        window.analytics.track('geolocation returned', {
          position: position
        });
      }
      self.setState({
        viewport: {
          center: [position.coords.latitude, position.coords.longitude],
          zoom: 17
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
      <div>
        {/* <div class="pin-container"
          style={{position: 'absolute',
            height: '100vh',
            width: '100vw',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            zIndex: 10,
            pointerEvents: 'none'
          }}>
          <img src={pin} width={25} height={40} style={{
            width: 25,
            height: 40,
            pointerEvents: 'none',
            objectFit: 'contain'
          }}/>
        </div> */}
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
            handleClick={this.handleClick}
          />
          {/* <div class="signup-card-main-text">
            {
              this.state.highlightedStreet &&
              this.state.highlightedStreet.properties &&
              StreetToString.fullStreetName(this.state.highlightedStreet)
            }
          </div>
          <Signup
            {...this.state}
            handleStreetSelected={this.handleStreetSelected}
            handleScheduleSMS={this.handleScheduleSMS}
            handlePhoneNumberChanged={this.handlePhoneNumberChanged}
          /> */}
        </div>
      </div>
    );
  }
}

export default App;
