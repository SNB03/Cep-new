// src/components/Dashboards/AuditLogViewer.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/config';
import Button from '../Common/Button';

// Helper to get action color
const getActionColor = (action) => {
  if (action.includes('DELETE')) return 'text-red-400 bg-red-800/50';
  if (action.includes('UPDATE_ROLE') || action.includes('REASSIGN')) return 'text-yellow-400 bg-yellow-800/50';
  if (action.includes('VERIFY') || action.includes('CLOSE')) return 'text-green-400 bg-green-800/50';
  if (action.includes('UPLOAD')) return 'text-blue-400 bg-blue-800/50';
  return 'text-gray-400 bg-gray-700/50';
};

const AuditLogViewer = ({ isDayTheme, onBack }) => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const cardClasses = isDayTheme ? 'bg-white shadow-xl text-gray-900' : 'bg-gray-800 shadow-2xl text-white';
  const tableHeaderClass = isDayTheme ? 'bg-gray-200 text-gray-700' : 'bg-gray-700 text-white';
  const accentTextClass = isDayTheme ? 'text-red-600' : 'text-red-400';

  // --- 1. Fetch All Logs ---
  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/audit/logs');
      setLogs(response.data);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
      setError(err.response?.data?.message || 'Failed to load audit logs.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // --- 2. Filtering Logic ---
  const filteredLogs = (logs || []).filter(log => 
    log && (
      (log.userEmail || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.action || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.details || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.targetId || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  if (isLoading) {
    return <div className={`text-center py-10 ${isDayTheme ? 'text-gray-900' : 'text-white'}`}>Loading Audit Logs...</div>;
  }
  
  return (
    <div className="space-y-8 py-10">
      <div className="flex justify-between items-center">
        <h1 className={`text-4xl font-extrabold ${accentTextClass}`}>System Audit Log</h1>
        <Button onClick={onBack} className={`text-sm ${isDayTheme ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
          ← Back to Dashboard
        </Button>
      </div>

      {error && (
        <div className={`p-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800`}>
          **Error:** {error}
        </div>
      )}

      <div className={`p-6 rounded-xl ${cardClasses}`}>
        <div className="flex justify-between items-center mb-4">
          <input 
            type="text" 
            placeholder="Search by Email, Action, Details, or ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`p-2 rounded border w-2/3 ${isDayTheme ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'}`}
          />
          <span className="font-bold">Displaying Latest {filteredLogs.length} Logs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-600">
            <thead className={tableHeaderClass}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Target ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                <tr key={log._id} className={isDayTheme ? 'hover:bg-gray-50' : 'hover:bg-gray-700'}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">{log.userEmail}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-mono">{log.targetId || 'N/A'}</td>
                  <td className="px-4 py-4 whitespace-normal text-sm">{log.details}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-lg">No logs match the current search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogViewer;