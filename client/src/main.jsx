import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import RedirectPage from './pages/RedirectPage.jsx';
import './App.css';

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/:slug', element: <RedirectPage /> }
]);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);