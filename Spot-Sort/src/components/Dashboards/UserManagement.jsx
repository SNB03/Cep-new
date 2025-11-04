// src/components/Dashboards/UserManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/config';
import Button from '../Common/Button';

// Helper to get role color
const getRoleColor = (role) => {
  switch (role) {
    case 'admin': return 'text-red-400 bg-red-800/50';
    case 'authority': return 'text-blue-400 bg-blue-800/50';
    case 'citizen': return 'text-green-400 bg-green-800/50';
    default: return 'text-gray-400 bg-gray-700/50';
  }
};

const UserManagement = ({ isDayTheme, onBack }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const cardClasses = isDayTheme ? 'bg-white shadow-xl text-gray-900' : 'bg-gray-800 shadow-2xl text-white';
  const tableHeaderClass = isDayTheme ? 'bg-gray-200 text-gray-700' : 'bg-gray-700 text-white';
  const accentTextClass = isDayTheme ? 'text-red-600' : 'text-red-400';

  // --- 1. Fetch All Users ---
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use the new admin-only endpoint
      const response = await api.get('/auth/users');
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(err.response?.data?.message || 'Failed to load user data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // --- 2. Action Handlers ---
  const handleDelete = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user: ${userName}? \nThis action CANNOT be undone.`)) {
      try {
        await api.delete(`/auth/users/${userId}`);
        alert('User deleted successfully.');
        fetchUsers(); // Refresh the list
      } catch (err) {
        alert(`Error deleting user: ${err.response?.data?.message}`);
      }
    }
  };

  const handleMakeAuthority = async (userId, userName) => {
    const zone = prompt(`Enter the zone to assign to authority: ${userName}`);
    if (zone) {
      try {
        await api.put(`/auth/users/${userId}/role`, { role: 'authority', zone: zone });
        alert('User updated to Authority.');
        fetchUsers(); // Refresh
      } catch (err) {
        alert(`Error updating role: ${err.response?.data?.message}`);
      }
    } else {
      alert('Action canceled. A zone is required.');
    }
  };

  const handleMakeCitizen = async (userId) => {
    if (window.confirm('Are you sure you want to demote this user to Citizen? Their zone assignment will be removed.')) {
      try {
        await api.put(`/auth/users/${userId}/role`, { role: 'citizen', zone: null });
        alert('User updated to Citizen.');
        fetchUsers(); // Refresh
      } catch (err) {
        alert(`Error updating role: ${err.response?.data?.message}`);
      }
    }
  };

  // --- 3. Filtering Logic ---
  const filteredUsers = (users || []).filter(user => 
    user && (
      (user.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (user.role || '').toLowerCase().includes(search.toLowerCase()) ||
      (user.zone || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  if (isLoading) {
    return <div className={`text-center py-10 ${isDayTheme ? 'text-gray-900' : 'text-white'}`}>Loading User Management...</div>;
  }
  
  return (
    <div className="space-y-8 py-10">
      <div className="flex justify-between items-center">
        <h1 className={`text-4xl font-extrabold ${accentTextClass}`}>User Management</h1>
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
            placeholder="Search by Name, Email, Role, or Zone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`p-2 rounded border w-2/3 ${isDayTheme ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'}`}
          />
          <span className="font-bold">Total Users: {filteredUsers.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-600">
            <thead className={tableHeaderClass}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Zone</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <tr key={user._id} className={isDayTheme ? 'hover:bg-gray-50' : 'hover:bg-gray-700'}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">{user.name || 'N/A'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">{user.email || 'N/A'}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">{user.zone || '---'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm space-x-2">
                    {user.role !== 'authority' &&
                      <Button onClick={() => handleMakeAuthority(user._id, user.name)} className="bg-blue-500 hover:bg-blue-600 text-white p-2 text-xs">Make Authority</Button>
                    }
                    {user.role !== 'citizen' &&
                      <Button onClick={() => handleMakeCitizen(user._id)} className="bg-green-500 hover:bg-green-600 text-white p-2 text-xs">Make Citizen</Button>
                    }
                    <Button onClick={() => handleDelete(user._id, user.name)} className="bg-red-500 hover:bg-red-600 text-white p-2 text-xs">Delete</Button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-lg">No users match the current search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;