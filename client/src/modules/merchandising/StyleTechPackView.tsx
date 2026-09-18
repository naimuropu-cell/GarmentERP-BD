import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Ruler, 
  Scissors
} from 'lucide-react';
import { GarmentStyle, TechPackVersion } from '../../types/merchandising';

export const StyleTechPackView: React.FC = () => {
  const [styles, setStyles] = useState<GarmentStyle[]>([]);
  const [selectedStyleId, setSelectedStyleId] = useState<string>('');
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchStyles = async () => {
      try {
        const token = localStorage.getItem('garment_access_token');
        const res = await fetch('/api/v1/styles', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const json = await res.json();
        if (json.success && json.data?.length > 0) {
          setStyles(json.data);
          setSelectedStyleId(json.data[0].id);
          setSelectedVersion(json.data[0].activeTechPackVersion);
        }
      } catch (e) {
        console.error('Failed to load styles', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStyles();
  }, []);

  const currentStyle = styles.find(s => s.id === selectedStyleId) || styles[0];
  const currentTechPack: TechPackVersion | undefined = currentStyle?.techPackVersions.find(
    v => v.version === selectedVersion
  ) || currentStyle?.techPackVersions[0];

  const filteredStyles = styles.filter(s =>
    s.styleNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.styleName.toLowerCase().includes(search.toLowerCase()) ||
    s.buyerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/30">
              MODULE 04 & 05
            </span>
            <span className="text-xs text-slate-400 font-mono">Merchandising & Technical Specifications</span>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Garment Style Master & Versioned Tech Packs
          </h1>
          <p className="text-xs text-slate-400">
            Engineered measurement charts, graded size specs, tolerances (+/- cm), fabric wash recipes, and version revision history.
          </p>
        </div>

        <div className="relative w-48 sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search styles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-8 flex items-center justify-center min-h-[300px]">
          <div className="flex items-center gap-2 text-brand-400 text-xs font-mono">
            <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading Styles & Tech Packs...</span>
          </div>
        </div>
      ) : !currentStyle ? (
        <div className="p-8 text-slate-400">No styles registered.</div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Column: Styles Directory List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
              <span>Registered Styles ({filteredStyles.length})</span>
              <span className="text-[10px] font-mono">Select to view specs</span>
            </div>

            <div className="space-y-2">
              {filteredStyles.map((stl) => {
                const isSelected = stl.id === currentStyle.id;

                return (
                  <button
                    key={stl.id}
                    onClick={() => {
                      setSelectedStyleId(stl.id);
                      setSelectedVersion(stl.activeTechPackVersion);
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'bg-slate-900 border-brand-500 ring-1 ring-brand-500/30 shadow-xl'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                          {stl.styleNumber}
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />}
                        </span>
                        <p className="text-xs text-slate-300 font-medium mt-0.5 line-clamp-1">{stl.styleName}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                        {stl.activeTechPackVersion}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Buyer: <strong className="text-slate-200">{stl.buyerName.split(' ')[0]}</strong></span>
                      <span className="text-brand-400 font-mono">{stl.season}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Complete Tech Pack Viewer (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Style Overview Header Banner */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-base font-extrabold text-white font-mono">{currentStyle.styleNumber}</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                      {currentStyle.productCategory} • {currentStyle.garmentType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{currentStyle.styleName}</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Buyer: <span className="font-semibold text-white">{currentStyle.buyerName}</span> | Brand: <span className="text-slate-300">{currentStyle.brand}</span>
                  </p>
                </div>

                {/* Tech Pack Version Switcher */}
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl shrink-0">
                  <span className="text-[11px] font-semibold text-slate-400 px-2">Tech Pack:</span>
                  {currentStyle.techPackVersions.map(v => (
                    <button
                      key={v.version}
                      onClick={() => setSelectedVersion(v.version)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                        currentTechPack?.version === v.version
                          ? 'bg-brand-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <span>{v.version}</span>
                      {v.isApproved && <CheckCircle2 className="w-3 h-3 text-emerald-300" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color & Size tags */}
              <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Colors:</span>
                  {currentStyle.availableColors.map(c => (
                    <span key={c} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700 text-[11px]">
                      {c}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Graded Sizes:</span>
                  {currentStyle.availableSizes.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-md bg-slate-800 font-mono text-brand-400 border border-slate-700 text-[11px] font-bold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tech Pack Detailed Tabs & Panels */}
            {currentTechPack && (
              <div className="space-y-4">
                {/* Fabric & Construction Specs */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                    <Scissors className="w-4 h-4 text-brand-400" />
                    Fabric Specification & Washing Recipe
                  </h3>

                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Composition</span>
                      <p className="font-bold text-slate-200 mt-0.5">{currentTechPack.fabricSpecs.composition}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Knit Construction</span>
                      <p className="font-bold text-slate-200 mt-0.5">{currentTechPack.fabricSpecs.construction}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Target GSM & Yarn</span>
                      <p className="font-bold text-brand-400 mt-0.5">{currentTechPack.fabricSpecs.weightGsm} GSM • {currentTechPack.fabricSpecs.yarnCount}</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Stitch & Sewing Instructions</span>
                      <p className="text-slate-300 mt-1 leading-relaxed">{currentTechPack.stitchSpecs}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Washing & Care Recipe</span>
                      <p className="text-slate-300 mt-1 leading-relaxed">{currentTechPack.washingInstructions}</p>
                    </div>
                  </div>
                </div>

                {/* Measurement Chart & Tolerances Table */}
                <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                  <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <Ruler className="w-4 h-4 text-amber-400" />
                      <span>Graded Measurement Chart & Quality Tolerances</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">All specs in centimeters (cm)</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900/90 text-slate-400 font-mono border-b border-slate-800">
                          <th className="p-3 font-bold">Code</th>
                          <th className="p-3 font-bold min-w-[200px]">Point of Measurement (POM)</th>
                          <th className="p-3 font-bold text-center">Tol (+)</th>
                          <th className="p-3 font-bold text-center">Tol (-)</th>
                          {currentStyle.availableSizes.map(s => (
                            <th key={s} className="p-3 font-bold text-center bg-slate-850/60 font-mono text-white">
                              {s}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {currentTechPack.measurements.map((m) => (
                          <tr key={m.code} className="hover:bg-slate-850/50 transition-colors">
                            <td className="p-3 font-bold text-brand-400">{m.code}</td>
                            <td className="p-3 font-sans text-slate-200">{m.pointOfMeasure}</td>
                            <td className="p-3 text-center text-emerald-400">+{m.tolerancePlusCm}</td>
                            <td className="p-3 text-center text-rose-400">-{m.toleranceMinusCm}</td>
                            {currentStyle.availableSizes.map(sz => (
                              <td key={sz} className="p-3 text-center font-bold text-slate-100 bg-slate-900/30">
                                {m.specsBySize[sz] !== undefined ? `${m.specsBySize[sz]}` : '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
