export interface Vendor {
  id: number;
  name: string;
  category: 'Raw Materials' | 'Packaging' | 'Lab Equipment' | 'Logistics';
  contact: string;
  email: string;
  contract_end: string;
  total_spend: number;
  rating: number;
  status: 'Active' | 'Inactive';
}

export interface NonITAsset {
  id: number;
  name: string;
  category: 'Stationery' | 'Lab Consumables' | 'Office Supplies';
  quantity: number;
  reorder_level: number;
  cost_per_unit: number;
}

export interface TravelBooking {
  id: number;
  employee: string;
  from_to: string;
  travel_date: string;
  mode: 'Flight' | 'Train' | 'Cab';
  purpose: string;
  status: 'Requested' | 'Approved' | 'Booked' | 'Rejected';
  cost: number;
}

export interface CourierEntry {
  id: number;
  courier_id: string;
  type: 'Inward' | 'Outward';
  sender: string;
  receiver: string;
  date: string;
  tracking_no: string;
  status: 'In Transit' | 'Delivered' | 'Returned';
  proof_of_delivery?: string;
}

export interface RegisterEntry {
  id: number;
  date: string;
  type: 'Inward' | 'Outward';
  description: string;
  from_party: string;
  to_party: string;
  purpose: string;
  received_by: string;
  signature_url?: string;
}

export const initialVendors: Vendor[] = [
  { id: 1, name: 'Apex Enzymes & Chemicals', category: 'Raw Materials', contact: 'Alok Mehta', email: 'alok@apexchem.in', contract_end: '2027-02-18', total_spend: 180000, rating: 5, status: 'Active' },
  { id: 2, name: 'Precision Glassware & Labware', category: 'Lab Equipment', contact: 'Rita Shah', email: 'rita@precisionglass.co.in', contract_end: '2026-11-30', total_spend: 42000, rating: 4, status: 'Active' },
  { id: 3, name: 'DHL Global Forwarding Export Partner', category: 'Logistics', contact: 'Nirmal Vyas', email: 'nirmal.vyas@dhl.com', contract_end: '2027-06-30', total_spend: 310000, rating: 5, status: 'Active' },
  { id: 4, name: 'Indo-Vietnam Logistics Services', category: 'Logistics', contact: 'Nguyen Tuan', email: 'tuan@ivlogistics.vn', contract_end: '2026-09-15', total_spend: 85000, rating: 3, status: 'Active' },
  { id: 5, name: 'Saraswati Packaging Boxes Pvt Ltd', category: 'Packaging', contact: 'Amit Patel', email: 'sales@saraswatipack.com', contract_end: '2027-01-10', total_spend: 64000, rating: 4, status: 'Active' }
];

export const initialNonITAssets: NonITAsset[] = [
  { id: 1, name: 'Cell Culture Petri Dishes (Pack of 500)', category: 'Lab Consumables', quantity: 45, reorder_level: 20, cost_per_unit: 18.5 },
  { id: 2, name: 'L-Cysteine Hydrocholoride Raw Material (kg)', category: 'Lab Consumables', quantity: 5, reorder_level: 10, cost_per_unit: 120.0 }, // low stock!
  { id: 3, name: 'Copier Paper A4 Reams', category: 'Stationery', quantity: 52, reorder_level: 15, cost_per_unit: 4.5 },
  { id: 4, name: 'Blue Ink Gel Pens (Box of 50)', category: 'Stationery', quantity: 4, reorder_level: 8, cost_per_unit: 12.0 } // low stock!
];

export const initialTravelBookings: TravelBooking[] = [
  { id: 1, employee: 'Dr. Dev Karve (R&D Head)', from_to: 'Ahmedabad (HQ) to USA Office (Morris Plains)', travel_date: '2026-08-15', mode: 'Flight', purpose: 'Stability study reviews & client meet at Morris Plains', status: 'Requested', cost: 1850 },
  { id: 2, employee: 'Nirmal Vyas (Exports Manager)', from_to: 'Ahmedabad (HQ) to Vietnam Office (Ho Chi Minh)', travel_date: '2026-09-02', mode: 'Flight', purpose: 'Vietnam local distributor meet & warehouse audit', status: 'Approved', cost: 720 },
  { id: 3, employee: 'Admin User', from_to: 'Ahmedabad (HQ) to Delhi (Govt Relations)', travel_date: '2026-07-22', mode: 'Train', purpose: 'CDSCO regulatory file submission', status: 'Booked', cost: 85 }
];

export const initialCouriers: CourierEntry[] = [
  { id: 1, courier_id: 'COU-OUT-8812', type: 'Outward', sender: 'Ahmedabad HQ QA Lab', receiver: 'Morris Plains (USA Office)', date: '2026-07-12', tracking_no: 'DHL-9921-8812', status: 'Delivered', proof_of_delivery: 'Signed by J. Smith (Morris Plains)' },
  { id: 2, courier_id: 'COU-IN-9921', type: 'Inward', sender: 'Apex Enzymes & Chemicals', receiver: 'Ahmedabad HQ Lab Desk', date: '2026-07-18', tracking_no: 'BLU-5521-9921', status: 'In Transit' }
];

export const initialRegister: RegisterEntry[] = [
  { id: 1, date: '2026-07-16', type: 'Inward', description: 'Enzyme blending raw material (Batch RM-442)', from_party: 'Apex Enzymes', to_party: 'Raw Material Warehouse', purpose: 'QC Inward inspection', received_by: 'IT Technician' },
  { id: 2, date: '2026-07-17', type: 'Outward', description: 'Sample COA documents package for Brazil', from_party: 'Ahmedabad QA office', to_party: 'DHL Courier center', purpose: 'Client Export transmittal', received_by: 'Admin User' }
];
