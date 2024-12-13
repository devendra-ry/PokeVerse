import './App.css';
import { useState } from 'react';
import Axios from "axios";

function App() {
    const [pokemonName, setPokemonName] = useState("");
    const [pokemon, setPokemon] = useState(null); // Initialize as null
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const searchPokemon = async () => {
        setLoading(true);
        setError(null); // Clear any previous errors
        try {
            const response = await Axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase().trim()}`); // Trim and lowercase input
            setPokemon({
                name: response.data.name, // Use the name from the API response for consistency
                species: response.data.species.name,
                image: response.data.sprites.other?.dream_world?.front_default || response.data.sprites.front_default || "https://via.placeholder.com/150", // Handle missing images
                hp: response.data.stats[0].base_stat,
                attack: response.data.stats[1].base_stat,
                defence: response.data.stats[2].base_stat,
                type: response.data.types[0].type.name,
            });
        } catch (err) {
            if (Axios.isAxiosError(err)) {
                setError(err.response?.data?.message || `Pokemon "${pokemonName}" not found.`);
            } else {
                setError("An unexpected error occurred.");
            }
            setPokemon(null)
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="App">
            <div className="TitleSection">
                <h1>Pokemon Stats</h1>
                <input
                    type="text"
                    placeholder="Enter Pokemon name" // Added placeholder
                    value={pokemonName} // Controlled input
                    onChange={(e) => setPokemonName(e.target.value)}
                />
                <button onClick={searchPokemon} disabled={loading}> {/* Disable button while loading */}
                    {loading ? "Searching..." : "Search Pokemon"} {/* Show loading message */}
                </button>
                {error && <div className="error">{error}</div>} {/* Display error message */}
            </div>
            <div className="DisplaySection">
                {loading && <p>Loading...</p>} {/* Loading message */}
                {pokemon && ( // Only render if pokemon data exists
                    <>
                        <h1>{pokemon.name.toUpperCase()}</h1> {/* Capitalize Pokemon name */}
                        <img src={pokemon.image} alt={pokemon.name} /> {/* Added alt text */}
                        <h3>Species: {pokemon.species}</h3>
                        <h3>Type: {pokemon.type}</h3>
                        <h4>HP: {pokemon.hp}</h4> {/* Consistent capitalization */}
                        <h4>Attack: {pokemon.attack}</h4>
                        <h4>Defense: {pokemon.defence}</h4>
                    </>
                )}

                {!pokemon && !loading && !error && <p>Please search for a Pokemon.</p>}
            </div>
        </div>
    );
}

export default App;