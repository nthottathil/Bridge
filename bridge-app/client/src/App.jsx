import { useState } from 'react';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        alert('Login successful!');
        setCurrentView('dashboard');
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      alert('Login failed. Is the server running?');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        alert('Signup successful!');
        setCurrentView('dashboard');
      } else {
        alert('Signup failed');
      }
    } catch (error) {
      alert('Signup failed. Is the server running?');
    }
  };

  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Welcome Back</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-lg bg-white/20 text-white placeholder-purple-200 mb-4"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-lg bg-white/20 text-white placeholder-purple-200 mb-6"
              required
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-lg font-semibold hover:shadow-xl transition"
            >
              Login
            </button>
          </form>
          <p className="text-center text-purple-200 mt-4">
            Don't have an account?{' '}
            <button onClick={() => setCurrentView('signup')} className="text-white hover:underline">
              Sign up
            </button>
          </p>
          <button 
            onClick={() => setCurrentView('landing')} 
            className="text-purple-200 hover:text-white mt-4 w-full text-center"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Join Bridge</h2>
          <form onSubmit={handleSignup}>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 rounded-lg bg-white/20 text-white placeholder-purple-200 mb-4"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-lg bg-white/20 text-white placeholder-purple-200 mb-4"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-lg bg-white/20 text-white placeholder-purple-200 mb-6"
              required
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-lg font-semibold hover:shadow-xl transition"
            >
              Create Account
            </button>
          </form>
          <p className="text-center text-purple-200 mt-4">
            Already have an account?{' '}
            <button onClick={() => setCurrentView('login')} className="text-white hover:underline">
              Login
            </button>
          </p>
          <button 
            onClick={() => setCurrentView('landing')} 
            className="text-purple-200 hover:text-white mt-4 w-full text-center"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
            <h1 className="text-3xl font-bold text-white mb-4">Welcome to Bridge!</h1>
            <p className="text-purple-200 mb-6">You're now logged in. The full app features are coming soon!</p>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                setCurrentView('landing');
              }}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Landing Page (default)
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <nav className="p-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-white">🌉 Bridge</span>
        </div>
        <div className="space-x-4">
          <button 
            onClick={() => setCurrentView('login')}
            className="text-white hover:text-purple-200 transition"
          >
            Login
          </button>
          <button 
            onClick={() => setCurrentView('signup')}
            className="bg-white text-purple-900 px-6 py-2 rounded-full font-semibold hover:bg-purple-100 transition"
          >
            Sign Up
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-6 pt-20 pb-32 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Find Your{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Tribe
          </span>
        </h1>
        <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
          Bridge connects you with small groups of like-minded people for meaningful conversations and lasting friendships.
        </p>
        <button 
          onClick={() => setCurrentView('signup')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition duration-300"
        >
          Start Your Journey
        </button>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-bold text-white mb-2">Smart Matching</h3>
            <p className="text-purple-200">Our algorithm finds your perfect group based on interests.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-white mb-2">Small Groups</h3>
            <p className="text-purple-200">4-6 people per group for meaningful conversations.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
            <div className="text-4xl mb-4">❤️</div>
            <h3 className="text-xl font-bold text-white mb-2">Real Connections</h3>
            <p className="text-purple-200">Move from chat to real-life meetups.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;