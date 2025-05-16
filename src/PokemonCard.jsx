import React from 'react';
import AboutTab from './AboutTab';
import BaseStatsTab from './BaseStatsTab';
import EvolutionTab from './EvolutionTab';
import MovesTab from './MovesTab';
import { getTypeColor } from './App'; // Import the helper function

function PokemonCard({ pokemon, activeTab, setActiveTab, setPokemon, setError, handleEvolutionPokemonSelect }) {
    if (!pokemon) return null;

    const handleBackClick = () => {
        setPokemon(null);
        setError(null);
        // Optional: setPokemonName(""); // Optional: clear search input on back
    };

    return (
        <div className="PokemonCard">
            <div className="CardHeader">
                <button className="BackButton" onClick={handleBackClick}>←</button>
            </div>

            <div className="PokemonInfo" style={{ backgroundColor: getTypeColor(pokemon.types[0]) }}>
                <h1>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h1>
                <div className="PokemonNumber">#{String(pokemon.id).padStart(3, '0')}</div>
                <div className="TypeBadges">
                    {pokemon.types.map((type, index) => (
                        <span key={`${pokemon.id}-type-${index}`} className="TypeBadge">{type}</span>
                    ))}
                </div>
                <img src={pokemon.image} alt={pokemon.name} className="PokemonImage" />
            </div>

            <div className="TabsContainer">
                <div className="Tabs">
                    {["about", "baseStats", "evolution", "moves"].map(tabName => (
                        <button
                            key={tabName}
                            className={activeTab === tabName ? "TabButton active" : "TabButton"}
                            onClick={() => setActiveTab(tabName)}
                        >
                            {tabName.charAt(0).toUpperCase() + tabName.slice(1).replace("baseStats", "Base Stats")}
                        </button>
                    ))}
                </div>

                <div className="TabContent">
                    {activeTab === "about" && <AboutTab pokemon={pokemon} />}
                    {activeTab === "baseStats" && <BaseStatsTab pokemon={pokemon} />}
                    {activeTab === "evolution" && <EvolutionTab pokemon={pokemon} onPokemonSelect={handleEvolutionPokemonSelect} />}
                    {activeTab === "moves" && <MovesTab pokemon={pokemon} />}
                </div>
            </div>
        </div>
    );
}

export default PokemonCard;