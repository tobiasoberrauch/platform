import { ModernLayout } from '@digital-platform/ui';

export default function MarketIntelligencePage() {
  return (
    <ModernLayout title="Market Intelligence">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Market Intelligence</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-6">
            Marktanalysen und Trends für strategische Entscheidungen.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Markttrends</h3>
              <p className="text-gray-600">Aktuelle Entwicklungen und Zukunftsprognosen</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Kundenverhalten</h3>
              <p className="text-gray-600">Analyse des Kundenverhaltens und Präferenzen</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Marktgröße</h3>
              <p className="text-gray-600">Bewertung des Marktpotentials und Wachstumschancen</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Competitive Landscape</h3>
              <p className="text-gray-600">Übersicht über Wettbewerber und Marktanteile</p>
            </div>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
}