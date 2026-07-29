import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhilippineMap from './components/PhilippineMap';
import provinces from '../../data/philippines-provinces';
import { ArrowLeft, Search, X } from 'lucide-react';
import './geo.css';

export default function MapExplorer() {
  const navigate = useNavigate();
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // All, Luzon, Visayas, Mindanao

  const handleProvinceClick = (id) => {
    const province = provinces.find(p => p.id === id);
    if (province) setSelectedProvince(province);
  };

  const filteredProvinces = provinces.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'All' || p.island_group === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="map-explorer">
      <div className="explorer-header">
        <button onClick={() => navigate('/geo')} className="back-btn"><ArrowLeft size={20} /></button>
        <h2>Map Explorer</h2>
      </div>

      <div className="explorer-controls">
        <div className="search-bar">
          <Search size={18} color="#666" />
          <input
            type="text"
            placeholder="Search province..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="island-tabs">
          {['All', 'Luzon', 'Visayas', 'Mindanao'].map(tab => (
            <button
              key={tab}
              className={activeTab === tab ? 'active' : ''}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="explorer-content">
        <div className="explorer-map">
          <PhilippineMap
            onProvinceClick={handleProvinceClick}
            highlightedProvince={selectedProvince?.id}
            showNames={true}
          />
        </div>
      </div>

      {selectedProvince && (
        <div className="info-card-overlay" onClick={() => setSelectedProvince(null)}>
          <div className="info-card" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedProvince(null)}><X size={20} /></button>
            <h3>{selectedProvince.name}</h3>
            <div className="info-details">
              <p><strong>Capital:</strong> {selectedProvince.capital}</p>
              <p><strong>Region:</strong> {selectedProvince.region}</p>
              <p><strong>Island Group:</strong> {selectedProvince.island_group}</p>
              <p><strong>Area:</strong> {selectedProvince.area_km2.toLocaleString()} km²</p>
              <p><strong>Population:</strong> {selectedProvince.population.toLocaleString()}</p>
            </div>
            <div className="fun-fact">
              <strong>💡 Fun Fact:</strong>
              <p>{selectedProvince.fun_fact}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
