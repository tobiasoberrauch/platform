import { ModernLayout } from '@digital-platform/ui';
import { useState } from 'react';

interface BenchmarkResult {
  name: string;
  score: number;
  unit: string;
  status: 'good' | 'warning' | 'error';
}

const mockData: BenchmarkResult[] = [
  { name: 'API Response Time', score: 145, unit: 'ms', status: 'good' },
  { name: 'Database Query Time', score: 23, unit: 'ms', status: 'good' },
  { name: 'Page Load Time', score: 2.3, unit: 's', status: 'warning' },
  { name: 'Memory Usage', score: 78, unit: '%', status: 'warning' },
  { name: 'CPU Usage', score: 45, unit: '%', status: 'good' },
  { name: 'Error Rate', score: 0.02, unit: '%', status: 'good' },
];

export default function BenchmarkPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<BenchmarkResult[]>(mockData);

  const runBenchmark = async () => {
    setIsRunning(true);
    // Simulate benchmark running
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Update results with random variations
    const newResults = mockData.map(result => ({
      ...result,
      score: result.score + (Math.random() - 0.5) * result.score * 0.2
    }));

    setResults(newResults);
    setIsRunning(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <ModernLayout title="Benchmark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 Performance Benchmark
          </h1>
          <p className="text-gray-600">
            Monitor and analyze system performance metrics
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Benchmark Results
            </h2>
            <button
              onClick={runBenchmark}
              disabled={isRunning}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isRunning ? 'Running...' : 'Run Benchmark'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((result, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{result.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                    {result.status}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {result.score.toFixed(2)}
                  <span className="text-sm text-gray-500 ml-1">{result.unit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${result.status === 'good' ? 'bg-green-500' :
                        result.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    style={{ width: `${Math.min(100, (result.score / 100) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              System Overview
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Tests:</span>
                <span className="font-medium">{results.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Passing:</span>
                <span className="font-medium text-green-600">
                  {results.filter(r => r.status === 'good').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Warnings:</span>
                <span className="font-medium text-yellow-600">
                  {results.filter(r => r.status === 'warning').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Errors:</span>
                <span className="font-medium text-red-600">
                  {results.filter(r => r.status === 'error').length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Recent Activity
            </h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Benchmark completed successfully</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">System metrics updated</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Performance warning detected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
}
