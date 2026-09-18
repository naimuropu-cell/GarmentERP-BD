import React, { useState, useEffect } from 'react';
import { History, Search, Clock } from 'lucide-react';
import { AuditLogItem } from '../../types';

export const AuditView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('garment_access_token');
        const res = await fetch('/api/v1/audit/logs', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const json = await res.json();
        if (json.success && json.data?.logs) {
          setLogs(json.data.logs);
        }
      } catch (err) {
        console.error('Failed to load audit logs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'LOGIN': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'CREATE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'UPDATE': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'DELETE': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'APPROVAL': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const filteredLogs = logs.filter(l => {
    const matchesAction = actionFilter === 'ALL' || l.action === actionFilter;
    const matchesSearch = 
      l.entityName.toLowerCase().includes(search.toLowerCase()) ||
      (l.userEmail && l.userEmail.toLowerCase().includes(search.toLowerCase())) ||
      (l.userName && l.userName.toLowerCase().includes(search.toLowerCase())) ||
      l.entityId.toLowerCase().includes(search.toLowerCase());
    return matchesAction && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              AUDIT TRAIL
            </span>
            <span className="text-xs text-slate-400 font-mono">Immutable Compliance Ledger</span>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Tamper-Evident System Audit Trail
          </h1>
          <p className="text-xs text-slate-400">
            Cryptographically timestamped record of all user authentications, role modifications, and production entity mutations.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative w-48">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
          >
            <option value="ALL">All Actions</option>
            <option value="LOGIN">LOGIN</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <History className="w-4 h-4 text-brand-400" />
            <span>Audit Records ({filteredLogs.length})</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Immutable append-only ledger</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 font-mono border-b border-slate-800">
                <th className="p-3.5 font-bold">Timestamp (BST)</th>
                <th className="p-3.5 font-bold">Action</th>
                <th className="p-3.5 font-bold">Actor / User</th>
                <th className="p-3.5 font-bold">Target Entity</th>
                <th className="p-3.5 font-bold">Entity ID</th>
                <th className="p-3.5 font-bold">Details / Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-sans">
                    <div className="flex items-center justify-center gap-2 text-brand-400">
                      <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading Audit Ledger...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-sans">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="p-3.5 text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-sans">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {new Date(log.timestamp).toLocaleString('en-US', { timeZone: 'Asia/Dhaka', hour12: true })}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 font-sans">
                      <p className="font-bold text-slate-200">{log.userName || 'System Auto'}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{log.userEmail || 'daemon'}</p>
                    </td>
                    <td className="p-3.5 font-sans font-semibold text-slate-300">
                      {log.entityName}
                    </td>
                    <td className="p-3.5 text-brand-400">
                      {log.entityId}
                    </td>
                    <td className="p-3.5 text-slate-400 max-w-xs truncate">
                      {log.newValues ? (
                        <span className="text-[11px] text-slate-300">
                          {JSON.stringify(log.newValues)}
                        </span>
                      ) : (
                        <span className="text-slate-400">IP: {log.ipAddress || '127.0.0.1'}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
