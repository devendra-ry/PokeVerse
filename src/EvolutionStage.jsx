import React from 'react';

// Component to display each stage of evolution recursively
function EvolutionStage({ stage, onPokemonSelect }) {
    if (!stage) return null;

    const evolutionStyle = {
        paddingLeft: '20px',
        borderLeft: '1px solid #ddd',
        marginLeft: '10px',
        marginTop: '5px',
    };

    // Generate a more unique key if multiple evolutions have the same species name (e.g. Eevee's branched evolutions)
    // However, in a single chain, species names are unique.
    const keyPrefix = stage.species.name;

    return (
        <div className="EvolutionNode" style={{ marginTop: '10px' }}>
            <p
                onClick={() => {
                    console.log(`[EvolutionStage] Clicked on: ${stage.species.name}`);
                    onPokemonSelect(stage.species.name);
                }}
                style={{ cursor: 'pointer', fontWeight: 'bold', margin: '5px 0' }}
                className="PokemonNameLink"
            >
                {stage.species.name.charAt(0).toUpperCase() + stage.species.name.slice(1)}
            </p>
            {stage.evolves_to && stage.evolves_to.length > 0 && (
                <div className="EvolvesTo" style={evolutionStyle}>
                    {stage.evolves_to.map((nextStage, index) => (
                        <EvolutionStage key={`${keyPrefix}-evo-${index}-${nextStage.species.name}`} stage={nextStage} onPokemonSelect={onPokemonSelect} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default EvolutionStage;