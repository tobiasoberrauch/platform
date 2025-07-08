# Intelligentes App & Funktionen Berechtigungssystem

Das Digital Platform verfügt jetzt über ein ausgeklügeltes Berechtigungssystem, mit dem Administratoren gezielt Apps und Funktionen für Benutzer freischalten können.

## 🎯 Features

### 1. **Klickbare Apps im AppSelector**
- Apps können jetzt direkt im AppSelector angeklickt werden
- Apps können als "nur Funktionen" konfiguriert werden (nicht klickbar)
- Visuelle Indikatoren zeigen den Status an

### 2. **Intelligentes Berechtigungssystem**
- **Role-basierte Berechtigung**: Guest, User, Admin
- **Granulare Berechtigungen**: Spezifische Permissions pro App/Funktion
- **Firmen-spezifisch**: Apps können für bestimmte Firmen freigeschaltet werden
- **Benutzer-spezifisch**: Apps können für einzelne Benutzer aktiviert werden

### 3. **Admin-Interface**
- Übersichtliche Verwaltung aller Apps und Funktionen
- Ein-/Ausschalten von Apps und Funktionen
- Änderung von Rollen-Anforderungen
- Live-Vorschau der Änderungen

## 🔧 Technische Implementierung

### Permission-Struktur

```typescript
interface AppConfig {
  id: string;
  name: string;
  description: string;
  icon?: string;
  url: string;
  color: string;
  gradient: string;
  functions?: AppFunction[];
  
  // Neues Berechtigungssystem
  requiredRole?: 'admin' | 'user' | 'guest';
  requiredPermissions?: string[];
  availableForCompanies?: string[];
  availableForUsers?: string[];
  isEnabled?: boolean;
  isClickable?: boolean; // Ob die App im Selector anklickbar ist
}

interface AppFunction {
  id: string;
  name: string;
  description: string;
  url: string;
  icon?: string;
  
  // Berechtigungssystem
  requiredRole?: 'admin' | 'user' | 'guest';
  requiredPermissions?: string[];
  availableForCompanies?: string[];
  availableForUsers?: string[];
  isEnabled?: boolean;
}
```

### Aktuelle Berechtigungen

**Apps:**
- **Platform**: Für alle Benutzer zugänglich
- **Benchmark**: Benötigt User-Rolle + `benchmark.access` Permission
- **CSRD**: Benötigt User-Rolle + `csrd.access` Permission  
- **Support**: Benötigt User-Rolle + `support.access` Permission

**Funktionen:**
- **Lagebericht**: User-Rolle erforderlich
- **Produkt Benchmark**: User + `benchmark.products`
- **Market Intelligence**: User + `benchmark.market`
- **Competitive Intelligence**: **Admin + `benchmark.competitive`**
- **Wesentlichkeitsanalyse**: User + `csrd.analysis`
- **CSRD Reporting**: **Admin + `csrd.reporting`**
- **Zero Level Support**: User + `support.tickets`

## 🎮 Nutzung

### Für Administratoren

1. **Admin-Panel öffnen:**
   - In der Navbar auf Ihr Benutzerprofil klicken
   - "App Berechtigungen" auswählen

2. **Apps verwalten:**
   - Apps ein-/ausschalten
   - Apps als anklickbar/nicht-anklickbar markieren
   - Rollen-Anforderungen ändern

3. **Funktionen verwalten:**
   - Einzelne Funktionen aktivieren/deaktivieren
   - Rollen-Anforderungen pro Funktion setzen

4. **Änderungen speichern:**
   - Alle Änderungen werden im LocalStorage gespeichert
   - In einer echten Implementierung würde dies über eine API erfolgen

### Für Benutzer

1. **AppSelector verwenden:**
   - Klicken Sie direkt auf Apps um sie zu öffnen
   - Oder navigieren Sie zu spezifischen Funktionen
   - Nur verfügbare Apps/Funktionen werden angezeigt

2. **Permissions verstehen:**
   - **Guest**: Minimale Rechte, meist nur Plattform-Zugang
   - **User**: Standard-Benutzer mit Zugang zu den meisten Features
   - **Admin**: Vollzugriff auf alle Features + Admin-Tools

## 🔒 Sicherheitsfeatures

