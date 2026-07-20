export interface QMSDocument {
  id: number;
  title: string;
  category: 'Quality Policy' | 'SOP' | 'Protocol' | 'Template';
  version: string;
  owner_id: number;
  owner_name: string;
  last_reviewed: string;
  next_review: string;
  acknowledged: boolean;
}

export interface ComplianceAudit {
  id: number;
  audit_id: string;
  type: 'Internal' | 'External';
  department: 'Production' | 'R&D Center' | 'QA Lab' | 'Admin & Logistics';
  scheduled_date: string;
  auditor_id: number;
  auditor_name: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
  checklist: AuditChecklistItem[];
}

export interface AuditChecklistItem {
  item: string;
  status: 'Pass' | 'Fail' | 'NA';
  comment: string;
}

export interface NonConformance {
  id: number;
  nc_id: string;
  description: string;
  raised_by: string;
  department: string;
  root_cause: string;
  corrective_action: string;
  status: 'Open' | 'In Progress' | 'Closed';
  due_date: string;
  assigned_to: string;
}

export const initialQMSDocuments: QMSDocument[] = [
  { id: 1, title: 'GMP Cleanroom Manufacturing Protocol', category: 'SOP', version: '4.2', owner_id: 4, owner_name: 'Dr. Dev Karve', last_reviewed: '2026-01-10', next_review: '2027-01-10', acknowledged: true },
  { id: 2, title: 'Stability Study Protocol for Probiotic Strains', category: 'Protocol', version: '2.0', owner_id: 4, owner_name: 'Dr. Dev Karve', last_reviewed: '2026-03-15', next_review: '2027-03-15', acknowledged: false },
  { id: 3, title: 'Regulatory Export Documentation SOP (EU/US markets)', category: 'SOP', version: '1.5', owner_id: 5, owner_name: 'General Manager', last_reviewed: '2026-05-20', next_review: '2027-05-20', acknowledged: true }
];

export const initialAudits: ComplianceAudit[] = [
  {
    id: 1,
    audit_id: 'AUD-GMP-101',
    type: 'Internal',
    department: 'Production',
    scheduled_date: '2026-07-28',
    auditor_id: 4,
    auditor_name: 'Dr. Dev Karve',
    status: 'Scheduled',
    checklist: [
      { item: 'Temperature/Humidity logs for probiotic packing zone active', status: 'NA', comment: '' },
      { item: 'Staff protective apparel & gowning logs checked', status: 'NA', comment: '' },
      { item: 'Raw material batch trace tags attached', status: 'NA', comment: '' }
    ]
  },
  {
    id: 2,
    audit_id: 'AUD-USFDA-102',
    type: 'External',
    department: 'QA Lab',
    scheduled_date: '2026-08-10',
    auditor_id: 5,
    auditor_name: 'US FDA Auditor',
    status: 'Scheduled',
    checklist: [
      { item: 'LIMS database audit trail logs active', status: 'NA', comment: '' },
      { item: 'Validation logs for analytical balance scales signed', status: 'NA', comment: '' }
    ]
  }
];

export const initialNCs: NonConformance[] = [
  {
    id: 1,
    nc_id: 'NC-2026-001',
    description: 'Temperature deviation in Probiotic strain storage chamber #2 (+1.5C over limit).',
    raised_by: 'QA Officer',
    department: 'Production',
    root_cause: 'Chamber gasket seal worn out.',
    corrective_action: 'Replace gasket seal, install temperature alarm auto-alert systems.',
    status: 'In Progress',
    due_date: '2026-07-25',
    assigned_to: 'Dr. Dev Karve'
  }
];
