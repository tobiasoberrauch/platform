import { ModernLayout } from '@digital-platform/ui';

export default function CSRDReportingPage() {
  return (
    <ModernLayout title="CSRD Reporting">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">CSRD Reporting</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-6">
            Corporate Sustainability Reporting Directive - Compliance und Berichterstattung.
          </p>
          <div className="space-y-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Berichtspflicht</h3>
              <p className="text-gray-600">Überprüfung der CSRD-Berichtspflicht für Ihr Unternehmen</p>
              <div className="mt-2">
                <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Berichtspflichtig ab 2025</span>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">ESRS Standards</h3>
              <p className="text-gray-600">European Sustainability Reporting Standards Implementierung</p>
              <div className="mt-2">
                <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">In Vorbereitung</span>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Datensammlung</h3>
              <p className="text-gray-600">Systematische Erfassung nachhaltigkeitsrelevanter Daten</p>
              <div className="mt-2">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Laufend</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
}