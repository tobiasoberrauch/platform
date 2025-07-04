import { ModernLayout } from '@digital-platform/ui';
import { useState } from 'react';

interface SustainabilityMetric {
  category: string;
  metrics: Array<{
    name: string;
    value: number;
    unit: string;
    target: number;
    status: 'on-track' | 'at-risk' | 'behind';
  }>;
}

const sustainabilityData: SustainabilityMetric[] = [
  {
    category: 'Environmental',
    metrics: [
      { name: 'Carbon Emissions', value: 1250, unit: 'tons CO₂', target: 1000, status: 'at-risk' },
      { name: 'Energy Consumption', value: 85, unit: 'MWh', target: 90, status: 'on-track' },
      { name: 'Water Usage', value: 2400, unit: 'liters', target: 2500, status: 'on-track' },
      { name: 'Waste Reduction', value: 78, unit: '%', target: 80, status: 'at-risk' }
    ]
  },
  {
    category: 'Social',
    metrics: [
      { name: 'Employee Satisfaction', value: 4.2, unit: '/5', target: 4.5, status: 'at-risk' },
      { name: 'Training Hours', value: 32, unit: 'hours/employee', target: 40, status: 'behind' },
      { name: 'Safety Incidents', value: 2, unit: 'incidents', target: 0, status: 'behind' },
      { name: 'Diversity Ratio', value: 45, unit: '%', target: 50, status: 'on-track' }
    ]
  },
  {
    category: 'Governance',
    metrics: [
      { name: 'Board Independence', value: 60, unit: '%', target: 75, status: 'at-risk' },
      { name: 'ESG Policy Coverage', value: 95, unit: '%', target: 100, status: 'on-track' },
      { name: 'Compliance Score', value: 92, unit: '%', target: 95, status: 'at-risk' },
      { name: 'Transparency Index', value: 88, unit: '%', target: 90, status: 'at-risk' }
    ]
  }
];

export default function CSRDPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Environmental');
  const [reportingPeriod, setReportingPeriod] = useState<string>('Q4 2024');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'text-green-600 bg-green-100 border-green-200';
      case 'at-risk': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'behind': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getProgressWidth = (value: number, target: number) => {
    return Math.min(100, (value / target) * 100);
  };

  const selectedData = sustainabilityData.find(d => d.category === selectedCategory);

  return (
    <ModernLayout title="CSRD">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🌱 CSRD Compliance Dashboard
          </h1>
          <p className="text-gray-600">
            Corporate Sustainability Reporting Directive - Monitor and manage ESG metrics
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Reporting Period: {reportingPeriod}
            </h2>
            <div className="flex space-x-4">
              <select
                value={reportingPeriod}
                onChange={(e) => setReportingPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option>Q4 2024</option>
                <option>Q3 2024</option>
                <option>Q2 2024</option>
                <option>Q1 2024</option>
              </select>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                Generate Report
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {sustainabilityData.map((category) => {
              const onTrackCount = category.metrics.filter(m => m.status === 'on-track').length;
              const totalCount = category.metrics.length;

              return (
                <button
                  key={category.category}
                  onClick={() => setSelectedCategory(category.category)}
                  className={`p-4 rounded-lg border-2 transition-all ${selectedCategory === category.category
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{category.category}</h3>
                  <div className="text-sm text-gray-600">
                    {onTrackCount}/{totalCount} metrics on track
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(onTrackCount / totalCount) * 100}%` }}
                    ></div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {selectedData && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {selectedCategory} Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedData.metrics.map((metric, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getStatusColor(metric.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{metric.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                      {metric.status.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-2 mb-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {metric.value}
                    </span>
                    <span className="text-sm text-gray-500">{metric.unit}</span>
                    <span className="text-sm text-gray-400">/ {metric.target} target</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${metric.status === 'on-track' ? 'bg-green-500' :
                          metric.status === 'at-risk' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      style={{ width: `${getProgressWidth(metric.value, metric.target)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Progress: {getProgressWidth(metric.value, metric.target).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Compliance Overview
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-green-800 font-medium">Data Collection</span>
                <span className="text-green-600">✓ Complete</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="text-yellow-800 font-medium">Data Verification</span>
                <span className="text-yellow-600">⚠ In Progress</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-800 font-medium">Report Submission</span>
                <span className="text-gray-600">○ Pending</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Key Actions Required
            </h2>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium text-gray-900">Reduce Carbon Emissions</div>
                  <div className="text-sm text-gray-600">20% above target - implement green initiatives</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium text-gray-900">Increase Employee Training</div>
                  <div className="text-sm text-gray-600">8 hours below target per employee</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium text-gray-900">Improve Board Independence</div>
                  <div className="text-sm text-gray-600">Need 15% more independent board members</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
}
