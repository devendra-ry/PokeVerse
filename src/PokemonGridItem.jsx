import React from 'react';
import { getTypeColor } from './App'; // Import the helper function

function PokemonGridItem({ pokemon, onClick }) {
    return (
        <div
            className="PokemonGridItem"
            style={{ backgroundColor: getTypeColor(pokemon.types[0]), cursor: 'pointer' }}
            onClick={onClick}
        >
            <img src={pokemon.image} alt={pokemon.name} className="PokemonGridImage" />
            <h3>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
            <div className="TypeBadges">
                {pokemon.types.map((type, index) => (
                    <span key={`${pokemon.id}-type-${index}`} className="TypeBadge">{type}</span>
                ))}
            </div>
        </div>
    );
}

export default PokemonGridItem;