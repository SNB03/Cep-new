// src/components/Auth/LoginSection.jsx
import React, { useState } from 'react';
import api from '../../api/config';
import { EyeIcon } from '../Common/ThemeIcons';
import Button from '../Common/Button';

const LoginSection = ({ onLoginSuccess, isDayTheme, onError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const cardClasses = isDayTheme ? 'bg-gray-100 shadow-xl' : 'bg-gray-800 shadow-2xl';
  const inputClasses = isDayTheme ?
    "bg-white border-gray-300 text-gray-900 placeholder-gray-500" :
    "bg-gray-700 border-gray-600 text-white placeholder-gray-400";
  const accentTextClass = isDayTheme ? 'text-teal-600' : 'text-teal-400';
  const labelTextClass = isDayTheme ? 'text-gray-700' : 'text-gray-300';

  const handleLoginAttempt = async (e) => {
    e.preventDefault();
    onError(null);
    setIsLoading(true);

    // --- START REAL API CALL (Handles all roles) ---
    try {
      const response = await api.post(`/auth/login`, {
        email,
        password,
        role,
      });

      const { token, role: userRole } = response.data;
      onLoginSuccess(token, userRole);

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Check server connection.';
      onError(errorMessage);
      console.error("Login Error:", error);
    } finally {
      setIsLoading(false);
    }
    // --- END REAL API CALL ---
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-20 md:py-32">
      <div className={`rounded-3xl p-8 md:p-16 text-center max-w-lg w-full transition-colors duration-300 ${cardClasses}`}>
        <h2 className={`text-4xl md:text-5xl font-extrabold mb-6 ${accentTextClass}`}>Welcome Back</h2>
        <p className={`${labelTextClass} text-lg md:text-xl mb-12`}>
          Please log in to your account.
        </p>
        <form onSubmit={handleLoginAttempt} className="flex flex-col space-y-6">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={`w-full p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${inputClasses}`}
          />

          {/* Password Input Group with Toggle */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors pr-12 ${inputClasses}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${isDayTheme ? 'text-gray-500 hover:text-teal-600' : 'text-gray-400 hover:text-teal-400'}`}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <EyeIcon className="h-6 w-6" showPassword={showPassword} />
            </button>
          </div>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={`w-full p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${inputClasses}`}
          >
            <option value="citizen">Citizen</option>
            <option value="authority">Authority</option>
            <option value="admin">Admin</option>
Â        </select>
          <Button type="submit" disabled={isLoading} className="bg-teal-500 hover:bg-teal-600 text-white">
            {isLoading ? 'Logging In...' : 'Log In'}
          </Button>
        </form>
        
        {/* --- [NEW] MOCK LOGIN HELPER TEXT --- */}
        <p className={`${isDayTheme ? 'text-gray-600' : 'text-gray-400'} mt-8 text-sm text-left border-t pt-4 ${isDayTheme ? 'border-gray-300' : 'border-gray-700'}`}>
          **TESTING CREDENTIALS (Bypasses DB):**
        <ul className="mt-2 space-y-1 list-disc list-inside">
<li><span className="font-medium">Admin:</span> `admin@test.com` / `test1234` (Role: Admin)</li>
<li><span className="font-medium">Authority:</span> `authority@test.com` / `test1234` (Role: Authority)</li>
<li>(Citizen accounts must be created via Sign Up)</li>
</ul>
 </p>
      </div>
    </div>
  );
};

export default LoginSection;