import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PortalLayout from './components/PortalLayout';
import * as UserPages from './portals/user/Pages';
import * as HospitalPages from './portals/hospital/Pages';
import * as AdminPages from './portals/admin/Pages';
import LandingPage from './portals/LandingPage';
import Login from './portals/Login';
import { trainLoadModel, loadHistory } from '../conduit-ml';
import {
  AlertOctagon,
  Search,
  Activity,
  Calendar,
  Route as RouteIcon,
  FileText,
  ListOrdered,
  Zap,
  Stethoscope,
  Users,
  Clock,
  Bed,
  Microscope,
  ShieldAlert,
  Map,
  BarChart,
  Settings,
  GitBranch,
  Bell,
  PieChart
} from 'lucide-react';

const userMenu = [
  { path: '/user/emergency', label: 'Emergency Routing', icon: AlertOctagon },
  { path: '/user/selector', label: 'Hospital Selector', icon: Search },
  { path: '/user/stress', label: 'System Stress', icon: Activity },
  { path: '/user/appointment', label: 'Smart Appointment', icon: Calendar },
  { path: '/user/referral', label: 'Referral Optimization', icon: RouteIcon },
  { path: '/user/tests', label: 'Test Duplication', icon: FileText },
  { path: '/user/queue', label: 'Queue Transparency', icon: ListOrdered },
  { path: '/user/surge', label: 'Surge Protocol', icon: Zap },
];

const hospitalMenu = [
  { path: '/hospital/triage', label: 'Smart Triage', icon: Stethoscope },
  { path: '/hospital/flow', label: 'Patient Flow', icon: Users },
  { path: '/hospital/queue', label: 'Queue Management', icon: Clock },
  { path: '/hospital/beds', label: 'Bed Optimization', icon: Bed },
  { path: '/hospital/equipment', label: 'Equipment Heatmap', icon: Microscope },
  { path: '/hospital/staff', label: 'Staff Balancer', icon: Users },
  { path: '/hospital/surge', label: 'Surge Management', icon: ShieldAlert },
  { path: '/hospital/redundancy', label: 'Redundancy Monitor', icon: FileText },
];

const adminMenu = [
  { path: '/admin/dashboard', label: 'Network Operations', icon: Map },
  { path: '/admin/surge', label: 'Surge Command', icon: ShieldAlert },
  { path: '/admin/resources', label: 'Resource Allocation', icon: BarChart },
  { path: '/admin/policies', label: 'Policy Mgmt', icon: Settings },
  { path: '/admin/coordination', label: 'Inter-Hospital', icon: GitBranch },
  { path: '/admin/alerts', label: 'Operational Alerts', icon: Bell },
  { path: '/admin/analytics', label: 'Unified Analytics', icon: PieChart },
];

function App() {
  // Train the Load Prediction model on app startup
  useEffect(() => {
    trainLoadModel(loadHistory);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />

      {/* User Portal */}
      <Route path="/user" element={<PortalLayout portalName="USER" menuItems={userMenu} />}>
        <Route index element={<Navigate to="emergency" replace />} />
        <Route path="emergency" element={<UserPages.EmergencyRouting />} />
        <Route path="selector" element={<UserPages.HospitalSelector />} />
        <Route path="stress" element={<UserPages.SystemStress />} />
        <Route path="appointment" element={<UserPages.SmartAppointment />} />
        <Route path="referral" element={<UserPages.ReferralOptimization />} />
        <Route path="tests" element={<UserPages.TestDuplication />} />
        <Route path="queue" element={<UserPages.QueueTransparency />} />
        <Route path="surge" element={<UserPages.SurgePage />} />
      </Route>

      {/* Hospital Portal */}
      <Route path="/hospital" element={<PortalLayout portalName="HOSPITAL" menuItems={hospitalMenu} />}>
        <Route index element={<Navigate to="triage" replace />} />
        <Route path="triage" element={<HospitalPages.SmartTriage />} />
        <Route path="flow" element={<HospitalPages.PatientFlow />} />
        <Route path="queue" element={<HospitalPages.QueueManagement />} />
        <Route path="beds" element={<HospitalPages.BedOptimization />} />
        <Route path="equipment" element={<HospitalPages.EquipmentUtilization />} />
        <Route path="staff" element={<HospitalPages.AvoidableVisitFilterAndStaffLoadBalancer />} />
        <Route path="surge" element={<HospitalPages.SurgeManagement />} />
        <Route path="redundancy" element={<HospitalPages.RedundancyMonitor />} />
      </Route>

      {/* Admin Portal */}
      <Route path="/admin" element={<PortalLayout portalName="ADMIN" menuItems={adminMenu} />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminPages.NetworkDashboard />} />
        <Route path="surge" element={<AdminPages.SurgeCommand />} />
        <Route path="resources" element={<AdminPages.ResourceAllocation />} />
        <Route path="policies" element={<AdminPages.PolicyManagement />} />
        <Route path="coordination" element={<AdminPages.CoordinationPanel />} />
        <Route path="alerts" element={<AdminPages.OperationalAlerts />} />
        <Route path="analytics" element={<AdminPages.UnifiedAnalytics />} />
      </Route>
    </Routes>
  );
}

export default App;
