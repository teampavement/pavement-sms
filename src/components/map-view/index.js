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
import Control from 'react-leaflet-control';
import 'react-leaflet-fullscreen/dist/styles.css';
import bbox from '@turf/bbox';
import bboxPolygon from '@turf/bbox-polygon';

import './map-view.css';

import MapParkingMarker from '../map-parking-marker';

const REGULAR_STYLE = {
    "color": "black",
    "weight": 2,
    "opacity": 0.65,
    "transition": "all .2s ease-in-out"
}

const HIGHLIGHTED_STYLE = {
    "color": "#F4E04D",
    "weight": 7,
    "opacity": 0.75,
    "transform": "scale(1.1)"
}

class MapView extends Component {

    constructor(props) {
      super(props);
      this.onViewportChange = this.onViewportChange.bind(this);
      this.onViewportChanged = this.onViewportChanged.bind(this);
      this.getStyle = this.getStyle.bind(this);
    }

    componentDidMount() {
      this.props.findNearestLine();
    }

    onViewportChange = (viewport) => {
      //TODO: maybe drop this if framerate is dropping?

      if (viewport.center[0] !== this.props.viewport.center[0] ||
          viewport.center[1] !== this.props.viewport.center[1]) {
            this.props.handleViewportChange(viewport, this.refs.map);
            // calc features in bounds

            // calc intersection between center and features in bounds
            // console.log("onViewportChange -> findNearestLine");
            this.props.findNearestLine();
      }
    }

    onViewportChanged = (viewport) => {
      this.props.handleViewportChanged(viewport, this.refs.map);
      // calc features in bounds

      // calc intersection between center and features in bounds
      // console.log("onViewportChanged -> findNearestLine");
      this.props.findNearestLine();
    }

    getStyle(geoJsonFeature) {
      if (geoJsonFeature !== this.props.highlightedStreet) {
        return REGULAR_STYLE;
      }
      return HIGHLIGHTED_STYLE;
    }

    render() {
      let geoJSONDataPolygon = this.props.viewport.zoom < 15 &&
        bboxPolygon((bbox(this.props.geoJSONData)));

      return (
        <Map
          ref="map"
          className="carto-map"
          viewport={this.props.viewport}
          onViewportChanged={this.onViewportChanged}
          onViewportChange={this.onViewportChange}
          draggable={false}>
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
          />
          {this.props.viewport.zoom >= 15 &&
          <GeoJSON key={Math.random()}
                   data={this.props.geoJSONData}
                   style={this.getStyle}
          />}
          {this.props.viewport.zoom < 15 &&
          <GeoJSON key={Math.random()}
                   data={geoJSONDataPolygon}
          />}
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
