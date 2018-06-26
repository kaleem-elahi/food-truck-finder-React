import React from 'react';
import './App.css';
import foodtruck from './assets/icons/food-truck.png';
import MapContainer from './components/MapContainer';

const App = () => (
  <div>
    <h2 className="app-name">
      Find Food truck
      <img src={foodtruck} height="32px" weight="32px" alt="logo" />
    </h2>
    <MapContainer />
  </div>
);

export default App;
