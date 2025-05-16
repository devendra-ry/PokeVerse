import React from 'react';

function AboutTab({ pokemon }) {
    if (!pokemon) return null;

    return (
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
    );
}

export default AboutTab;