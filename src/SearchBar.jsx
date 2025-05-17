import React from 'react';
import './SearchBar.css'; // We will create this CSS file

function SearchBar({ pokemonName, setPokemonName, handleSearch, loading }) {
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="search-bar-container">
            <input
                type="text"
                placeholder="Search your Pokémon!"
                value={pokemonName}
                onChange={(e) => setPokemonName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="search-input"
                disabled={loading}
            />
            <button onClick={handleSearch} className="search-button" disabled={loading}>
                {/* You can replace this with an actual Pokeball icon if you have one */}
                <div className="pokeball-icon"></div> {/* Placeholder for icon */}
            </button>
        </div>
    );
}

export default SearchBar;