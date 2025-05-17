import './App.css';
import { useState, useEffect } from 'react'; // Import useEffect
import Axios from "axios";
// import SearchSection from './SearchSection'; // We will remove SearchSection from the initial view
import PokemonCard from './PokemonCard';
// Import the new component for grid items (you'll need to create this file)
import PokemonGridItem from './PokemonGridItem'; // Uncomment this line
import SearchBar from './SearchBar'; // Import the new SearchBar component

// Helper function to get background color based on Pokemon type
export function getTypeColor(type) { // Export this function
    const typeColors = {
        normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C',
        grass: '#7AC74C', ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1',
        ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
        rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', dark: '#705746',
        steel: '#B7B7CE', fairy: '#D685AD',
    };
    return typeColors[type] || '#78C850'; // Default color
}

// EvolutionStage component is moved to EvolutionStage.jsx
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
    const [pokemon, setPokemon] = useState(null); // This holds the currently selected Pokemon for the detailed view
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("about");
    const [initialPokemonList, setInitialPokemonList] = useState([]); // New state for the initial grid list
    const [initialLoading, setInitialLoading] = useState(true); // New state for initial loading
    const [currentPage, setCurrentPage] = useState(0); // State for current page (0-indexed)
    const [itemsPerPage] = useState(50); // Number of items per page
    const [totalPokemonCount, setTotalPokemonCount] = useState(0); // Total number of Pokemon

    // Function to fetch a specific page of Pokemon
    const fetchPokemonPage = async (limit, offset) => {
        setInitialLoading(true);
        try {
            const listResponse = await Axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
            const results = listResponse.data.results;
            setTotalPokemonCount(listResponse.data.count); // Store total count

            // Fetch details for each Pokemon concurrently
            const detailedPokemonPromises = results.map(async (p) => {
                const detailResponse = await Axios.get(p.url);
                return {
                    id: detailResponse.data.id,
                    name: detailResponse.data.name,
                    image: detailResponse.data.sprites.other?.dream_world?.front_default ||
                           detailResponse.data.sprites.other?.["official-artwork"]?.front_default ||
                           detailResponse.data.sprites.front_default ||
                           "https://via.placeholder.com/100", // Smaller placeholder for grid
                    types: detailResponse.data.types.map(type => type.type.name),
                };
            });

            const detailedPokemonList = await Promise.all(detailedPokemonPromises);

            // Append new results to the existing list
            setInitialPokemonList(prevList => [...prevList, ...detailedPokemonList]);

        } catch (err) {
            console.error("[fetchPokemonPage] Error fetching Pokemon page:", err);
            // Handle error, maybe set an error state for the initial load
        } finally {
            setInitialLoading(false);
        }
    };

    // Effect to fetch the initial list of Pokemon when the component mounts or page changes
    useEffect(() => {
        // Calculate offset based on current page and items per page
        const offset = currentPage * itemsPerPage;
        fetchPokemonPage(itemsPerPage, offset);
    }, [currentPage, itemsPerPage]); // Re-run effect when currentPage or itemsPerPage changes

    const executeSearch = async (nameToSearch) => {
        const pkmnQuery = (nameToSearch || pokemonName).toLowerCase().trim();
        console.log(`[executeSearch] Starting search for: "${pkmnQuery}"`);

        if (!pkmnQuery) {
            // If no query, and we are not in detailed view, do nothing or show initial list
            if (!pokemon) {
                 setError(null); // Clear error if user goes back to list
            }
            return;
        }

        setLoading(true);
        setError(null);
        setPokemon(null); // Clear previous pokemon data

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
                species: speciesResponse.data.genera.find(g => g.language.name === 'en')?.genus || speciesResponse.data.species.name, // Get species genus
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
            setActiveTab("about"); // Reset to about tab for clarity on new Pokemon

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
            setPokemon(null); // Ensure pokemon state is null on error
        } finally {
            setLoading(false);
        }
    };

    const handleEvolutionPokemonSelect = (name) => {
        console.log(`[handleEvolutionPokemonSelect] Evolution selected: "${name}". Updating input field and re-searching.`);
        setPokemonName(name); // Update the input field text (optional, but good for consistency)
        executeSearch(name); // This will fetch and display data (including moves) ONLY for this 'name'
    };

    // New function to handle clicks on the initial grid items
    const handleGridItemClick = (pokemonName) => {
        console.log(`[handleGridItemClick] Grid item clicked: "${pokemonName}". Searching for details.`);
        executeSearch(pokemonName); // Trigger the detailed search
    };

    // Function to handle loading more Pokemon
    const handleLoadMore = () => {
        setCurrentPage(prevPage => prevPage + 1);
    };

    // Determine if there are more Pokemon to load
    const hasMorePokemon = initialPokemonList.length < totalPokemonCount;

    return (
        <div className="App">
            {/* Add the new SearchBar component here */}
            <SearchBar
                pokemonName={pokemonName}
                setPokemonName={setPokemonName}
                handleSearch={() => executeSearch()} // Pass the executeSearch function
                loading={loading}
            />

            {/* Conditionally render the grid or the detailed card */}
            {initialLoading && initialPokemonList.length === 0 && <p className="loading">Loading initial Pokemon...</p>}
            {error && !pokemon && <div className="error">{error}</div>} {/* Show error if initial load fails */}

            {!pokemon && initialPokemonList.length > 0 && (
                <div className="PokemonListContainer"> {/* New container div */}
                    <div className="PokemonGrid"> {/* You'll need to add CSS for this class */}
                        {initialPokemonList.map((p, index) => (
                            // Use the PokemonGridItem component here
                            <PokemonGridItem // Replace the inline div with this component
                                key={`pokemon-${p.id}-${index}`}
                                pokemon={p} // Pass simplified data
                                onClick={() => handleGridItemClick(p.name)}
                            />
                        ))}
                    </div>
                    {/* Add Load More button */}
                    {initialLoading && initialPokemonList.length > 0 && <p className="loading">Loading more...</p>}
                    {!initialLoading && hasMorePokemon && (
                        <button className="LoadMoreButton" onClick={handleLoadMore} disabled={initialLoading}>
                            Load More
                        </button>
                    )}
                    {!initialLoading && !hasMorePokemon && totalPokemonCount > 0 && (
                         <p className="EndMessage">You've seen all {totalPokemonCount} Pokemon!</p>
                    )}
                </div>
            )}

            {pokemon && (
                <PokemonCard
                    pokemon={pokemon}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    setPokemon={setPokemon}
                    setError={setError}
                    handleEvolutionPokemonSelect={handleEvolutionPokemonSelect}
                />
            )}

            {/* Remove the initial message */}
            {/* {!pokemon && !loading && !error && <p className="InitialMessage">Please search for a Pokemon.</p>} */}
        </div>
    );
}

export default App;