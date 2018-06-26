
import React, { Component } from 'react';
import {
  GoogleApiWrapper
} from 'google-maps-react';
import PropTypes from 'prop-types'; // ES6
import ReactDOM from 'react-dom';
import axios from 'axios';
import foodtruck from '../assets/icons/food-truck.png';
import { arePointsNear } from '../utils';
import * as constants from '../constants';
import SearchFilter from './SearchFilter';
import RangeSlider from './RangeSlider';

class MapContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clearFilter: false,
      kM: 1,
      markers: [],
      zoom: 11,
      currentLocation: { // setting default lan & lng of sanfrancisco
        lat: Number(37.773972),
        lng: Number(-122.431297)
      },
      locations: []
    };
    this.getData = this.getData.bind(this);
    this.initMap = this.initMap.bind(this);
    this.searchNearBy = this.searchNearBy.bind(this);
    this.searchFilter = this.searchFilter.bind(this);
    this.handleRange = this.handleRange.bind(this);
  }

  componentDidMount() {
    this.getData();
  }

  getData() {
    axios.get('https://data.sfgov.org/resource/6a9r-agq8.json')
      .then((res) => {
        const locations = res.data.map(data => ({
          name: data.applicant,
          fooditems: data.fooditems,
          objectId: data.objectid,
          location: {
            lat: Number(data.latitude),
            lng: Number(data.longitude)
          }
        }));
        this.setState({ locations }, () => {
          this.getSelfLocation();
        });
      });
  }

  getSelfLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.setState({
          currentLocation: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        }, () => {
          this.initMap();
          this.searchNearBy();
        });
      }, (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          console.log('you denied me :-(');
          this.initMap();
          this.searchNearBy();
        }
      });
    } else {
      console.log('geolocation IS NOT available');
      /* geolocation IS NOT available */
    }
  }

  initMap() {
    const { google } = this.props; // sets props equal to google
    const { currentLocation, zoom, } = this.state;
    if (this.props && google) { // checks to make sure that props have been passed
      const { maps } = google; // sets maps to google maps props

      const mapRef = this.refs.map; // eslint-disable-line
      const node = ReactDOM.findDOMNode(mapRef); // eslint-disable-line
      const mapConfig = Object.assign({}, {
        center: currentLocation, // sets center of google map to NYC.
        zoom, // sets zoom. Lower numbers are zoomed further out.
        mapTypeId: 'roadmap' // optional main map layer. Terrain, satellite, hybrid or roadmap--if unspecified, defaults to roadmap.
      });
      this.map = new maps.Map(node, mapConfig); // creates a new Google map on the specified node
      this.map.addListener('click', (e) => {
        this.setState({
          clearFilter: true,
          currentLocation: {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
          }
        }, () => {
          this.searchNearBy();
          this.setState({
            clearFilter: false
          });
        });
      });
    }
  }

  searchNearBy() {
    const { kM } = this.state;
    const tmp = [];
    const { currentLocation, locations } = this.state;
    locations.forEach((location) => { // iterate through locations saved in state
      if (arePointsNear(location.location, currentLocation, kM)) {
        tmp.push(location);
      }
    });
    this.showMarkers(tmp);
  }

  showMarkers(data) {
    const { markers } = this.state;
    markers.forEach((marker) => {
      marker.setMap(null);
    });

    this.setState({
      markers: []
    });
    const { google } = this.props; // sets props equal to google
    const tmpMarkers = [];
    data.forEach((selected) => { // iterate through locations saved in state
      // ADD MARKERS TO MAP
      const marker = new google.maps.Marker({ // creates a new Google maps Marker object.
        position: {
          lat: selected.location.lat,
          lng: selected.location.lng
        }, // set marker pos.
        map: this.map, // sets markers to appear on the map
        title: selected.name, // the title of the marker is set to the name of the location
        icon: foodtruck // icon as marker
      });
      tmpMarkers.push(marker);
    });
    this.setState({
      markers: tmpMarkers
    });
  }

  handleRange(e) {
    e.persist();
    this.setState({
      clearFilter: true,
      kM: e.target.value
    }, () => {
      this.setState({
        clearFilter: false
      });
      this.searchNearBy();
    });
  }

  searchFilter(value) {
    const foodLocation = JSON.parse(value).map(o => ({
      name: o.label,
      location: o.value
    }));
    this.showMarkers(foodLocation);
  }

  render() {
    const {
      locations,
      kM,
      clearFilter,
    } = this.state;
    const style = { // MUST specify dimensions of the Google map or it will not work.
      width: '100vw', // 90vw basically means take up 90% of the width screen. px also works.
      height: '85vh' // 75vh similarly will take up roughly 75% of the height of the screen. px also works.
    };

    return ( // in our return function you must return a div with ref='map' and style.
      <div>
        <RangeSlider
          handleRange={this.handleRange}
          kM={kM}
          max="200"
        />
        <div className="filter-beside-map">
          <div className="filter">
            <SearchFilter
              searchFilter={this.searchFilter}
              kiloMeter={kM}
              clearFilter={clearFilter}
              foundLocations={locations.map(data => ({
                label: data.fooditems,
                value: data.location
              }))}
            />
          </div>
          <div ref="map" style={style}> {/* eslint-disable-line */}
          loading...
          </div>
        </div>
      </div>
    );
  }
}

MapContainer.propTypes = {
  google: PropTypes.objectOf(PropTypes.any).isRequired
};
export default GoogleApiWrapper({
  apiKey: constants.API_KEY
})(MapContainer);
