import React, { createContext, useState, useContext, useEffect } from 'react';
import { initialAssets, ITAsset } from '../data/mockAssets';
import { initialTickets, Ticket, TicketComment } from '../data/mockTickets';
import { 
  initialVendors, Vendor, 
  initialNonITAssets, NonITAsset, 
  initialTravelBookings, TravelBooking, 
  initialCouriers, CourierEntry, 
  initialRegister, RegisterEntry 
} from '../data/mockVendors';
import { 
  initialLeads, Lead, LeadInteraction,
  initialQuotations, Quotation, 
  initialCustomers, Customer 
} from '../data/mockLeads';
import { initialCoaRequests, CoaRequest, initialCoas, CoaCertificate, CoaTestParam } from '../data/mockCoas';
import { initialOrders, FulfillmentOrder } from '../data/mockOrders';
import { initialQMSDocuments, QMSDocument, initialAudits, ComplianceAudit, initialNCs, NonConformance, AuditChecklistItem } from '../data/mockQms';

export interface ActivityLog {
  id: number;
  user_name: string;
  module: string;
  action: string;
  description: string;
  created_at: string;
}

export interface DemoNotification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  link: string;
  created_at: string;
}

interface AppDataContextType {
  // States
  assets: ITAsset[];
  tickets: Ticket[];
  vendors: Vendor[];
  nonItAssets: NonITAsset[];
  travelBookings: TravelBooking[];
  couriers: CourierEntry[];
  register: RegisterEntry[];
  leads: Lead[];
  quotations: Quotation[];
  customers: Customer[];
  coaRequests: CoaRequest[];
  coas: CoaCertificate[];
  orders: FulfillmentOrder[];
  qmsDocuments: QMSDocument[];
  audits: ComplianceAudit[];
  ncs: NonConformance[];
  activityLogs: ActivityLog[];
  notifications: DemoNotification[];
  demoRole: 'Super Admin' | 'IT Department' | 'Admin Department' | 'Sales Team' | 'QA Team' | 'QMS Team';

  // Actions
  setDemoRole: (role: 'Super Admin' | 'IT Department' | 'Admin Department' | 'Sales Team' | 'QA Team' | 'QMS Team') => void;
  addAsset: (asset: Omit<ITAsset, 'id' | 'asset_id'>) => void;
  updateAsset: (id: number, data: Partial<ITAsset>) => void;
  deleteAsset: (id: number) => void;
  addTicket: (ticket: Omit<Ticket, 'id' | 'ticket_id' | 'created_at' | 'status' | 'sla_deadline'>) => void;
  updateTicketStatus: (id: number, status: Ticket['status']) => void;
  assignTicket: (id: number, techId: number, techName: string) => void;
  addTicketComment: (ticketId: number, commentText: string) => void;
  addVendor: (vendor: Omit<Vendor, 'id' | 'total_spend' | 'status'>) => void;
  updateVendor: (id: number, data: Partial<Vendor>) => void;
  addNonITAsset: (item: Omit<NonITAsset, 'id'>) => void;
  updateNonITAssetStock: (id: number, quantity: number, type: 'in' | 'out') => void;
  addTravelBooking: (booking: Omit<TravelBooking, 'id' | 'status'>) => void;
  approveTravelBooking: (id: number, status: 'Approved' | 'Rejected') => void;
  markTravelBooked: (id: number) => void;
  addCourier: (courier: Omit<CourierEntry, 'id' | 'courier_id' | 'status'>) => void;
  markCourierDelivered: (id: number) => void;
  addRegisterEntry: (entry: Omit<RegisterEntry, 'id' | 'date'>) => void;
  updateRegisterEntry: (id: number, data: Partial<RegisterEntry>) => void;
  addLead: (lead: Omit<Lead, 'id' | 'last_contacted'>) => void;
  updateLead: (id: number, data: Partial<Lead>) => void;
  addLeadInteraction: (leadId: number, type: LeadInteraction['type'], notes: string) => void;
  addQuotation: (quote: Omit<Quotation, 'id' | 'quote_no' | 'created_at' | 'status' | 'hasCOA'>) => void;
  updateQuotationStatus: (id: number, status: Quotation['status']) => void;
  requestCoaFromQA: (id: number) => void;
  approveCoa: (id: number) => void;
  addCoa: (coa: Omit<CoaCertificate, 'id' | 'coa_no' | 'created_at' | 'status'>) => void;
  updateCoa: (id: number, data: Partial<CoaCertificate>) => void;
  addOrder: (order: Omit<FulfillmentOrder, 'id' | 'order_no' | 'status' | 'vendor_acknowledged' | 'created_at'>) => void;
  sendOrderToProduction: (id: number) => void;
  acknowledgeOrderVendor: (id: number) => void;
  updateOrderStatus: (id: number, status: FulfillmentOrder['status']) => void;
  addQmsDocument: (doc: Omit<QMSDocument, 'id' | 'acknowledged'>) => void;
  acknowledgeQmsDoc: (id: number) => void;
  addAudit: (audit: Omit<ComplianceAudit, 'id' | 'audit_id' | 'status' | 'checklist'>) => void;
  updateAuditChecklist: (id: number, checklist: AuditChecklistItem[], status?: ComplianceAudit['status']) => void;
  addNC: (nc: Omit<NonConformance, 'id' | 'nc_id' | 'status'>) => void;
  updateNC: (id: number, data: Partial<NonConformance>) => void;
  closeNC: (id: number) => void;
  addNotification: (title: string, message: string, link: string) => void;
  markNotificationRead: (id: number) => void;
  markAllNotificationsRead: () => void;
}

