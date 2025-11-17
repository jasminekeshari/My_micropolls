import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export default function CreatePoll() {
  const [adminKey, setAdminKey] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showKeyHint, setShowKeyHint] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const validOptions = options.filter(opt => opt.trim());
      
      if (validOptions.length < 2) {
        setError('At least 2 options required');
        setLoading(false);
        return;
      }

      console.log('Sending admin key:', adminKey);
      console.log('API URL:', `${API_BASE_URL}/api/polls`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_BASE_URL}/api/polls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-ADMIN-KEY': adminKey
        },
        body: JSON.stringify({
          question: question.trim(),
          options: validOptions
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const data = await response.json();

      if (response.ok) {
        navigate(`/p/${data._id}`);
      } else {
        setError(data.error || 'Failed to create poll');
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError('Failed to connect to server. Make sure backend is running!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob top-0 -left-20"></div>
        <div className="absolute w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 top-0 right-20"></div>
        <div className="absolute w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 bottom-20 left-40"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <h1 className="text-5xl font-black text-white hover:scale-105 transition-transform duration-300">
                Micro<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Polls</span>
              </h1>
            </Link>
            <p className="text-xl text-purple-200">Create a new poll for your audience</p>
          </div>

          {/* Main Form Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">Poll Creator</h2>
              <div className="bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full text-sm font-semibold">
                Admin Only
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-400/50 text-red-200 px-6 py-4 rounded-xl mb-6 animate-pulse">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <div className="font-bold">Error</div>
                    <div className="text-sm">{error}</div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Admin Key */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-white font-semibold text-lg">Admin Key</label>
                  <button
                    type="button"
                    onClick={() => setShowKeyHint(!showKeyHint)}
                    className="text-purple-300 hover:text-purple-200 text-sm underline"
                  >
                    Need help?
                  </button>
                </div>
                
                {showKeyHint && (
                  <div className="bg-blue-500/20 border border-blue-400/50 text-blue-200 px-4 py-3 rounded-xl mb-4">
                    <div className="text-sm">
                      💡 <strong>Demo Key:</strong> admin123<br/>
                      Contact your administrator for the production key.
                    </div>
                  </div>
                )}
                
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    className="w-full bg-black/40 text-white rounded-xl p-4 pr-12 border border-white/20 focus:border-purple-400/70 focus:ring-4 focus:ring-purple-400/20 outline-none transition-all duration-300"
                    placeholder="Enter admin key..."
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Question */}
              <div>
                <label className="block text-white font-semibold text-lg mb-3">Poll Question</label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full bg-black/40 text-white rounded-xl p-4 border border-white/20 focus:border-purple-400/70 focus:ring-4 focus:ring-purple-400/20 outline-none transition-all duration-300"
                  placeholder="What would you like to ask?"
                  required
                />
              </div>

              {/* Options */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-white font-semibold text-lg">Answer Options</label>
                  <div className="text-purple-300 text-sm">
                    {options.filter(opt => opt.trim()).length}/6 options
                  </div>
                </div>
                
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg w-8 h-8 flex items-center justify-center text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="flex-1 bg-black/40 text-white rounded-xl p-4 border border-white/20 focus:border-purple-400/70 focus:ring-4 focus:ring-purple-400/20 outline-none transition-all duration-300"
                        placeholder={`Option ${index + 1}`}
                        required
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="w-10 h-10 bg-red-500/30 hover:bg-red-500/50 text-red-300 rounded-xl transition-all duration-300 flex items-center justify-center"
                          title="Remove option"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {options.length < 6 && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="mt-4 px-6 py-3 bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-300 rounded-xl transition-all duration-300 flex items-center gap-2 font-medium"
                  >
                    <span className="text-lg">+</span>
                    Add Another Option
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading || !question.trim() || options.filter(opt => opt.trim()).length < 2}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 hover:from-purple-600 hover:via-pink-600 hover:to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold rounded-xl text-lg transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating Your Poll...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">🚀</span>
                      <span>Create Poll & Get Shareable Link</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Help Text */}
            <div className="mt-6 text-center text-white/60 text-sm">
              <p>Your poll will be instantly shareable with a unique URL</p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-purple-300 hover:text-white transition-colors duration-300"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}