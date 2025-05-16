import React from 'react';

function SearchSection({ pokemonName, setPokemonName, handleInitialSearch, loading, error }) {
    return (
        <div className="SearchSection">
            <h1>Pokemon Stats</h1>
            <input
                type="text"
                placeholder="Enter Pokemon name"
                value={pokemonName}
                onChange={(e) => setPokemonName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleInitialSearch()}
            />
            <button onClick={handleInitialSearch} disabled={loading}>
                {loading ? "Searching..." : "Search Pokemon"}
            </button>
            {error && <div className="error">{error}</div>}
        </div>
    );
}

export default SearchSection;