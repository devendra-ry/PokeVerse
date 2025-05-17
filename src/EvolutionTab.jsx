import React from 'react';
import EvolutionStage from './EvolutionStage';

function EvolutionTab({ pokemon, onPokemonSelect }) {
    if (!pokemon) return null;

    return (
        <div className="EvolutionTab">
            <h3>EVOLUTION</h3>
            {pokemon.evolution_chain_data ? (
                <div className="EvolutionChain">
                    <EvolutionStage
                        stage={pokemon.evolution_chain_data}
                        onPokemonSelect={onPokemonSelect}
                    />
                </div>
            ) : (
                <p>No evolution data available.</p>
            )}
        </div>
    );
}

export default EvolutionTab;