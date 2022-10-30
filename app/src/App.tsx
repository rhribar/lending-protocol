// @ts-nocheck
import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import Invest from './pages/Invest';
import Apply from './pages/Apply';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<Home />} />
          <Route path="invest" element={<Invest />} />
          <Route path="apply" element={<Apply />} />
        </Route>
      </Routes>
    </BrowserRouter>
    )
}

export default App;
