
'use client';

import { useState } from 'react';

export default function TestApiPage() {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const checkApi = async () => {
        setLoading(true);
        try {
            // Test with a known movie (Fight Club)
            const res = await fetch('/api/sources?tmdbId=550&title=Fight%20Club&type=movie&year=1999');
            const data = await res.json();
            setResult(data);
        } catch (error: any) {
            setResult({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 text-white min-h-screen bg-black font-mono">
            <h1 className="text-2xl mb-4">Scraper API Debugger</h1>
            <button
                onClick={checkApi}
                className="bg-blue-600 px-4 py-2 rounded disabled:opacity-50"
                disabled={loading}
            >
                {loading ? 'Testing...' : 'Test /api/sources'}
            </button>

            <div className="mt-8 p-4 bg-gray-900 rounded border border-gray-800">
                <h2 className="text-xl mb-2">API Response:</h2>
                <pre className="whitespace-pre-wrap text-sm text-green-400">
                    {JSON.stringify(result, null, 2)}
                </pre>
            </div>
        </div>
    );
}
