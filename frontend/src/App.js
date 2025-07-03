import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ItemProvider } from './contexts/ItemContext';
import { BookingProvider } from './contexts/BookingContext';
import { ChatProvider } from './contexts/ChatContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Browse from './pages/Browse';
import ItemDetail from './pages/ItemDetail';
import AddItem from './pages/AddItem';
import MyItems from './pages/MyItems';
import Profile from './pages/Profile';
import Bookings from './pages/Bookings';
import Messages from './pages/Messages';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ItemProvider>
          <BookingProvider>
            <ChatProvider>
              <div className="App">
                <Layout>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/browse" element={<Browse />} />
                    <Route path="/item/:id" element={<ItemDetail />} />
                    
                    {/* Protected Routes */}
                    <Route
                      path="/add-item"
                      element={
                        <ProtectedRoute>
                          <AddItem />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/my-items"
                      element={
                        <ProtectedRoute>
                          <MyItems />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/bookings"
                      element={
                        <ProtectedRoute>
                          <Bookings />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/messages"
                      element={
                        <ProtectedRoute>
                          <Messages />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </Layout>
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      duration: 3000,
                      theme: {
                        primary: '#4aed88',
                      },
                    },
                  }}
                />
              </div>
            </ChatProvider>
          </BookingProvider>
        </ItemProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;