import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { AppShell } from '@mantine/core';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

import HomePage from './pages/HomePage';
import TripsPage from './pages/TripsPage';
import PinsPage from './pages/PinsPage';
import CategoriesPage from './pages/CategoriesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <Router>
      <AppShell
        padding="md"
        styles={{ root: { minHeight: '100vh' }, main: { display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1, paddingTop: 60 } }}
      >
        
        <AppShell.Header height={60}>
          <Header />
        </AppShell.Header>

        <AppShell.Main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/trips" element={<TripsPage />} />
            <Route path="/pins" element={<PinsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </AppShell.Main>

        <AppShell.Footer>
          <Footer />
        </AppShell.Footer>

      </AppShell>
    </Router>
  );
}

export default App;
