// src/components/Dashboards/IssueDetailModal.jsx
import React, { useState } from 'react';
import Button from '../Common/Button';
import { PotholeIcon, BinIcon } from '../Common/ThemeIcons';
import api from '../../api/config'; 

// --- [MODIFIED] 1. Updated Lightbox Component ---
const ImageLightbox = ({ src, onClose }) => {
  if (!src) return null;
  return (
    <div 
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-80 p-4"
      onClick={onClose} // Close when clicking the background
    >
      {/* --- [NEW] Visible Close Button --- */}
      <button
        onClick={onClose}
        className="absolute top-4 right-6 text-white text-5xl font-bold hover:text-gray-300"
        aria-label="Close fullscreen image"
      >
        &times;
      </button>

      <img 
        src={src} 
        alt="Fullscreen" 
        className="max-w-full max-h-full rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()} // Prevent image click from closing modal
      />
    </div>
  );
};

const IssueDetailModal = ({ isOpen, onClose, issue, isDayTheme, onStatusUpdate }) => {
  if (!isOpen || !issue) return null;

  const [fullscreenImage, setFullscreenImage] = useState(null);
  const backendUrl = api.defaults.baseURL.replace('/api', ''); 

  const modalBgClass = isDayTheme ? 'bg-white text-gray-900' : 'bg-gray-800 text-white';
  const headerTextClass = isDayTheme ? 'text-teal-600' : 'text-teal-400';
  const detailTextClass = isDayTheme ? 'text-gray-700' : 'text-gray-300';
  const labelClass = isDayTheme ? 'text-gray-500' : 'text-gray-400';
  const sectionBgClass = isDayTheme ? 'bg-gray-100' : 'bg-gray-700';

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-red-500';
      case 'In Progress': return 'bg-yellow-500';
      case 'Awaiting Verification': return 'bg-blue-500';
      case 'Closed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    if (newStatus && newStatus !== issue.status) {
      onStatusUpdate(issue.ticketId, newStatus);
    }
  };

  const statusOptions = ['Pending', 'In Progress', 'Awaiting Verification', 'Closed'];

  return (
    <>
      {/* Render the lightbox component */}
      <ImageLightbox src={fullscreenImage} onClose={() => setFullscreenImage(null)} />

      {/* Wrapper: Dark overlay, centers modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70">
        
        {/* Modal Panel: Added max-h and overflow-y-auto */}
        <div className={`relative w-full max-w-2xl rounded-xl p-8 shadow-2xl transition-colors duration-300 ${modalBgClass} max-h-[90vh] overflow-y-auto`}>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 text-2xl font-bold ${isDayTheme ? 'text-gray-600' : 'text-gray-300'} hover:${isDayTheme ? 'text-gray-900' : 'text-white'}`}
            aria-label="Close modal"
          >
            &times;
          </button>

          {/* 1. TITLE */}
          <h2 className={`text-3xl font-extrabold mb-6 ${headerTextClass}`}>
            {issue.title || `${(issue.issueType || 'Issue').charAt(0).toUpperCase() + (issue.issueType || 'Issue').slice(1)} Issue`}
          </h2>

          {/* 2. DETAILS SECTION (Simplified 2-col grid) */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-6">
            <div>
              <p className={`text-sm font-semibold ${labelClass}`}>ID</p>
              <p className="font-mono text-sm">{issue.ticketId}</p>
            </div>
            <div>
              <p className={`text-sm font-semibold ${labelClass}`}>Type</p>
              <p>{(issue.issueType || 'N/A').charAt(0).toUpperCase() + (issue.issueType || 'N/A').slice(1)}</p>
            </div>
            <div>
              <p className={`text-sm font-semibold ${labelClass}`}>Status</p>
              <p><span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${getStatusColor(issue.status)}`}>{issue.status}</span></p>
            </div>
             <div>
              <p className={`text-sm font-semibold ${labelClass}`}>Reported</p>
              <p>{issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div className="col-span-2">
              <p className={`text-sm font-semibold ${labelClass}`}>Location</p>
              <p>Lat: {issue.location?.lat?.toFixed(4)}, Lng: {issue.location?.lng?.toFixed(4)}</p>
            </div>
          </div>

          {/* 3. DESCRIPTION */}
          <div className="mb-6">
            <h3 className={`text-xl font-bold mb-2 ${headerTextClass}`}>Description</h3>
            <p className={`${detailTextClass}`}>{issue.description}</p>
          </div>
          
          {/* 4. EVIDENCE SECTION */}
          <div className="mb-6">
              <h3 className={`text-xl font-bold mb-2 ${headerTextClass}`}>Evidence</h3>
              <div className="flex flex-col md:flex-row gap-4">
                  
                  {/* Submitted Image */}
                  <div className="md:w-1/2">
                      <p className={`text-sm font-semibold mb-1 ${labelClass}`}>Submitted Photo</p>
                      {issue.issueImageUrl ? (
                          <img 
                            src={`${backendUrl}${issue.issueImageUrl}`} 
                            alt={issue.title} 
                            className={`w-full h-64 rounded-lg shadow-md object-cover ${sectionBgClass} cursor-pointer transition-opacity hover:opacity-80`}
                            onClick={() => setFullscreenImage(`${backendUrl}${issue.issueImageUrl}`)}
                          />
                      ) : (
                          <div className={`w-full h-64 flex items-center justify-center rounded-lg ${sectionBgClass} ${detailTextClass}`}>No Submitted Photo</div>
                      )}
                  </div>
                  
                  {/* Resolution Image */}
                  <div className="md:w-1A/2">
                      <p className={`text-sm font-semibold mb-1 ${labelClass}`}>Resolution Photo</p>
                      {issue.resolutionImageUrl ? (
                          <img 
                            src={`${backendUrl}${issue.resolutionImageUrl}`} 
                            alt="Resolution Proof" 
                            className={`w-full h-64 rounded-lg shadow-md object-cover ${sectionBgClass} cursor-pointer transition-opacity hover:opacity-80`}
                            onClick={() => setFullscreenImage(`${backendUrl}${issue.resolutionImageUrl}`)}
                          />
                      ) : (
                          <div className={`w-full h-64 flex items-center justify-center rounded-lg ${sectionBgClass} ${detailTextClass}`}>No Resolution Photo</div>
                      )}
                  </div>
              </div>
          </div>

          {/* 5. ACTIONS */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-500 pt-6 mt-6">
            <div className="flex items-center gap-3">
              <label htmlFor="status-select" className={`${labelClass} font-semibold`}>Update Status:</label>
              <select
                id="status-select"
                value={issue.status}
                onChange={handleStatusChange}
                className={`p-2 rounded-lg border ${isDayTheme ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'}`}
              >
                {statusOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <Button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2">
              Close
            </Button>
          </div>

          {/* Issue Timeline */}
          <div className={`mt-6 p-4 rounded-lg ${sectionBgClass} ${detailTextClass} text-sm`}>
            <p className="font-semibold mb-2">Issue Timeline (Placeholder)</p>
            <ul>
              <li>Reported: {issue.createdAt ? new Date(issue.createdAt).toLocaleString() : 'N/A'}</li>
              {issue.status !== 'Pending' && <li>Assigned: (Date/Time)</li>}
              {issue.status === 'Awaiting Verification' && <li>Marked Ready for Verification: (Date/Time)</li>}
              {issue.status === 'Closed' && <li>Citizen Verified: (Date/Time)</li>}
            </ul>
          </div>

        </div>
      </div>
    </>
  );
};

export default IssueDetailModal;