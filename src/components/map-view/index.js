import React, { Component } from 'react';
import L from 'leaflet';
import {
  Map,
  Marker,
  Popup,
  TileLayer,
  GeoJSON,
  Polyline
} from 'react-leaflet';
// import GeoJsonCluster from 'react-leaflet-geojson-cluster';
import Control from 'react-leaflet-control';
import bbox from '@turf/bbox';
import bboxPolygon from '@turf/bbox-polygon';

import './map-view.css';

import MapParkingMarker from '../map-parking-marker';
import canParkAPI from '../../services/rules-engine-api/can-park';

const REGULAR_STYLE = {
    "color": "black",
    "weight": 2,
    "opacity": 0.65,
    "transition": "all .2s ease-in-out"
}

const CAN_PARK_STYLE = {
    "color": "green",
    "weight": 2,
    "opacity": 0.65,
    "transition": "all .2s ease-in-out"
}

const CANNOT_PARK_STYLE = {
    "color": "red",
    "weight": 2,
    "opacity": 0.65,
    "transition": "all .2s ease-in-out"
}

const HIGHLIGHTED_STYLE = {
    "color": "#F4E04D",
    "weight": 10,
    "opacity": 0.75,
    "transform": "scale(1.1)"
}

class MapView extends Component {

    constructor(props) {
      super(props);
      this.onViewportChange = this.onViewportChange.bind(this);
      this.onViewportChanged = this.onViewportChanged.bind(this);
      this.onClick = this.onClick.bind(this);
      this.getStyle = this.getStyle.bind(this);
    }

    componentDidMount() {
      this.props.findNearestLine();
    }

    onClick = (e) => {
      this.props.handleClick(e.latlng, this.refs.map);
      this.props.findNearestLine(e.latlng);
    }

    onViewportChange = (viewport) => {
      //TODO: maybe drop this if framerate is dropping?

      if (viewport.center[0] !== this.props.viewport.center[0] ||
          viewport.center[1] !== this.props.viewport.center[1]) {
            this.props.handleViewportChange(viewport, this.refs.map);
            // calc features in bounds

            // calc intersection between center and features in bounds
            // console.log("onViewportChange -> findNearestLine");
            // this.props.findNearestLine();
      }
    }

    onViewportChanged = (viewport) => {
      this.props.handleViewportChanged(viewport, this.refs.map);
      // calc features in bounds

      // calc intersection between center and features in bounds
      // console.log("onViewportChanged -> findNearestLine");
      // this.props.findNearestLine();
    }

    getStyle(geoJsonFeature) {
      let style = REGULAR_STYLE;
      if (geoJsonFeature !== this.props.highlightedStreet) {
      }

      if (canParkAPI({street: geoJsonFeature})) {
        style = CAN_PARK_STYLE;
      } else {
        style = CANNOT_PARK_STYLE;
      }
      if (geoJsonFeature === this.props.highlightedStreet) {
        style = Object.assign({}, style, {'weight': 7});
      }
      return style;
    }

    render() {
      return (
        <Map
          ref="map"
          className="carto-map"
          viewport={this.props.viewport}
          onViewportChanged={this.onViewportChanged}
          // onViewportChange={this.onViewportChange}
          onClick={this.onClick}
          draggable={false}
          style={{height: (window.innerHeight - 44)}}>
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
          />
          <GeoJSON key={Math.random()}
                   data={this.props.geoJSONData}
                   style={this.getStyle}
          />
          <Control position="bottomleft">
            <button
              className="map-control-button"
              onClick={this.props.handleGeoLocation}>
              <span className="glyphicon glyphicon-map-marker" />
              <span></span>
            </button>
          </Control>
        </Map>
      );

    }
}

export default MapView;
