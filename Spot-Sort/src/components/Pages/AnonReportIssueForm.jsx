// src/components/Pages/AnonReportIssueForm.jsx
import React, { useState } from 'react'; // <-- We need useState for local state
import api from '../../api/config';
import Button from '../Common/Button';
import LocationMap from './LocationMap'; 
import { useReportFormCommon } from '../../hooks/useReportFormCommon'; 

const AnonReportIssueForm = ({ isDayTheme, onCancel, onSuccess }) => { 
    const { 
        issueType, setIssueType, description, setDescription, title, setTitle,
        image, setImage, imagePreviewUrl, setImagePreviewUrl, handleImageChange, 
        location, setLocation, zone, setZone, 
        isSubmitting, setIsSubmitting, locating, setLocating, error, setError,
        // ticketId, setTicketId, // <-- REMOVED FROM HOOK
        inputClasses, accentTextClass,
        labelTextClass, locateTextClass, locateInfoClass, cardClasses
    } = useReportFormCommon(isDayTheme);

    // --- [NEW] Local state for this form's success modal ---
    const [ticketId, setTicketId] = useState('');

    // --- ANONYMOUS SPECIFIC STATES ---
    const [reporterName, setReporterName] = useState('');
    const [reporterEmail, setReporterEmail] = useState('');
    const [reporterMobile, setReporterMobile] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [tempSessionId, setTempSessionId] = useState(null); 
    const [enteredOtp, setEnteredOtp] = useState('');

    // --- Function to reset the form after success ---
    const resetForm = () => {
        setTitle('');
        setIssueType('pothole');
        setDescription('');
        setZone('');
        setImage(null);
        setImagePreviewUrl(null);
        setReporterName('');
        setReporterEmail('');
        setReporterMobile('');
        setIsVerifying(false);
        setTempSessionId(null);
        setEnteredOtp('');
        setTicketId(''); // This will now use the LOCAL setTicketId
        setError(null);
    };

    // --- Handler for the "Return to Home" button ---
    const handleCloseAndHome = () => {
        resetForm();  // Hides the modal
        onSuccess();  // Scrolls to top (from parent component)
    };

    // ... (handleSendOtp function remains the same) ...
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError(null);
        
        if (!reporterEmail || !reporterMobile || !reporterName || !description || !location.lat || !title || !zone) {
            setError('Please fill out ALL fields (Contact, Issue Details, Location, and Zone).');
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await api.post('/issues/otp-send', {
                reporterName, reporterEmail, reporterMobile, title, zone,
                issueType, description, lat: location.lat, lng: location.lng
            });
            setTempSessionId(response.data.tempId);
            setIsVerifying(true);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to send verification code. Check email service.';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ... (handleVerifyAndSubmit function remains the same) ...
    const handleVerifyAndSubmit = async (e) => {
        e.preventDefault();
        
        if (!enteredOtp || !tempSessionId) {
            setError('Invalid verification state. Please restart the submission.');
            return;
        }
        if (!image) {
            setError('Please upload an issue image before submitting.');
            return;
        }
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData();
        formData.append('enteredOtp', enteredOtp);
        formData.append('tempId', tempSessionId);
        formData.append('issueImage', image); 

        try {
            const response = await api.post(`/issues/anonymous`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setTicketId(response.data.ticketId); // Uses LOCAL setTicketId
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Verification or final submission failed.';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Determine the form handler for the current step
    const currentFormHandler = isVerifying ? handleVerifyAndSubmit : handleSendOtp;

    // --- Success Modal ---
    const renderSuccessModal = () => {
        if (!ticketId) return null; // Uses LOCAL ticketId

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
                        The ID has been sent to **{reporterEmail}**. Use it to track your report.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button 
                            onClick={handleCloseAndHome} 
                            className={`w-full ${isDayTheme ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            Return to Home
                        </Button>
                        <Button 
                            onClick={resetForm} 
                            className="w-full bg-teal-500 hover:bg-teal-600 text-white"
                        >
                            Report Another Issue
                        </Button>
                    </div>
                </div>
            </div>
        );
    };
    
    // ... (The rest of the form rendering is identical) ...
    return (
        <div className={`relative rounded-3xl p-8 md:p-16 text-center transition-colors duration-300 ${cardClasses}`}>
            
            {renderSuccessModal()}

            <h2 className={`text-4xl md:text-5xl font-extrabold mb-6 ${accentTextClass}`}>Report an Issue (Anonymous)</h2>
            <p className={`${labelTextClass} text-lg md:text-xl mb-8 max-w-2xl mx-auto`}>
                {isVerifying ? 
                    `Enter the code sent to ${reporterEmail} to verify your identity.` :
                    'Verify your email address to submit your report and receive a tracking ID.'}
            </p>
            
            <Button onClick={onCancel} type="button" className={`mb-6 text-sm ${isDayTheme ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                ← Back to Home
            </Button>

            {error && (
                <div className="bg-red-700 p-4 rounded-lg shadow-inner max-w-lg mx-auto mb-4">
                    <p className="text-red-200">{error}</p>
                </div>
            )}
            
            <form onSubmit={currentFormHandler} className="max-w-lg mx-auto space-y-6">
                
                {/* CONTACT INFO (STEP 1/EDIT) */}
                {(!isVerifying) && (
                    <>
                        <h3 className={`text-2xl font-bold mb-4 ${accentTextClass}`}>1. Your Contact Info</h3>
                        <input type="text" placeholder="Your Full Name" value={reporterName} onChange={(e) => setReporterName(e.target.value)} required className={`w-full p-4 rounded-lg border ${inputClasses}`} />
                        {/* Fixed typo w-fulel -> w-full */}
                        <input type="email" placeholder="Your Email (for verification & ID)" value={reporterEmail} onChange={(e) => setReporterEmail(e.target.value)} required className={`w-full p-4 rounded-lg border ${inputClasses}`} />
                        <input type="tel" placeholder="Your Mobile Number" value={reporterMobile} onChange={(e) => setReporterMobile(e.target.value)} required className={`w-full p-4 rounded-lg border ${inputClasses}`} />
                    </>
                )}

                {/* VERIFICATION STEP (STEP 2) */}
                {isVerifying && (
                    <>
                        <h3 className={`text-2xl font-bold mb-4 ${accentTextClass}`}>Verification Code</h3>
                        <input type="text" placeholder="Enter 6-digit Code" value={enteredOtp} onChange={(e) => setEnteredOtp(e.target.value)} required className={`w-full p-4 rounded-lg border ${inputClasses}`} />
                    </>
                )}
                
                {/* ISSUE DETAILS (Visible on Step 1) */}
                {!isVerifying && (
                    <>
                        <h3 className={`text-2xl font-bold pt-6 mb-4 ${accentTextClass}`}>2. Issue Details</h3>
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
                    </>
                )}
                
                {/* Image upload is now part of Step 2 (Verification) */}
                {isVerifying && (
                    <div className="text-left">
                        <label htmlFor="image" className={`block mb-2 ${labelTextClass}`}>Upload Image (Required)</label>
                        <input type="file" id="image" accept="image/*" onChange={handleImageChange} required className={`w-full p-3 rounded-lg border cursor-pointer ${inputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${isDayTheme ? 'file:bg-teal-500 file:text-white' : 'file:bg-teal-500 file:text-white bg-gray-700'}`} />
                        {imagePreviewUrl && (<div className="mt-4"><img src={imagePreviewUrl} alt="Preview" className="w-full h-auto rounded-lg shadow-lg" /></div>)}
                    </div>
                )}
                
                {/* LOCATION & ZONE (Only on Step 1) */}
                {!isVerifying && (
                    <>
                        <h3 className={`text-2xl font-bold pt-6 mb-4 ${accentTextClass}`}>3. Confirm Location/Zone</h3>
                        <input type="text" placeholder="Zone/Locality (e.g., Central Park Area)" value={zone} onChange={(e) => setZone(e.target.value)} required className={`w-full p-4 rounded-lg border ${inputClasses}`} />
                        <LocationMap location={location} isDayTheme={isDayTheme} />
                        <div className="mt-4 p-3 rounded-lg border-2 border-dashed border-teal-500">
                            {locating ? (<p className={locateTextClass}>Fetching your precise GPS location...</p>) : (
                                <p className={locateTextClass}>
                                    **Coordinates:** <span className={`font-bold ${locateInfoClass}`}>Lat: {location.lat?.toFixed(5) || 'N/A'}</span>, <span className={`font-bold ${locateInfoClass}`}> Lng: {location.lng?.toFixed(5) || 'N/A'}</span>
                                </p>
                            )}
                        </div>
                    </>
                )}

                {/* Submission Button */}
                <Button 
                    type="submit" 
                    disabled={isSubmitting || locating || (isVerifying && !image)} 
                    className="bg-teal-500 hover:bg-teal-600 text-white w-full"
                >
                    {isSubmitting ? 'Processing...' : (isVerifying ? 'Verify & Submit Report' : 'Send Verification Code')}
                </Button>
                
                {/* Anonymous Edit Button */}
                {isVerifying && (
                    <Button type="button" onClick={() => setIsVerifying(false)} className={`bg-transparent border-2 ${isDayTheme ? 'border-gray-500 text-gray-500 hover:bg-gray-100' : 'border-gray-500 text-gray-400 hover:bg-gray-700'} w-full mt-2`}>
                        Edit Contact/Details
                    </Button>
                )}
            </form>
        </div>
    );
};

export default AnonReportIssueForm;