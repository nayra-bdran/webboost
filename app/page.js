import { useState } from 'react';

export default function Home() {
  const [code, setCode] = useState('');
  const [stack, setStack] = useState('nextjs');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setResult('');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, stack })
      });

      const data = await res.json();
      setResult(data.message);
    } catch (err) {
      setResult('حصل خطأ أثناء تحليل الكود.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-700 mb-4 text-center">🚀 WebBoost Analyzer</h1>
        <p className="text-center text-gray-600 mb-6">ادخل كودك واختار نوع المشروع علشان نحلله ونقولك إزاي تحسّن الأداء</p>

        <label className="block mb-2 font-semibold">نوع المشروع (Stack):</label>
        <select
          className="mb-4 p-2 border rounded w-full"
          value={stack}
          onChange={(e) => setStack(e.target.value)}
        >
          <option value="nextjs">Next.js</option>
          <option value="react">React</option>
          <option value="vue">Vue.js</option>
          <option value="vanilla">Vanilla JS</option>
        </select>

        <textarea
          className="w-full h-48 p-3 border rounded resize-none"
          placeholder="الصق هنا جزء من الكود..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
        ></textarea>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full mt-4 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition"
        >
          {loading ? 'جارٍ التحليل...' : 'حلل الكود'}
        </button>

        {result && (
          <div className="mt-6 bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">💡 نصيحة الأداء:</h2>
            <p className="text-gray-800 whitespace-pre-line">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}
