import { ModernLayout } from '@digital-platform/ui';

export default function ZeroLevelPage() {
  return (
    <ModernLayout title="Zero Level Support">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Zero Level Support</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-6">
            Automatisierte Erstbearbeitung von Support-Anfragen mit KI-Unterstützung.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Automatische Kategorisierung</h3>
              <p className="text-gray-600">KI-basierte Einordnung eingehender Support-Tickets</p>
              <div className="mt-2">
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Aktiv</span>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Sofortlösungen</h3>
              <p className="text-gray-600">Automatische Bereitstellung von Lösungsvorschlägen</p>
              <div className="mt-2">
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Aktiv</span>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Eskalationsmanagement</h3>
              <p className="text-gray-600">Intelligente Weiterleitung komplexer Anfragen</p>
              <div className="mt-2">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Optimierung</span>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Performance Monitoring</h3>
              <p className="text-gray-600">Überwachung der Automatisierungseffizienz</p>
              <div className="mt-2">
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Läuft</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
}