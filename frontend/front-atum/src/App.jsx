
import { useState } from 'react';

function App() {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Simulate code generation
  const handleGenerate = () => {
    if (!query) {
      alert('Please describe the code you want to generate');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setGeneratedCode(`// Sample ${language} code for: ${query}\nfunction example() {\n  // ...\n}`);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F2F5FF] font-poppins text-[#2D3748]">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Logo */}
        <header className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-4xl bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-500 bg-clip-text text-transparent">
              <i className="fas fa-sun"></i>
            </span>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400 bg-clip-text text-transparent font-playfair">Atum | Code Generator</h1>
          </div>
          <div className="text-sm text-gray-600 italic">
            "The primordial code generator from which all else arises"
          </div>
        </header>

        {/* Main Content */}
        <main>
          {/* Query Input Section */}
          <section className="mb-8 bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-300 rounded-xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
              <div className="flex-1">
                <label htmlFor="query" className="block text-white font-semibold mb-2">Describe the code you want to generate</label>
                <textarea
                  id="query"
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white text-gray-800 placeholder-gray-400 font-poppins"
                  placeholder="Create a Python Function"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-col md:w-1/3 gap-3">
                <label htmlFor="language" className="block text-white text-sm mb-1 flex items-center font-poppins">
                  <i className="fas fa-code mr-2 text-xs"></i> Programming Language
                </label>
                <select
                  id="language"
                  className="px-3 py-2 rounded-lg w-full text-sm bg-white border border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 font-poppins"
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                >
                  <option value="" disabled>Select a programming language</option>
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="csharp">C#</option>
                  <option value="php">PHP</option>
                  <option value="ruby">Ruby</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                  <option value="swift">Swift</option>
                  <option value="typescript">TypeScript</option>
                </select>
                <button
                  id="generate-btn"
                  className="mt-auto bg-gradient-to-r from-purple-500 via-pink-400 to-pink-500 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center text-sm hover:scale-105 hover:shadow-lg font-poppins"
                  onClick={handleGenerate}
                  disabled={loading}
                >
                  {loading ? (
                    <><i className="fas fa-spinner fa-spin mr-1 text-xs"></i> Generating...</>
                  ) : (
                    <><i className="fas fa-sparkles mr-1 text-xs"></i> Generate Code</>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* Results Section */}
          <section>
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800 font-poppins">Generated Code</h2>
                <div className="flex space-x-2">
                  <button className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded flex items-center transition-all duration-300 hover:scale-105 font-poppins"
                    onClick={() => navigator.clipboard.writeText(generatedCode)}>
                    <i className="fas fa-copy mr-1"></i> Copy
                  </button>
                  {/* Download button can be implemented later */}
                </div>
              </div>
              <div className="p-6">
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto animate-pulse font-poppins">
                  <code className="text-gray-800">
                    {generatedCode || '// Your generated code will appear here\n// Describe what you need and click "Generate Code"'}
                  </code>
                </pre>
              </div>
            </div>
          </section>

          {/* Analysis Tools Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Quality Report */}
            <div className="flex flex-col items-center text-center p-6 rounded-xl shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-purple-300 flex items-center justify-center mb-4">
                <i className="fas fa-chart-bar text-3xl text-purple-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 font-poppins">Quality Report</h3>
              <p className="text-gray-600 mb-4 font-poppins">Get detailed analysis of your code quality metrics</p>
              <button className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full flex items-center transition-colors duration-300 hover:scale-105 font-poppins">
                <i className="fas fa-sparkles mr-2"></i> Generate
              </button>
            </div>

            {/* Unit Tests */}
            <div className="flex flex-col items-center text-center p-6 rounded-xl shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center mb-4">
                <i className="fas fa-vial text-3xl text-blue-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 font-poppins">Unit Tests</h3>
              <p className="text-gray-600 mb-4 font-poppins">Automatically generate comprehensive test cases</p>
              <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full flex items-center transition-colors duration-300 hover:scale-105 font-poppins">
                <i className="fas fa-sparkles mr-2"></i> Generate
              </button>
            </div>

            {/* Documentation */}
            <div className="flex flex-col items-center text-center p-6 rounded-xl shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-green-300 flex items-center justify-center mb-4">
                <i className="fas fa-book text-3xl text-green-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 font-poppins">Documentation</h3>
              <p className="text-gray-600 mb-4 font-poppins">Create professional documentation instantly</p>
              <button className="mt-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full flex items-center transition-colors duration-300 hover:scale-105 font-poppins">
                <i className="fas fa-sparkles mr-2"></i> Generate
              </button>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm font-poppins">
          <p>Atum Code Generator - Andres Felipe Sanchez</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
