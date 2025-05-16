import React from 'react';

function MovesTab({ pokemon }) {
    if (!pokemon) return null;

    // This console log is CRITICAL for debugging. It shows what 'pokemon.moves' contains AT THE TIME OF RENDERING
    console.log(`[MovesTab] Rendering. Currently displaying Pokemon: "${pokemon.name}". Moves in state (pokemon.moves):`, pokemon.moves);

    return (
        <div className="MovesTab">
            {/* This explicitly states which Pokemon's moves are being shown */}
            <h3>Moves for {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>

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
    );
}

export default MovesTab;