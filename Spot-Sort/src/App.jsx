// // src/App.jsx
// import React, { useState, useEffect } from 'react';
// import Navbar from './components/Common/Navbar';
// import Footer from './components/Common/Footer';
// import HomeSection from './components/Pages/HomeSection';
// import LoginSection from './components/Auth/LoginSection';
// import SignupSection from './components/Auth/SignupSection';

// import AuthorityDashboard from './components/Dashboards/AuthorityDashboard';
// import CitizenDashboard from './components/Dashboards/CitizenDashboard';
// import AdminDashboard from './components/Dashboards/AdminDashboard';
// import UserManagement from './components/Dashboards/UserManagement'; // --- [NEW] IMPORT ---
// import AuthReportIssueForm from './components/Pages/AuthReportIssueForm';
// import AnonReportIssueForm from './components/Pages/AnonReportIssueForm';
// import AuditLogViewer from './components/Dashboards/AuditLogViewer';

// const App = () => {
//   const [activeSection, setActiveSection] = useState('home');
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [userRole, setUserRole] = useState('');
//   const [isDayTheme, setIsDayTheme] = useState(false);
//   const [scrollToId, setScrollToId] = useState(null);
//   const [error, setError] = useState(null);

//   // --- [NEW] State for Admin navigation ---
//   const [adminView, setAdminView] = useState('dashboard');

//   const navItems = [
//     { name: 'Home', section: 'home', id: 'hero-section' },
//     { name: 'About Us', section: 'about', id: 'about-us-section' },
//     { name: 'Report an Issue', section: 'report', id: 'report-issue-section' },
//     { name: 'Track Your Report', section: 'track-report', id: 'track-report-section' },
//     { name: 'Contact', section: 'contact', id: 'contact-section' },
//   ];

//   useEffect(() => {
//     // Check for existing token in localStorage on mount
//     const token = localStorage.getItem('token');
//     const role = localStorage.getItem('userRole');
//     if (token && role) {
//       setIsLoggedIn(true);
//       setUserRole(role);
//       // --- [MODIFIED] Go to correct dashboard on load ---
//       if (role === 'citizen' || role === 'authority' || role === 'admin') {
//         setActiveSection('dashboard');
//       }
//     }
//   }, []);

//   const handleLoginSuccess = (token, role) => {
//     localStorage.setItem('token', token);
//     localStorage.setItem('userRole', role);
//     setUserRole(role);
//     setIsLoggedIn(true);
//     // --- [MODIFIED] Send all logged-in users to 'dashboard' ---
//     setActiveSection('dashboard'); 
//     setAdminView('dashboard'); // Reset admin view on login
//     setError(null);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('userRole');
//     setIsLoggedIn(false);
//     setUserRole('');
//     setActiveSection('home');
//     setAdminView('dashboard'); // Reset admin view on logout
//   };
//   
//   // Handler to return from the report form to the dashboard
//   const handleReportCompletion = () => {
//     setActiveSection('dashboard');
//   };

//   const handleThemeToggle = () => {
//     setIsDayTheme(prev => !prev);
//   };

//   const handleNavClick = (section, id) => {
//     const scrollingSections = ['home', 'about', 'report', 'contact', 'track-report'];

//     if (scrollingSections.includes(section)) {
//       setActiveSection('home'); // Go to home to scroll
//       setScrollToId(id); 
//     } else {
//       setActiveSection(section);
//       setScrollToId(null);
//     }
//   };

//   useEffect(() => {
//     if (scrollToId) {
//       const element = document.getElementById(scrollToId);
//       if (element) {
//         const yOffset = -80;
//         const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
//         window.scrollTo({ top: y, behavior: 'smooth' });
//       }
//       setScrollToId(null); 
//     }
//   }, [scrollToId]);


//   // --- [MODIFIED] RENDERSECTION LOGIC ---
//   const renderSection = () => {
//     // --- STANDALONE PAGES (Login/Signup) ---
//     if (activeSection === 'login') {
//         return <LoginSection onLoginSuccess={handleLoginSuccess} isDayTheme={isDayTheme} onError={setError} />;
//     }
//     if (activeSection === 'signup') {
//         return <SignupSection isDayTheme={isDayTheme} onError={setError} onSignupSuccess={() => setActiveSection('login')} />;
//     }
    
