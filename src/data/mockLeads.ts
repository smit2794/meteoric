export interface Lead {
  id: number;
  name: string;
  company: string;
  source: 'Website Distributor Form' | 'Website Quotation Form' | 'Website Sample Request' | 'Direct/Email' | 'Trade Show';
  trade_show_name?: string;
  assigned_rep: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Won' | 'Lost';
  email: string;
  phone: string;
  product_category: string;
  country: string;
  notes: string;
  last_contacted: string;
  interactions?: LeadInteraction[];
}

export interface LeadInteraction {
  id: number;
  lead_id: number;
  user_name: string;
  type: 'Call' | 'Email' | 'Meeting' | 'Note';
  notes: string;
  created_at: string;
}

export interface Quotation {
  id: number;
  quote_no: string;
  lead_id: number;
  customer_name: string;
  product_category: string;
  amount: number;
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected' | 'COA Requested' | 'COA Ready';
  hasCOA: boolean;
  line_items: QuotationLineItem[];
  created_at: string;
}

export interface QuotationLineItem {
  item: string;
  qty: number;
  price: number;
}

export interface Customer {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  total_orders: number;
  last_order_date: string;
}

export const initialLeads: Lead[] = [
  {
    id: 1,
    name: 'Roberto Silva',
    company: 'Silva BioFoods Ltda',
    source: 'Website Distributor Form',
    assigned_rep: 'Sales Representative',
    status: 'Proposal',
    email: 'silva@biofoods.com.br',
    phone: '+55 11 9988-7766',
    product_category: 'Probiotics (+ Blends)',
    country: 'Brazil',
    notes: 'Inquiring about importing custom probiotic blends (L. Acidophilus + B. Longum) for local distribution.',
    last_contacted: '2026-07-18',
    interactions: [
      { id: 1, lead_id: 1, user_name: 'Sales Representative', type: 'Email', notes: 'Sent quotation QTN-SLS-201 and product technical specifications.', created_at: new Date(Date.now() - 48*60*60*1000).toISOString() }
    ]
  },
  {
    id: 2,
    name: 'Helmut Muller',
    company: 'PharmaAktiv GmbH',
    source: 'Website Sample Request',
    assigned_rep: 'Sales Representative',
    status: 'Qualified',
    email: 'h.muller@pharmaaktiv.de',
    phone: '+49 89 123456',
    product_category: 'PostMetBio (Postbiotics)',
    country: 'Germany',
    notes: 'Requested stability samples (500g) of PostMetBio for active formulation stability testing.',
    last_contacted: '2026-07-17',
    interactions: [
      { id: 2, lead_id: 2, user_name: 'Sales Representative', type: 'Call', notes: 'Discussed sample customs clearance requirements in Germany.', created_at: new Date(Date.now() - 72*60*60*1000).toISOString() }
    ]
  },
  {
    id: 3,
    name: 'Fatima Al Maktoum',
    company: 'Gulf Nutra Trading',
    source: 'Trade Show',
    trade_show_name: 'Vitafoods Europe',
    assigned_rep: 'Sales Representative',
    status: 'New',
    email: 'fatima@gulfnutra.ae',
    phone: '+971 4 555 1234',
    product_category: 'Formulations (Kids)',
    country: 'UAE',
    notes: 'Met at Vitafoods Europe stand. Interested in our ready-to-fill kids formulation blends.',
    last_contacted: '2026-07-20',
    interactions: []
  },
  {
    id: 4,
    name: 'Nguyen Van Thao',
    company: 'Thao Pharmaceutical JSC',
    source: 'Website Quotation Form',
    assigned_rep: 'Sales Representative',
    status: 'Won',
    email: 'thao@thaopharma.com.vn',
    phone: '+84 28 3829 1234',
    product_category: 'Enzymes (Human)',
    country: 'Vietnam',
    notes: 'Bulk purchase of Lactase and Alpha-Galactosidase. Order confirmed and pending logistics.',
    last_contacted: '2026-07-16',
    interactions: [
      { id: 3, lead_id: 4, user_name: 'Sales Representative', type: 'Meeting', notes: 'Met at Ho Chi Minh Office to sign supply agreement.', created_at: new Date(Date.now() - 96*60*60*1000).toISOString() }
    ]
  }
];

export const initialQuotations: Quotation[] = [
  {
    id: 1,
    quote_no: 'QTN-SLS-201',
    lead_id: 1,
    customer_name: 'Silva BioFoods Ltda (Brazil)',
    product_category: 'Probiotics (+ Blends)',
    amount: 145000,
    status: 'Approved',
    hasCOA: false,
    line_items: [
      { item: 'L. Acidophilus (100 Billion CFU/g)', qty: 25, price: 3800 },
      { item: 'B. Longum (50 Billion CFU/g)', qty: 15, price: 3300 }
    ],
    created_at: new Date(Date.now() - 3*24*60*60*1000).toISOString()
  },
  {
    id: 2,
    quote_no: 'QTN-SLS-202',
    lead_id: 4,
    customer_name: 'Thao Pharmaceutical JSC (Vietnam)',
    product_category: 'Enzymes (Human)',
    amount: 98000,
    status: 'COA Ready',
    hasCOA: true,
    line_items: [
      { item: 'Lactase Enzyme Activity 100,000 ALU/g', qty: 20, price: 4900 }
    ],
    created_at: new Date(Date.now() - 5*24*60*60*1000).toISOString()
  }
];

export const initialCustomers: Customer[] = [
  { id: 1, name: 'Silva BioFoods Ltda', company: 'Silva BioFoods', email: 'silva@biofoods.com.br', phone: '+55 11 9988-7766', country: 'Brazil', total_orders: 4, last_order_date: '2026-05-10' },
  { id: 2, name: 'Thao Pharmaceutical JSC', company: 'Thao Pharma', email: 'thao@thaopharma.com.vn', phone: '+84 28 3829 1234', country: 'Vietnam', total_orders: 8, last_order_date: '2026-07-16' },
  { id: 3, name: 'Morris Plains Wellness Inc', company: 'Morris Plains Wellness', email: 'info@morrisplains.com', phone: '+1 973 555 7711', country: 'USA', total_orders: 12, last_order_date: '2026-06-25' }
];
