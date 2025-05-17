import React, { useState, useRef, useEffect } from 'react'; // Import useRef and useEffect
import './FilterBar.css';
import Axios from 'axios'; // Import Axios

function FilterBar({ onFilterChange }) {
  const [filters, setFilters] = useState({
    type: '',
    weaknesses: '',
    // ability: '', // Removed
    height: '',
    weight: ''
  });

  // State to manage dropdown visibility
  const [openDropdown, setOpenDropdown] = useState(null); // null, 'type', 'weaknesses', etc.

  // State to hold fetched data
  const [types, setTypes] = useState([]);
  // const [abilities, setAbilities] = useState([]); // Removed
  const [loadingData, setLoadingData] = useState(true); // New state for data loading
  const [dataError, setDataError] = useState(null); // New state for data fetching errors


  // Refs for each dropdown to detect clicks outside
  const dropdownRefs = {
    type: useRef(null),
    weaknesses: useRef(null),
    // ability: useRef(null), // Removed
    height: useRef(null),
    weight: useRef(null),
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      // Check if the click is outside the currently open dropdown
      if (openDropdown && dropdownRefs[openDropdown].current && !dropdownRefs[openDropdown].current.contains(event.target)) {
        setOpenDropdown(null); // Close the dropdown
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown, dropdownRefs]); // Re-run effect if openDropdown or dropdownRefs change

  // Effect to fetch types and abilities when the component mounts
  useEffect(() => {
    const fetchFilterData = async () => {
      setLoadingData(true);
      setDataError(null);
      try {
        // Fetch types
        const typesResponse = await Axios.get('https://pokeapi.co/api/v2/type/');
        // Filter out the 'unknown' and 'shadow' types as they are not typical filters
        const fetchedTypes = typesResponse.data.results
          .map(type => type.name)
          .filter(name => name !== 'unknown' && name !== 'shadow');
        setTypes(fetchedTypes);

        // Fetch abilities // Removed ability fetching
        // const abilitiesResponse = await Axios.get('https://pokeapi.co/api/v2/ability/?limit=300'); 
        // const fetchedAbilities = abilitiesResponse.data.results.map(ability => ability.name);
        // setAbilities(fetchedAbilities);

      } catch (err) {
        console.error("Error fetching filter data:", err);
        setDataError("Failed to load filter options.");
      } finally {
        setLoadingData(false);
      }
    };

    fetchFilterData();
  }, []); // Empty dependency array means this effect runs only once on mount


  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
    setOpenDropdown(null); // Close dropdown after selection
  };

  const toggleDropdown = (filterName) => {
    setOpenDropdown(openDropdown === filterName ? null : filterName);
  };

  // Placeholder options for demonstration (will be replaced by fetched data)
  // const typeOptions = ['Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'];
  // const weaknessesOptions = ['Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'];
  // const abilityOptions = ['Overgrow', 'Blaze', 'Torrent', 'Static', 'Synchronize']; // Example abilities // Removed
  const heightOptions = ['Small', 'Medium', 'Large']; // Example height categories - keeping as placeholder
  const weightOptions = ['Light', 'Medium', 'Heavy']; // Example weight categories - keeping as placeholder


  // Use fetched data for Type and Weaknesses (Weaknesses uses the same list as Types)
  const typeOptions = types;
  const weaknessesOptions = types; // Weaknesses are based on types
  // const abilityOptions = abilities; // Use fetched abilities // Removed


  return (
    <div className="filter-bar">
      {loadingData && <p>Loading filters...</p>}
      {dataError && <p className="error">{dataError}</p>}

      {!loadingData && !dataError && (
        <>
          <div className="filter-option" ref={dropdownRefs.type}>
            <button className="filter-button" onClick={() => toggleDropdown('type')}>
              <span className="filter-icon">⚪</span> Type
            </button>
            {openDropdown === 'type' && (
              <div className="filter-dropdown">
                <ul className="dropdown-list">
                  {/* Add 'All' option */}
                  <li key="all-type" className="dropdown-item" onClick={() => handleFilterChange('type', '')}>
                    All Types
                  </li>
                  {typeOptions.map(option => (
                    <li key={option} className="dropdown-item" onClick={() => handleFilterChange('type', option.toLowerCase())}>
                      {option.charAt(0).toUpperCase() + option.slice(1)} {/* Capitalize for display */}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="filter-option" ref={dropdownRefs.weaknesses}>
            <button className="filter-button" onClick={() => toggleDropdown('weaknesses')}>
              <span className="filter-icon">⚔️</span> Weaknesses
            </button>
            {openDropdown === 'weaknesses' && (
              <div className="filter-dropdown">
                <ul className="dropdown-list">
                   {/* Add 'All' option */}
                   <li key="all-weakness" className="dropdown-item" onClick={() => handleFilterChange('weaknesses', '')}>
                    All Weaknesses
                  </li>
                  {weaknessesOptions.map(option => (
                    <li key={option} className="dropdown-item" onClick={() => handleFilterChange('weaknesses', option.toLowerCase())}>
                      {option.charAt(0).toUpperCase() + option.slice(1)} {/* Capitalize for display */}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Re-added Ability Filter */} {/* Removed Ability Filter JSX */}
          {/* <div className="filter-option" ref={dropdownRefs.ability}>
            <button className="filter-button" onClick={() => toggleDropdown('ability')}>
              <span className="filter-icon">✨</span> Ability
            </button>
            {openDropdown === 'ability' && (
              <div className="filter-dropdown">
                <ul className="dropdown-list">
                   
                   <li key="all-ability" className="dropdown-item" onClick={() => handleFilterChange('ability', '')}>
                    All Abilities
                  </li>
                  {abilityOptions.map(option => (
                    <li key={option} className="dropdown-item" onClick={() => handleFilterChange('ability', option.toLowerCase())}>
                      {option.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')} 
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div> */}


          <div className="filter-option" ref={dropdownRefs.height}>
            <button className="filter-button" onClick={() => toggleDropdown('height')}>
              <span className="filter-icon">📏</span> Height
            </button>
            {openDropdown === 'height' && (
              <div className="filter-dropdown">
                <ul className="dropdown-list">
                   {/* Add 'All' option */}
                   <li key="all-height" className="dropdown-item" onClick={() => handleFilterChange('height', '')}>
                    All Heights
                  </li>
                  {heightOptions.map(option => (
                    <li key={option} className="dropdown-item" onClick={() => handleFilterChange('height', option.toLowerCase())}>
                      {option}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="filter-option" ref={dropdownRefs.weight}>
            <button className="filter-button" onClick={() => toggleDropdown('weight')}>
              <span className="filter-icon">⚖️</span> Weight
            </button>
            {openDropdown === 'weight' && (
              <div className="filter-dropdown">
                <ul className="dropdown-list">
                   {/* Add 'All' option */}
                   <li key="all-weight" className="dropdown-item" onClick={() => handleFilterChange('weight', '')}>
                    All Weights
                  </li>
                  {weightOptions.map(option => (
                    <li key={option} className="dropdown-item" onClick={() => handleFilterChange('weight', option.toLowerCase())}>
                      {option}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default FilterBar;