//     // --- LOGGED-IN DASHBOARDS/PAGES ---
//    if (isLoggedIn) {
//       if (activeSection === 'dashboard') {
//         switch(userRole) {
//           case 'authority':
//             return <AuthorityDashboard isDayTheme={isDayTheme} />;
//           case 'admin':
//             // --- [NEW] Admin Sub-navigation ---
//             if (adminView === 'dashboard') {
//               return <AdminDashboard isDayTheme={isDayTheme} onNavigate={setAdminView} />;
//             }
//             if (adminView === 'users') {
//               return <UserManagement isDayTheme={isDayTheme} onBack={() => setAdminView('dashboard')} />;
//             }
//             if (adminView === 'logs') {
//               return <AuditLogViewer isDayTheme={isDayTheme} onBack={() => setAdminView('dashboard')} />;
//             }
//             return <AdminDashboard isDayTheme={isDayTheme} onNavigate={setAdminView} />; // Default
//           case 'citizen':
//             return (
//               <CitizenDashboard 
//                   isDayTheme={isDayTheme} 
//                   onReportClick={() => setActiveSection('report')} // Switch to 'report' view
//               />
//             );
//           default:
//             return <HomeSection userRole={userRole} isDayTheme={isDayTheme} isLoggedIn={isLoggedIn} />;
//         }
//       }

//       // --- Logged-in "Report Issue" page ---
//       if (activeSection === 'report') {
//           // This view is now only for logged-in users (citizen)
//           return (
//               <AuthReportIssueForm
//                   isDayTheme={isDayTheme}
//                   onCancel={handleReportCompletion} 
//                   onSuccess={handleReportCompletion} 
//                   token={localStorage.getItem('token')} // Interceptor handles this, but good to keep
//               />
//           );
//       }
//     }
//     // --- END LOGGED-IN SECTION ---


//     // --- GUEST/ANONYMOUS VIEW ---
//     switch (activeSection) {
//       case 'report':
//             // Guest/Anonymous: Render Anon form when activeSection is 'report'
//             return (
//                 <AnonReportIssueForm
//                     isDayTheme={isDayTheme}
//                     onCancel={() => setActiveSection('home')} 
//                     onSuccess={() => setActiveSection('home')}
//                 />
//             );
//       default:
//         // All other sections ('home', 'about', etc.) render HomeSection
//         return <HomeSection userRole={userRole} isDayTheme={isDayTheme} isLoggedIn={isLoggedIn} />;
//     }
// };

//   const appClasses = isDayTheme
//     ? "bg-white text-gray-900 light-mode"
//     : "bg-gray-900 text-white";

//   return (
//     <div className={`min-h-screen font-sans antialiased transition-colors duration-300 ${appClasses}`}>
//       <Navbar
//         isLoggedIn={isLoggedIn}
//         activeSection={activeSection}
//         navItems={navItems}
//         onLogout={handleLogout}
//         onNavClick={handleNavClick}
//         onStandaloneClick={setActiveSection}
//         isDayTheme={isDayTheme}
//         onThemeToggle={handleThemeToggle}
//       />
//       <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-160px)]">
//         {error && (
//           <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
//             <span className="font-medium">Error:</span> {error}
//           </div>
//         )}
//         {renderSection()}
//       </main>
//       <Footer isDayTheme={isDayTheme} />
//     </div>
//   );
// };

// export default App;












// src/App.jsx
import React, { useState, useEffect } from 'react';
import Navbar from './components/Common/Navbar';
import Footer from './components/Common/Footer';
import HomeSection from './components/Pages/HomeSection';
import LoginSection from './components/Auth/LoginSection';
import SignupSection from './components/Auth/SignupSection';

import AuthorityDashboard from './components/Dashboards/AuthorityDashboard';
import CitizenDashboard from './components/Dashboards/CitizenDashboard';
import AdminDashboard from './components/Dashboards/AdminDashboard';
import UserManagement from './components/Dashboards/UserManagement';
import AuditLogViewer from './components/Dashboards/AuditLogViewer'; 
import AuthReportIssueForm from './components/Pages/AuthReportIssueForm'; 
import AnonReportIssueForm from './components/Pages/AnonReportIssueForm'; 

