import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppMainLayout from '../templates/AppMainLayout';
import HomePage from '../pages/HomePage';
import DoctorsPage from '../pages/DoctorsPage';

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<AppMainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/doctors" element={<DoctorsPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
