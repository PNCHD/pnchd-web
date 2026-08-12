import { createPlaceholderPage } from './createPlaceholderPage'

// Section 10.2 — marketing / public
export const PricingPage = createPlaceholderPage(
  'Pricing',
  'Interactive module picker and live pricing calculator.',
)
export const SignupPage = createPlaceholderPage(
  'Create your account',
  'Organization setup and Stripe subscription. 30-day free trial, no card required.',
)
export const LoginPage = createPlaceholderPage('Log in')

// Section 10.2 — contractor app
export const DashboardPage = createPlaceholderPage(
  'Dashboard',
  'Active projects, recent activity, and unpaid invoices.',
)
export const ProjectsPage = createPlaceholderPage(
  'Projects',
  'Filter by status, search, and sort.',
)
export const ProjectDetailPage = createPlaceholderPage(
  'Project detail',
  'Timeline, documents, team, and invoices.',
)
export const SchedulingPage = createPlaceholderPage(
  'Scheduling',
  'Scheduling and timelines.',
)
export const ProposalsPage = createPlaceholderPage(
  'Proposals',
  'Create proposals and track approval status.',
)
export const ProposalDetailPage = createPlaceholderPage(
  'Proposal detail',
  'Line items, send to client, track approval.',
)
export const InvoicesPage = createPlaceholderPage(
  'Invoices',
  'Filter unpaid, overdue, and paid.',
)
export const InvoiceDetailPage = createPlaceholderPage(
  'Invoice detail',
  'Payment status and history.',
)
export const DocumentsPage = createPlaceholderPage(
  'Documents',
  'Upload and send for signing via Docuseal.',
)
export const DocumentDetailPage = createPlaceholderPage(
  'Document detail',
  'Signer status and completed document download.',
)
export const FleetPage = createPlaceholderPage(
  'Fleet',
  'Live truck positions on the map.',
)

// Section 10.2 — settings
export const AccountSettingsPage = createPlaceholderPage(
  'Account',
  'Profile and organization settings.',
)
export const BillingSettingsPage = createPlaceholderPage(
  'Billing',
  'Module toggles, seat management, and the Stripe billing portal.',
)
export const TeamSettingsPage = createPlaceholderPage(
  'Team',
  'Invite clients, drivers, and additional Pro seats.',
)

// Section 15.3 — platform admin
export const AdminOverviewPage = createPlaceholderPage(
  'Admin overview',
  'Total orgs, active subscribers, MRR estimate, recent signups and errors.',
)
export const AdminOrganizationsPage = createPlaceholderPage(
  'Organizations',
  'All organizations across the platform.',
)
export const AdminOrganizationDetailPage = createPlaceholderPage(
  'Organization detail',
  'Modules, team, activity, and Stripe links.',
)
export const AdminBillingPage = createPlaceholderPage(
  'Platform billing',
  'Subscribers by plan, MRR, churn, and founding members.',
)
export const AdminErrorsPage = createPlaceholderPage(
  'Errors',
  'Recent Sentry errors grouped by organization.',
)
