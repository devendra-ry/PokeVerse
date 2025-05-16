import React from 'react';
import EvolutionStage from './EvolutionStage'; // We will create this file next

function EvolutionTab({ pokemon, onPokemonSelect }) {
    if (!pokemon) return null;

    return (
        <div className="EvolutionTab">
            <h3>Evolution Chain</h3>
            {pokemon.evolution_chain_data ? (
                <EvolutionStage
                    stage={pokemon.evolution_chain_data}
                    onPokemonSelect={onPokemonSelect}
                />
            ) : (
                <p>No evolution data available.</p>
            )}
        </div>
    );
}

export default EvolutionTab;