const AppDataContext = createContext<AppDataContextType | null>(null);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [demoRole, setDemoRole] = useState<'Super Admin' | 'IT Department' | 'Admin Department' | 'Sales Team' | 'QA Team' | 'QMS Team'>('Super Admin');
  const [assets, setAssets] = useState<ITAsset[]>(initialAssets);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [nonItAssets, setNonItAssets] = useState<NonITAsset[]>(initialNonITAssets);
  const [travelBookings, setTravelBookings] = useState<TravelBooking[]>(initialTravelBookings);
  const [couriers, setCouriers] = useState<CourierEntry[]>(initialCouriers);
  const [register, setRegister] = useState<RegisterEntry[]>(initialRegister);
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [quotations, setQuotations] = useState<Quotation[]>(initialQuotations);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [coaRequests, setCoaRequests] = useState<CoaRequest[]>(initialCoaRequests);
  const [coas, setCoas] = useState<CoaCertificate[]>(initialCoas);
  const [orders, setOrders] = useState<FulfillmentOrder[]>(initialOrders);
  const [qmsDocuments, setQmsDocuments] = useState<QMSDocument[]>(initialQMSDocuments);
  const [audits, setAudits] = useState<ComplianceAudit[]>(initialAudits);
  const [ncs, setNcs] = useState<NonConformance[]>(initialNCs);
  
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    { id: 1, user_name: 'Admin User', module: 'System', action: 'init', description: 'System pre-seeded with Meteoric Biopharmaceuticals mock data.', created_at: new Date().toISOString() }
  ]);
  
  const [notifications, setNotifications] = useState<DemoNotification[]>([
    { id: 1, title: 'Pending Travel Request', message: 'Travel booking requested for Dr. Dev Karve (Ahmedabad HQ to USA).', read: false, link: '/admin/travel', created_at: new Date().toISOString() }
  ]);

  const logActivity = (module: string, action: string, description: string) => {
    setActivityLogs(prev => [
      { id: Date.now(), user_name: `${demoRole} User`, module, action, description, created_at: new Date().toISOString() },
      ...prev
    ]);
  };

  const addNotification = (title: string, message: string, link: string) => {
    setNotifications(prev => [
      { id: Date.now(), title, message, read: false, link, created_at: new Date().toISOString() },
      ...prev
    ]);
  };

  const markNotificationRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Asset Actions
  const addAsset = (asset: Omit<ITAsset, 'id' | 'asset_id'>) => {
    const assetId = `AST-${asset.type.replace(/\s+/g, '-').toUpperCase()}-${Date.now().toString().slice(-4)}`;
    setAssets(prev => [
      { ...asset, id: Date.now(), asset_id: assetId } as ITAsset,
      ...prev
    ]);
    logActivity('IT Asset', 'create', `Created asset ${assetId} (${asset.model})`);
  };

  const updateAsset = (id: number, data: Partial<ITAsset>) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
    logActivity('IT Asset', 'update', `Updated asset ID ${id}`);
  };

  const deleteAsset = (id: number) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    logActivity('IT Asset', 'delete', `Deleted asset ID ${id}`);
  };

  // Ticket Actions
  const addTicket = (ticket: Omit<Ticket, 'id' | 'ticket_id' | 'created_at' | 'status' | 'sla_deadline'>) => {
    const ticketId = `TCK-${ticket.category.toUpperCase()}-${Date.now().toString().slice(-3)}`;
    const newTkt: Ticket = {
      ...ticket,
      id: Date.now(),
      ticket_id: ticketId,
      status: 'New',
      sla_deadline: new Date(Date.now() + 48*60*60*1000).toISOString(),
      created_at: new Date().toISOString(),
      comments: []
    };
    setTickets(prev => [newTkt, ...prev]);
    logActivity('Helpdesk', 'create', `Raised ticket ${ticketId}: ${ticket.title}`);
    addNotification('New Ticket Raised', `A new ${ticket.category} ticket (${ticketId}) was raised by ${ticket.raised_by_name}.`, `/tickets/${newTkt.id}`);
  };

  const updateTicketStatus = (id: number, status: Ticket['status']) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    logActivity('Helpdesk', 'update_status', `Updated ticket ID ${id} to ${status}`);
  };

  const assignTicket = (id: number, techId: number, techName: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, assigned_to: techId, assigned_to_name: techName, status: 'In Progress' } : t));
    logActivity('Helpdesk', 'assign', `Assigned ticket ID ${id} to ${techName}`);
  };

  const addTicketComment = (ticketId: number, commentText: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const comments = t.comments || [];
        return {
          ...t,
          comments: [
            ...comments,
            { id: Date.now(), ticket_id: ticketId, user_name: `${demoRole} User`, comment: commentText, created_at: new Date().toISOString() }
          ]
        };
      }
      return t;
    }));
  };

  // Vendor Actions
  const addVendor = (vendor: Omit<Vendor, 'id' | 'total_spend' | 'status'>) => {
    setVendors(prev => [
      { ...vendor, id: Date.now(), total_spend: 0, status: 'Active' } as Vendor,
      ...prev
    ]);
    logActivity('Procurement', 'create', `Registered vendor ${vendor.name}`);
  };

  const updateVendor = (id: number, data: Partial<Vendor>) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, ...data } : v));
    logActivity('Procurement', 'update', `Updated vendor ID ${id}`);
  };

  // Non-IT Inventory Actions
  const addNonITAsset = (item: Omit<NonITAsset, 'id'>) => {
    setNonItAssets(prev => [{ ...item, id: Date.now() }, ...prev]);
    logActivity('Admin Stock', 'create', `Added non-IT item ${item.name}`);
  };

  const updateNonITAssetStock = (id: number, quantity: number, type: 'in' | 'out') => {
    setNonItAssets(prev => prev.map(item => {
      if (item.id === id) {
        const qty = type === 'in' ? item.quantity + quantity : Math.max(0, item.quantity - quantity);
        return { ...item, quantity: qty };
      }
      return item;
    }));
    logActivity('Admin Stock', 'update_stock', `${type === 'in' ? 'Stoked In' : 'Stocked Out'} item ID ${id}`);
  };

  // Travel Actions
  const addTravelBooking = (booking: Omit<TravelBooking, 'id' | 'status'>) => {
    setTravelBookings(prev => [
      { ...booking, id: Date.now(), status: 'Requested' },
      ...prev
    ]);
    logActivity('Admin Travel', 'create', `Travel request filed by ${booking.employee}`);
    addNotification('Travel Booking Requested', `A travel request to ${booking.from_to} has been submitted.`, '/admin/travel');
  };

  const approveTravelBooking = (id: number, status: 'Approved' | 'Rejected') => {
    setTravelBookings(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    logActivity('Admin Travel', 'approve', `Travel booking ID ${id} marked ${status}`);
  };

  const markTravelBooked = (id: number) => {
    setTravelBookings(prev => prev.map(t => t.id === id ? { ...t, status: 'Booked' } : t));
    logActivity('Admin Travel', 'booked', `Travel booking ID ${id} marked Booked`);
  };

  // Courier Actions
  const addCourier = (courier: Omit<CourierEntry, 'id' | 'courier_id' | 'status'>) => {
    const courierId = `COU-${courier.type.toUpperCase()}-${Date.now().toString().slice(-4)}`;
    setCouriers(prev => [
      { ...courier, id: Date.now(), courier_id: courierId, status: 'In Transit' },
      ...prev
    ]);
    logActivity('Admin Logistics', 'create', `Courier registered: ${courierId}`);
  };

  const markCourierDelivered = (id: number) => {
    setCouriers(prev => prev.map(c => c.id === id ? { ...c, status: 'Delivered', proof_of_delivery: `Delivered & verified by ${demoRole} User` } : c));
    logActivity('Admin Logistics', 'deliver', `Courier ID ${id} marked Delivered`);
  };

  // Register Actions
  const addRegisterEntry = (entry: Omit<RegisterEntry, 'id' | 'date'>) => {
    setRegister(prev => [
      { ...entry, id: Date.now(), date: new Date().toISOString().split('T')[0] },
      ...prev
    ]);
    logActivity('Inward/Outward Log', 'create', `Registered ${entry.type} entry for ${entry.description}`);
  };

  const updateRegisterEntry = (id: number, data: Partial<RegisterEntry>) => {
    setRegister(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
    logActivity('Inward/Outward Log', 'update', `Updated register entry ID ${id}`);
  };

  // Leads & CRM Actions
  const addLead = (lead: Omit<Lead, 'id' | 'last_contacted'>) => {
    const newLead: Lead = {
      ...lead,
      id: Date.now(),
      last_contacted: new Date().toISOString().split('T')[0],
      interactions: [
        { id: Date.now(), lead_id: Date.now(), user_name: `${demoRole} User`, type: 'Note', notes: 'Lead file opened.', created_at: new Date().toISOString() }
      ]
    };
    setLeads(prev => [newLead, ...prev]);
    logActivity('Sales CRM', 'create', `Created lead ${lead.name} (${lead.company})`);
  };

  const updateLead = (id: number, data: Partial<Lead>) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
  };

  const addLeadInteraction = (leadId: number, type: LeadInteraction['type'], notes: string) => {
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        const list = l.interactions || [];
        return {
          ...l,
          last_contacted: new Date().toISOString().split('T')[0],
          interactions: [
            { id: Date.now(), lead_id: leadId, user_name: `${demoRole} User`, type, notes, created_at: new Date().toISOString() },
            ...list
          ]
        };
      }
      return l;
    }));
    logActivity('Sales CRM', 'log_interaction', `Logged contact for lead ID ${leadId}`);
  };

  // Quotation Actions
  const addQuotation = (quote: Omit<Quotation, 'id' | 'quote_no' | 'created_at' | 'status' | 'hasCOA'>) => {
    const quoteNo = `QTN-${quote.product_category.replace(/[^A-Za-z]/g, '').slice(0,3).toUpperCase()}-${Date.now().toString().slice(-3)}`;
    const newQuote: Quotation = {
      ...quote,
      id: Date.now(),
      quote_no: quoteNo,
      status: 'Draft',
      hasCOA: false,
      created_at: new Date().toISOString()
    };
    setQuotations(prev => [newQuote, ...prev]);
    logActivity('Sales CRM', 'create_quote', `Created proposal ${quoteNo}`);
  };

  const updateQuotationStatus = (id: number, status: Quotation['status']) => {
    setQuotations(prev => prev.map(q => q.id === id ? { ...q, status } : q));
    logActivity('Sales CRM', 'quote_status', `Updated quote ID ${id} to ${status}`);
    
    // Cross-module trigger: Won Quote -> Pushes Order to Fulfillment
    if (status === 'Approved') {
      const quote = quotations.find(q => q.id === id);
      if (quote) {
        const orderNo = `ORD-EX-${Date.now().toString().slice(-4)}`;
        setOrders(prev => [
          {
            id: Date.now(),
            order_no: orderNo,
            quotation_id: id,
            quote_no: quote.quote_no,
            coa_id: quote.hasCOA ? 1 : null, // link mock COA if already has COA
            coa_no: quote.hasCOA ? 'COA-2026-9912' : 'Pending',
            customer: quote.customer_name,
            status: 'Confirmed',
            vendor_acknowledged: false,
            created_at: new Date().toISOString()
          },
          ...prev
        ]);
        logActivity('Sales Fulfillment', 'create', `Created fulfillment order ${orderNo} from won quotation ${quote.quote_no}`);
        addNotification('New Export Order confirmed', `Order ${orderNo} confirmed for ${quote.customer_name}. Pushed to production line.`, '/sales/orders');
      }
    }
  };

  // Cross-module CRM -> QA Request COA
  const requestCoaFromQA = (id: number) => {
    const quote = quotations.find(q => q.id === id);
    if (!quote) return;

    // Pushes request into QA coaRequests list
    const newReq: CoaRequest = {
      id: Date.now(),
      quotation_id: id,
      quote_no: quote.quote_no,
      product: quote.line_items[0]?.item || 'Biopharma Blend',
      requested_by: `${demoRole} Representative`,
      status: 'Pending',
      created_at: new Date().toISOString()
    };

    setCoaRequests(prev => [newReq, ...prev]);
    setQuotations(prev => prev.map(q => q.id === id ? { ...q, status: 'COA Requested' } : q));
    logActivity('QA Lab', 'coa_request', `Dispatched analytical COA request for quotation ${quote.quote_no}`);
    addNotification('COA Request received', `QA Analysis requested for quote ${quote.quote_no}.`, '/qa/requests');
  };

  // QA Lab COA Builder Actions
  const addCoa = (coa: Omit<CoaCertificate, 'id' | 'coa_no' | 'created_at' | 'status'>) => {
    const coaNo = `COA-${Date.now().toString().slice(-4)}`;
    const newCoa: CoaCertificate = {
      ...coa,
      id: Date.now(),
      coa_no: coaNo,
      status: 'Draft',
      created_at: new Date().toISOString()
    };
    setCoas(prev => [newCoa, ...prev]);
    if (coa.coa_request_id) {
      setCoaRequests(prev => prev.map(r => r.id === coa.coa_request_id ? { ...r, status: 'In Progress' } : r));
    }
    logActivity('QA Lab', 'create_coa', `Prepared COA Draft ${coaNo}`);
  };

  const updateCoa = (id: number, data: Partial<CoaCertificate>) => {
    setCoas(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  // Cross-module QA -> CRM COA approval
  const approveCoa = (id: number) => {
    const coa = coas.find(c => c.id === id);
    if (!coa) return;

    setCoas(prev => prev.map(c => c.id === id ? { ...c, status: 'Approved' } : c));
    
    if (coa.coa_request_id) {
      setCoaRequests(prev => prev.map(r => r.id === coa.coa_request_id ? { ...r, status: 'Completed' } : r));
    }

    // Update quotation status in CRM
    setQuotations(prev => prev.map(q => q.id === coa.quotation_id ? { ...q, status: 'COA Ready', hasCOA: true } : q));
    
    // Update order COA ref if order already created
    setOrders(prev => prev.map(o => o.quotation_id === coa.quotation_id ? { ...o, coa_id: id, coa_no: coa.coa_no } : o));

    logActivity('QA Lab', 'approve_coa', `Approved & Signed COA ${coa.coa_no}`);
    addNotification('COA Approved & Transmitted', `COA ${coa.coa_no} has been attached to quotation ${coa.quote_no}.`, '/crm/quotations');
  };

  // Fulfillment Orders Actions
  const addOrder = (order: Omit<FulfillmentOrder, 'id' | 'order_no' | 'status' | 'vendor_acknowledged' | 'created_at'>) => {
    const orderNo = `ORD-EX-${Date.now().toString().slice(-4)}`;
    setOrders(prev => [
      {
        ...order,
        id: Date.now(),
        order_no: orderNo,
        status: 'Confirmed',
        vendor_acknowledged: false,
        created_at: new Date().toISOString()
      },
      ...prev
    ]);
  };

  // Cross-module Fulfillment -> Admin Vendor Cost Log
  const sendOrderToProduction = (id: number) => {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Sent to Vendor' } : o));
    
    // Pushes cost entry into Admin Vendors spend logs
    const quote = quotations.find(q => q.id === order.quotation_id);
    if (quote) {
      const estimatedCost = Math.round(quote.amount * 0.45); // simulated 45% production cost
      setVendors(prev => prev.map(v => v.id === 1 ? { ...v, total_spend: v.total_spend + estimatedCost } : v));
      logActivity('Procurement Spend', 'update_cost', `Logged raw material production cost of $${estimatedCost} to Apex Enzymes`);
    }

    logActivity('Sales Fulfillment', 'send_to_production', `Dispatched Order ${order.order_no} to contract manufacturer`);
    addNotification('Production order dispatched', `Manufacturing pipeline initiated for order ${order.order_no}.`, `/sales/orders/${id}`);
  };

  const acknowledgeOrderVendor = (id: number) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, vendor_acknowledged: true, status: 'In Production' } : o));
    logActivity('Sales Fulfillment', 'acknowledge_vendor', `Contract vendor acknowledged receipt of Order ID ${id}`);
  };

  const updateOrderStatus = (id: number, status: FulfillmentOrder['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    logActivity('Sales Fulfillment', 'update_order_status', `Updated order ID ${id} to ${status}`);
  };

  // QMS Actions
  const addQmsDocument = (doc: Omit<QMSDocument, 'id' | 'acknowledged'>) => {
    setQmsDocuments(prev => [
      { ...doc, id: Date.now(), acknowledged: false } as QMSDocument,
      ...prev
    ]);
    logActivity('QMS SOP Control', 'create', `Published SOP document: ${doc.title}`);
  };

  const acknowledgeQmsDoc = (id: number) => {
    setQmsDocuments(prev => prev.map(d => d.id === id ? { ...d, acknowledged: true } : d));
    logActivity('QMS SOP Control', 'acknowledge', `User acknowledged reading SOP ID ${id}`);
  };

  const addAudit = (audit: Omit<ComplianceAudit, 'id' | 'audit_id' | 'status' | 'checklist'>) => {
    const auditId = `AUD-${audit.department.split(/\s+/).map(w => w[0]).join('').toUpperCase()}-${Date.now().toString().slice(-3)}`;
    setAudits(prev => [
      {
        ...audit,
        id: Date.now(),
        audit_id: auditId,
        status: 'Scheduled',
        checklist: [
          { item: 'Staff training certificates updated', status: 'NA', comment: '' },
          { item: 'Facility sanitation logs logged', status: 'NA', comment: '' },
          { item: 'Batch record trace IDs verified', status: 'NA', comment: '' }
        ]
      },
      ...prev
    ]);
    logActivity('QMS Auditing', 'schedule', `Scheduled ${audit.type} Audit (${auditId}) for ${audit.department}`);
  };

  const updateAuditChecklist = (id: number, checklist: AuditChecklistItem[], status?: ComplianceAudit['status']) => {
    setAudits(prev => prev.map(a => a.id === id ? { ...a, checklist, status: status || a.status } : a));
    logActivity('QMS Auditing', 'update_checklist', `Logged checklist execution observations for audit ID ${id}`);
  };

  const addNC = (nc: Omit<NonConformance, 'id' | 'nc_id' | 'status'>) => {
    const ncId = `NC-${Date.now().toString().slice(-4)}`;
    setNcs(prev => [
      { ...nc, id: Date.now(), nc_id: ncId, status: 'Open' },
      ...prev
    ]);
    logActivity('QMS Deviations', 'create', `Raised Non-Conformance report ${ncId} on ${nc.department}`);
    addNotification('Non-Conformance raised', `QMS deviation ${ncId} raised. Assign owner: ${nc.assigned_to}.`, '/qms/ncs');
  };

  const updateNC = (id: number, data: Partial<NonConformance>) => {
    setNcs(prev => prev.map(n => n.id === id ? { ...n, ...data } : n));
  };

  const closeNC = (id: number) => {
    setNcs(prev => prev.map(n => n.id === id ? { ...n, status: 'Closed' } : n));
    logActivity('QMS Deviations', 'close', `Closed Non-Conformance report ID ${id}`);
  };

  return (
    <AppDataContext.Provider value={{
      assets, tickets, vendors, nonItAssets, travelBookings, couriers, register, leads, quotations, customers, coaRequests, coas, orders, qmsDocuments, audits, ncs, activityLogs, notifications, demoRole,
      setDemoRole,
      addAsset, updateAsset, deleteAsset,
      addTicket, updateTicketStatus, assignTicket, addTicketComment,
      addVendor, updateVendor,
      addNonITAsset, updateNonITAssetStock,
      addTravelBooking, approveTravelBooking, markTravelBooked,
      addCourier, markCourierDelivered,
      addRegisterEntry, updateRegisterEntry,
      addLead, updateLead, addLeadInteraction,
      addQuotation, updateQuotationStatus,
      requestCoaFromQA, approveCoa, addCoa, updateCoa,
      addOrder, sendOrderToProduction, acknowledgeOrderVendor, updateOrderStatus,
      addQmsDocument, acknowledgeQmsDoc,
      addAudit, updateAuditChecklist,
      addNC, updateNC, closeNC,
      addNotification, markNotificationRead, markAllNotificationsRead
    }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used within AppDataProvider');
  return context;
};
export default AppDataContext;
