import { Layout, ModernLayout } from '@digital-platform/ui';
import { useState } from 'react';

interface Ticket {
  id: string;
  subject: string;
  customer: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  assignee: string;
  createdAt: string;
  category: string;
}

const mockTickets: Ticket[] = [
  {
    id: 'TICK-001',
    subject: 'Cannot access dashboard after login',
    customer: 'John Doe',
    priority: 'high',
    status: 'open',
    assignee: 'Sarah Miller',
    createdAt: '2024-07-03 14:30',
    category: 'Technical'
  },
  {
    id: 'TICK-002',
    subject: 'Billing inquiry for Q4 charges',
    customer: 'Acme Corp',
    priority: 'medium',
    status: 'in-progress',
    assignee: 'Mike Johnson',
    createdAt: '2024-07-03 13:15',
    category: 'Billing'
  },
  {
    id: 'TICK-003',
    subject: 'Feature request: Export to Excel',
    customer: 'Tech Solutions Ltd',
    priority: 'low',
    status: 'open',
    assignee: 'Unassigned',
    createdAt: '2024-07-03 11:45',
    category: 'Feature Request'
  },
  {
    id: 'TICK-004',
    subject: 'System performance issues',
    customer: 'Global Industries',
    priority: 'urgent',
    status: 'in-progress',
    assignee: 'Alex Chen',
    createdAt: '2024-07-03 10:20',
    category: 'Technical'
  },
  {
    id: 'TICK-005',
    subject: 'Account setup assistance',
    customer: 'StartupCo',
    priority: 'medium',
    status: 'resolved',
    assignee: 'Lisa Wong',
    createdAt: '2024-07-02 16:00',
    category: 'Onboarding'
  }
];

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-100';
      case 'in-progress': return 'text-purple-600 bg-purple-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredTickets = selectedStatus === 'all' 
    ? tickets 
    : tickets.filter(ticket => ticket.status === selectedStatus);

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    urgent: tickets.filter(t => t.priority === 'urgent').length
  };

  return (
    <ModernLayout title="Support">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🛠️ Support Dashboard
          </h1>
          <p className="text-gray-600">
            Manage customer support tickets and requests
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Tickets</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
            <div className="text-sm text-gray-500">Open</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.inProgress}</div>
            <div className="text-sm text-gray-500">In Progress</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            <div className="text-sm text-gray-500">Resolved</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
            <div className="text-sm text-gray-500">Urgent</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Support Tickets
            </h2>
            <div className="flex space-x-4">
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <button 
                onClick={() => setShowNewTicketForm(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                + New Ticket
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{ticket.id}</div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">{ticket.subject}</div>
                        <div className="text-xs text-gray-400">{ticket.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{ticket.customer}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ticket.assignee}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.createdAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Recent Activity
            </h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-xs">SM</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Sarah Miller assigned TICK-001</div>
                  <div className="text-xs text-gray-500">2 minutes ago</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xs">LW</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Lisa Wong resolved TICK-005</div>
                  <div className="text-xs text-gray-500">1 hour ago</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xs">AC</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Alex Chen updated TICK-004</div>
                  <div className="text-xs text-gray-500">3 hours ago</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Team Performance
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Response Time</span>
                <span className="font-semibold text-gray-900">2.3 hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Resolution Rate</span>
                <span className="font-semibold text-green-600">89%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Customer Satisfaction</span>
                <span className="font-semibold text-blue-600">4.7/5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Agents</span>
                <span className="font-semibold text-gray-900">12/15</span>
              </div>
            </div>
          </div>
        </div>

        {showNewTicketForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Ticket</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option>Technical</option>
                    <option>Billing</option>
                    <option>Feature Request</option>
                    <option>Onboarding</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button 
                  onClick={() => setShowNewTicketForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setShowNewTicketForm(false)}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Create Ticket
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModernLayout>
  );
}
