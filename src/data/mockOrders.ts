export interface FulfillmentOrder {
  id: number;
  order_no: string;
  quotation_id: number;
  quote_no: string;
  coa_id: number | null;
  coa_no: string;
  customer: string;
  status: 'Confirmed' | 'Sent to Vendor' | 'In Production' | 'Dispatched' | 'Delivered';
  vendor_acknowledged: boolean;
  created_at: string;
}

export const initialOrders: FulfillmentOrder[] = [
  { id: 1, order_no: 'ORD-EX-9901', quotation_id: 2, quote_no: 'QTN-SLS-202', coa_id: 1, coa_no: 'COA-2026-9912', customer: 'Thao Pharmaceutical JSC (Vietnam)', status: 'In Production', vendor_acknowledged: true, created_at: new Date(Date.now() - 4*24*60*60*1000).toISOString() }
];