const App = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [isDayTheme, setIsDayTheme] = useState(false);
  const [scrollToId, setScrollToId] = useState(null);
  const [error, setError] = useState(null);
  const [adminView, setAdminView] = useState('dashboard');

  const navItems = [
    { name: 'Home', section: 'home', id: 'hero-section' },
    { name: 'About Us', section: 'about', id: 'about-us-section' },
    { name: 'Report an Issue', section: 'report', id: 'report-issue-section' },
    { name: 'Track Your Report', section: 'track-report', id: 'track-report-section' },
    { name: 'Contact', section: 'contact', id: 'contact-section' },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    if (token && role) {
      setIsLoggedIn(true);
      setUserRole(role);
      if (role === 'citizen' || role === 'authority' || role === 'admin') {
        setActiveSection('dashboard');
      }
    }
  }, []);

  const handleLoginSuccess = (token, role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    setUserRole(role);
    setIsLoggedIn(true);
    setActiveSection('dashboard'); 
    setAdminView('dashboard');
    setError(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    setUserRole('');
    setActiveSection('home');
    setAdminView('dashboard'); 
  };
  
  const handleReportCompletion = () => {
    setActiveSection('dashboard');
  };

  const handleThemeToggle = () => {
    setIsDayTheme(prev => !prev);
  };

  // --- [MODIFIED] ---
  // 'report' is no longer a scrolling section
  const handleNavClick = (section, id) => {
    const scrollingSections = ['home', 'about', 'contact', 'track-report'];

    // If it's a scrolling section, go to 'home' and set the scroll ID
    if (scrollingSections.includes(section)) {
      setActiveSection('home'); // Go to home to scroll
      setScrollToId(id); 
    } else {
      // This handles 'login', 'signup', and now 'report'
      setActiveSection(section);
      setScrollToId(null);
    }
  };
  // --- [END MODIFICATION] ---

  useEffect(() => {
    if (scrollToId) {
      const element = document.getElementById(scrollToId);
      if (element) {
        const yOffset = -80;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
      setScrollToId(null); 
    }
  }, [scrollToId]);


  // --- [MODIFIED] ---
  // Updated renderSection to handle 'report' as a dedicated page for all users
  const renderSection = () => {
    // --- STANDALONE PAGES (Login/Signup) ---
    if (activeSection === 'login') {
        return <LoginSection onLoginSuccess={handleLoginSuccess} isDayTheme={isDayTheme} onError={setError} />;
    }
    if (activeSection === 'signup') {
        return <SignupSection isDayTheme={isDayTheme} onError={setError} onSignupSuccess={() => setActiveSection('login')} />;
    }
    
    // --- [NEW] REPORT PAGE ---
    // This now handles both logged-in and guest users
    if (activeSection === 'report') {
        if (isLoggedIn && userRole === 'citizen') {
            // Render Auth form for logged-in citizens
            return (
                <AuthReportIssueForm
                    isDayTheme={isDayTheme}
                    onCancel={handleReportCompletion} 
                    onSuccess={handleReportCompletion} 
                    token={localStorage.getItem('token')}
                />
            );
        }
        // Render Anon form for guests
        return (
            <AnonReportIssueForm
                isDayTheme={isDayTheme}
                onCancel={() => setActiveSection('home')} // Go back to home
                onSuccess={() => setActiveSection('home')} // Go back to home
            />
        );
    }
    // --- [END NEW] ---
    
    // --- LOGGED-IN DASHBOARDS ---
   if (isLoggedIn && activeSection === 'dashboard') {
        switch(userRole) {
          case 'authority':
            return <AuthorityDashboard isDayTheme={isDayTheme} />;
          case 'admin':
            if (adminView === 'dashboard') {
              return <AdminDashboard isDayTheme={isDayTheme} onNavigate={setAdminView} />;
            }
            if (adminView === 'users') {
              return <UserManagement isDayTheme={isDayTheme} onBack={() => setAdminView('dashboard')} />;
            }
            if (adminView === 'logs') {
              return <AuditLogViewer isDayTheme={isDayTheme} onBack={() => setAdminView('dashboard')} />;
            }
            return <AdminDashboard isDayTheme={isDayTheme} onNavigate={setAdminView} />; // Default
          case 'citizen':
            return (
              <CitizenDashboard 
                  isDayTheme={isDayTheme} 
                  onReportClick={() => setActiveSection('report')} 
              />
            );
          default:
            // If role is unknown but logged in, show home
            return <HomeSection userRole={userRole} isDayTheme={isDayTheme} isLoggedIn={isLoggedIn} />;
        }
    }
    // --- END LOGGED-IN SECTION ---

    // --- GUEST/ANONYMOUS VIEW (HOMEPAGE) ---
    switch (activeSection) {
      case 'home':
      case 'about':
      case 'contact':
      case 'track-report':
        return <HomeSection userRole={userRole} isDayTheme={isDayTheme} isLoggedIn={isLoggedIn} />;
     default:
        // If no other condition is met, show the homepage
          return <HomeSection userRole={userRole} isDayTheme={isDayTheme} isLoggedIn={isLoggedIn} />;
    }
};
  // --- [END MODIFICATION] ---

  const appClasses = isDayTheme
    ? "bg-white text-gray-900 light-mode"
    : "bg-gray-900 text-white";

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors duration-300 ${appClasses}`}>
      <Navbar
        isLoggedIn={isLoggedIn}
        activeSection={activeSection}
        navItems={navItems}
        onLogout={handleLogout}
        onNavClick={handleNavClick}
        onStandaloneClick={setActiveSection}
        isDayTheme={isDayTheme}
        onThemeToggle={handleThemeToggle}
      />
      <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-160px)]">
        {error && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}
        {renderSection()}
      </main>
      <Footer isDayTheme={isDayTheme} />
    </div>
  );
};

export default App;