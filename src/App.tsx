import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppDataProvider } from './context/AppDataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';
import PortalLayout from './components/PortalLayout';

// Pages
import Login from './pages/auth/Login';
import PortalSelect from './pages/auth/PortalSelect';
import MainDashboard from './pages/dashboard/MainDashboard';

// IT Asset Management Portal
import ITDashboard from './pages/it/ITDashboard';
import AssetInventory from './pages/it/AssetInventory';
import IncidentManagement from './pages/it/IncidentManagement';
import TicketDetail from './pages/it/TicketDetail';
import ServiceRequests from './pages/it/ServiceRequests';
import AccessControl from './pages/it/AccessControl';
import ITPolicies from './pages/it/ITPolicies';
import LicenseTracker from './pages/it/LicenseTracker';

// Admin Operations Portal
import AdminDashboard from './pages/admin/AdminDashboard';
import VendorManagement from './pages/admin/VendorManagement';
import Stationery from './pages/admin/Stationery';
import TravelBookings from './pages/admin/TravelBookings';
import CourierManagement from './pages/admin/CourierManagement';
import Register from './pages/admin/Register';

// Sales Team Portal
import CRMDashboard from './pages/crm/CRMDashboard';
import Leads from './pages/crm/Leads';
import LeadDetail from './pages/crm/LeadDetail';
import Pipeline from './pages/crm/Pipeline';
import Quotations from './pages/crm/Quotations';
import SalesCOA from './pages/sales/SalesCOA';

// QA Team Portal
import QADashboard from './pages/qa/QADashboard';
import COARequests from './pages/qa/COARequests';
import COAEditor from './pages/qa/COAEditor';

// Sales Fulfillment (Wait, Fulfillment is orders, which can be mounted inside Sales Team or Admin or Central Dashboard. Let's see where the new route mapping lists it. The new route mapping lists QMS and Sales, let's keep all paths mapped!)
import Orders from './pages/sales/Orders';
import HandoffDetail from './pages/sales/HandoffDetail';

// QMS Team Portal
import QMSDashboard from './pages/qms/QMSDashboard';
import SOPDocs from './pages/qms/SOPDocs';
import AuditScheduling from './pages/qms/AuditScheduling';
import AuditExecution from './pages/qms/AuditExecution';
import NCTracker from './pages/qms/NCTracker';

// Settings
import Users from './pages/settings/Users';
import Permissions from './pages/settings/Permissions';
import NotificationSettings from './pages/settings/NotificationSettings';

export default function App() {
  return (
    <AppDataProvider>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              {/* Central Landing Hub selector */}
              <Route path="/" element={<PortalSelect />} />

              {/* Central Dashboard cross-module KPIs */}
              <Route path="/dashboard" element={<PortalLayout><MainDashboard /></PortalLayout>} />

              {/* Login demo route */}
              <Route path="/login" element={<Navigate to="/" replace />} />

              {/* Portal 1: IT Department scoped routing */}
              <Route path="/portal/it-department">
                <Route index element={<PortalLayout><ITDashboard /></PortalLayout>} />
                <Route path="assets" element={<PortalLayout><AssetInventory /></PortalLayout>} />
                <Route path="incidents" element={<PortalLayout><IncidentManagement /></PortalLayout>} />
                <Route path="service-requests" element={<PortalLayout><ServiceRequests /></PortalLayout>} />
                <Route path="user-access" element={<PortalLayout><AccessControl /></PortalLayout>} />
                <Route path="policies" element={<PortalLayout><ITPolicies /></PortalLayout>} />
                <Route path="licenses" element={<PortalLayout><LicenseTracker /></PortalLayout>} />
                <Route path="tickets" element={<PortalLayout><IncidentManagement /></PortalLayout>} />
                <Route path="tickets/:id" element={<PortalLayout><TicketDetail /></PortalLayout>} />
              </Route>

              {/* Portal 2: Admin Department scoped routing */}
              <Route path="/portal/admin-department">
                <Route index element={<PortalLayout><AdminDashboard /></PortalLayout>} />
                <Route path="vendors" element={<PortalLayout><VendorManagement /></PortalLayout>} />
                <Route path="stationery" element={<PortalLayout><Stationery /></PortalLayout>} />
                <Route path="travel" element={<PortalLayout><TravelBookings /></PortalLayout>} />
                <Route path="courier" element={<PortalLayout><CourierManagement /></PortalLayout>} />
                <Route path="inward-outward" element={<PortalLayout><Register /></PortalLayout>} />
              </Route>

              {/* Portal 3: Sales Team scoped routing */}
              <Route path="/portal/sales-team">
                <Route index element={<PortalLayout><CRMDashboard /></PortalLayout>} />
                <Route path="crm" element={<PortalLayout><Leads /></PortalLayout>} />
                <Route path="crm/leads/:id" element={<PortalLayout><LeadDetail /></PortalLayout>} />
                <Route path="crm/pipeline" element={<PortalLayout><Pipeline /></PortalLayout>} />
                <Route path="quotations" element={<PortalLayout><Quotations /></PortalLayout>} />
                <Route path="coa" element={<PortalLayout><SalesCOA /></PortalLayout>} />
              </Route>

              {/* Portal 4: QA Team scoped routing */}
              <Route path="/portal/qa-team">
                <Route index element={<PortalLayout><QADashboard /></PortalLayout>} />
                <Route path="coa-builder" element={<PortalLayout><COAEditor /></PortalLayout>} />
                <Route path="coa-requests" element={<PortalLayout><COARequests /></PortalLayout>} />
              </Route>

              {/* Portal 5: QMS Team scoped routing */}
              <Route path="/portal/qms-team">
                <Route index element={<PortalLayout><QMSDashboard /></PortalLayout>} />
                <Route path="sop-documentation" element={<PortalLayout><SOPDocs /></PortalLayout>} />
                <Route path="audit-management" element={<PortalLayout><AuditScheduling /></PortalLayout>} />
                <Route path="audit-management/:id" element={<PortalLayout><AuditExecution /></PortalLayout>} />
                <Route path="ncs" element={<PortalLayout><NCTracker /></PortalLayout>} />
              </Route>

              {/* Catch-all redirect to Portal Select */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </AppDataProvider>
  );
}
