import { useState, useEffect } from 'react';

export default function App() {
  const [commands, setCommands] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);

  const exampleCommands = `NEWTAB home
OPEN news
NEWTAB docs
SWITCH 1
BACK 1
QUEUE file1.zip
TICK 1
LIST
RECENTS 3
OPEN videos
FORWARD 2
RECENTS 2`;

  // Fetch history and stats on component mount
  useEffect(() => {
    fetchHistory();
    fetchStats();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/history?limit=10');
      const data = await response.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleExecute = async () => {
    setLoading(true);
    setError('');
    setResults([]);
    setExecutionTime(null);

    try {
      const commandArray = commands
        .split('\n')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0);

      const response = await fetch('http://localhost:5000/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commands: commandArray })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResults(data.results);
        setExecutionTime(data.executionTime);
        fetchHistory();
        fetchStats();
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to connect to server. Make sure backend is running!');
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    setCommands(exampleCommands);
    setResults([]);
    setError('');
    setExecutionTime(null);
  };

  const loadFromHistory = (execution) => {
    setCommands(execution.commands.join('\n'));
    setResults(execution.results);
    setShowHistory(false);
  };

  const deleteHistoryItem = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/history/${id}`, {
        method: 'DELETE'
      });
      fetchHistory();
      fetchStats();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob top-0 -left-20"></div>
        <div className="absolute w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 top-0 right-20"></div>
        <div className="absolute w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 bottom-20 left-40"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-full px-6 py-2 border border-white/20">
              <span className="text-purple-300 text-sm font-medium">Advanced Browser Simulation + MongoDB</span>
            </div>
          </div>
          <h1 className="text-6xl font-black text-white mb-4 tracking-tight">
            Tab<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Master</span>
          </h1>
          <p className="text-xl text-purple-200">Full MERN Stack with History Tracking</p>
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <div className="text-purple-300 text-sm">Total Executions</div>
              <div className="text-3xl font-bold text-white">{stats.totalExecutions}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <div className="text-purple-300 text-sm">Avg Execution Time</div>
              <div className="text-3xl font-bold text-white">{stats.averageExecutionTime}ms</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <div className="text-purple-300 text-sm">Total Commands</div>
              <div className="text-3xl font-bold text-white">{stats.totalCommands}</div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                Command Input
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="px-4 py-2 bg-blue-500/30 hover:bg-blue-500/50 text-blue-200 rounded-xl text-sm font-medium transition-all duration-300 border border-blue-400/30"
                >
                  📜 History
                </button>
                <button
                  onClick={loadExample}
                  className="px-4 py-2 bg-purple-500/30 hover:bg-purple-500/50 text-purple-200 rounded-xl text-sm font-medium transition-all duration-300 border border-purple-400/30"
                >
                  Load Example
                </button>
              </div>
            </div>

            {showHistory ? (
              <div className="bg-black/30 rounded-2xl p-4 h-96 overflow-y-auto border border-white/10">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <span>🕐</span> Recent Executions
                </h3>
                {history.length > 0 ? (
                  <div className="space-y-3">
                    {history.map((exec) => (
                      <div
                        key={exec._id}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all duration-300"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-purple-300 text-xs">{formatDate(exec.executedAt)}</div>
                          <div className="text-green-400 text-xs">{exec.executionTime}ms</div>
                        </div>
                        <div className="text-white text-sm mb-2">{exec.commandCount} commands</div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => loadFromHistory(exec)}
                            className="flex-1 px-3 py-1 bg-purple-500/30 hover:bg-purple-500/50 text-purple-200 rounded-lg text-xs transition-all"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => deleteHistoryItem(exec._id)}
                            className="px-3 py-1 bg-red-500/30 hover:bg-red-500/50 text-red-200 rounded-lg text-xs transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-white/40 py-12">No history yet</div>
                )}
              </div>
            ) : (
              <>
                <textarea
                  value={commands}
                  onChange={(e) => setCommands(e.target.value)}
                  placeholder="Enter commands (one per line)...
Example:
NEWTAB home
OPEN news
LIST"
                  className="w-full h-80 bg-black/30 text-white rounded-2xl p-4 font-mono text-sm border border-white/10 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 outline-none resize-none placeholder-white/30"
                />

                <button
                  onClick={handleExecute}
                  disabled={loading || !commands.trim()}
                  className="w-full mt-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold rounded-2xl text-lg transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span>⚡</span>
                      Execute & Save to DB
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Output Section */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></span>
                Output Results
              </h2>
              {executionTime !== null && (
                <div className="bg-green-500/20 border border-green-400/50 text-green-200 px-3 py-1 rounded-lg text-sm font-mono">
                  ⚡ {executionTime}ms
                </div>
              )}
            </div>

            <div className="bg-black/30 rounded-2xl p-6 h-96 overflow-y-auto border border-white/10">
              {error && (
                <div className="bg-red-500/20 border border-red-400/50 text-red-200 px-4 py-3 rounded-xl mb-4 animate-pulse">
                  <div className="font-bold mb-1">❌ Error</div>
                  {error}
                </div>
              )}

              {results.length > 0 ? (
                <div className="space-y-3">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold rounded-lg w-8 h-8 flex items-center justify-center text-sm flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 font-mono text-green-300 text-sm break-all">
                          {result}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-white/40 text-center">
                  <div>
                    <div className="text-6xl mb-4">💾</div>
                    <div className="text-lg">
                      {loading ? 'Processing and saving to MongoDB...' : 'Results will appear here'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-4 gap-6 mt-12">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-white font-bold mb-2">O(1) Operations</h3>
            <p className="text-purple-200 text-sm">Optimized algorithms</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="text-3xl mb-3">🍃</div>
            <h3 className="text-white font-bold mb-2">MongoDB</h3>
            <p className="text-purple-200 text-sm">Full history tracking</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="text-3xl mb-3">⚛️</div>
            <h3 className="text-white font-bold mb-2">React + Vite</h3>
            <p className="text-purple-200 text-sm">Lightning fast UI</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-white font-bold mb-2">Real-time Stats</h3>
            <p className="text-purple-200 text-sm">Live performance data</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}