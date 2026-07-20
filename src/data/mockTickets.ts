export interface Ticket {
  id: number;
  ticket_id: string;
  title: string;
  category: 'IT' | 'Admin' | 'Sales' | 'QA';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'New' | 'In Progress' | 'Resolved' | 'Closed';
  description: string;
  assigned_to: number | null;
  assigned_to_name: string;
  raised_by: number;
  raised_by_name: string;
  sla_deadline: string;
  created_at: string;
  comments?: TicketComment[];
}

export interface TicketComment {
  id: number;
  ticket_id: number;
  user_name: string;
  comment: string;
  created_at: string;
}

export const initialTickets: Ticket[] = [
  {
    id: 1,
    ticket_id: 'TCK-IT-101',
    title: 'LIMS software not syncing batch data',
    category: 'IT',
    priority: 'High',
    status: 'In Progress',
    description: 'The LIMS terminal in R&D Center 1 is not pushing stability-study logs to the central database.',
    assigned_to: 2,
    assigned_to_name: 'IT Technician',
    raised_by: 4,
    raised_by_name: 'Dr. Dev Karve',
    sla_deadline: new Date(Date.now() + 12*60*60*1000).toISOString(),
    created_at: new Date(Date.now() - 4*60*60*1000).toISOString(),
    comments: [
      { id: 1, ticket_id: 1, user_name: 'IT Technician', comment: 'Checking network gateway settings for R&D Center 1.', created_at: new Date(Date.now() - 3*60*60*1000).toISOString() }
    ]
  },
  {
    id: 2,
    ticket_id: 'TCK-QA-102',
    title: 'COA request pending review for Batch Enz-339',
    category: 'QA',
    priority: 'Critical',
    status: 'New',
    description: 'We need batch analysis certificate approved before shipment loading for Brazil.',
    assigned_to: 4,
    assigned_to_name: 'Dr. Dev Karve',
    raised_by: 3,
    raised_by_name: 'Sales Representative',
    sla_deadline: new Date(Date.now() + 2*60*60*1000).toISOString(),
    created_at: new Date(Date.now() - 1*60*60*1000).toISOString()
  },
  {
    id: 3,
    ticket_id: 'TCK-ADM-103',
    title: 'Courier delayed to Vietnam office (Ho Chi Minh)',
    category: 'Admin',
    priority: 'Medium',
    status: 'In Progress',
    description: 'Important export license documents shipped from Ahmedabad on 12th July have not arrived.',
    assigned_to: 1,
    assigned_to_name: 'Admin User',
    raised_by: 5,
    raised_by_name: 'General Manager',
    sla_deadline: new Date(Date.now() + 36*60*60*1000).toISOString(),
    created_at: new Date(Date.now() - 24*60*60*1000).toISOString()
  },
  {
    id: 4,
    ticket_id: 'TCK-SLS-104',
    title: 'Distributor quote pending manager sign-off',
    category: 'Sales',
    priority: 'Low',
    status: 'New',
    description: 'Quotation request QTN-SLS-202 for Enzyme Blends has been sitting in draft for 3 days.',
    assigned_to: 5,
    assigned_to_name: 'General Manager',
    raised_by: 3,
    raised_by_name: 'Sales Representative',
    sla_deadline: new Date(Date.now() + 72*60*60*1000).toISOString(),
    created_at: new Date(Date.now() - 48*60*60*1000).toISOString()
  },
  {
    id: 5,
    ticket_id: 'TCK-IT-105',
    title: 'VPN access issue – Vietnam office',
    category: 'IT',
    priority: 'Medium',
    status: 'Resolved',
    description: 'Staff cannot connect to remote file servers using FortiClient.',
    assigned_to: 2,
    assigned_to_name: 'IT Technician',
    raised_by: 5,
    raised_by_name: 'General Manager',
    sla_deadline: new Date(Date.now() + 48*60*60*1000).toISOString(),
    created_at: new Date(Date.now() - 96*60*60*1000).toISOString()
  }
];
