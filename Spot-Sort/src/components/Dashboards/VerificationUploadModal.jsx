// src/components/Dashboards/VerificationUploadModal.jsx
import React, { useState } from 'react';
import Button from '../Common/Button';
import api from '../../api/config'; // Used for the actual upload

const VerificationUploadModal = ({ isOpen, onClose, issue, isDayTheme, onStatusUpdate }) => {
  const [resolutionImage, setResolutionImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !issue) return null;

  const modalBgClass = isDayTheme ? 'bg-white text-gray-900' : 'bg-gray-800 text-white';
  const headerTextClass = isDayTheme ? 'text-purple-600' : 'text-purple-400';
  const labelTextClass = isDayTheme ? 'text-gray-700' : 'text-gray-300';
  const inputClasses = isDayTheme ?
    "bg-white border-gray-300 text-gray-900" :
    "bg-gray-700 border-gray-600 text-white";

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setResolutionImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionImage) {
      setError('Please upload the proof of resolution photo.');
      return;
    }

    setIsUploading(true);
    setError(null);
    const token = localStorage.getItem('token');
    
    // Create FormData for the file upload and status update
    const formData = new FormData();
    formData.append('resolutionImage', resolutionImage); // Must match backend Multer field
    formData.append('status', 'Awaiting Verification');
    
    // --- API Call Simulation ---
    // In a real application, you would make an API call here.
   try {
       const response = await api.put(`/issues/${issue.ticketId}/resolve`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                // 'Authorization': `Bearer ${token}`, // <-- This line is removed
            },
        });
        
        // Update status in the frontend optimistically
        onStatusUpdate(issue.ticketId, response.data.newStatus);
        
        // Clean up and close
        setResolutionImage(null);
        setImagePreviewUrl(null);
        onClose();

    } catch (err) {
        // ... error handling
        setError(err.response?.data?.message || 'Upload failed.');
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70">
      <form onSubmit={handleSubmit} className={`relative w-full max-w-lg rounded-xl p-8 shadow-2xl transition-colors duration-300 ${modalBgClass}`}>
        <h2 className={`text-2xl font-extrabold mb-4 ${headerTextClass}`}>
          Verify Resolution for ID: {issue.ticketId}
        </h2>
        <p className={`${labelTextClass} mb-6`}>
          Please upload a photo showing the issue has been fully resolved. This photo will be sent to the citizen for final confirmation.
        </p>

        {error && (
            <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                {error}
            </div>
        )}

        <div className="mb-6">
            <label htmlFor="resolution-image" className={`block mb-2 font-semibold ${labelTextClass}`}>
                Upload Proof Photo (Required)
            </label>
            <input
                type="file"
                id="resolution-image"
                accept="image/*"
                onChange={handleImageChange}
                required
                className={`w-full p-3 rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${isDayTheme ? 'file:bg-purple-500 file:text-white' : 'file:bg-purple-500 file:text-white bg-gray-700 border-gray-600'}`}
            />
        </div>

        {imagePreviewUrl && (
            <div className="mb-6">
                <p className={`mb-2 font-semibold ${labelTextClass}`}>Preview:</p>
                <img src={imagePreviewUrl} alt="Resolution Preview" className="w-full h-auto rounded-lg shadow-lg" />
            </div>
        )}

        <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button 
                type="button" 
                onClick={onClose} 
                className={`bg-gray-500 hover:bg-gray-600 text-white px-6 py-2`}
                disabled={isUploading}
            >
                Cancel
            </Button>
            <Button 
                type="submit" 
                className={`px-6 py-2 ${isUploading ? 'bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'} text-white`}
                disabled={isUploading || !resolutionImage}
            >
                {isUploading ? 'Uploading...' : 'Submit & Verify Ready'}
            </Button>
        </div>
      </form>
    </div>
  );
};

export default VerificationUploadModal;