import './App.css';
import { useState, useEffect } from 'react'; // Import useEffect
import Axios from "axios";
// import SearchSection from './SearchSection'; // We will remove SearchSection from the initial view
import PokemonCard from './PokemonCard';
// Import the new component for grid items (you'll need to create this file)
import PokemonGridItem from './PokemonGridItem'; // Uncomment this line
import SearchBar from './SearchBar'; // Import the new SearchBar component
import FilterBar from './FilterBar'; // Import the new FilterBar component

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
    const [filters, setFilters] = useState({
        type: '',
        weaknesses: '',
        // ability: '', // Removed
        height: '',
        weight: ''
    });

    // New state to store type damage relations
    const [typeDamageRelations, setTypeDamageRelations] = useState({});
    const [loadingDamageRelations, setLoadingDamageRelations] = useState(true); // State for loading damage relations

    // Effect to fetch type damage relations on mount
    useEffect(() => {
        const fetchDamageRelations = async () => {
            setLoadingDamageRelations(true);
            try {
                // Fetch list of all types
                const typesListResponse = await Axios.get('https://pokeapi.co/api/v2/type/');
                const typesUrls = typesListResponse.data.results.map(type => type.url);

                // Fetch details for each type concurrently
                const damageRelationsPromises = typesUrls.map(async (url) => {
                    const typeDetailResponse = await Axios.get(url);
                    return {
                        name: typeDetailResponse.data.name,
                        damage_relations: typeDetailResponse.data.damage_relations
                    };
                });

                const relations = await Promise.all(damageRelationsPromises);

                // Map relations by type name for easy lookup
                const relationsMap = relations.reduce((acc, relation) => {
                    acc[relation.name] = relation.damage_relations;
                    return acc;
                }, {});

                setTypeDamageRelations(relationsMap);
                console.log("[App] Fetched type damage relations:", relationsMap);

            } catch (err) {
                console.error("[App] Error fetching type damage relations:", err);
                // Handle error if needed
            } finally {
                setLoadingDamageRelations(false);
            }
        };

        fetchDamageRelations();
    }, []); // Empty dependency array means this runs only once on mount


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
                    // Add height and weight to the initial fetch
                    height: detailResponse.data.height, // Height is in decimetres
                    weight: detailResponse.data.weight, // Weight is in hectograms
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

    // Determine if there are more Pokemon to load
    const hasMorePokemon = initialPokemonList.length < totalPokemonCount;

    // --- New Filtering Logic ---
    // Apply filters to the initialPokemonList
    // Move this declaration BEFORE the useEffect that uses it
    const filteredPokemonList = initialPokemonList.filter(pokemon => {
        // Type filter
        if (filters.type && !pokemon.types.includes(filters.type)) {
            return false;
        }

        // Weaknesses filter:
        // Implementing a true 'weaknesses' filter based on the selected type requires checking
        // the damage relations of the selected type against the Pokemon's types.
        // This data is not available in the initial list fetch and would require additional API calls
        // per Pokemon or a different data fetching strategy. Skipping for now.
        if (filters.weaknesses) {
             // Logic to check if pokemon is weak to filters.weaknesses type would go here
             // This is complex and requires fetching type damage relations.
             // For now, this filter is effectively disabled until implemented.
             // return false; // Uncomment and add logic if implementing

             // --- Start Weakness Filter Logic ---
             const selectedWeaknessType = filters.weaknesses;
             const weaknessRelations = typeDamageRelations[selectedWeaknessType];

             // If damage relations for the selected weakness type are not loaded, skip filtering
             if (!weaknessRelations) {
                 // console.warn(`[App] Damage relations for type "${selectedWeaknessType}" not loaded yet.`);
                 // Decide how to handle this: either show all or filter out.
                 // For now, let's filter out if relations aren't loaded for the selected type.
                 // Alternatively, you could return true here to show all until data loads.
                 return false;
             }

             // Check if the Pokemon's types are in the 'double_damage_from' list of the selected weakness type
             // A Pokemon is weak to the selected type if any of its types receive double damage from the selected type.
             const isWeak = pokemon.types.some(pokemonType => {
                 // Find the damage relations for the Pokemon's type
                 const pokemonTypeRelations = typeDamageRelations[pokemonType];

                 if (!pokemonTypeRelations) {
                     // console.warn(`[App] Damage relations for pokemon type "${pokemonType}" not loaded yet.`);
                     return false; // Cannot determine weakness if Pokemon's type relations aren't loaded
                 }

                 // Check if the selected weakness type is in the 'double_damage_from' list of the Pokemon's type
                 // This is the correct way: A Pokemon is weak to type X if type X deals double damage to the Pokemon's type.
                 // So we check the damage relations of the POKEMON's type, not the selected weakness type.
                 return pokemonTypeRelations.double_damage_from.some(relation => relation.name === selectedWeaknessType);
             });

             if (!isWeak) {
                 return false; // Filter out if the Pokemon is NOT weak to the selected type
             }
             // --- End Weakness Filter Logic ---
        }


        // Ability filter: // Removed ability filter logic
        // Implementing an 'ability' filter requires fetching ability data for each Pokemon
        // in the initial list, which is not currently done. Skipping for now.
        // if (filters.ability) {
            // Logic to check if pokemon has filters.ability would go here.
            // This is complex and requires fetching ability data per pokemon.
            // For now, this filter is effectively disabled until implemented.
            // return false; // Uncomment and add logic if implementing
        // }

        // Height filter (using simple categories)
        if (filters.height) {
            // Height is in decimetres (1m = 10 dm)
            const heightInMeters = pokemon.height * 0.1;
            let passesHeightFilter = false;
            switch (filters.height) {
                case 'small': // Example: < 0.7m
                    passesHeightFilter = heightInMeters < 0.7;
                    break;
                case 'medium': // Example: 0.7m to 1.5m
                    passesHeightFilter = heightInMeters >= 0.7 && heightInMeters <= 1.5;
                    break;
                case 'large': // Example: > 1.5m
                    passesHeightFilter = heightInMeters > 1.5;
                    break;
                default:
                    passesHeightFilter = true; // 'All' or unknown filter passes
            }
            if (!passesHeightFilter) {
                return false;
            }
        }

        // Weight filter (using simple categories)
        if (filters.weight) {
             // Weight is in hectograms (1kg = 10 hg)
            const weightInKg = pokemon.weight * 0.1;
            let passesWeightFilter = false;
            switch (filters.weight) {
                case 'light': // Example: < 10kg
                    passesWeightFilter = weightInKg < 10;
                    break;
                case 'medium': // Example: 10kg to 100kg
                    passesWeightFilter = weightInKg >= 10 && weightInKg <= 100;
                    break;
                case 'heavy': // Example: > 100kg
                    passesWeightFilter = weightInKg > 100;
                    break;
                default:
                    passesWeightFilter = true; // 'All' or unknown filter passes
            }
             if (!passesWeightFilter) {
                return false;
            }
        }

        // If no filters are applied or the pokemon passes all active filters, include it
        return true;
    });
    // --- End New Filtering Logic ---

    // --- New Effect to auto-load more if filtered list is empty ---
    useEffect(() => {
        // Check if the filtered list is empty, we are not currently loading,
        // and there are more pokemon available to load from the API.
        // Also ensure initialPokemonList is not empty to avoid infinite loop on initial load failure
        // Add check for loadingDamageRelations - don't auto-load if still fetching relations
        if (filteredPokemonList.length === 0 && !initialLoading && hasMorePokemon && initialPokemonList.length > 0 && !loadingDamageRelations) {
            console.log("[App] Filtered list is empty, loading more Pokemon...");
            handleLoadMore();
        }
    }, [filteredPokemonList, initialLoading, hasMorePokemon, initialPokemonList.length, loadingDamageRelations]); // Dependencies

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
                height: (response.data.height * 0.1).toFixed(2), // Convert decimetres to meters
                weight: (response.data.weight * 0.1).toFixed(1), // Convert hectograms to kilograms
                // abilities: response.data.abilities.map(ability => ability.ability.name).join(", "), // Removed
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
    // const hasMorePokemon = initialPokemonList.length < totalPokemonCount; // This line is moved up

    // --- New Filtering Logic ---
    const handleFilterChange = (newFilters) => {
        console.log("[App] Filters updated:", newFilters);
        setFilters(newFilters);
        // When filters change, reset pagination to start from the beginning
        // This is a simple approach. A more complex one would refetch data with filters.
        // For now, we filter the currently loaded list.
        // setCurrentPage(0); // Decide if you want to reset page on filter change
        // setInitialPokemonList([]); // Decide if you want to clear list on filter change
    };

    // Apply filters to the initialPokemonList
    // const filteredPokemonList = initialPokemonList.filter(pokemon => { // This block is moved up
    //     // Type filter
    //     if (filters.type && !pokemon.types.includes(filters.type)) {
    //         return false;
    //     }
    // });
    // --- End New Filtering Logic ---


    return (
        <div className="App">
            {/* Add the new SearchBar component here */}
            <SearchBar
                pokemonName={pokemonName}
                setPokemonName={setPokemonName}
                handleSearch={() => executeSearch()} // Pass the executeSearch function
                loading={loading}
            />
            
            {/* Add the new FilterBar component here */}
            {/* Pass the handleFilterChange function to FilterBar */}
            {/* Disable FilterBar while damage relations are loading */}
            <FilterBar onFilterChange={handleFilterChange} disabled={loadingDamageRelations} />

            {/* Conditionally render the grid or the detailed card */}
            {initialLoading && initialPokemonList.length === 0 && <p className="loading">Loading initial Pokemon...</p>}
            {loadingDamageRelations && <p className="loading">Loading type data for filters...</p>} {/* Indicate loading of filter data */}
            {error && !pokemon && <div className="error">{error}</div>} {/* Show error if initial load fails */}

            {!pokemon && initialPokemonList.length > 0 && (
                <div className="PokemonListContainer"> {/* New container div */}
                    <div className="PokemonGrid"> {/* You'll need to add CSS for this class */}
                        {/* Render the filtered list instead of the initial list */}
                        {filteredPokemonList.map((p, index) => (
                            // Use the PokemonGridItem component here
                            <PokemonGridItem // Replace the inline div with this component
                                key={`pokemon-${p.id}-${index}`}
                                pokemon={p} // Pass simplified data
                                onClick={() => handleGridItemClick(p.name)}
                            />
                        ))}
                    </div>
                    {/* Add Load More button */}
                    {/* Consider how Load More interacts with filtering.
                        Currently, Load More adds to initialPokemonList, and filtering happens on that list.
                        If filters are applied, Load More will add more items that are then filtered.
                        If you want Load More to fetch *only* filtered results, the API call needs to change,
                        which is not possible with the current PokeAPI /pokemon endpoint.
                        So, the current approach filters the growing list.
                    */}
                    {initialLoading && initialPokemonList.length > 0 && <p className="loading">Loading more...</p>}
                    {!initialLoading && hasMorePokemon && (
                        <button className="LoadMoreButton" onClick={handleLoadMore} disabled={initialLoading || loadingDamageRelations}> {/* Disable if loading relations */}
                            Load More
                        </button>
                    )}
                    {!initialLoading && !hasMorePokemon && totalPokemonCount > 0 && (
                         <p className="EndMessage">You've seen all {totalPokemonCount} Pokemon!</p>
                    )}
                     {/* Message if no Pokemon match the filters */}
                    {!initialLoading && filteredPokemonList.length === 0 && initialPokemonList.length > 0 && (
                        <p className="EndMessage">No Pokemon match the current filters.</p>
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