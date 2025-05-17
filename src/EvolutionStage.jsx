import React from 'react';

function EvolutionStage({ stage, onPokemonSelect }) {
    if (!stage) return null;

    // Function to render a single Pokémon in the evolution chain
    const renderPokemon = (pokemon, evolutionDetails = null) => {
        return (
            <div className="EvolutionPokemon" onClick={() => onPokemonSelect(pokemon.species.name)}>
                {/* Pokémon sprite - using a placeholder if image not available */}
                <img 
                    src={pokemon.sprite_url || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.species.url.split('/').filter(Boolean).pop()}.png`} 
                    alt={pokemon.species.name} 
                    className="EvolutionSprite"
                />
                {/* Evolution level if available */}
                {evolutionDetails && evolutionDetails.min_level && (
                    <div className="EvolutionLevel">Lvl {evolutionDetails.min_level}</div>
                )}
                {/* Pokémon name */}
                <div className="EvolutionName">
                    {pokemon.species.name.charAt(0).toUpperCase() + pokemon.species.name.slice(1)}
                </div>
            </div>
        );
    };

    // Function to recursively build the evolution chain
    const buildEvolutionChain = (currentStage) => {
        if (!currentStage) return [];

        const result = [];
        
        // Add the current Pokémon
        result.push(renderPokemon(currentStage));

        // Process each evolution
        if (currentStage.evolves_to && currentStage.evolves_to.length > 0) {
            currentStage.evolves_to.forEach((nextStage, index) => {
                // Add arrow with evolution details
                result.push(
                    <div key={`arrow-${index}`} className="EvolutionArrow">
                        →
                    </div>
                );
                
                // Add the evolved Pokémon with evolution details
                result.push(renderPokemon(nextStage, nextStage.evolution_details[0]));
                
                // If this Pokémon evolves further, continue the chain
                if (nextStage.evolves_to && nextStage.evolves_to.length > 0) {
                    nextStage.evolves_to.forEach((finalStage, finalIndex) => {
                        result.push(
                            <div key={`arrow-${index}-${finalIndex}`} className="EvolutionArrow">
                                →
                            </div>
                        );
                        result.push(renderPokemon(finalStage, finalStage.evolution_details[0]));
                    });
                }
            });
        }
        
        return result;
    };

    return (
        <div className="EvolutionChainContainer">
            {buildEvolutionChain(stage)}
        </div>
    );
}

export default EvolutionStage;