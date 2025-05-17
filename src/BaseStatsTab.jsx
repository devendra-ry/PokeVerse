import React from 'react';

function BaseStatsTab({ pokemon }) {
    if (!pokemon) return null;

    // Function to determine bar color based on stat value
    const getStatColor = (value) => {
        if (value < 50) return '#FB6C6C'; // Red for low stats
        if (value < 70) return '#FFD86F'; // Yellow for medium stats
        return '#48D0B0'; // Green for high stats
    };

    // Calculate total stats
    const totalStats = pokemon.stats ? 
        pokemon.stats.hp + 
        pokemon.stats.attack + 
        pokemon.stats.defense + 
        pokemon.stats.specialAttack + 
        pokemon.stats.specialDefense + 
        pokemon.stats.speed : 0;

    return (
        <div className="BaseStatsTab">
            <div className="InfoRow">
                <div className="InfoLabel">HP</div>
                <div className="InfoValue">{pokemon.stats.hp}</div>
                <div className="StatBar">
                    <div className="StatBarFill" style={{ width: `${(pokemon.stats.hp / 255) * 100}%`, backgroundColor: getStatColor(pokemon.stats.hp) }}></div>
                </div>
            </div>
            <div className="InfoRow">
                <div className="InfoLabel">Attack</div>
                <div className="InfoValue">{pokemon.stats.attack}</div>
                <div className="StatBar">
                    <div className="StatBarFill" style={{ width: `${(pokemon.stats.attack / 255) * 100}%`, backgroundColor: getStatColor(pokemon.stats.attack) }}></div>
                </div>
            </div>
            <div className="InfoRow">
                <div className="InfoLabel">Defense</div>
                <div className="InfoValue">{pokemon.stats.defense}</div>
                <div className="StatBar">
                    <div className="StatBarFill" style={{ width: `${(pokemon.stats.defense / 255) * 100}%`, backgroundColor: getStatColor(pokemon.stats.defense) }}></div>
                </div>
            </div>
            <div className="InfoRow">
                <div className="InfoLabel">Sp. Atk</div>
                <div className="InfoValue">{pokemon.stats.specialAttack}</div>
                <div className="StatBar">
                    <div className="StatBarFill" style={{ width: `${(pokemon.stats.specialAttack / 255) * 100}%`, backgroundColor: getStatColor(pokemon.stats.specialAttack) }}></div>
                </div>
            </div>
            <div className="InfoRow">
                <div className="InfoLabel">Sp. Def</div>
                <div className="InfoValue">{pokemon.stats.specialDefense}</div>
                <div className="StatBar">
                    <div className="StatBarFill" style={{ width: `${(pokemon.stats.specialDefense / 255) * 100}%`, backgroundColor: getStatColor(pokemon.stats.specialDefense) }}></div>
                </div>
            </div>
            <div className="InfoRow">
                <div className="InfoLabel">Speed</div>
                <div className="InfoValue">{pokemon.stats.speed}</div>
                <div className="StatBar">
                    <div className="StatBarFill" style={{ width: `${(pokemon.stats.speed / 255) * 100}%`, backgroundColor: getStatColor(pokemon.stats.speed) }}></div>
                </div>
            </div>
            <div className="InfoRow TotalRow">
                <div className="InfoLabel">Total</div>
                <div className="InfoValue">{totalStats}</div>
                <div className="StatBar">
                    <div className="StatBarFill" style={{ width: `${(totalStats / 1530) * 100}%`, backgroundColor: getStatColor(totalStats / 6) }}></div>
                </div>
            </div>
        </div>
    );
}

export default BaseStatsTab;