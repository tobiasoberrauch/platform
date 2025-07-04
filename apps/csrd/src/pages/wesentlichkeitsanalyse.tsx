import { ModernLayout } from '@digital-platform/ui';

export default function WesentlichkeitsanalysePage() {
  return (
    <ModernLayout title="Wesentlichkeitsanalyse">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Wesentlichkeitsanalyse</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-6">
            Identifizierung wesentlicher Nachhaltigkeitsthemen für Ihr Unternehmen.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Umweltauswirkungen</h3>
              <p className="text-gray-600">Bewertung der ökologischen Auswirkungen</p>
              <div className="mt-2">
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Hoch relevant</span>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Soziale Verantwortung</h3>
              <p className="text-gray-600">Analyse sozialer Nachhaltigkeitsaspekte</p>
              <div className="mt-2">
                <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Mittel relevant</span>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Governance</h3>
              <p className="text-gray-600">Unternehmensführung und Compliance</p>
              <div className="mt-2">
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Hoch relevant</span>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Stakeholder-Engagement</h3>
              <p className="text-gray-600">Einbindung relevanter Interessensgruppen</p>
              <div className="mt-2">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">In Bearbeitung</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
}