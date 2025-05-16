import './App.css';
import { useState } from 'react';
import Axios from "axios";

// Helper function to get background color based on Pokemon type
function getTypeColor(type) {
    const typeColors = {
        normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C',
        grass: '#7AC74C', ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1',
        ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
        rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', dark: '#705746',
        steel: '#B7B7CE', fairy: '#D685AD',
    };
    return typeColors[type] || '#78C850'; // Default color
}

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


function App() {
    const [pokemonName, setPokemonName] = useState("");
    const [pokemon, setPokemon] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("about");

    const executeSearch = async (nameToSearch) => {
        const pkmnQuery = (nameToSearch || pokemonName).toLowerCase().trim();
        console.log(`[executeSearch] Starting search for: "${pkmnQuery}"`);

        if (!pkmnQuery) {
            setError("Please enter a Pokemon name.");
            setPokemon(null);
            return;
        }

        setLoading(true);
        setError(null);
        setPokemon(null); 

        try {
            const response = await Axios.get(`https://pokeapi.co/api/v2/pokemon/${pkmnQuery}`);
            console.log(`[executeSearch] API response for "${pkmnQuery}" received successfully.`);
            
            const speciesResponse = await Axios.get(response.data.species.url);
            const evolutionResponse = await Axios.get(speciesResponse.data.evolution_chain.url);
            
            // This log shows the raw 'moves' array from the API for the specific Pokemon queried
            console.log(`[executeSearch] Raw moves for "${pkmnQuery}" from API (response.data.moves):`, response.data.moves);

            // This extracts just the move names. The important part is that response.data.moves
            // IS ALREADY specific to the pkmnQuery (e.g., Pikachu's moves if pkmnQuery is "pikachu")
            const currentPokemonMoves = response.data.moves.map(moveInfo => ({
                name: moveInfo.move.name
                // If you wanted to include, for example, how a move is learned (level-up, TM, etc.)
                // you would need to process `moveInfo.version_group_details` here.
                // For now, we are just getting the names, which are specific to the fetched Pokemon.
            }));
            console.log(`[executeSearch] Processed moves for "${pkmnQuery}" (these are the moves that will be set in state):`, currentPokemonMoves);

            const newPokemonData = {
                id: response.data.id,
                name: response.data.name, // This is the name of the specific Pokemon (e.g., "pikachu")
                species: response.data.species.name,
                image: response.data.sprites.other?.dream_world?.front_default || 
                       response.data.sprites.other?.["official-artwork"]?.front_default || 
                       response.data.sprites.front_default || 
                       "https://via.placeholder.com/150",
                height: (response.data.height * 0.1).toFixed(2),
                weight: (response.data.weight * 0.1).toFixed(1),
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
                egg_cycle: speciesResponse.data.hatch_counter,
                evolution_chain_data: evolutionResponse.data.chain,
                moves: currentPokemonMoves // These are the moves for the specific Pokemon queried (e.g., "pikachu")
            };
            console.log(`[executeSearch] New Pokemon data object to be set in state for "${pkmnQuery}":`, newPokemonData);
            
            setPokemon(newPokemonData); // Set the new Pokemon data, including its specific moves
            if (nameToSearch) { // If the search was triggered by clicking an evolution
                setActiveTab("about"); // Reset to about tab for clarity on new Pokemon
            }
        } catch (err) {
            console.error(`[executeSearch] Error fetching data for "${pkmnQuery}":`, err);
            if (Axios.isAxiosError(err)) {
                if (err.response?.status === 404) {
                    setError(`Pokemon "${pkmnQuery}" not found. Please check the name and try again.`);
                } else {
                    setError(err.response?.data?.message || `An error occurred while fetching data for "${pkmnQuery}". Status: ${err.response?.status || 'Unknown'}`);
                }
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
            setPokemon(null);
        } finally {
            setLoading(false);
        }
    };

    const handleEvolutionPokemonSelect = (name) => {
        console.log(`[handleEvolutionPokemonSelect] Evolution selected: "${name}". Updating input field and re-searching.`);
        setPokemonName(name); // Update the input field text
        executeSearch(name); // This will fetch and display data (including moves) ONLY for this 'name'
    };

    const handleInitialSearch = () => {
        executeSearch(pokemonName); // Use the name from the input field
    }

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
                        onKeyPress={(e) => e.key === 'Enter' && handleInitialSearch()}
                    />
                    <button onClick={handleInitialSearch} disabled={loading}>
                        {loading ? "Searching..." : "Search Pokemon"}
                    </button>
                    {error && <div className="error">{error}</div>}
                </div>
            )}
            
            {loading && <p className="loading">Loading...</p>}
            
            {pokemon && ( // This 'pokemon' object contains the data for the currently displayed Pokemon
                <div className="PokemonCard">
                    <div className="CardHeader">
                        <button className="BackButton" onClick={() => { setPokemon(null); setError(null); /* setPokemonName(""); // Optional: clear search input on back */ }}>←</button>
                    </div>
                    
                    <div className="PokemonInfo" style={{backgroundColor: getTypeColor(pokemon.types[0])}}>
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
                            {activeTab === "about" && (
                                <div className="AboutTab">
                                    <div className="InfoRow"><div className="InfoLabel">Species</div><div className="InfoValue">{pokemon.species}</div></div>
                                    <div className="InfoRow"><div className="InfoLabel">Height</div><div className="InfoValue">{pokemon.height}m ({(pokemon.height * 3.28084).toFixed(2)}ft)</div></div>
                                    <div className="InfoRow"><div className="InfoLabel">Weight</div><div className="InfoValue">{pokemon.weight}kg ({(pokemon.weight * 2.20462).toFixed(1)}lbs)</div></div>
                                    <div className="InfoRow"><div className="InfoLabel">Abilities</div><div className="InfoValue">{pokemon.abilities}</div></div>
                                    <h3>Breeding</h3>
                                    <div className="InfoRow"><div className="InfoLabel">Gender</div><div className="InfoValue">{pokemon.gender_rate === -1 ? "Genderless" : <>♂ {100 - (pokemon.gender_rate * 12.5)}% ♀ {pokemon.gender_rate * 12.5}%</>}</div></div>
                                    <div className="InfoRow"><div className="InfoLabel">Egg Groups</div><div className="InfoValue">{pokemon.egg_groups}</div></div>
                                    <div className="InfoRow"><div className="InfoLabel">Egg Cycle</div><div className="InfoValue">{pokemon.egg_cycle} (Approx. {pokemon.egg_cycle * 255} steps)</div></div>
                                </div>
                            )}
                            
                            {activeTab === "baseStats" && (
                                <div className="BaseStatsTab">
                                    <div className="InfoRow"><div className="InfoLabel">HP</div><div className="InfoValue">{pokemon.stats.hp}</div></div>
                                    <div className="InfoRow"><div className="InfoLabel">Attack</div><div className="InfoValue">{pokemon.stats.attack}</div></div>
                                    <div className="InfoRow"><div className="InfoLabel">Defense</div><div className="InfoValue">{pokemon.stats.defense}</div></div>
                                    <div className="InfoRow"><div className="InfoLabel">Special Attack</div><div className="InfoValue">{pokemon.stats.specialAttack}</div></div>
                                    <div className="InfoRow"><div className="InfoLabel">Special Defense</div><div className="InfoValue">{pokemon.stats.specialDefense}</div></div>
                                    <div className="InfoRow"><div className="InfoLabel">Speed</div><div className="InfoValue">{pokemon.stats.speed}</div></div>
                                </div>
                            )}
                            
                            {activeTab === "evolution" && (
                                <div className="EvolutionTab">
                                    <h3>Evolution Chain</h3>
                                    {pokemon.evolution_chain_data ? (
                                        <EvolutionStage 
                                            stage={pokemon.evolution_chain_data} 
                                            onPokemonSelect={handleEvolutionPokemonSelect} 
                                        />
                                    ) : (
                                        <p>No evolution data available.</p>
                                    )}
                                </div>
                            )}
                            
                            {activeTab === "moves" && (
                                <div className="MovesTab">
                                    {/* This explicitly states which Pokemon's moves are being shown */}
                                    <h3>Moves for {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
                                    
                                    {/* This console log is CRITICAL for debugging. It shows what 'pokemon.moves' contains AT THE TIME OF RENDERING */}
                                    {console.log(`[MovesTab] Rendering. Currently displaying Pokemon: "${pokemon.name}". Moves in state (pokemon.moves):`, pokemon.moves)}
                                    
                                    {pokemon.moves && pokemon.moves.length > 0 ? (
                                        <ul className="MovesList">
                                            {/* pokemon.moves is the array of moves for the CURRENTLY displayed Pokemon */}
                                            {pokemon.moves.map((move, index) => (
                                                <li key={`${pokemon.id}-${move.name}-${index}`} className="MoveItem">
                                                    {move.name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No moves listed for {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {!pokemon && !loading && !error && <p className="InitialMessage">Please search for a Pokemon.</p>}
        </div>
    );
}

export default App;