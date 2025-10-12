import { useState } from 'react';
import './index.css';

// API Configuration
const API_URL = 'http://localhost:5000';  // Changed back to localhost to match CORS

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [userData, setUserData] = useState(null);
  const [onboardingData, setOnboardingData] = useState({
    personality: '',
    interests: [],
    goals: [],
    expertise: [],
    description: ''
  });
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  // Personality options
  const personalityOptions = [
    { id: 'introvert-thinker', label: 'Quiet Thinker', description: 'I prefer deep conversations with a few people' },
    { id: 'extrovert-social', label: 'Social Butterfly', description: 'I gain energy from being around others' },
    { id: 'ambivert-balanced', label: 'Balanced Mix', description: 'I enjoy both solitude and social time equally' },
    { id: 'introvert-creative', label: 'Creative Soul', description: 'I express myself better through art/writing than words' },
    { id: 'extrovert-leader', label: 'Natural Leader', description: 'I often take charge in group situations' },
    { id: 'analytical', label: 'Analytical Mind', description: 'I approach problems logically and systematically' }
  ];

  // Interest categories
  const interestCategories = {
    'Sports & Fitness': ['Badminton', 'Basketball', 'Soccer', 'Yoga', 'Running', 'Gym', 'Swimming', 'Cycling'],
    'Science & Tech': ['Chemistry', 'Physics', 'AI/ML', 'Web Development', 'Biology', 'Space', 'Robotics'],
    'Arts & Culture': ['Movies', 'Music', 'Photography', 'Painting', 'Literature', 'Theatre', 'Dance'],
    'Current Affairs': ['Geopolitics', 'Economics', 'Climate Change', 'Social Issues', 'Technology Trends'],
    'Hobbies': ['Gaming', 'Cooking', 'Gardening', 'Travel', 'Reading', 'Writing', 'Collecting'],
    'Philosophy & Mind': ['Psychology', 'Philosophy', 'Meditation', 'Spirituality', 'Self-improvement']
  };

  // Goals
  const goalOptions = [
    'Self-improvement',
    'Start a business',
    'Find a job in tech',
    'Find a job in finance',
    'Self-discovery',
    'Fitness & health',
    'Build motivation',
    'Knowledge expansion',
    'Creative pursuits',
    'Career transition',
    'Build meaningful friendships',
    'Learn new skills'
  ];

  // Expertise areas
  const expertiseOptions = [
    'STEM (Science, Technology, Engineering, Math)',
    'Personal Finance & Investing',
    'Entrepreneurship & Business',
    'Global Perspectives & Culture',
    'Arts & Creative Expression',
    'Health & Wellness',
    'Psychology & Human Behavior',
    'Marketing & Communication',
    'Philosophy & Ethics',
    'Environmental Sustainability'
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setUserData(data.user);
        
        // Check if user has completed onboarding
        if (data.user.onboardingCompleted) {
          setCurrentView('dashboard');
        } else {
          setCurrentView('verification');
        }
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      alert('Login failed. Is the server running?');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Age validation
    const userAge = parseInt(age);
    if (userAge < 18) {
      alert('You must be 18 or older to use Bridge');
      return;
    }
    
    console.log('Attempting signup with:', { email, name, age: userAge });
    
    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password, name, age: userAge })
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Signup successful:', data);
        localStorage.setItem('token', data.token);
        setUserData(data.user);
        setCurrentView('verification');
      } else {
        const error = await response.json();
        console.error('Signup error response:', error);
        alert(error.error || 'Signup failed');
      }
    } catch (error) {
      console.error('Network error:', error);
      alert(`Signup failed: ${error.message}. Check console for details.`);
    }
  };

  const handleVerification = () => {
    // In a real app, this would integrate with a government ID verification service
    alert('Government ID verification would happen here. For demo purposes, proceeding to onboarding.');
    setCurrentView('onboarding');
  };

  const handleOnboardingSubmit = async () => {
    // Validate all fields
    if (!onboardingData.personality) {
      alert('Please select your personality type');
      return;
    }
    if (onboardingData.interests.length < 3) {
      alert('Please select at least 3 interests');
      return;
    }
    if (onboardingData.goals.length === 0) {
      alert('Please select at least one goal');
      return;
    }
    if (onboardingData.expertise.length === 0) {
      alert('Please select at least one area of expertise');
      return;
    }
    if (onboardingData.description.trim().split(' ').length > 30) {
      alert('Description must be 30 words or less');
      return;
    }
    if (onboardingData.description.trim().length < 10) {
      alert('Please write a meaningful description of yourself');
      return;
    }

    try {
      const token = localStorage.getItem('token');
              const response = await fetch(`${API_URL}/api/user/onboarding`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(onboardingData)
      });

      if (response.ok) {
        setCurrentView('matching');
        startMatching();
      } else {
        alert('Failed to save profile. Please try again.');
      }
    } catch (error) {
      alert('Error saving profile. Please check your connection.');
    }
  };

  const startMatching = async () => {
    setIsMatching(true);
    
    // Simulate matching process
    setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/matching/find-group`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setMatchResult(data);
          if (data.matched) {
            setTimeout(() => {
              setCurrentView('dashboard');
            }, 3000);
          }
        }
      } catch (error) {
        console.error('Matching error:', error);
      }
      setIsMatching(false);
    }, 5000);
  };

  // Government Verification View
  if (currentView === 'verification') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Verify Your Identity</h2>
          <div className="text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">🔐</div>
              <p className="text-purple-200 mb-4">
                To ensure the safety of our community, we require government ID verification.
              </p>
              <p className="text-purple-200 text-sm">
                Your data is encrypted and never shared with other users.
              </p>
            </div>
            <button
              onClick={handleVerification}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-lg font-semibold hover:shadow-xl transition mb-4"
            >
              Verify with Government ID
            </button>
            <p className="text-purple-300 text-xs">
              This uses secure third-party verification services
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Onboarding View
  if (currentView === 'onboarding') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6">Let's Get to Know You</h2>
            
            {/* Step 1: Personality */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">1. How would you describe yourself?</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {personalityOptions.map(option => (
                  <div
                    key={option.id}
                    onClick={() => setOnboardingData({...onboardingData, personality: option.id})}
                    className={`p-4 rounded-lg cursor-pointer transition ${
                      onboardingData.personality === option.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/20 text-purple-100 hover:bg-white/30'
                    }`}
                  >
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-sm mt-1 opacity-90">{option.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Interests */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">
                2. Select your interests (at least 3)
              </h3>
              {Object.entries(interestCategories).map(([category, items]) => (
                <div key={category} className="mb-4">
                  <h4 className="text-purple-200 mb-2">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {items.map(interest => (
                      <button
                        key={interest}
                        onClick={() => {
                          const interests = onboardingData.interests.includes(interest)
                            ? onboardingData.interests.filter(i => i !== interest)
                            : [...onboardingData.interests, interest];
                          setOnboardingData({...onboardingData, interests});
                        }}
                        className={`px-4 py-2 rounded-full text-sm transition ${
                          onboardingData.interests.includes(interest)
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/20 text-purple-100 hover:bg-white/30'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Step 3: Goals */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">3. What are your goals?</h3>
              <div className="grid md:grid-cols-3 gap-3">
                {goalOptions.map(goal => (
                  <button
                    key={goal}
                    onClick={() => {
                      const goals = onboardingData.goals.includes(goal)
                        ? onboardingData.goals.filter(g => g !== goal)
                        : [...onboardingData.goals, goal];
                      setOnboardingData({...onboardingData, goals});
                    }}
                    className={`px-4 py-3 rounded-lg text-sm transition ${
                      onboardingData.goals.includes(goal)
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/20 text-purple-100 hover:bg-white/30'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Expertise */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">4. What knowledge can you share?</h3>
              <div className="space-y-3">
                {expertiseOptions.map(expertise => (
                  <button
                    key={expertise}
                    onClick={() => {
                      const expertiseList = onboardingData.expertise.includes(expertise)
                        ? onboardingData.expertise.filter(e => e !== expertise)
                        : [...onboardingData.expertise, expertise];
                      setOnboardingData({...onboardingData, expertise: expertiseList});
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition ${
                      onboardingData.expertise.includes(expertise)
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/20 text-purple-100 hover:bg-white/30'
                    }`}
                  >
                    {expertise}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 5: Description */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">
                5. Describe yourself in one sentence (30 words max)
              </h3>
              <textarea
                value={onboardingData.description}
                onChange={(e) => setOnboardingData({...onboardingData, description: e.target.value})}
                placeholder="I'm a curious soul who loves deep conversations about technology and philosophy..."
                className="w-full p-4 rounded-lg bg-white/20 text-white placeholder-purple-200 resize-none"
                rows="3"
              />
              <div className="text-purple-200 text-sm mt-2">
                Words: {onboardingData.description.trim().split(' ').filter(w => w).length}/30
              </div>
            </div>

            <button
              onClick={handleOnboardingSubmit}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-lg font-semibold hover:shadow-xl transition"
            >
              Start Finding Your Tribe
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Matching/Waiting Area View
  if (currentView === 'matching') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Finding Your Tribe</h2>
          
          {isMatching ? (
            <>
              <div className="mb-8">
                <div className="animate-pulse">
                  <div className="text-6xl mb-4">🔍</div>
                  <div className="flex justify-center space-x-2 mb-4">
                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
                <p className="text-purple-200">
                  Analyzing compatibility with thousands of users...
                </p>
                <p className="text-purple-300 text-sm mt-2">
                  This usually takes 10-30 seconds
                </p>
              </div>
              
              <div className="space-y-2 text-purple-200 text-sm">
                <div className="flex items-center justify-center space-x-2">
                  <span>✓</span>
                  <span>Analyzing personality match</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span>✓</span>
                  <span>Finding shared interests</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="animate-pulse">⏳</span>
                  <span>Creating perfect group...</span>
                </div>
              </div>
            </>
          ) : matchResult ? (
            <div>
              {matchResult.matched ? (
                <>
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-white mb-4">Match Found!</h3>
                  <p className="text-purple-200 mb-4">
                    We found the perfect group for you with {matchResult.group?.members?.length || 5} like-minded people!
                  </p>
                  <p className="text-purple-300 text-sm">
                    Redirecting to your group chat...
                  </p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">⏰</div>
                  <h3 className="text-xl font-bold text-white mb-4">Almost there!</h3>
                  <p className="text-purple-200 mb-4">
                    {matchResult.message || 'We\'re gathering more compatible people. Check back in a few minutes!'}
                  </p>
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition"
                  >
                    Go to Dashboard
                  </button>
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // Login View
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

  // Signup View
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
              type="number"
              placeholder="Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full p-4 rounded-lg bg-white/20 text-white placeholder-purple-200 mb-4"
              min="18"
              max="120"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-lg bg-white/20 text-white placeholder-purple-200 mb-4"
              required
            />
            <p className="text-purple-200 text-sm mb-4">
              You must be 18 or older to use Bridge. Your age will be verified.
            </p>
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

  // Dashboard View
  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-white">Welcome to Bridge!</h1>
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
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-2">Your Profile</h3>
                <p className="text-purple-200">
                  {userData?.name || 'User'}<br/>
                  Age: {userData?.age || 'N/A'}
                </p>
              </div>
              
              <div className="bg-white/10 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-2">Active Groups</h3>
                <p className="text-purple-200">
                  You're in 1 active group
                </p>
              </div>
              
              <div className="bg-white/10 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-2">Connections</h3>
                <p className="text-purple-200">
                  5 new connections this week
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Your Groups</h2>
            <div className="bg-white/10 rounded-lg p-6">
              <p className="text-purple-200">
                Your matched groups will appear here. Start chatting with your tribe!
              </p>
              <button
                onClick={() => {
                  setCurrentView('matching');
                  startMatching();
                }}
                className="mt-4 bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition"
              >
                Find New Group
              </button>
            </div>
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
            <p className="text-purple-200">Our algorithm finds your perfect group based on personality and interests.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold text-white mb-2">Verified & Safe</h3>
            <p className="text-purple-200">Government ID verification ensures a trusted community.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
            <div className="text-4xl mb-4">💡</div>
            <h3 className="text-xl font-bold text-white mb-2">Knowledge Exchange</h3>
            <p className="text-purple-200">Share your expertise and learn from others in your group.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;