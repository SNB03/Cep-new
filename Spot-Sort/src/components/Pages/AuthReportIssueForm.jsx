// src/components/Pages/AuthReportIssueForm.jsx
import React, { useState, useEffect } from 'react'; // <-- We need useState
import api from '../../api/config';
import Button from '../Common/Button';
import LocationMap from './LocationMap'; 
import { useReportFormCommon } from '../../hooks/useReportFormCommon'; 
import axios from 'axios'; 

const AuthReportIssueForm = ({ isDayTheme, onCancel, onSuccess, token }) => { 
    const { 
        issueType, setIssueType, description, setDescription, title, setTitle,
        image, setImage, imagePreviewUrl, handleImageChange, 
        location, setLocation, zone, setZone, 
        isSubmitting, setIsSubmitting, locating, setLocating, error, setError,
        // ticketId, setTicketId, // <-- REMOVED FROM HOOK
        inputClasses, accentTextClass,
        labelTextClass, locateTextClass, locateInfoClass, cardClasses 
    } = useReportFormCommon(isDayTheme); 

    // --- [NEW] Local state for this form's success modal ---
    const [ticketId, setTicketId] = useState('');

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!title || !description || !image || !location.lat || !zone) {
            setError('Please fill out all Issue Details, Zone, Image, and Location fields.');
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        
        formData.append('title', title);
        formData.append('issueType', issueType);
        formData.append('description', description);
        formData.append('lat', location.lat);
        formData.append('lng', location.lng);
        formData.append('zone', zone);
        formData.append('issueImage', image);
        
        try {
            const response = await api.post('/issues', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    // Token is added by interceptor
                },
            });

            setTicketId(response.data.ticketId); // Uses LOCAL setTicketId
            
        } catch (error) {
            const status = error.response?.status;
            
            if (status === 401 || status === 403) {
                console.error("Session expired or invalid token. Forcing re-login.");
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                onSuccess(); // This will navigate to dashboard, which will detect logout
                return setError('Session expired. Please log in again to submit your report.');
            }

            const errorMessage = error.response?.data?.message || 'Report submission failed. Please try logging in again.';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (ticketId) {
        // --- Success Message ---
        // We use the same modal style as the anon form for consistency
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
                <div className={`rounded-3xl p-8 md:p-12 shadow-2xl max-w-lg mx-auto text-center ${cardClasses}`}>
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h2 className={`text-3xl font-extrabold mb-3 ${accentTextClass}`}>Report Submitted!</h2>
                    <p className={`text-lg ${labelTextClass} mb-4`}>
                        Thank you for helping improve your community.
                    </p>
                    <p className={`text-lg ${labelTextClass} mb-2`}>Your ticket ID is:</p>
                    <p className={`text-2xl font-bold ${accentTextClass} mb-4 font-mono`}>{ticketId}</p>
                    <p className={`${labelTextClass} text-sm mb-8`}>
                        Check your dashboard to track its status.
                    </p>
                    {/* The onSuccess prop from App.jsx will navigate back to the dashboard */}
                    <Button onClick={onSuccess} className="bg-green-500 hover:bg-green-600 text-white mt-4 px-6">
                        Return to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={`rounded-3xl p-8 md:p-16 text-center transition-colors duration-300 ${cardClasses}`}>
            <h2 className={`text-4xl md:text-5xl font-extrabold mb-6 ${accentTextClass}`}>Submit New Report (Authenticated)</h2>
            <p className={`${labelTextClass} text-lg md:text-xl mb-8 max-w-2xl mx-auto`}>
                Your submission will be **instantly linked** to your account.
            </p>
            
            {/* The onCancel prop from App.jsx will navigate back to the dashboard */}
            <Button onClick={onCancel} type="button" className={`mb-6 text-sm ${isDayTheme ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                ← Back to Dashboard
            </Button>

            {error && (
                <div className="bg-red-700 p-4 rounded-lg shadow-inner max-w-lg mx-auto mb-4">
                    <p className="text-red-200">{error}</p>
                </div>
            )}
            
            <form onSubmit={handleFormSubmit} className="max-w-lg mx-auto space-y-6">
                {/* 1. ISSUE DETAILS */}
                <h3 className={`text-2xl font-bold mb-4 ${accentTextClass}`}>1. Issue Details</h3>
                
                <input type="text" placeholder="Short Title (e.g., Large Pothole on Main St)" value={title} onChange={(e) => setTitle(e.target.value)} required className={`w-full p-4 rounded-lg border ${inputClasses}`} />
                
                <div className="text-left">
                    <label htmlFor="issueType" className={`block mb-2 ${labelTextClass}`}>Type of Issue</label>
                    <select id="issueType" value={issueType} onChange={(e) => setIssueType(e.target.value)} className={`w-full p-4 rounded-lg border ${inputClasses}`}>
                        <option value="pothole">Pothole</option>
                        <option value="waste">Waste Management</option>
                    </select>
                </div>
                <div className="text-left">
                    <label htmlFor="description" className={`block mb-2 ${labelTextClass}`}>Description of the problem</label>
                    <textarea id="description" placeholder="e.g., A large pothole on the corner of Main St and Elm Ave" value={description} onChange={(e) => setDescription(e.target.value)} required rows="4" className={`w-full p-4 rounded-lg border ${inputClasses}`}></textarea>
                </div>
                <div className="text-left">
                    <label htmlFor="image" className={`block mb-2 ${labelTextClass}`}>Upload Image</label>
                    <input type="file" id="image" accept="image/*" onChange={handleImageChange} required className={`w-full p-3 rounded-lg border cursor-pointer ${inputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${isDayTheme ? 'file:bg-teal-500 file:text-white' : 'file:bg-teal-500 file:text-white bg-gray-700'}`} />
                    {imagePreviewUrl && (<div className="mt-4"><img src={imagePreviewUrl} alt="Preview" className="w-full h-auto rounded-lg shadow-lg" /></div>)}
                </div>
                
                {/* 2. LOCATION & ZONE */}
                <h3 className={`text-2xl font-bold pt-6 mb-4 ${accentTextClass}`}>2. Confirm Location/Zone</h3>

                <input type="text" placeholder="Zone/Locality (e.g., Central Park Area)" value={zone} onChange={(e) => setZone(e.target.value)} required className={`w-full p-4 rounded-lg border ${inputClasses}`} />

                <LocationMap location={location} isDayTheme={isDayTheme} />
                
                <div className="mt-4 p-3 rounded-lg border-2 border-dashed border-teal-500">
                    {locating ? (
                        <p className={locateTextClass}>Fetching your precise GPS location...</p>
                    ) : (
                        <p className={locateTextClass}>
                            **Coordinates:** <span className={`font-bold ${locateInfoClass}`}>Lat: {location.lat?.toFixed(5) || 'N/A'}</span>, 
                            <span className={`font-bold ${locateInfoClass}`}> Lng: {location.lng?.toFixed(5) || 'N/A'}</span>
                        </p>
                    )}
                </div>

                <Button type="submit" disabled={isSubmitting || locating || !image} className="bg-teal-500 hover:bg-teal-600 text-white w-full">
                    {isSubmitting ? 'Submitting Report...' : 'Submit Report'}
                </Button>
            </form>
        </div>
    );
};

export default AuthReportIssueForm;