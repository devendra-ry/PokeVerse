import './App.css';
import { useState } from 'react';
import Axios from "axios";

function App() {
    const [pokemonName, setPokemonName] = useState("");
    const [pokemon, setPokemon] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("about");

    const searchPokemon = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await Axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase().trim()}`);
            const speciesResponse = await Axios.get(response.data.species.url);
            
            setPokemon({
                id: response.data.id,
                name: response.data.name,
                species: response.data.species.name,
                image: response.data.sprites.other?.dream_world?.front_default || 
                       response.data.sprites.other?.["official-artwork"]?.front_default || 
                       response.data.sprites.front_default || 
                       "https://via.placeholder.com/150",
                height: (response.data.height * 0.1).toFixed(2), // Convert to meters
                weight: (response.data.weight * 0.1).toFixed(1), // Convert to kg
                abilities: response.data.abilities.map(ability => ability.ability.name).join(", "),
                types: response.data.types.map(type => type.type.name),
                stats: {
                    hp: response.data.stats[0].base_stat,
                    attack: response.data.stats[1].base_stat,
                    defense: response.data.stats[2].base_stat,
                    specialAttack: response.data.stats[3].base_stat,
                    specialDefense: response.data.stats[4].base_stat,
                    speed: response.data.stats[5].base_stat
                },
                gender_rate: speciesResponse.data.gender_rate,
                egg_groups: speciesResponse.data.egg_groups.map(group => group.name).join(", "),
                egg_cycle: speciesResponse.data.hatch_counter
            });
        } catch (err) {
            if (Axios.isAxiosError(err)) {
                setError(err.response?.data?.message || `Pokemon "${pokemonName}" not found.`);
            } else {
                setError("An unexpected error occurred.");
            }
            setPokemon(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="App">
            {!pokemon && (
                <div className="SearchSection">
                    <h1>Pokemon Stats</h1>
                    <input
                        type="text"
                        placeholder="Enter Pokemon name"
                        value={pokemonName}
                        onChange={(e) => setPokemonName(e.target.value)}
                    />
                    <button onClick={searchPokemon} disabled={loading}>
                        {loading ? "Searching..." : "Search Pokemon"}
                    </button>
                    {error && <div className="error">{error}</div>}
                </div>
            )}
            
            {loading && <p className="loading">Loading...</p>}
            
            {pokemon && (
                <div className="PokemonCard">
                    <div className="CardHeader">
                        <button className="BackButton" onClick={() => setPokemon(null)}>←</button>
                        <button className="FavoriteButton">♡</button>
                    </div>
                    
                    <div className="PokemonInfo" style={{backgroundColor: getTypeColor(pokemon.types[0])}}>
                        <h1>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h1>
                        <div className="PokemonNumber">#{String(pokemon.id).padStart(3, '0')}</div>
                        
                        <div className="TypeBadges">
                            {pokemon.types.map((type, index) => (
                                <span key={index} className="TypeBadge">{type}</span>
                            ))}
                        </div>
                        
                        <img src={pokemon.image} alt={pokemon.name} className="PokemonImage" />
                    </div>
                    
                    <div className="TabsContainer">
                        <div className="Tabs">
                            <button 
                                className={activeTab === "about" ? "TabButton active" : "TabButton"}
                                onClick={() => setActiveTab("about")}
                            >
                                About
                            </button>
                            <button 
                                className={activeTab === "baseStats" ? "TabButton active" : "TabButton"}
                                onClick={() => setActiveTab("baseStats")}
                            >
                                Base Stats
                            </button>
                            <button 
                                className={activeTab === "evolution" ? "TabButton active" : "TabButton"}
                                onClick={() => setActiveTab("evolution")}
                            >
                                Evolution
                            </button>
                            <button 
                                className={activeTab === "moves" ? "TabButton active" : "TabButton"}
                                onClick={() => setActiveTab("moves")}
                            >
                                Moves
                            </button>
                        </div>
                        
                        <div className="TabContent">
                            {activeTab === "about" && (
                                <div className="AboutTab">
                                    <div className="InfoRow">
                                        <div className="InfoLabel">Species</div>
                                        <div className="InfoValue">{pokemon.species}</div>
                                    </div>
                                    <div className="InfoRow">
                                        <div className="InfoLabel">Height</div>
                                        <div className="InfoValue">{pokemon.height}m ({(pokemon.height * 3.28084).toFixed(2)}ft)</div>
                                    </div>
                                    <div className="InfoRow">
                                        <div className="InfoLabel">Weight</div>
                                        <div className="InfoValue">{pokemon.weight}kg ({(pokemon.weight * 2.20462).toFixed(1)}lbs)</div>
                                    </div>
                                    <div className="InfoRow">
                                        <div className="InfoLabel">Abilities</div>
                                        <div className="InfoValue">{pokemon.abilities}</div>
                                    </div>
                                    
                                    <h3>Breeding</h3>
                                    <div className="InfoRow">
                                        <div className="InfoLabel">Gender</div>
                                        <div className="InfoValue">
                                            {pokemon.gender_rate === -1 ? 
                                                "Genderless" : 
                                                <>♂ {100 - (pokemon.gender_rate * 12.5)}% ♀ {pokemon.gender_rate * 12.5}%</>
                                            }
                                        </div>
                                    </div>
                                    <div className="InfoRow">
                                        <div className="InfoLabel">Egg Groups</div>
                                        <div className="InfoValue">{pokemon.egg_groups}</div>
                                    </div>
                                    <div className="InfoRow">
                                        <div className="InfoLabel">Egg Cycle</div>
                                        <div className="InfoValue">{pokemon.egg_cycle}</div>
                                    </div>
                                </div>
                            )}
                            
                            {activeTab === "baseStats" && (
                                <div className="BaseStatsTab">
                                    {/* Base stats content */}
                                </div>
                            )}
                            
                            {activeTab === "evolution" && (
                                <div className="EvolutionTab">
                                    {/* Evolution content */}
                                </div>
                            )}
                            
                            {activeTab === "moves" && (
                                <div className="MovesTab">
                                    {/* Moves content */}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {!pokemon && !loading && !error && <p>Please search for a Pokemon.</p>}
        </div>
    );
}

// Helper function to get background color based on Pokemon type
function getTypeColor(type) {
    const typeColors = {
        normal: '#A8A77A',
        fire: '#EE8130',
        water: '#6390F0',
        electric: '#F7D02C',
        grass: '#7AC74C',
        ice: '#96D9D6',
        fighting: '#C22E28',
        poison: '#A33EA1',
        ground: '#E2BF65',
        flying: '#A98FF3',
        psychic: '#F95587',
        bug: '#A6B91A',
        rock: '#B6A136',
        ghost: '#735797',
        dragon: '#6F35FC',
        dark: '#705746',
        steel: '#B7B7CE',
        fairy: '#D685AD',
    };
    
    return typeColors[type] || '#78C850'; // Default to grass green if type not found
}

export default App;