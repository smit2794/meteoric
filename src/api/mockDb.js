// Client-side local mock database backed by localStorage
const DEFAULT_USERS = [
  { id: 1, name: 'Admin User', email: 'admin@demo.com', role: 'admin', department: 'Administration', status: 'active', avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=AdminUser' },
  { id: 2, name: 'IT Technician', email: 'ittech@demo.com', role: 'ittech', department: 'IT', status: 'active', avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ITTech' },
  { id: 3, name: 'Sales Representative', email: 'sales@demo.com', role: 'sales', department: 'Sales', status: 'active', avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=SalesRep' },
  { id: 4, name: 'QA Officer', email: 'qa@demo.com', role: 'qa', department: 'Quality Assurance', status: 'active', avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=QAOfficer' },
  { id: 5, name: 'General Manager', email: 'manager@demo.com', role: 'manager', department: 'Management', status: 'active', avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Manager' }
];

const DEFAULT_ASSETS = [
  { id: 1, asset_id: 'AST-2026-001', type: 'Laptop', brand: 'Apple', model: 'MacBook Pro 16', serial_no: 'C02F1234MD6M', assigned_to: 1, assigned_to_name: 'Admin User', location: 'HQ - 3rd Floor', status: 'Active', purchase_date: '2024-01-10', warranty_expiry: '2028-12-31', created_at: new Date().toISOString() },
  { id: 2, asset_id: 'AST-2026-002', type: 'Laptop', brand: 'Lenovo', model: 'ThinkPad T14', serial_no: 'PF3A9876', assigned_to: 3, assigned_to_name: 'Sales Representative', location: 'HQ - 2nd Floor', status: 'Active', purchase_date: '2024-01-10', warranty_expiry: '2027-05-15', created_at: new Date().toISOString() },
  { id: 3, asset_id: 'AST-2026-003', type: 'Laptop', brand: 'Dell', model: 'Latitude 5420', serial_no: 'DL87654', assigned_to: 2, assigned_to_name: 'IT Technician', location: 'HQ - 1st Floor', status: 'Active', purchase_date: '2024-01-10', warranty_expiry: '2026-11-20', created_at: new Date().toISOString() },
  { id: 4, asset_id: 'AST-2026-004', type: 'Laptop', brand: 'Apple', model: 'MacBook Air M2', serial_no: 'C02G9988BB', assigned_to: 4, assigned_to_name: 'QA Officer', location: 'Remote', status: 'Active', purchase_date: '2024-01-10', warranty_expiry: '2028-06-30', created_at: new Date().toISOString() },
  { id: 5, asset_id: 'AST-2026-005', type: 'Laptop', brand: 'Apple', model: 'MacBook Pro 14', serial_no: 'C02H1122AA', assigned_to: 5, assigned_to_name: 'General Manager', location: 'HQ - 3rd Floor', status: 'Active', purchase_date: '2024-01-10', warranty_expiry: '2028-09-01', created_at: new Date().toISOString() },
  { id: 6, asset_id: 'AST-2026-006', type: 'Desktop', brand: 'HP', model: 'EliteDesk 800', serial_no: 'USG123456', assigned_to: null, assigned_to_name: '', location: 'HQ - Reception', status: 'Active', purchase_date: '2024-01-10', warranty_expiry: '2026-03-10', created_at: new Date().toISOString() },
  { id: 7, asset_id: 'AST-2026-007', type: 'Server', brand: 'Dell', model: 'PowerEdge R750', serial_no: 'SV998877', assigned_to: 2, assigned_to_name: 'IT Technician', location: 'Server Room', status: 'Active', purchase_date: '2024-01-10', warranty_expiry: '2029-01-01', created_at: new Date().toISOString() },
  { id: 8, asset_id: 'AST-2026-008', type: 'Monitor', brand: 'LG', model: 'UltraFine 27', serial_no: 'LG270011', assigned_to: null, assigned_to_name: '', location: 'HQ - 3rd Floor', status: 'In Stock', purchase_date: '2024-01-10', warranty_expiry: '2027-04-18', created_at: new Date().toISOString() }
];

const DEFAULT_TICKETS = [
  { id: 1, ticket_id: 'TCK-1001', title: 'VPN connection fails on macOS', category: 'IT', priority: 'High', status: 'In Progress', description: 'User cannot connect to corporate VPN after macOS update.', assigned_to: 2, assigned_to_name: 'IT Technician', raised_by: 5, raised_by_name: 'General Manager', sla_deadline: new Date(Date.now() + 24*60*60*1000).toISOString(), created_at: new Date().toISOString() },
  { id: 2, ticket_id: 'TCK-1002', title: 'Office Chair broken on 2nd Floor', category: 'Admin', priority: 'Low', status: 'New', description: 'The hydraulic lift on desk chair 2B has failed.', assigned_to: null, assigned_to_name: '', raised_by: 3, raised_by_name: 'Sales Representative', sla_deadline: new Date(Date.now() + 72*60*60*1000).toISOString(), created_at: new Date().toISOString() },
  { id: 3, ticket_id: 'TCK-1003', title: 'QA server disk space warning 95%', category: 'IT', priority: 'Critical', status: 'New', description: 'Disk /dev/sda1 on QA-01 is full. Log rotation might be broken.', assigned_to: 2, assigned_to_name: 'IT Technician', raised_by: 4, raised_by_name: 'QA Officer', sla_deadline: new Date(Date.now() + 4*60*60*1000).toISOString(), created_at: new Date().toISOString() },
  { id: 4, ticket_id: 'TCK-1004', title: 'Need printer cartridge replacement', category: 'Admin', priority: 'Medium', status: 'Resolved', description: 'IT Hallway printer is showing Low Toner.', assigned_to: 2, assigned_to_name: 'IT Technician', raised_by: 1, raised_by_name: 'Admin User', sla_deadline: new Date(Date.now() + 48*60*60*1000).toISOString(), created_at: new Date().toISOString() }
];

const DEFAULT_COMMENTS = [
  { id: 1, ticket_id: 1, user_id: 2, user_name: 'IT Technician', user_role: 'ittech', user_avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ITTech', comment: 'I am looking into this now. Should be resolved shortly.', created_at: new Date().toISOString() }
];

const DEFAULT_REQUESTS = [
  { id: 1, request_id: 'REQ-5001', type: 'Hardware', requested_by: 3, requested_by_name: 'Sales Representative', status: 'Pending', approver_id: null, approver_name: '', notes: 'Need an external 24-inch monitor for desk.', created_at: new Date().toISOString() },
  { id: 2, request_id: 'REQ-5002', type: 'Software License', requested_by: 4, requested_by_name: 'QA Officer', status: 'Approved', approver_id: 5, approver_name: 'General Manager', notes: 'Requesting Adobe Acrobat Pro license for document signing.', created_at: new Date().toISOString() }
];

const DEFAULT_ACCESS = [
  { id: 1, user_id: 1, user_name: 'Admin User', system_app: 'AWS Cloud', access_level: 'Admin', granted_by: 1, granted_by_name: 'Admin User', granted_date: '2025-06-01', status: 'Active' },
  { id: 2, user_id: 2, user_name: 'IT Technician', system_app: 'AWS Cloud', access_level: 'Write', granted_by: 1, granted_by_name: 'Admin User', granted_date: '2025-06-01', status: 'Active' }
];

const DEFAULT_IT_DOCUMENTS = [
  { id: 1, title: 'Information Security Policy', version: '2.1', file_url: '/docs/dummy.pdf', category: 'Security Policy', uploaded_by: 1, uploaded_by_name: 'Admin User', last_updated: new Date().toISOString(), acknowledged: 0 },
  { id: 2, title: 'New Employee Laptop Setup Guide', version: '1.4', file_url: '/docs/dummy.pdf', category: 'IT SOP', uploaded_by: 1, uploaded_by_name: 'Admin User', last_updated: new Date().toISOString(), acknowledged: 0 }
];

const DEFAULT_LICENSES = [
  { id: 1, name: 'Office 365 Enterprise', vendor: 'Microsoft', expiry_date: '2026-08-10', owner_id: 2, owner_name: 'IT Technician', reminder_set: 1, days_remaining: 24, created_at: new Date().toISOString() },
  { id: 2, name: 'Adobe Creative Cloud', vendor: 'Adobe', expiry_date: '2026-08-01', owner_id: 1, owner_name: 'Admin User', reminder_set: 1, days_remaining: 15, created_at: new Date().toISOString() }
];

const DEFAULT_VENDORS = [
  { id: 1, name: 'Tech Solutions Inc', category: 'Hardware', contact_name: 'John Doe', contact_email: 'john@techsolutions.com', contract_end_date: '2027-06-30', total_spend: 45000, rating: 5, status: 'Active' },
  { id: 2, name: 'Software Hub Ltd', category: 'Software', contact_name: 'Sarah Connor', contact_email: 'sarah@softwarehub.io', contract_end_date: '2026-09-15', total_spend: 28000, rating: 4, status: 'Active' }
];

const DEFAULT_NON_IT = [
  { id: 1, name: 'A4 Printing Paper Reams', category: 'Stationery', quantity: 45, reorder_level: 15, cost_per_unit: 4.5 },
  { id: 2, name: 'Blue Gel Pens (Box of 50)', category: 'Stationery', quantity: 8, reorder_level: 10, cost_per_unit: 12.0 }
];

const DEFAULT_TRAVEL = [
  { id: 1, employee_id: 3, employee_name: 'Sales Representative', destination: 'Chicago Branch Office', from_date: '2026-08-10', to_date: '2026-08-14', purpose: 'Quarterly Sales Meet & Training', mode: 'Flight', estimated_cost: 750, status: 'Approved', approver_id: 5, approver_name: 'General Manager' }
];

const DEFAULT_COURIERS = [
  { id: 1, courier_id: 'COU-101', type: 'Inward', sender: 'Acme Chemical Corp', receiver: 'QA Lab', date: '2026-07-15', tracking_no: 'TRK99882211', status: 'Delivered', notes: 'Signed on arrival' }
];

const DEFAULT_REGISTER = [
  { id: 1, date: '2026-07-17', item_description: 'Confidential Audit Ledger Book', from_party: 'Internal Audit Team', to_party: 'QA Office', purpose: 'Review', received_by: 4, received_by_name: 'QA Officer', signature_url: '' }
];

const DEFAULT_LEADS = [
  { id: 1, name: 'Robert Downey', company: 'Stark Industries', source: 'Web', assigned_rep: 3, assigned_rep_name: 'Sales Representative', status: 'Proposal', last_contacted: '2026-07-16', email: 'tony@stark.com', phone: '555-0199', notes: 'Very interested in our quality standards.' },
  { id: 2, name: 'Bruce Wayne', company: 'Wayne Enterprises', source: 'Direct', assigned_rep: 3, assigned_rep_name: 'Sales Representative', status: 'Contacted', last_contacted: '2026-07-16', email: 'bruce@waynecorp.com', phone: '555-0199', notes: 'Interested in structural packaging.' }
];

const DEFAULT_INTERACTIONS = [
  { id: 1, lead_id: 1, user_id: 3, user_name: 'Sales Representative', type: 'Call', notes: 'Had a brief introductory call. Shared corporate brochure.', created_at: new Date().toISOString() }
];

const DEFAULT_QUOTATIONS = [
  { id: 1, quote_no: 'QTN-2026-001', lead_id: 1, customer_name: 'Robert Downey (Stark Industries)', status: 'Approved', amount: 125000, line_items_json: JSON.stringify([{ item: 'Industrial Chemical Formulation A', qty: 25, price: 5000 }]), created_by: 3, created_by_name: 'Sales Representative', created_at: new Date().toISOString() }
];

const DEFAULT_COA_REQS = [
  { id: 1, quotation_id: 1, product: 'Industrial Chemical Formulation A', requested_by: 3, requested_by_name: 'Sales Representative', status: 'Pending', created_at: new Date().toISOString() }
];

const DEFAULT_COAS = [
  { id: 1, coa_no: 'COA-2026-001', coa_request_id: null, quotation_id: 1, product: 'Industrial Chemical Formulation A', batch_no: 'BATCH-A-9988', test_params_json: JSON.stringify([{ parameter: 'Purity', specification: '>= 99.5%', result: '99.7%', status: 'Pass' }, { parameter: 'Moisture', specification: '<= 0.1%', result: '0.04%', status: 'Pass' }]), prepared_by: 4, prepared_by_name: 'QA Officer', reviewed_by: 5, reviewed_by_name: 'General Manager', status: 'Approved', created_at: new Date().toISOString() }
];

const DEFAULT_ORDERS = [
  { id: 1, order_no: 'ORD-9901', quotation_id: 1, quote_no: 'QTN-2026-001', coa_id: 1, coa_no: 'COA-2026-001', customer: 'Stark Industries', status: 'Confirmed', vendor_acknowledged: 0, created_at: new Date().toISOString() }
];

const DEFAULT_QMS_DOCS = [
  { id: 1, title: 'Quality Management Manual', category: 'Quality Policy', version: '4.0', owner_id: 4, owner_name: 'QA Officer', last_reviewed: '2026-01-15', next_review: '2027-01-15', acknowledged: 0 }
];

const DEFAULT_AUDITS = [
  { id: 1, audit_id: 'AUD-2026-01', type: 'Internal', department: 'Quality Assurance', scheduled_date: '2026-07-20', auditor_id: 4, auditor_name: 'QA Officer', status: 'Scheduled', checklist_json: JSON.stringify([{ item: 'Lab calibration records updated', status: 'NA', comment: '' }, { item: 'Staff training logs signed', status: 'NA', comment: '' }]) }
];

const DEFAULT_NCS = [
  { id: 1, nc_id: 'NC-2026-001', description: 'Expired reagent found in QA Lab shelf B', raised_by: 4, raised_by_name: 'QA Officer', department: 'Quality Assurance', root_cause: 'Lack of monthly storage inspection.', corrective_action: 'Destroy reagent, setup checklist.', status: 'Open', due_date: '2026-07-30', assigned_to: 4, assigned_to_name: 'QA Officer' }
];

const DEFAULT_NOTIFICATIONS = [
  { id: 1, user_id: 1, title: 'Pending Approval', message: 'New travel booking request for Chicago branch requires your approval.', type: 'info', read: 0, link: '/admin/travel', created_at: new Date().toISOString() }
];

const DEFAULT_ACTIVITIES = [
  { id: 1, user_id: 3, user_name: 'Sales Representative', module: 'crm', action: 'create', entity_type: 'lead', entity_id: '1', description: 'Created new lead Robert Downey (Stark Industries).', created_at: new Date().toISOString() }
];

const DEFAULT_ROLES = [
  { id: 1, role: 'admin', module: 'dashboard', can_view: 1, can_create: 1, can_edit: 1, can_delete: 1 },
  { id: 2, role: 'ittech', module: 'it', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 }
];

// Helper to load/save in localStorage
function getStore(key, fallback) {
  const data = localStorage.getItem(`meteoric_${key}`);
  if (!data) {
    localStorage.setItem(`meteoric_${key}`, JSON.stringify(fallback));
    return fallback;
  }
  return JSON.parse(data);
}

function saveStore(key, data) {
  localStorage.setItem(`meteoric_${key}`, JSON.stringify(data));
}

// Database wrapper simulating server-side CRUD and queries
export const db = {
  init() {
    getStore('users', DEFAULT_USERS);
    getStore('assets', DEFAULT_ASSETS);
    getStore('tickets', DEFAULT_TICKETS);
    getStore('comments', DEFAULT_COMMENTS);
    getStore('requests', DEFAULT_REQUESTS);
    getStore('access', DEFAULT_ACCESS);
    getStore('it_documents', DEFAULT_IT_DOCUMENTS);
    getStore('licenses', DEFAULT_LICENSES);
    getStore('vendors', DEFAULT_VENDORS);
    getStore('non_it', DEFAULT_NON_IT);
    getStore('travel', DEFAULT_TRAVEL);
    getStore('couriers', DEFAULT_COURIERS);
    getStore('register', DEFAULT_REGISTER);
    getStore('leads', DEFAULT_LEADS);
    getStore('interactions', DEFAULT_INTERACTIONS);
    getStore('quotations', DEFAULT_QUOTATIONS);
    getStore('coa_reqs', DEFAULT_COA_REQS);
    getStore('coas', DEFAULT_COAS);
    getStore('orders', DEFAULT_ORDERS);
    getStore('qms_docs', DEFAULT_QMS_DOCS);
    getStore('audits', DEFAULT_AUDITS);
    getStore('ncs', DEFAULT_NCS);
    getStore('notifications', DEFAULT_NOTIFICATIONS);
    getStore('activities', DEFAULT_ACTIVITIES);
    getStore('roles', DEFAULT_ROLES);
  },

  // Auth Operations
  getNotifications() {
    return getStore('notifications', DEFAULT_NOTIFICATIONS);
  },
  readNotification(id) {
    const list = this.getNotifications();
    const updated = list.map(n => String(n.id) === String(id) ? { ...n, read: 1 } : n);
    saveStore('notifications', updated);
    return { success: true };
  },
  readAllNotifications() {
    const list = this.getNotifications();
    const updated = list.map(n => ({ ...n, read: 1 }));
    saveStore('notifications', updated);
    return { success: true };
  },
  getActivities() {
    return getStore('activities', DEFAULT_ACTIVITIES);
  },
  logActivity(userId, moduleName, action, entityType, entityId, description) {
    const list = this.getActivities();
    const newAct = {
      id: Date.now(),
      user_id: userId,
      user_name: 'Admin User',
      module: moduleName,
      action,
      entity_type: entityType,
      entity_id: String(entityId),
      description,
      created_at: new Date().toISOString()
    };
    saveStore('activities', [newAct, ...list]);
  },
  sendNotification(userId, title, message, type = 'info', link = null) {
    const list = this.getNotifications();
    const newNotif = {
      id: Date.now(),
      user_id: userId,
      title,
      message,
      type,
      read: 0,
      link,
      created_at: new Date().toISOString()
    };
    saveStore('notifications', [newNotif, ...list]);
  },

  // Generic CRUD Helper
  getAll(table) {
    return getStore(table, []);
  },
  getById(table, id) {
    const list = this.getAll(table);
    return list.find(item => String(item.id) === String(id));
  },
  insert(table, data) {
    const list = this.getAll(table);
    const newRecord = {
      ...data,
      id: Date.now(),
      created_at: new Date().toISOString()
    };
    saveStore(table, [newRecord, ...list]);
    this.logActivity(1, table, 'create', table, newRecord.id, `Created new record in ${table}.`);
    return newRecord;
  },
  update(table, id, data) {
    const list = this.getAll(table);
    const updated = list.map(item => String(item.id) === String(id) ? { ...item, ...data } : item);
    saveStore(table, updated);
    this.logActivity(1, table, 'update', table, id, `Updated record ID ${id} in ${table}.`);
    return { success: true };
  },
  delete(table, id) {
    const list = this.getAll(table);
    const filtered = list.filter(item => String(item.id) !== String(id));
    saveStore(table, filtered);
    this.logActivity(1, table, 'delete', table, id, `Deleted record ID ${id} in ${table}.`);
    return { success: true };
  }
};

// Initialize mock DB instantly on import
db.init();
export default db;
