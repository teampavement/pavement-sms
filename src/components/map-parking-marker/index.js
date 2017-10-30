import React, { Component } from 'react';
import './map-parking-marker.css';

class MapParkingMarker extends Component {
  render() {
    return (
      <div className="map-parking-marker">
        <div className="map-parking-marker-tip">
          <div className="map-parking-marker-tip-text">
            Park
          </div>
        </div>
        <div className="map-parking-marker-tail"></div>
      </div>
    );
  }
}

export default MapParkingMarker;
