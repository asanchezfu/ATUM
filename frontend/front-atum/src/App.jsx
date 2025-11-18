
import { useState, useEffect } from 'react';

// API base URL - adjust if backend runs on different port
const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('');
  const [framework, setFramework] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [generatedTests, setGeneratedTests] = useState('');
  const [documentation, setDocumentation] = useState('');
  const [documentationFilename, setDocumentationFilename] = useState('');
  const [documentationNotes, setDocumentationNotes] = useState([]);
  const [qualityReport, setQualityReport] = useState(null);
  const [qualityDetailsOpen, setQualityDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingTests, setLoadingTests] = useState(false);
  const [loadingDocumentation, setLoadingDocumentation] = useState(false);
  const [loadingQuality, setLoadingQuality] = useState(false);
  const [error, setError] = useState('');
  const [copyNotification, setCopyNotification] = useState('');

  // Generate code using POST /generate endpoint
  const handleGenerate = async () => {
    if (!query) {
      alert('Please describe the code you want to generate');
      return;
    }
    if (!language) {
      alert('Please select a programming language');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          language: language,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGeneratedCode(data.generated_code || '// No code generated');
      // Don't clear manualCode - keep them separate
    } catch (err) {
      setError(`Error generating code: ${err.message}`);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate tests using POST /api/v1/generate-tests endpoint
  const handleGenerateTests = async () => {
    const sourceCode = manualCode.trim() !== '' ? manualCode : generatedCode;

    if (!sourceCode || sourceCode.trim() === '' || sourceCode.includes('Your generated code will appear here')) {
      alert('Please generate code or paste your own code first');
      return;
    }
    if (!language) {
      alert('Please select a programming language');
      return;
    }
    if (!framework) {
      alert('Please select a testing framework');
      return;
    }

    setLoadingTests(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/generate-tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: sourceCode,
          language: language,
          framework: framework,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.ok && data.tests) {
        setGeneratedTests(data.tests);
      } else {
        setError(`Error: ${data.notes?.join(', ') || 'Failed to generate tests'}`);
      }
    } catch (err) {
      setError(`Error generating tests: ${err.message}`);
      console.error('Error:', err);
    } finally {
      setLoadingTests(false);
    }
  };

  // Generate documentation markdown via backend
  const handleGenerateDocumentation = async () => {
    const sourceCode = manualCode.trim() !== '' ? manualCode : generatedCode;

    if (!sourceCode || sourceCode.trim() === '' || sourceCode.includes('Your generated code will appear here')) {
      alert('Please generate code or paste your own code first');
      return;
    }

    setLoadingDocumentation(true);
    setError('');
    setDocumentationNotes([]);

    const payload = { code: sourceCode };
    if (language) {
      payload.language = language;
    }
    if (query && query.trim() !== '') {
      payload.project_name = query.trim().slice(0, 80);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/generate-docs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.ok && data.content) {
        setDocumentation(data.content);
        setDocumentationFilename(data.filename || 'documentation.md');
        setDocumentationNotes(data.notes || []);
      } else {
        setError(`Error: ${data.notes?.join(', ') || 'Failed to generate documentation'}`);
      }
    } catch (err) {
      setError(`Error generating documentation: ${err.message}`);
      console.error('Error:', err);
    } finally {
      setLoadingDocumentation(false);
    }
  };

  // Copy handler with notification
  const handleCopy = async (text, type = 'code') => {
    try {
      await navigator.clipboard.writeText(text);
      const label = type === 'code' ? 'Code' : type === 'tests' ? 'Tests' : 'Documentation';
      setCopyNotification(`${label} copied to clipboard!`);
      setTimeout(() => setCopyNotification(''), 3000);
    } catch (err) {
      setCopyNotification('Failed to copy to clipboard');
      setTimeout(() => setCopyNotification(''), 3000);
    }
  };

  const handleDownloadDocumentation = () => {
    if (!documentation) return;
    const blob = new Blob([documentation], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = documentationFilename || 'documentation.md';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  // Get language class for syntax highlighting
  const getLanguageClass = (lang) => {
    const langMap = {
      'python': 'language-python',
      'javascript': 'language-javascript',
      'java': 'language-java',
      'csharp': 'language-csharp',
      'php': 'language-php',
      'ruby': 'language-ruby',
      'go': 'language-go',
      'rust': 'language-rust',
      'swift': 'language-swift',
      'typescript': 'language-typescript'
    };
    return langMap[lang?.toLowerCase()] || 'language-text';
  };

  const gradeColors = (grade) => {
    if (!grade) return 'from-gray-400 via-gray-300 to-gray-200';
    const mapping = {
      'A+': 'from-green-500 via-emerald-400 to-emerald-300',
      'A': 'from-green-500 via-emerald-400 to-emerald-300',
      'A-': 'from-green-400 via-lime-400 to-lime-300',
      'B+': 'from-lime-400 via-yellow-300 to-yellow-300',
      'B': 'from-yellow-400 via-amber-300 to-amber-200',
      'B-': 'from-amber-400 via-orange-300 to-orange-200',
      'C+': 'from-orange-400 via-orange-300 to-orange-200',
      'C': 'from-orange-500 via-amber-400 to-yellow-300',
      'C-': 'from-orange-600 via-amber-500 to-yellow-400',
      'D': 'from-red-400 via-rose-400 to-rose-300',
      'F': 'from-red-600 via-rose-500 to-rose-400',
    };
    return mapping[grade] || 'from-gray-400 via-gray-300 to-gray-200';
  };

  const handleGenerateQualityReport = async () => {
    const sourceCode = manualCode.trim() !== '' ? manualCode : generatedCode;

    if (!sourceCode || sourceCode.trim() === '' || sourceCode.includes('Your generated code will appear here')) {
      alert('Please generate code or paste your own code first');
      return;
    }

    setLoadingQuality(true);
    setError('');
    setQualityDetailsOpen(false);

    const payload = { code: sourceCode };
    if (language) {
      payload.language = language;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/quality-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.ok) {
        setQualityReport(data);
      } else {
        setError(`Error: ${data.suggestions?.join(', ') || 'Failed to generate quality report'}`);
      }
    } catch (err) {
      setError(`Error generating quality report: ${err.message}`);
      console.error('Error:', err);
    } finally {
      setLoadingQuality(false);
    }
  };

  // Trigger Prism highlighting when code changes
  useEffect(() => {
    if (window.Prism) {
      window.Prism.highlightAll();
    }
  }, [generatedCode, manualCode, generatedTests, documentation, language]);

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

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded font-poppins">
              {error}
            </div>
          )}

          {/* Copy Notification */}
          {copyNotification && (
            <div className="mb-4 fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 font-poppins animate-fade-in">
              <i className="fas fa-check-circle"></i>
              {copyNotification}
            </div>
          )}

          {/* Results Section */}
          {generatedCode && (
            <section>
              <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800 font-poppins">Generated Code</h2>
                  <div className="flex space-x-2">
                    <button className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded flex items-center transition-all duration-300 hover:scale-105 font-poppins"
                      onClick={() => handleCopy(generatedCode, 'code')}>
                      <i className="fas fa-copy mr-1"></i> Copy
                    </button>
                    {/* Download button can be implemented later */}
                  </div>
                </div>
                <div className="p-6">
                  <pre className="bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto">
                    <code className={getLanguageClass(language)}>
                      {generatedCode}
                    </code>
                  </pre>
                </div>
              </div>
            </section>
          )}

          {/* Manual Code Input */}
          <section className="mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 font-poppins mb-3 flex items-center gap-2">
                <i className="fas fa-code-branch text-indigo-500"></i>
                Paste Your Own Code (Optional)
              </h2>
              <p className="text-sm text-gray-600 mb-4 font-poppins">
                Already have code? Paste it here and select the language and testing framework to generate tests. This code will be used for test generation.
              </p>
              <textarea
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 bg-white text-gray-800 placeholder-gray-400 font-poppins"
                placeholder="Paste your existing code here..."
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
              />
              {manualCode.trim() !== '' && (
                <>
                  <p className="mt-2 text-xs text-gray-500 font-poppins mb-3">Tests will be generated based on the pasted code above.</p>
                  <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 font-poppins">Preview:</h3>
                    <pre className="bg-gray-900 p-3 rounded text-xs overflow-x-auto">
                      <code className={getLanguageClass(language)}>
                        {manualCode}
                      </code>
                    </pre>
                  </div>
                </>
              )}
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
              <button
                className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full flex items-center transition-colors duration-300 hover:scale-105 font-poppins disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleGenerateQualityReport}
                disabled={loadingQuality}
              >
                {loadingQuality ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i> Generating...</>
                ) : (
                  <><i className="fas fa-sparkles mr-2"></i> Generate</>
                )}
              </button>
              {qualityReport && (
                <div className="w-full mt-4">
                  <div className={`rounded-lg p-4 text-white font-semibold bg-gradient-to-r ${gradeColors(qualityReport.final_grade)} shadow`}>
                    <div className="text-sm uppercase tracking-wide">Final Score</div>
                    <div className="text-3xl font-bold">{qualityReport.final_grade}</div>
                    <p className="text-xs font-normal mt-1">Average score: {qualityReport.final_score}/100</p>
                  </div>
                  <button
                    className="mt-3 w-full border border-purple-200 text-purple-700 hover:bg-purple-50 px-4 py-2 rounded-lg text-sm font-poppins transition-colors duration-200 flex items-center justify-center gap-2"
                    onClick={() => setQualityDetailsOpen(!qualityDetailsOpen)}
                  >
                    <i className={`fas ${qualityDetailsOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                    {qualityDetailsOpen ? 'Hide metric details' : 'Show metric details'}
                  </button>
                </div>
              )}
            </div>

            {/* Unit Tests */}
            <div className="flex flex-col items-center text-center p-6 rounded-xl shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center mb-4">
                <i className="fas fa-vial text-3xl text-blue-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 font-poppins">Unit Tests</h3>
              <p className="text-gray-600 mb-4 font-poppins">Automatically generate comprehensive test cases</p>
              <div className="w-full mb-3">
                <select
                  className="w-full px-3 py-2 rounded-lg text-sm bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-poppins"
                  value={framework}
                  onChange={e => setFramework(e.target.value)}
                >
                  <option value="" disabled>Select framework</option>
                  {language === 'python' && (
                    <>
                      <option value="pytest">pytest</option>
                      <option value="unittest">unittest</option>
                    </>
                  )}
                  {language === 'javascript' && (
                    <>
                      <option value="jest">Jest</option>
                      <option value="mocha">Mocha</option>
                    </>
                  )}
                  {language === 'java' && (
                    <option value="junit">JUnit</option>
                  )}
                  {language && !['python', 'javascript', 'java'].includes(language) && (
                    <option value="default">Default</option>
                  )}
                </select>
              </div>
              <button
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full flex items-center transition-colors duration-300 hover:scale-105 font-poppins"
                onClick={handleGenerateTests}
                disabled={loadingTests}
              >
                {loadingTests ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i> Generating...</>
                ) : (
                  <><i className="fas fa-sparkles mr-2"></i> Generate</>
                )}
              </button>
            </div>

            {/* Documentation */}
            <div className="flex flex-col items-center text-center p-6 rounded-xl shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-green-300 flex items-center justify-center mb-4">
                <i className="fas fa-book text-3xl text-green-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 font-poppins">Documentation</h3>
              <p className="text-gray-600 mb-4 font-poppins">Create professional documentation instantly</p>
              <button
                className="mt-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full flex items-center transition-colors duration-300 hover:scale-105 font-poppins disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleGenerateDocumentation}
                disabled={loadingDocumentation}
              >
                {loadingDocumentation ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i> Generating...</>
                ) : (
                  <><i className="fas fa-sparkles mr-2"></i> Generate</>
                )}
              </button>
              {documentation && (
                <p className="mt-3 text-sm text-green-600 font-poppins">Documentation file ready below.</p>
              )}
            </div>
          </section>

          {/* Generated Tests Section */}
          {generatedTests && (
            <section className="mt-6">
              <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800 font-poppins">Generated Unit Tests</h2>
                  <div className="flex space-x-2">
                    <button className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded flex items-center transition-all duration-300 hover:scale-105 font-poppins"
                      onClick={() => handleCopy(generatedTests, 'tests')}>
                      <i className="fas fa-copy mr-1"></i> Copy
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <pre className="bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto">
                    <code className={getLanguageClass(language)}>
                      {generatedTests}
                    </code>
                  </pre>
                </div>
              </div>
            </section>
          )}

          {/* Quality Report Details */}
          {qualityReport && qualityDetailsOpen && (
            <section className="mt-6">
              <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800 font-poppins">Quality Metrics</h2>
                  <span className="text-sm text-gray-500 font-poppins">Based on heuristic analysis</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                  {qualityReport.metrics?.map((metric) => (
                    <div key={metric.name} className="border border-gray-100 rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-semibold text-gray-700 font-poppins">{metric.name}</h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-semibold">{metric.letter}</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-2">{metric.score}/100</div>
                      <p className="text-sm text-gray-600 font-poppins leading-relaxed">{metric.explanation}</p>
                    </div>
                  ))}
                </div>
                {qualityReport.suggestions?.length > 0 && (
                  <div className="bg-purple-50 text-purple-800 px-6 py-4 border-t border-purple-100 text-sm font-poppins">
                    <strong className="block mb-1">Suggestions</strong>
                    <ul className="list-disc ml-6 space-y-1">
                      {qualityReport.suggestions.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Generated Documentation Section */}
          {documentation && (
            <section className="mt-6">
              <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 font-poppins">Generated Documentation</h2>
                    <p className="text-xs text-gray-500 font-poppins">{documentationFilename || 'documentation.md'}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="text-sm bg-green-200 hover:bg-green-300 px-3 py-1 rounded flex items-center transition-all duration-300 hover:scale-105 font-poppins"
                      onClick={handleDownloadDocumentation}
                    >
                      <i className="fas fa-download mr-1"></i> Download
                    </button>
                    <button
                      className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded flex items-center transition-all duration-300 hover:scale-105 font-poppins"
                      onClick={() => handleCopy(documentation, 'documentation')}
                    >
                      <i className="fas fa-copy mr-1"></i> Copy
                    </button>
                  </div>
                </div>
                {documentationNotes.length > 0 && (
                  <div className="bg-green-50 text-green-700 text-sm px-6 py-3 border-b font-poppins">
                    {documentationNotes.join(' ')}
                  </div>
                )}
                <div className="p-6">
                  <pre className="bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto text-white">
                    <code className="language-markdown">
                      {documentation}
                    </code>
                  </pre>
                </div>
              </div>
            </section>
          )}
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
