import React from 'react';

function BaseStatsTab({ pokemon }) {
    if (!pokemon) return null;

    return (
        <div className="BaseStatsTab">
            <div className="InfoRow"><div className="InfoLabel">HP</div><div className="InfoValue">{pokemon.stats.hp}</div></div>
            <div className="InfoRow"><div className="InfoLabel">Attack</div><div className="InfoValue">{pokemon.stats.attack}</div></div>
            <div className="InfoRow"><div className="InfoLabel">Defense</div><div className="InfoValue">{pokemon.stats.defense}</div></div>
            <div className="InfoRow"><div className="InfoLabel">Special Attack</div><div className="InfoValue">{pokemon.stats.specialAttack}</div></div>
            <div className="InfoRow"><div className="InfoLabel">Special Defense</div><div className="InfoValue">{pokemon.stats.specialDefense}</div></div>
            <div className="InfoRow"><div className="InfoLabel">Speed</div><div className="InfoValue">{pokemon.stats.speed}</div></div>
        </div>
    );
}

export default BaseStatsTab;