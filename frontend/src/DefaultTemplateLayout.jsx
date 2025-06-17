import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Doctors from './pages/Doctors';
import DoctorDetail from './pages/DoctorDetail';
import Clinics from './pages/Clinics';
import ClinicDetail from './pages/ClinicDetail';
import Treatments from './pages/Treatments';
import TreatmentDetails from './pages/TreatmentDetails';
import TreatmentBooking from './pages/TreatmentBooking';
import Contact from './pages/Contact';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
//import './App.css';

const DefaultTemplateLayout = () => {
  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="doctors/:id" element={<DoctorDetail />} />
          <Route path="clinics" element={<Clinics />} />
          <Route path="clinics/:id" element={<ClinicDetail />} />
          <Route path="treatments" element={<Treatments />} />
          <Route path="treatments/:id" element={<TreatmentDetails />} />
          <Route path="treatments/:treatmentId/book" element={<TreatmentBooking />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default DefaultTemplateLayout; 