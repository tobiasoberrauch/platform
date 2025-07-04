import { ModernLayout } from '@digital-platform/ui';

export default function CompetitiveIntelligencePage() {
  return (
    <ModernLayout title="Competitive Intelligence">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Competitive Intelligence</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-6">
            Wettbewerbsanalyse und strategische Insights für Ihren Markterfolg.
          </p>
          <div className="space-y-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Wettbewerberprofile</h3>
              <p className="text-gray-600">Detaillierte Analyse der wichtigsten Konkurrenten</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Strategische Positionierung</h3>
              <p className="text-gray-600">Bewertung der Marktposition und Differenzierungsstrategien</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">SWOT-Analyse</h3>
              <p className="text-gray-600">Stärken, Schwächen, Chancen und Risiken im Wettbewerbsvergleich</p>
            </div>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
}