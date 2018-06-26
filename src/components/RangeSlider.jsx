import React from 'react';

const RangeSlider = prop => (
  <div className="form">
    <div className="range-bar">
      <input name="search" placeholder="search" type="range" min="1" max={prop.max} value={prop.kM} onChange={e => prop.handleRange(e)} />
      <div>
        {prop.kM}
        km
      </div>
    </div>
  </div>
);

export default RangeSlider;
