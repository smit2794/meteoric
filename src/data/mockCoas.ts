export interface CoaRequest {
  id: number;
  quotation_id: number;
  quote_no: string;
  product: string;
  requested_by: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  created_at: string;
}

export interface CoaCertificate {
  id: number;
  coa_no: string;
  coa_request_id: number | null;
  quotation_id: number;
  quote_no: string;
  product: string;
  batch_no: string;
  status: 'Draft' | 'Approved';
  prepared_by: string;
  reviewed_by: string;
  test_params: CoaTestParam[];
  created_at: string;
}

export interface CoaTestParam {
  parameter: string;
  specification: string;
  result: string;
  status: 'Pass' | 'Fail' | 'NA';
}

export const initialCoaRequests: CoaRequest[] = [
  { id: 1, quotation_id: 1, quote_no: 'QTN-SLS-201', product: 'L. Acidophilus (100 Billion CFU/g)', requested_by: 'Sales Representative', status: 'Pending', created_at: new Date(Date.now() - 24*60*60*1000).toISOString() }
];

export const initialCoas: CoaCertificate[] = [
  {
    id: 1,
    coa_no: 'COA-2026-9912',
    coa_request_id: null,
    quotation_id: 2,
    quote_no: 'QTN-SLS-202',
    product: 'Lactase Enzyme Activity 100,000 ALU/g',
    batch_no: 'BATCH-ENZ-7711',
    status: 'Approved',
    prepared_by: 'QA Officer',
    reviewed_by: 'Dr. Dev Karve',
    created_at: new Date(Date.now() - 5*24*60*60*1000).toISOString(),
    test_params: [
      { parameter: 'Enzyme Activity Unit', specification: '>= 100,000 ALU/g', result: '102,400 ALU/g', status: 'Pass' },
      { parameter: 'Loss on Drying', specification: '<= 5.0%', result: '3.8%', status: 'Pass' },
      { parameter: 'Total Plate Count', specification: '<= 1000 CFU/g', result: '150 CFU/g', status: 'Pass' },
      { parameter: 'Escherichia coli', specification: 'Absent in 25g', result: 'Absent', status: 'Pass' }
    ]
  }
];
