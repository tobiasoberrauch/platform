import { ModernLayout } from '@digital-platform/ui';

export default function LageberichtPage() {
  return (
    <ModernLayout title="Lagebericht">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Lagebericht</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-4">
            Umfassender Unternehmensbericht mit aktuellen Kennzahlen und Entwicklungen.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Umsatz</h3>
              <p className="text-2xl font-bold text-green-600">€2.4M</p>
              <p className="text-sm text-gray-500">+12% vs. Vormonat</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Gewinn</h3>
              <p className="text-2xl font-bold text-blue-600">€480K</p>
              <p className="text-sm text-gray-500">+8% vs. Vormonat</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Mitarbeiter</h3>
              <p className="text-2xl font-bold text-purple-600">127</p>
              <p className="text-sm text-gray-500">+3 neue Stellen</p>
            </div>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
}