### Role-Hierarchie
```
Admin (Level 3) > User (Level 2) > Guest (Level 1)
```

- Ein Admin kann alles was ein User kann
- Ein User kann alles was ein Guest kann
- Spezifische Permissions können zusätzliche Einschränkungen hinzufügen

### Permission-Checks
```typescript
// Beispiel: Zugriff auf Competitive Intelligence
requiredRole: 'admin'
requiredPermissions: ['benchmark.competitive']

// Bedeutet: Nur Admins mit der spezifischen Permission können zugreifen
```

### Client-Side Security
- Permissions werden client-seitig für die UI-Darstellung verwendet
- **Wichtig**: Server-seitige Validation ist trotzdem erforderlich!
- LocalStorage wird nur für Prototyping verwendet

## 🚀 Integration

### In Existing Apps

```typescript
// App-Komponente
import { getCurrentUser, hasPermission } from '@digital-platform/config';

const MyComponent = () => {
  const user = getCurrentUser();
  
  // Feature nur für Admins
  if (user.role === 'admin') {
    return <AdminFeature />;
  }
  
  // Feature mit spezifischer Permission
  if (hasPermission(user, 'benchmark.competitive')) {
    return <CompetitiveAnalysis />;
  }
  
  return <StandardView />;
};
```

### Navbar Integration

```typescript
// Die Navbar verwendet automatisch das neue System
import { ImprovedNavbar } from '@digital-platform/ui';

// Benutzer-Informationen werden automatisch geladen
<ImprovedNavbar />
```

## 🎯 Beispiel-Szenarien

### Szenario 1: Neue Firma onboarden
1. Admin öffnet Berechtigungs-Panel
2. Deaktiviert "Competitive Intelligence" für neue Firma
3. Behält Standard-Features aktiv
4. Neue Firma sieht nur erlaubte Features

### Szenario 2: Beta-Feature einführen
1. Admin erstellt neues Feature mit `beta.access` Permission
2. Gibt nur ausgewählten Benutzern die Permission
3. Feature ist nur für Beta-Tester sichtbar

### Szenario 3: Role-basierte Einschränkung
1. CSRD-Reporting ist nur für Admins verfügbar
2. Standard-User können Analysen machen, aber keine Berichte erstellen
3. Klare Trennung der Verantwortlichkeiten

## 🔄 Migration

### Von hardcoded zu permissions-basiert

**Vorher:**
```typescript
// Alle Apps für alle Benutzer
const apps = getAppConfigs();
```

**Nachher:**
```typescript
// Gefiltert nach Benutzer-Berechtigungen
const apps = getFilteredAppConfigs(currentUser);
```

### Existing Components
- Alle bestehenden Komponenten funktionieren weiterhin
- Neue Features werden automatisch mit Permissions gefiltert
- Keine Breaking Changes

## 🎨 UI/UX Improvements

### AppSelector
- **Klickbare Apps**: Direkte Navigation möglich
- **Visual Indicators**: "Aktiv", "Nur Funktionen"
- **Permission-Aware**: Nur verfügbare Items werden angezeigt
- **Function Count**: Zeigt Anzahl verfügbarer Funktionen

### Admin Interface
- **Drag & Drop**: Einfache Verwaltung (zukünftig)
- **Bulk Operations**: Mehrere Items gleichzeitig ändern (zukünftig)
- **Live Preview**: Sofortige Visualisierung der Änderungen
- **Audit Log**: Nachverfolgung von Änderungen (zukünftig)

## 📈 Zukunft

### Geplante Features
1. **Database Integration**: Persistente Speicherung statt LocalStorage
2. **API Integration**: Backend-Validation der Permissions
3. **Advanced Roles**: Custom Roles statt nur Admin/User/Guest
4. **Time-based Permissions**: Zeitlich begrenzte Zugriffe
5. **IP-based Restrictions**: Standort-basierte Einschränkungen
6. **Audit Logging**: Vollständige Nachverfolgung aller Änderungen

### Skalierung
- System ist designed für Hunderte von Apps/Funktionen
- Effiziente Client-seitige Filterung
- Lazy Loading für große Permission-Sets
- Caching für bessere Performance

---

Das neue Berechtigungssystem macht die Digital Platform extrem flexibel und sicher, während es gleichzeitig eine intuitive Benutzererfahrung bietet! 🎉