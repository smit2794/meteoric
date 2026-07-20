export interface ITAsset {
  id: number;
  asset_id: string;
  type: string;
  brand: string;
  model: string;
  serial_no: string;
  assigned_to: number | null;
  assigned_to_name: string;
  location: 'Ahmedabad HQ' | 'USA Office' | 'Vietnam Office';
  status: 'Active' | 'Under Repair' | 'In Stock' | 'Retired';
  purchase_date: string;
  warranty_expiry: string;
}

export const initialAssets: ITAsset[] = [
  { id: 1, asset_id: 'AST-LIMS-001', type: 'LIMS Terminal', brand: 'HP', model: 'EliteDesk 800 G9', serial_no: 'HP-LIMS-8762', assigned_to: 4, assigned_to_name: 'Dr. Dev Karve', location: 'Ahmedabad HQ', status: 'Active', purchase_date: '2024-03-12', warranty_expiry: '2027-03-12' },
  { id: 2, asset_id: 'AST-LIMS-002', type: 'LIMS Terminal', brand: 'Dell', model: 'OptiPlex 7090', serial_no: 'DELL-LIMS-9921', assigned_to: null, assigned_to_name: 'Unassigned', location: 'Ahmedabad HQ', status: 'In Stock', purchase_date: '2024-05-18', warranty_expiry: '2027-05-18' },
  { id: 3, asset_id: 'AST-LAB-001', type: 'Lab Computer', brand: 'Lenovo', model: 'ThinkStation P360', serial_no: 'LEN-LAB-1029', assigned_to: 4, assigned_to_name: 'Dr. Dev Karve', location: 'Ahmedabad HQ', status: 'Active', purchase_date: '2023-11-01', warranty_expiry: '2026-11-01' },
  { id: 4, asset_id: 'AST-LAB-002', type: 'Lab Computer', brand: 'Lenovo', model: 'ThinkStation P360', serial_no: 'LEN-LAB-1030', assigned_to: 2, assigned_to_name: 'IT Technician', location: 'Ahmedabad HQ', status: 'Under Repair', purchase_date: '2023-11-01', warranty_expiry: '2026-11-01' },
  { id: 5, asset_id: 'AST-PROD-001', type: 'Production Floor Device', brand: 'Getac', model: 'F110 Rugged Tablet', serial_no: 'GET-PRD-7721', assigned_to: null, assigned_to_name: 'Unassigned', location: 'Ahmedabad HQ', status: 'Active', purchase_date: '2024-01-10', warranty_expiry: '2027-01-10' },
  { id: 6, asset_id: 'AST-PROD-002', type: 'Production Floor Device', brand: 'Getac', model: 'F110 Rugged Tablet', serial_no: 'GET-PRD-7722', assigned_to: null, assigned_to_name: 'Unassigned', location: 'Ahmedabad HQ', status: 'Active', purchase_date: '2024-01-10', warranty_expiry: '2027-01-10' },
  { id: 7, asset_id: 'AST-LAP-101', type: 'Office Laptop', brand: 'Apple', model: 'MacBook Pro 14 (M3)', serial_no: 'APL-MBP-9912', assigned_to: 1, assigned_to_name: 'Admin User', location: 'Ahmedabad HQ', status: 'Active', purchase_date: '2024-02-15', warranty_expiry: '2027-02-15' },
  { id: 8, asset_id: 'AST-LAP-102', type: 'Office Laptop', brand: 'Lenovo', model: 'ThinkPad T14 Gen 4', serial_no: 'LEN-TP-8871', assigned_to: 3, assigned_to_name: 'Sales Representative', location: 'USA Office', status: 'Active', purchase_date: '2024-04-10', warranty_expiry: '2027-04-10' },
  { id: 9, asset_id: 'AST-LAP-103', type: 'Office Laptop', brand: 'Lenovo', model: 'ThinkPad T14 Gen 4', serial_no: 'LEN-TP-8872', assigned_to: 5, assigned_to_name: 'General Manager', location: 'Vietnam Office', status: 'Active', purchase_date: '2024-04-12', warranty_expiry: '2027-04-12' },
  { id: 10, asset_id: 'AST-NET-001', type: 'Networking', brand: 'Cisco', model: 'Catalyst 9300 Switch', serial_no: 'CIS-NET-1122', assigned_to: 2, assigned_to_name: 'IT Technician', location: 'Ahmedabad HQ', status: 'Active', purchase_date: '2023-08-01', warranty_expiry: '2028-08-01' },
  { id: 11, asset_id: 'AST-NET-002', type: 'Networking', brand: 'Ubiquiti', model: 'UniFi Dream Machine', serial_no: 'UBI-NET-5511', assigned_to: null, assigned_to_name: 'Unassigned', location: 'USA Office', status: 'Active', purchase_date: '2024-05-01', warranty_expiry: '2027-05-01' },
  { id: 12, asset_id: 'AST-NET-003', type: 'Networking', brand: 'Ubiquiti', model: 'UniFi Dream Machine', serial_no: 'UBI-NET-5512', assigned_to: null, assigned_to_name: 'Unassigned', location: 'Vietnam Office', status: 'Active', purchase_date: '2024-05-05', warranty_expiry: '2027-05-05' },
  { id: 13, asset_id: 'AST-LAP-104', type: 'Office Laptop', brand: 'Dell', model: 'Latitude 5440', serial_no: 'DEL-LT-6611', assigned_to: null, assigned_to_name: 'Unassigned', location: 'Ahmedabad HQ', status: 'In Stock', purchase_date: '2024-06-01', warranty_expiry: '2027-06-01' },
  { id: 14, asset_id: 'AST-LIMS-003', type: 'LIMS Terminal', brand: 'HP', model: 'EliteDesk 800 G9', serial_no: 'HP-LIMS-8763', assigned_to: null, assigned_to_name: 'Unassigned', location: 'Vietnam Office', status: 'In Stock', purchase_date: '2024-07-01', warranty_expiry: '2027-07-01' },
  { id: 15, asset_id: 'AST-PROD-003', type: 'Production Floor Device', brand: 'Getac', model: 'F110 Rugged Tablet', serial_no: 'GET-PRD-7723', assigned_to: null, assigned_to_name: 'Unassigned', location: 'Ahmedabad HQ', status: 'Retired', purchase_date: '2021-02-10', warranty_expiry: '2024-02-10' }
];
