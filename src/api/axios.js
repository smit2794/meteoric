import mockDb from './mockDb';

// Custom mock API layer that mimics Axios interface and routes to localStorage DB
const delay = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms));

const parseUrlParams = (url) => {
  const queryStr = url.split('?')[1] || '';
  const params = {};
  queryStr.split('&').forEach(pair => {
    const [k, v] = pair.split('=');
    if (k) params[k] = decodeURIComponent(v || '');
  });
  return params;
};

const api = {
  // GET requests
  async get(url) {
    await delay();
    const cleanUrl = url.split('?')[0];
    const params = parseUrlParams(url);

    // Auth & Dashboard
    if (cleanUrl === '/api/auth/me') {
      const users = mockDb.getAll('users');
      return { data: users[0] }; // Default Admin User
    }
    
    if (cleanUrl === '/api/auth/notifications') {
      return { data: mockDb.getNotifications() };
    }

    if (cleanUrl === '/api/auth/activity-log') {
      return { data: mockDb.getActivities() };
    }

    if (cleanUrl === '/api/auth/dashboard-stats') {
      const tickets = mockDb.getAll('tickets');
      const reqs = mockDb.getAll('requests');
      const travel = mockDb.getAll('travel');
      const leads = mockDb.getAll('leads');
      const audits = mockDb.getAll('audits');
      const licenses = mockDb.getAll('licenses');
      const vendors = mockDb.getAll('vendors');
      const quotations = mockDb.getAll('quotations');

      const openTickets = tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').length;
      const pendingApprovals = reqs.filter(r => r.status === 'Pending').length + travel.filter(t => t.status === 'Requested').length;
      const activeLeads = leads.filter(l => l.status !== 'Won' && l.status !== 'Lost').length;
      const upcomingAudits = audits.filter(a => a.status === 'Scheduled').length;
      const licensesDue = licenses.filter(l => {
        const diff = new Date(l.expiry_date) - new Date();
        return diff > 0 && Math.ceil(diff / (1000 * 60 * 60 * 24)) <= 30;
      }).length;
      const activeVendors = vendors.filter(v => v.status === 'Active').length;

      const ticketStats = {};
      tickets.forEach(t => { ticketStats[t.status] = (ticketStats[t.status] || 0) + 1; });
      const ticketPie = Object.entries(ticketStats).map(([name, value]) => ({ name, value }));

      const quoteStats = {};
      quotations.forEach(q => { quoteStats[q.status] = (quoteStats[q.status] || 0) + q.amount; });
      const pipelineBar = Object.entries(quoteStats).map(([stage, value]) => ({ stage, value }));

      // Simple mock tasks for Admin
      const myTasks = tickets.slice(0, 3).map(t => ({
        id: t.id,
        task_id: t.ticket_id,
        title: t.title,
        label: t.priority,
        type: 'Ticket',
        link: `/tickets/${t.id}`
      }));

      return {
        data: {
          cards: {
            openTickets,
            pendingApprovals,
            activeLeads,
            upcomingAudits,
            licensesDue,
            activeVendors
          },
          charts: {
            ticketPie,
            pipelineBar,
            monthlyTrend: [
              { month: 'Jan', travel: 1200, courier: 250 },
              { month: 'Feb', travel: 1500, courier: 300 },
              { month: 'Mar', travel: 1800, courier: 280 },
              { month: 'Apr', travel: 2400, courier: 350 },
              { month: 'May', travel: 2100, courier: 400 },
              { month: 'Jun', travel: 3100, courier: 380 },
              { month: 'Jul', travel: 2800, courier: 450 }
            ]
          },
          myTasks
        }
      };
    }

    // IT Module
    if (cleanUrl === '/api/it/assets') {
      return { data: mockDb.getAll('assets') };
    }
    if (cleanUrl === '/api/it/service-requests') {
      return { data: mockDb.getAll('requests') };
    }
    if (cleanUrl === '/api/it/access-control') {
      return { data: mockDb.getAll('access') };
    }
    if (cleanUrl === '/api/it/documents') {
      return { data: mockDb.getAll('it_documents') };
    }
    if (cleanUrl === '/api/it/licenses') {
      const licenses = mockDb.getAll('licenses').map(l => {
        const diff = new Date(l.expiry_date) - new Date();
        const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
        return { ...l, days_remaining: days };
      });
      return { data: licenses };
    }

    // Admin Module
    if (cleanUrl === '/api/admin/vendors') {
      return { data: mockDb.getAll('vendors') };
    }
    if (cleanUrl === '/api/admin/non-it-assets') {
      return { data: mockDb.getAll('non_it') };
    }
    if (cleanUrl === '/api/admin/travel') {
      return { data: mockDb.getAll('travel') };
    }
    if (cleanUrl === '/api/admin/couriers') {
      return { data: mockDb.getAll('couriers') };
    }
    if (cleanUrl === '/api/admin/register') {
      return { data: mockDb.getAll('register') };
    }

    // CRM Module
    if (cleanUrl === '/api/crm/leads') {
      return { data: mockDb.getAll('leads') };
    }
    if (cleanUrl.startsWith('/api/crm/leads/')) {
      const id = cleanUrl.split('/').pop();
      const lead = mockDb.getById('leads', id);
      if (lead) {
        const interactions = mockDb.getAll('interactions').filter(i => String(i.lead_id) === String(id));
        return { data: { ...lead, interactions } };
      }
    }
    if (cleanUrl === '/api/crm/quotations') {
      return { data: mockDb.getAll('quotations') };
    }

    // QA Module
    if (cleanUrl === '/api/qa/requests') {
      return { data: mockDb.getAll('coa_reqs') };
    }
    if (cleanUrl === '/api/qa/coas') {
      return { data: mockDb.getAll('coas') };
    }
    if (cleanUrl.startsWith('/api/qa/coas/')) {
      const id = cleanUrl.split('/').pop();
      return { data: mockDb.getById('coas', id) };
    }

    // Sales Fulfillment
    if (cleanUrl === '/api/sales/orders') {
      return { data: mockDb.getAll('orders') };
    }
    if (cleanUrl.startsWith('/api/sales/orders/')) {
      const id = cleanUrl.split('/').pop();
      const order = mockDb.getById('orders', id);
      if (order) {
        const quote = mockDb.getById('quotations', order.quotation_id);
        const coa = order.coa_id ? mockDb.getById('coas', order.coa_id) : null;
        return {
          data: {
            ...order,
            line_items_json: quote ? quote.line_items_json : '[]',
            test_params_json: coa ? coa.test_params_json : '[]'
          }
        };
      }
    }

    // QMS Module
    if (cleanUrl === '/api/qms/documents') {
      return { data: mockDb.getAll('qms_docs') };
    }
    if (cleanUrl === '/api/qms/audits') {
      return { data: mockDb.getAll('audits') };
    }
    if (cleanUrl.startsWith('/api/qms/audits/')) {
      const id = cleanUrl.split('/').pop();
      return { data: mockDb.getById('audits', id) };
    }
    if (cleanUrl === '/api/qms/ncs') {
      return { data: mockDb.getAll('ncs') };
    }

    // Settings
    if (cleanUrl === '/api/settings/users') {
      return { data: mockDb.getAll('users') };
    }
    if (cleanUrl === '/api/settings/permissions') {
      return { data: mockDb.getAll('roles') };
    }
    if (cleanUrl === '/api/settings/notifications') {
      return {
        data: {
          emailAlerts: { it_ticket: true, approval_request: true, low_stock: true, audit_scheduled: true, nc_raised: true },
          inAppAlerts: { it_ticket: true, approval_request: true, low_stock: true, audit_scheduled: true, nc_raised: true }
        }
      };
    }

    // Ticketing Engine
    if (cleanUrl === '/api/tickets') {
      const tickets = mockDb.getAll('tickets');
      if (params.category) {
        return { data: tickets.filter(t => t.category === params.category) };
      }
      return { data: tickets };
    }
    if (cleanUrl.startsWith('/api/tickets/')) {
      const id = cleanUrl.split('/').pop();
      const ticket = mockDb.getById('tickets', id);
      if (ticket) {
        const comments = mockDb.getAll('comments').filter(c => String(c.ticket_id) === String(id));
        return { data: { ...ticket, comments } };
      }
    }

    throw new Error(`404 Not Found: GET ${url}`);
  },

  // POST requests
  async post(url, data) {
    await delay();
    const cleanUrl = url.split('?')[0];

    if (cleanUrl === '/api/auth/login') {
      const user = mockDb.getAll('users')[0]; // Return default Admin
      return { data: { token: 'mock-jwt-token', user } };
    }

    if (cleanUrl === '/api/it/assets') {
      const record = mockDb.insert('assets', {
        ...data,
        assigned_to_name: data.assigned_to ? mockDb.getById('users', data.assigned_to)?.name : ''
      });
      return { data: record };
    }

    if (cleanUrl === '/api/it/service-requests') {
      const reqId = `REQ-${Date.now().toString().slice(-4)}`;
      const record = mockDb.insert('requests', {
        ...data,
        request_id: reqId,
        requested_by: 1, // Admin
        requested_by_name: 'Admin User',
        status: 'Pending'
      });
      mockDb.sendNotification(1, 'New IT Service Request', `A new service request (${reqId}) has been raised.`, 'info');
      return { data: record };
    }

    if (cleanUrl === '/api/it/access-control') {
      const userObj = mockDb.getById('users', data.user_id);
      const record = mockDb.insert('access', {
        ...data,
        user_name: userObj ? userObj.name : 'Unknown User',
        status: 'Active',
        granted_by: 1,
        granted_by_name: 'Admin User'
      });
      return { data: record };
    }

    if (cleanUrl === '/api/it/documents') {
      const record = mockDb.insert('it_documents', {
        ...data,
        last_updated: new Date().toISOString(),
        uploaded_by: 1,
        uploaded_by_name: 'Admin User',
        acknowledged: 0
      });
      return { data: record };
    }

    if (cleanUrl.startsWith('/api/it/documents/') && cleanUrl.endsWith('/acknowledge')) {
      const id = cleanUrl.split('/')[4];
      const list = mockDb.getAll('it_documents');
      const updated = list.map(d => String(d.id) === String(id) ? { ...d, acknowledged: 1 } : d);
      localStorage.setItem('meteoric_it_documents', JSON.stringify(updated));
      return { data: { success: true } };
    }

    if (cleanUrl === '/api/it/licenses') {
      const record = mockDb.insert('licenses', {
        ...data,
        owner_name: data.owner_id ? mockDb.getById('users', data.owner_id)?.name : 'Unassigned',
        reminder_set: 1
      });
      return { data: record };
    }

    if (cleanUrl === '/api/admin/vendors') {
      const record = mockDb.insert('vendors', { ...data, status: 'Active' });
      return { data: record };
    }

    if (cleanUrl === '/api/admin/non-it-assets') {
      const record = mockDb.insert('non_it', data);
      return { data: record };
    }

    if (cleanUrl === '/api/admin/travel') {
      const record = mockDb.insert('travel', {
        ...data,
        employee_id: 1,
        employee_name: 'Admin User',
        status: 'Requested'
      });
      mockDb.sendNotification(1, 'Travel Request Filed', `Your travel request to ${data.destination} has been sent.`, 'info');
      return { data: record };
    }

    if (cleanUrl === '/api/admin/couriers') {
      const courierId = `COU-${Date.now().toString().slice(-4)}`;
      const record = mockDb.insert('couriers', {
        ...data,
        courier_id: courierId,
        status: 'In Transit'
      });
      return { data: record };
    }

    if (cleanUrl === '/api/admin/register') {
      const userObj = mockDb.getById('users', data.received_by);
      const record = mockDb.insert('register', {
        ...data,
        received_by_name: userObj ? userObj.name : 'Unknown User'
      });
      return { data: record };
    }

    if (cleanUrl === '/api/crm/leads') {
      const repObj = mockDb.getById('users', data.assigned_rep);
      const record = mockDb.insert('leads', {
        ...data,
        assigned_rep_name: repObj ? repObj.name : 'Unassigned',
        last_contacted: new Date().toISOString().split('T')[0]
      });
      // insert log
      mockDb.insert('interactions', {
        lead_id: record.id,
        user_id: 1,
        user_name: 'Admin User',
        type: 'Note',
        notes: 'Lead profile created.'
      });
      return { data: record };
    }

    if (cleanUrl.startsWith('/api/crm/leads/') && cleanUrl.endsWith('/interactions')) {
      const id = cleanUrl.split('/')[4];
      const record = mockDb.insert('interactions', {
        ...data,
        lead_id: id,
        user_id: 1,
        user_name: 'Admin User'
      });
      return { data: record };
    }

    if (cleanUrl === '/api/crm/quotations') {
      const quoteNo = `QTN-${Date.now().toString().slice(-4)}`;
      const record = mockDb.insert('quotations', {
        ...data,
        quote_no: quoteNo,
        line_items_json: JSON.stringify(data.line_items),
        status: 'Draft',
        created_by: 1,
        created_by_name: 'Admin User'
      });
      return { data: record };
    }

    if (cleanUrl.startsWith('/api/crm/quotations/') && cleanUrl.endsWith('/request-coa')) {
      const id = cleanUrl.split('/')[4];
      const quote = mockDb.getById('quotations', id);
      const lineItems = JSON.parse(quote.line_items_json);
      const product = lineItems[0]?.item || 'Unknown Product';
      
      const reqRecord = mockDb.insert('coa_reqs', {
        quotation_id: id,
        quote_no: quote.quote_no,
        product,
        requested_by: 1,
        requested_by_name: 'Admin User',
        status: 'Pending'
      });

      mockDb.update('quotations', id, { status: 'COA Requested' });
      mockDb.sendNotification(4, 'COA Requested by Sales', `A new COA request has been raised for product "${product}".`, 'warning');
      return { data: { success: true, coa_request_id: reqRecord.id } };
    }

    if (cleanUrl === '/api/qa/coas') {
      const coaNo = `COA-${Date.now().toString().slice(-4)}`;
      const record = mockDb.insert('coas', {
        ...data,
        coa_no: coaNo,
        test_params_json: JSON.stringify(data.test_params),
        prepared_by: 1,
        prepared_by_name: 'Admin User',
        status: 'Draft'
      });
      if (data.coa_request_id) {
        mockDb.update('coa_reqs', data.coa_request_id, { status: 'In Progress' });
      }
      return { data: record };
    }

    if (cleanUrl.startsWith('/api/qa/coas/') && cleanUrl.endsWith('/approve')) {
      const id = cleanUrl.split('/')[4];
      const coa = mockDb.getById('coas', id);
      mockDb.update('coas', id, { status: 'Approved', reviewed_by: 1, reviewed_by_name: 'Admin User' });
      if (coa.coa_request_id) {
        mockDb.update('coa_reqs', coa.coa_request_id, { status: 'Completed' });
      }
      mockDb.update('quotations', coa.quotation_id, { status: 'COA Ready' });
      const quote = mockDb.getById('quotations', coa.quotation_id);
      if (quote) {
        mockDb.sendNotification(quote.created_by, 'COA Prepared and Attached', `QA has approved and attached COA ${coa.coa_no}.`, 'success');
      }
      return { data: { success: true } };
    }

    if (cleanUrl === '/api/sales/orders') {
      const orderNo = `ORD-${Date.now().toString().slice(-4)}`;
      const quote = mockDb.getById('quotations', data.quotation_id);
      const coa = mockDb.getById('coas', data.coa_id);

      const record = mockDb.insert('orders', {
        order_no: orderNo,
        quotation_id: data.quotation_id,
        quote_no: quote ? quote.quote_no : 'N/A',
        coa_id: data.coa_id,
        coa_no: coa ? coa.coa_no : 'N/A',
        customer: data.customer,
        status: 'Confirmed',
        vendor_acknowledged: 0
      });

      mockDb.update('quotations', data.quotation_id, { status: 'Approved' });
      return { data: record };
    }

    if (cleanUrl === '/api/qms/documents') {
      const userObj = mockDb.getById('users', data.owner_id);
      const record = mockDb.insert('qms_docs', {
        ...data,
        owner_name: userObj ? userObj.name : 'Unknown User',
        acknowledged: 0
      });
      return { data: record };
    }

    if (cleanUrl.startsWith('/api/qms/documents/') && cleanUrl.endsWith('/acknowledge')) {
      const id = cleanUrl.split('/')[4];
      const list = mockDb.getAll('qms_docs');
      const updated = list.map(d => String(d.id) === String(id) ? { ...d, acknowledged: 1 } : d);
      localStorage.setItem('meteoric_qms_docs', JSON.stringify(updated));
      return { data: { success: true } };
    }

    if (cleanUrl === '/api/qms/audits') {
      const auditId = `AUD-${Date.now().toString().slice(-4)}`;
      const userObj = mockDb.getById('users', data.auditor_id);
      const record = mockDb.insert('audits', {
        ...data,
        audit_id: auditId,
        status: 'Scheduled',
        auditor_name: userObj ? userObj.name : 'Unassigned',
        checklist_json: JSON.stringify([
          { item: 'All operational records updated and signed', status: 'NA', comment: '' },
          { item: 'SOP compliance checklist completed', status: 'NA', comment: '' },
          { item: 'Staff training logs verified', status: 'NA', comment: '' }
        ])
      });
      return { data: record };
    }

    if (cleanUrl === '/api/qms/ncs') {
      const ncId = `NC-${Date.now().toString().slice(-4)}`;
      const userObj = mockDb.getById('users', data.assigned_to);
      const record = mockDb.insert('ncs', {
        ...data,
        nc_id: ncId,
        raised_by: 1,
        raised_by_name: 'Admin User',
        status: 'Open',
        assigned_to_name: userObj ? userObj.name : 'Unassigned'
      });
      return { data: record };
    }

    if (cleanUrl === '/api/settings/users') {
      const record = mockDb.insert('users', {
        ...data,
        avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${data.name.replace(' ', '')}`,
        status: 'active'
      });
      return { data: record };
    }

    if (cleanUrl.startsWith('/api/tickets/') && cleanUrl.endsWith('/comments')) {
      const id = cleanUrl.split('/')[3];
      const record = mockDb.insert('comments', {
        ticket_id: parseInt(id),
        user_id: 1,
        user_name: 'Admin User',
        user_role: 'admin',
        user_avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=AdminUser',
        comment: data.comment
      });
      return { data: record };
    }

    if (cleanUrl === '/api/tickets') {
      const ticketId = `TCK-${Date.now().toString().slice(-4)}`;
      const record = mockDb.insert('tickets', {
        ...data,
        ticket_id: ticketId,
        status: 'New',
        raised_by: 1,
        raised_by_name: 'Admin User',
        sla_deadline: new Date(Date.now() + 48*60*60*1000).toISOString()
      });
      return { data: record };
    }

    throw new Error(`404 Not Found: POST ${url}`);
  },

  // PUT requests
  async put(url, data) {
    await delay();
    const cleanUrl = url.split('?')[0];

    if (cleanUrl.startsWith('/api/auth/notifications/') && cleanUrl.endsWith('/read')) {
      const id = cleanUrl.split('/')[4];
      return { data: mockDb.readNotification(id) };
    }

    if (cleanUrl === '/api/auth/notifications/read-all') {
      return { data: mockDb.readAllNotifications() };
    }

    if (cleanUrl.startsWith('/api/it/assets/')) {
      const id = cleanUrl.split('/').pop();
      const userObj = mockDb.getById('users', data.assigned_to);
      return { data: mockDb.update('assets', id, {
        ...data,
        assigned_to_name: userObj ? userObj.name : ''
      }) };
    }

    if (cleanUrl.startsWith('/api/it/service-requests/') && cleanUrl.endsWith('/status')) {
      const id = cleanUrl.split('/')[4];
      return { data: mockDb.update('requests', id, {
        status: data.status,
        approver_id: 1,
        approver_name: 'Admin User'
      }) };
    }

    if (cleanUrl.startsWith('/api/it/access-control/') && cleanUrl.endsWith('/revoke')) {
      const id = cleanUrl.split('/')[4];
      return { data: mockDb.update('access', id, { status: 'Revoked' }) };
    }

    if (cleanUrl.startsWith('/api/it/licenses/') && cleanUrl.endsWith('/renew')) {
      const id = cleanUrl.split('/')[4];
      return { data: mockDb.update('licenses', id, { expiry_date: data.expiry_date }) };
    }

    if (cleanUrl.startsWith('/api/it/licenses/') && cleanUrl.endsWith('/reminder')) {
      const id = cleanUrl.split('/')[4];
      return { data: mockDb.update('licenses', id, { reminder_set: data.reminder_set }) };
    }

    if (cleanUrl.startsWith('/api/admin/vendors/')) {
      const id = cleanUrl.split('/').pop();
      return { data: mockDb.update('vendors', id, data) };
    }

    if (cleanUrl.startsWith('/api/admin/non-it-assets/')) {
      const id = cleanUrl.split('/').pop();
      return { data: mockDb.update('non_it', id, data) };
    }

    if (cleanUrl.startsWith('/api/admin/travel/') && cleanUrl.endsWith('/status')) {
      const id = cleanUrl.split('/')[4];
      return { data: mockDb.update('travel', id, { status: data.status, approver_id: 1, approver_name: 'Admin User' }) };
    }

    if (cleanUrl.startsWith('/api/admin/travel/') && cleanUrl.endsWith('/book')) {
      const id = cleanUrl.split('/')[4];
      return { data: mockDb.update('travel', id, { status: 'Booked' }) };
    }

    if (cleanUrl.startsWith('/api/admin/couriers/') && cleanUrl.endsWith('/delivered')) {
      const id = cleanUrl.split('/')[4];
      return { data: mockDb.update('couriers', id, { status: 'Delivered' }) };
    }

    if (cleanUrl.startsWith('/api/crm/leads/')) {
      const id = cleanUrl.split('/').pop();
      const repObj = mockDb.getById('users', data.assigned_rep);
      return { data: mockDb.update('leads', id, {
        ...data,
        assigned_rep_name: repObj ? repObj.name : 'Unassigned'
      }) };
    }

    if (cleanUrl.startsWith('/api/crm/quotations/')) {
      const id = cleanUrl.split('/').pop();
      return { data: mockDb.update('quotations', id, data) };
    }

    if (cleanUrl.startsWith('/api/qa/coas/')) {
      const id = cleanUrl.split('/').pop();
      return { data: mockDb.update('coas', id, {
        batch_no: data.batch_no,
        status: data.status,
        test_params_json: JSON.stringify(data.test_params)
      }) };
    }

    if (cleanUrl.startsWith('/api/sales/orders/') && cleanUrl.endsWith('/status')) {
      const id = cleanUrl.split('/')[4];
      return { data: mockDb.update('orders', id, { status: data.status }) };
    }

    if (cleanUrl.startsWith('/api/sales/orders/') && cleanUrl.endsWith('/send-to-vendor')) {
      const id = cleanUrl.split('/')[4];
      return { data: mockDb.update('orders', id, { status: 'Sent to Vendor' }) };
    }

    if (cleanUrl.startsWith('/api/sales/orders/') && cleanUrl.endsWith('/acknowledge-vendor')) {
      const id = cleanUrl.split('/')[4];
      return { data: mockDb.update('orders', id, { vendor_acknowledged: 1, status: 'In Production' }) };
    }

    if (cleanUrl.startsWith('/api/qms/audits/') && cleanUrl.endsWith('/checklist')) {
      const id = cleanUrl.split('/')[4];
      return { data: mockDb.update('audits', id, {
        checklist_json: JSON.stringify(data.checklist),
        status: data.status || 'In Progress'
      }) };
    }

    if (cleanUrl.startsWith('/api/qms/audits/') && cleanUrl.endsWith('/status')) {
      const id = cleanUrl.split('/')[4];
      return { data: mockDb.update('audits', id, { status: data.status }) };
    }

    if (cleanUrl.startsWith('/api/qms/ncs/') && cleanUrl.endsWith('/capa')) {
      const id = cleanUrl.split('/')[4];
      const userObj = mockDb.getById('users', data.assigned_to);
      return { data: mockDb.update('ncs', id, {
        ...data,
        assigned_to_name: userObj ? userObj.name : 'Unassigned'
      }) };
    }

    if (cleanUrl.startsWith('/api/qms/ncs/') && cleanUrl.endsWith('/close')) {
      const id = cleanUrl.split('/')[4];
      return { data: mockDb.update('ncs', id, { status: 'Closed' }) };
    }

    if (cleanUrl.startsWith('/api/settings/users/') && cleanUrl.endsWith('/status')) {
      const id = cleanUrl.split('/')[4];
      return { data: mockDb.update('users', id, { status: data.status }) };
    }

    if (cleanUrl.startsWith('/api/settings/users/')) {
      const id = cleanUrl.split('/').pop();
      return { data: mockDb.update('users', id, data) };
    }

    if (cleanUrl === '/api/settings/permissions') {
      saveStore('roles', data.matrix);
      return { data: { success: true } };
    }

    if (cleanUrl === '/api/settings/notifications') {
      return { data: { success: true } };
    }

    if (cleanUrl.startsWith('/api/tickets/') && cleanUrl.endsWith('/status')) {
      const id = cleanUrl.split('/')[3];
      return { data: mockDb.update('tickets', id, { status: data.status }) };
    }

    if (cleanUrl.startsWith('/api/tickets/') && cleanUrl.endsWith('/assign')) {
      const id = cleanUrl.split('/')[3];
      const userObj = mockDb.getById('users', data.assigned_to);
      return { data: mockDb.update('tickets', id, {
        assigned_to: data.assigned_to,
        assigned_to_name: userObj ? userObj.name : 'Unassigned',
        status: 'In Progress'
      }) };
    }

    throw new Error(`404 Not Found: PUT ${url}`);
  },

  // DELETE requests
  async delete(url) {
    await delay();
    const cleanUrl = url.split('?')[0];

    if (cleanUrl.startsWith('/api/it/assets/')) {
      const id = cleanUrl.split('/').pop();
      return { data: mockDb.update('assets', id, { status: 'Retired' }) };
    }

    if (cleanUrl.startsWith('/api/admin/vendors/')) {
      const id = cleanUrl.split('/').pop();
      return { data: mockDb.update('vendors', id, { status: 'Inactive' }) };
    }

    throw new Error(`404 Not Found: DELETE ${url}`);
  }
};

export default api;
