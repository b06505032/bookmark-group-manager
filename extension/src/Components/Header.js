import React from 'react';
import '../App.css';

const Header = ({ handleHomePageClick }) => {
  return (
    <div className="App-header">
      <label>
        <h2 className="App-title" onClick={handleHomePageClick}>Bookmark</h2>
      </label>

    </div>
  )
}

export default Header