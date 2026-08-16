import { Navigate, Route, Routes } from 'react-router-dom'

import { AppLayout } from '../components/AppLayout'
import { LandingPage } from '../pages/LandingPage'
import { LoginPage } from '../pages/LoginPage'
import { OnboardingPage } from '../pages/OnboardingPage'
import { MobileOnlyPage } from '../pages/MobileOnlyPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import {
  AccountSettingsPage,
  AdminBillingPage,
  AdminErrorsPage,
  AdminOrganizationDetailPage,
  AdminOrganizationsPage,
  AdminOverviewPage,
  BillingSettingsPage,
  DashboardPage,
  DocumentDetailPage,
  DocumentsPage,
  FleetPage,
  InvoiceDetailPage,
  InvoicesPage,
  PricingPage,
  ProjectDetailPage,
  ProjectsPage,
  ProposalDetailPage,
  ProposalsPage,
  SchedulingPage,
  TeamSettingsPage,
} from '../pages'
import { RequireAccess } from './RequireAccess'

/**
 * Section 10.2 routes plus the agreed /scheduling addition and the Section 15.3
 * admin area. Public routes render directly; everything else sits behind
 * RequireAccess, which resolves the pure access decision.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/mobile-only" element={<MobileOnlyPage />} />

      <Route
        path="/login"
        element={
          <RequireAccess>
            <LoginPage />
          </RequireAccess>
        }
      />
      <Route
        path="/signup"
        element={
          <RequireAccess>
            <LoginPage />
          </RequireAccess>
        }
      />
      <Route
        path="/welcome"
        element={
          <RequireAccess>
            <OnboardingPage />
          </RequireAccess>
        }
      />

      <Route
        element={
          <RequireAccess>
            <AppLayout />
          </RequireAccess>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/scheduling" element={<SchedulingPage />} />
        <Route path="/proposals" element={<ProposalsPage />} />
        <Route path="/proposals/:id" element={<ProposalDetailPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/documents/:id" element={<DocumentDetailPage />} />
        <Route path="/fleet" element={<FleetPage />} />

        <Route path="/settings" element={<Navigate to="/settings/account" replace />} />
        <Route path="/settings/account" element={<AccountSettingsPage />} />
        <Route path="/settings/billing" element={<BillingSettingsPage />} />
        <Route path="/settings/team" element={<TeamSettingsPage />} />

        <Route path="/admin" element={<AdminOverviewPage />} />
        <Route path="/admin/organizations" element={<AdminOrganizationsPage />} />
        <Route
          path="/admin/organizations/:id"
          element={<AdminOrganizationDetailPage />}
        />
        <Route path="/admin/billing" element={<AdminBillingPage />} />
        <Route path="/admin/errors" element={<AdminErrorsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
