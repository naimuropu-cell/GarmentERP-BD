import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Layers, 
  MapPin, 
  Package, 
  Users, 
  ChevronRight, 
  ChevronDown, 
  CheckCircle2, 
  Factory as FactoryIcon, 
  Boxes
} from 'lucide-react';
import { Factory } from '../../types';

interface OrganizationViewProps {
  selectedFactoryId: string;
}

export const OrganizationView: React.FC<OrganizationViewProps> = ({ selectedFactoryId }) => {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFactoryId, setActiveFactoryId] = useState(selectedFactoryId);
  const [expandedBuildings, setExpandedBuildings] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setActiveFactoryId(selectedFactoryId);
  }, [selectedFactoryId]);

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const token = localStorage.getItem('garment_access_token');
        const res = await fetch('/api/v1/organization/hierarchy', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const json = await res.json();
        if (json.success && json.data?.factories) {
          setFactories(json.data.factories);
          // Default expand first building
          if (json.data.factories[0]?.buildings[0]) {
            setExpandedBuildings({ [json.data.factories[0].buildings[0].id]: true });
          }
        }
      } catch (e) {
        console.error('Failed to load hierarchy', e);
      } finally {
        setLoading(false);
      }
    };
    fetchHierarchy();
  }, []);

  const toggleBuilding = (bldId: string) => {
    setExpandedBuildings(prev => ({ ...prev, [bldId]: !prev[bldId] }));
  };

  const currentFactory = factories.find(f => f.id === activeFactoryId) || factories[0];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-brand-400 font-mono text-sm">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading Bangladesh Factory Topology...</span>
        </div>
      </div>
    );
  }

  if (!currentFactory) {
    return <div className="p-8 text-slate-400">No factory data discovered.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/30">
              MODULE 02
            </span>
            <span className="text-xs text-slate-400 font-mono">Organization & Physical Infrastructure</span>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Factory Topology & Line Architecture
          </h1>
          <p className="text-xs text-slate-400">
            Multi-tiered hierarchical mapping from Bangladesh RMG complexes down to cutting tables, sewing lines, and bonded warehouse bins.
          </p>
        </div>

        {/* Factory Switch Tabs */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl shrink-0">
          {factories.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFactoryId(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                currentFactory.id === f.id
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FactoryIcon className="w-3.5 h-3.5" />
              <span>{f.name.split('—')[1]?.trim() || f.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Factory Profile Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">{currentFactory.name}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                {currentFactory.code}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                Operational
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {currentFactory.address} ({currentFactory.upazila}, {currentFactory.district})
              </span>
            </div>
          </div>
        </div>

        {/* Quick Factory Stats */}
        <div className="flex items-center gap-6 border-t lg:border-t-0 lg:border-l border-slate-800 pt-3 lg:pt-0 lg:pl-6 w-full lg:w-auto">
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Buildings</p>
            <p className="text-lg font-extrabold text-white">{currentFactory.buildings.length}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Bonded Stores</p>
            <p className="text-lg font-extrabold text-white">{currentFactory.warehouses.length}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Total Lines</p>
            <p className="text-lg font-extrabold text-brand-400">
              {currentFactory.buildings.reduce((acc, b) => acc + b.floors.reduce((fAcc, fl) => fAcc + fl.departments.reduce((dAcc, d) => dAcc + d.lines.length, 0), 0), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Buildings & Floor Hierarchy Tree */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Buildings, Floors, Departments & Production Lines (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-400" />
              Production Floor Hierarchy
            </h3>
            <span className="text-[11px] text-slate-400">Real-time line capacity & target efficiency</span>
          </div>

          <div className="space-y-4">
            {currentFactory.buildings.map((building) => {
              const isExpanded = expandedBuildings[building.id] ?? true;

              return (
                <div key={building.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
                  {/* Building Header Accordion */}
                  <button
                    onClick={() => toggleBuilding(building.id)}
                    className="w-full px-5 py-3.5 bg-slate-850/80 hover:bg-slate-800/80 flex items-center justify-between text-left transition-colors border-b border-slate-800/80"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-brand-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                      <div>
                        <span className="text-xs font-bold text-white tracking-wide">{building.name}</span>
                        <span className="text-[11px] text-slate-400 ml-3">({building.floors.length} Floors)</span>
                      </div>
                    </div>
                  </button>

                  {/* Floors Content */}
                  {isExpanded && (
                    <div className="p-5 space-y-5">
                      {building.floors.map((floor) => (
                        <div key={floor.id} className="pl-3 border-l-2 border-slate-800 space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand-500" />
                            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                              {floor.name}
                            </h4>
                          </div>

                          {/* Departments & Lines */}
                          <div className="space-y-3 pl-4">
                            {floor.departments.map((dept) => (
                              <div key={dept.id} className="glass-card p-4 rounded-xl border border-slate-800/80">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-white">{dept.name}</span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                                      {dept.type}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-slate-400 font-mono">
                                    {dept.lines.length} Active {dept.lines.length === 1 ? 'Station' : 'Stations'}
                                  </span>
                                </div>

                                {/* Lines List */}
                                <div className="grid sm:grid-cols-2 gap-2.5">
                                  {dept.lines.map((line) => (
                                    <div
                                      key={line.id}
                                      className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-2 hover:border-brand-500/40 transition-all group"
                                    >
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <p className="text-xs font-bold text-slate-200 group-hover:text-brand-400 transition-colors">
                                            {line.lineNumber}
                                          </p>
                                          <p className="text-[10px] text-slate-500">ID: {line.id}</p>
                                        </div>
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                          {line.targetEfficiency}% Target
                                        </span>
                                      </div>

                                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
                                        <span className="flex items-center gap-1">
                                          <Users className="w-3 h-3 text-slate-500" />
                                          {line.operatorCapacity} Operators
                                        </span>
                                        <span>+{line.helperCapacity} Helpers</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Multi-Warehouse & Inventory Stores (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" />
              Warehouse & Bin Storage
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">{currentFactory.warehouses.length} Stores</span>
          </div>

          <div className="space-y-3">
            {currentFactory.warehouses.map((wh) => (
              <div key={wh.id} className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{wh.name}</h4>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {wh.type} STORE
                    </span>
                  </div>
                  <Boxes className="w-4 h-4 text-slate-500" />
                </div>

                {/* Bins List */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Rack & Bin Allocations</p>
                  {wh.binLocations.map((bin) => (
                    <div
                      key={bin.id}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="text-[11px] font-medium text-slate-300">{bin.rack}</p>
                        <p className="text-[10px] font-mono text-brand-400">Bin: {bin.binCode}</p>
                      </div>
                      {bin.capacityKg && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {bin.capacityKg.toLocaleString()} KG
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
