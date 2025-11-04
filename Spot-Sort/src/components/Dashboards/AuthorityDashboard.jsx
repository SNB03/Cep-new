// src/components/Dashboards/AuthorityDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/config';
import IssueColumn from './IssueColumn';
import AuthorityMetrics from './AuthorityMetrics';
import IssueMap from './IssueMap'; 
import { PotholeIcon, BinIcon } from '../Common/ThemeIcons';
import Button from '../Common/Button';

const AuthorityDashboard = ({ isDayTheme }) => {
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');

  const fetchIssues = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/issues/authority/dashboard');
      setIssues(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load issues for your zone.');
      console.error(err);
      setIssues([]); 
    } finally {
      setIsLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleStatusUpdate = async (ticketId, newStatus) => {
    // Optimistic UI update
    setIssues(prevIssues => 
      prevIssues.map(issue => 
        issue.ticketId === ticketId ? { ...issue, status: newStatus } : issue
      )
    );
    
    try {
        await api.put(`/issues/${ticketId}/status`, { status: newStatus });
        fetchIssues(); // Refresh data to ensure sync
    } catch (err) {
        console.error("Status Update Failed:", err);
        alert(`Error updating status: ${err.response?.data?.message}. Reverting change.`);
        fetchIssues(); 
    }
  };

  const getColumnIssues = (status) => {
    let filtered = issues.filter(issue => issue.status === status);
    
    if (filterType !== 'all') {
      filtered = filtered.filter(issue => issue.issueType === filterType);
    }
    
    if (status === 'Pending') {
      filtered.sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        const aDays = (Date.now() - aDate) / (1000 * 60 * 60 * 24);
        const bDays = (Date.now() - bDate) / (1000 * 60 * 60 * 24);
        
        if (aDays > 7 && bDays <= 7) return -1;
        if (aDays <= 7 && bDays > 7) return 1;
        return 0;
      });
    }
    return filtered;
  };
  
  const cardClasses = isDayTheme ? 'bg-white shadow-xl text-gray-900' : 'bg-gray-800 shadow-2xl text-white';

  if (isLoading) return <div className={`text-center py-20 ${isDayTheme ? 'text-gray-700' : 'text-gray-300'}`}>Loading Issues...</div>;
  if (error) return <div className={`p-4 bg-red-700 text-white rounded-lg`}>Error: {error}</div>;

  // Pre-calculate issue lists
  const pendingIssues = getColumnIssues('Pending');
  const inProgressIssues = getColumnIssues('In Progress');
  const awaitingIssues = getColumnIssues('Awaiting Verification');

  return (
    <div className="space-y-8">
      <h1 className={`text-4xl font-extrabold ${isDayTheme ? 'text-teal-600' : 'text-teal-400'}`}>Authority Operations Dashboard</h1>
      
      {/* Metrics Section */}
      <AuthorityMetrics issues={issues} isDayTheme={isDayTheme} />

      {/* Filter and Map Section */}
     <div className={`p-6 rounded-xl transition-colors duration-300 ${cardClasses}`}>
        <div className="flex flex-wrap justify-between items-center">
            <div className="flex space-x-3 items-center">
                <h2 className="text-xl font-bold mr-3">Filter by Type:</h2>
                <Button 
                    onClick={() => setFilterType('all')} 
                    className={`py-2 px-4 text-sm ${filterType === 'all' ? 'bg-teal-500 text-white' : isDayTheme ? 'bg-gray-200 text-gray-700 hover:bg-teal-100' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
                    All ({issues.length})
                </Button>
                <Button 
                    onClick={() => setFilterType('pothole')} 
                    className={`py-2 px-4 text-sm ${filterType === 'pothole' ? 'bg-purple-500 text-white' : isDayTheme ? 'bg-gray-200 text-gray-700 hover:bg-purple-100' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
                    Potholes ({issues.filter(i => i.issueType === 'pothole').length})
                </Button>
                <Button 
                    onClick={() => setFilterType('waste')} 
                    className={`py-2 px-4 text-sm ${filterType === 'waste' ? 'bg-orange-500 text-white' : isDayTheme ? 'bg-gray-200 text-gray-700 hover:bg-orange-100' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
                    Waste ({issues.filter(i => i.issueType === 'waste').length})
                </Button>
            </div>
        </div>
        
        {/* Placeholder for Map View */}
        <div className="mt-6">
            <IssueMap isDayTheme={isDayTheme} issueLocations={issues.map(i => ({ lat: i.lat, lng: i.lng, id: i.ticketId }))} />
        </div>
    </div>

      {/* --- [MODIFIED] Kanban-Style Columns --- */}
      {/* This is now just a grid. The IssueColumn component handles all styling. */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Column 1: Pending */}
        <IssueColumn
          title="Issues Pending (New & High Priority)"
          issues={pendingIssues}
          count={pendingIssues.length}
          isDayTheme={isDayTheme}
          onStatusUpdate={handleStatusUpdate}
          titleColor="text-red-400"
          separatorColor="border-red-500"
        />

        {/* Column 2: In Progress */}
        <IssueColumn
          title="In Progress (Assigned & Working)"
          issues={inProgressIssues}
          count={inProgressIssues.length}
          isDayTheme={isDayTheme}
          onStatusUpdate={handleStatusUpdate}
          titleColor="text-teal-400"
          separatorColor="border-teal-500"
        />
        
        {/* Column 3: Awaiting Verification */}
        <IssueColumn
          title="Awaiting Citizen Verification"
          issues={awaitingIssues}
          count={awaitingIssues.length}
          isDayTheme={isDayTheme}
          onStatusUpdate={handleStatusUpdate}
          titleColor="text-teal-400"
          separatorColor="border-teal-500"
        />
      </div>
    </div>
  );
};

export default AuthorityDashboard;