import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useEffect, lazy, Suspense } from 'react';
// Import user switch monitor for development
// import './utils/userSwitchTest.js';

// import DefaultTemplateLayout from './DefaultTemplateLayout'
// import Header from './components/Header';
// import Footer from './components/Footer';
// import Home from './pages/Home';
// import Doctors from './pages/Doctors';
// import DoctorDetail from './pages/DoctorDetail';
// import Clinics from './pages/Clinics';
// import ClinicDetail from './pages/ClinicDetail';
// import Treatments from './pages/Treatments';
// import TreatmentDetails from './pages/TreatmentDetails';
// import TreatmentBooking from './pages/TreatmentBooking';
// import Contact from './pages/Contact';
// import Login from './pages/Login';

import NotFound from './pages/NotFound';
import FirstTemplate from './first_template';
import SecondTemplate from './second_template';
import ThirdTemplate from './Third_template';
import ForTemplate from './for_template';
import FiveTemplate from './five_template';

// Import CSS files
//import './App.css';
import './first_template_App.css';
import './second_third_App.css';
import './Third_template_App.css';
import './for_template_App.css';
import './five_template_App.css';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Redirect root to default user */}
              <Route path="/" element={<Navigate to="/drnoagrados/" replace />} />
              
              {/* 404 Not Found route for invalid users */}
              <Route path="/404" element={<NotFound />} />
              
              {/* User-based routes */}
              <Route path="/:userKey/*" element={
                <UserProvider>
                  <AppContent />
                </UserProvider>
              } />
            </Routes>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

// New component to handle dynamic content based on templateId from UserContext
function AppContent() {
  const { templateId } = useUser();
  //console.log('AppContent template id' ,templateId);

  // Remove all template-specific CSS classes
  useEffect(() => {
    document.body.classList.remove('FirstTemplate', 'SecondTemplate', 'ThirdTemplate', 'ForTemplate', 'FiveTemplate');
    
    // Add the appropriate template class
    switch(templateId) {
      case '1':
        // document.body.classList.add('FirstTemplate');
        document.body.classList.add('ForTemplate');
        break;
      case '2':
        document.body.classList.add('SecondTemplate');
        break;
      case '3':
        document.body.classList.add('ThirdTemplate');
        break;
      case '4':
        document.body.classList.add('ForTemplate');
        break;
      case '5':
        document.body.classList.add('FiveTemplate');
        break;
    }
  }, [templateId]);

  switch(templateId) {
    case '1':
      return (
        <div className="ForTemplate">
          {/* <FirstTemplate /> */}
          <ForTemplate />
        </div>
      );
    case '2':
      return (
        <div className="SecondTemplate">
          <SecondTemplate />
        </div>
      );
    case '3':
      return (
        <div className="ThirdTemplate">
          <ThirdTemplate />
        </div>
      );
    case '4':
      return (
        <div className="ForTemplate">
          <ForTemplate />
        </div>
      );
    case '5':
      return (
        <div className="FiveTemplate">
          <FiveTemplate />
        </div>
      );
    //default:
      //return <NotFound />;
  }
}

export default App;
