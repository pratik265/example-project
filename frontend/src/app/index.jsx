import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from '../templates/AppLayout';
import Home from '../pages/Home';
import Doctors from '../pages/Doctors';
// other pages...

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/doctors" element={<Doctors />} />
        {/* other routes */}
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;
