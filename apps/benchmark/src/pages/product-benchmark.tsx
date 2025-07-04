import { ModernLayout } from '@digital-platform/ui';

export default function ProductBenchmarkPage() {
  return (
    <ModernLayout title="Produkt Benchmark">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Produkt Benchmark</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-6">
            Vergleichen Sie Ihre Produkte mit der Konkurrenz und identifizieren Sie Verbesserungspotentiale.
          </p>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Produktvergleich</h3>
              <p className="text-gray-600">Detaillierte Analyse Ihrer Produkte im Marktvergleich</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Wettbewerbsanalyse</h3>
              <p className="text-gray-600">Umfassende Bewertung der Konkurrenzprodukte</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Marktpositionierung</h3>
              <p className="text-gray-600">Strategische Empfehlungen für bessere Marktposition</p>
            </div>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
}