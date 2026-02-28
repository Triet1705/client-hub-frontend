"use client";

import {
  NavDashboardIcon,
  NavProjectsIcon,
  NavTasksIcon,
  NavInvoicesIcon,
  NavCommunicationIcon,
  NavAdminIcon,
  ActionEditIcon,
  ActionDeleteIcon,
  ActionPlusIcon,
  ActionSearchIcon,
  ActionViewIcon,
  ActionFilterIcon,
  FilePdfIcon,
  NotificationBellIcon,
  UploadCloudIcon,
  WalletIcon,
  CryptographicLockIcon,
  EscrowWaitingIcon,
  FundsReleasedIcon,
  NetworkPolygonIcon,
  BlockchainPendingIcon,
  BlockchainVerificationBadge,
  AuditLoggingIcon,
  AiMagicIcon,
  MilestoneIcon,
  RiskWarningIcon,
  ClientHubLogo,
  EmailIcon,
  PasswordIcon,
  VisibilityOpenIcon,
  VisibilityClosedIcon,
  WorkspaceDomainIcon,
} from "@/components/icons";

interface IconComponentProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

export default function IconGalleryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl p-10">
        <h1 className="text-4xl font-bold text-blue-900 mb-2">
          🎨 Client Hub Icon Gallery
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          Complete icon system with size variants and states
        </p>

        {/* Color System Info */}
        <div className="mb-8 p-5 bg-blue-50 border-l-4 border-blue-600 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-3">Color System</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded border"
                style={{ background: "#0052CC" }}
              />
              <span>
                <strong>Primary:</strong> #0052CC (Blueprint Blue)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded border"
                style={{ background: "#00D9A3" }}
              />
              <span>
                <strong>Accent:</strong> #00D9A3 (Cyber Mint)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded border"
                style={{ background: "#FF4444" }}
              />
              <span>
                <strong>Alert:</strong> #FF4444 (Alert Red)
              </span>
            </div>
          </div>
        </div>

        {/* Logo Section */}
        <Section title="🏢 Branding">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 rounded-xl text-white mb-6">
            <h3 className="text-xl font-semibold mb-6">Client Hub Logo</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <LogoCard label="Small (32px)" size="sm" />
              <LogoCard label="Medium (40px)" size="md" />
              <LogoCard label="Large (56px)" size="lg" />
              <LogoCard label="XL (80px)" size="xl" />
              <LogoCard label="Icon Only" size="md" showText={false} />
            </div>
          </div>
        </Section>

        {/* Navigation Icons */}
        <Section title="🧭 Navigation Icons">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <IconCard name="Dashboard" icon={NavDashboardIcon} />
            <IconCard name="Projects" icon={NavProjectsIcon} />
            <IconCard name="Tasks" icon={NavTasksIcon} />
            <IconCard name="Invoices" icon={NavInvoicesIcon} />
            <IconCard name="Communication" icon={NavCommunicationIcon} />
            <IconCard name="Admin" icon={NavAdminIcon} />
          </div>
        </Section>

        {/* Action Icons */}
        <Section title="⚡ Action Icons">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <IconCard name="Edit" icon={ActionEditIcon} />
            <IconCard name="Delete" icon={ActionDeleteIcon} />
            <IconCard name="Plus" icon={ActionPlusIcon} />
            <IconCard name="Search" icon={ActionSearchIcon} />
            <IconCard name="View" icon={ActionViewIcon} />
            <IconCard name="Filter" icon={ActionFilterIcon} />
            <IconCard name="Upload Cloud" icon={UploadCloudIcon} />
            <IconCard name="PDF File" icon={FilePdfIcon} />
            <NotificationCard />
          </div>
        </Section>

        {/* Blockchain Icons - Web3 Payment States */}
        <Section title="🔗 Blockchain Icons - Payment Flow States">
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-cyan-500 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              💡 State Progression Guide
            </h3>
            <p className="text-sm text-slate-700 mb-3">
              Icons represent different states in crypto escrow payment flow:
            </p>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                  1️⃣ CRYPTO_ESCROW_WAITING
                </span>
                <span>→ User initiated transaction (Gray)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono bg-amber-100 px-2 py-1 rounded text-amber-700">
                  2️⃣ DEPOSIT_DETECTED
                </span>
                <span>→ 1 confirmation received (Amber/Pending)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono bg-blue-100 px-2 py-1 rounded text-blue-700">
                  3️⃣ LOCKED
                </span>
                <span>→ 12 confirmations, funds secured (Blue/Trust)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono bg-green-100 px-2 py-1 rounded text-green-700">
                  4️⃣ PAID
                </span>
                <span>→ Funds released to freelancer (Green/Success)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-300 hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <EscrowWaitingIcon
                  className="w-20 h-20 animate-pulse text-gray-600"
                  primaryColor="#64748b"
                  accentColor="#00f0ff"
                />
              </div>
              <h4 className="text-center font-bold text-gray-800 mb-2">
                1. Escrow Waiting
              </h4>
              <div className="space-y-1 text-xs text-gray-700 bg-white p-3 rounded border border-gray-200">
                <p>
                  <strong>InvoiceStatus:</strong> CRYPTO_ESCROW_WAITING
                </p>
                <p>
                  <strong>Visual:</strong> Clock + dashed network nodes
                </p>
                <p>
                  <strong>Meaning:</strong> User clicked `Secure with Escrow`,
                  transaction broadcasting
                </p>
                <p>
                  <strong>Color:</strong> Gray (#64748b) - Unconfirmed
                </p>
                <p>
                  <strong>Animation:</strong> Pulse (shows `processing)
                </p>
              </div>
            </div>

            <div className="bg-amber-50 p-6 rounded-lg border-2 border-amber-400 hover:shadow-lg transition-shadow">
              <div className="flex flex-col gap-4">
                {/* Variant 1: With progress text (default) */}
                <div>
                  <div className="flex justify-center mb-2">
                    <BlockchainPendingIcon
                      className="w-20 h-20 text-amber-600"
                      primaryColor="#f59e0b"
                      accentColor="#00f0ff"
                      showProgress={true}
                      confirmations={1}
                    />
                  </div>
                  <p className="text-center text-xs font-semibold text-amber-700 mb-1">
                    With Progress (showProgress=true)
                  </p>
                </div>

                {/* Variant 2: Without progress text */}
                <div>
                  <div className="flex justify-center mb-2">
                    <BlockchainPendingIcon
                      className="w-20 h-20 text-amber-600"
                      primaryColor="#f59e0b"
                      accentColor="#00f0ff"
                      showProgress={false}
                    />
                  </div>
                  <p className="text-center text-xs font-semibold text-amber-700 mb-1">
                    Without Progress (showProgress=false)
                  </p>
                </div>
              </div>

              <h4 className="text-center font-bold text-amber-800 mb-2 mt-4">
                2. Deposit Detected (1 conf)
              </h4>
              <div className="space-y-2 text-xs text-amber-800 bg-white p-3 rounded border border-amber-300">
                <p>
                  <strong>InvoiceStatus:</strong> DEPOSIT_DETECTED
                </p>
                <p>
                  <strong>Visual:</strong> Hourglass with optional `X/12`
                  indicator
                </p>
                <p>
                  <strong>Meaning:</strong> Transaction on-chain, awaiting
                  confirmations
                </p>
                <p>
                  <strong>Color:</strong> Amber (#f59e0b) - Optimistic UI
                </p>
                <p>
                  <strong>Time:</strong> ~2-3 minutes to LOCKED
                </p>
                <div className="mt-2 pt-2 border-t border-amber-200">
                  <p className="font-semibold mb-1">💡 Design Choice:</p>
                  <p className="text-xs text-amber-700">
                    <strong>With `1/12`:</strong> User transparency, reduces
                    anxiety ✅<br />
                    <strong>Without:</strong> Clean design, less clutter
                    <br />
                    <strong>Default:</strong> showProgress=
                    <code className="bg-amber-100 px-1">true</code>{" "}
                    (recommended)
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-400 hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <CryptographicLockIcon
                  className="w-20 h-20 text-blue-600"
                  primaryColor="#3b82f6"
                  accentColor="#10b981"
                />
              </div>
              <h4 className="text-center font-bold text-blue-800 mb-2">
                3. Cryptographically Locked (12 conf)
              </h4>
              <div className="space-y-1 text-xs text-blue-800 bg-white p-3 rounded border border-blue-300">
                <p>
                  <strong>InvoiceStatus:</strong> LOCKED
                </p>
                <p>
                  <strong>EscrowStatus:</strong> DEPOSITED
                </p>
                <p>
                  <strong>Visual:</strong> Double shield + lock with keyhole
                </p>
                <p>
                  <strong>Meaning:</strong> Funds SAFE in smart contract, work
                  can begin
                </p>
                <p>
                  <strong>Color:</strong> Blue (#3b82f6) - Trust & Security
                </p>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg border-2 border-green-400 hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <FundsReleasedIcon
                  className="w-20 h-20 text-green-600"
                  primaryColor="#10b981"
                  accentColor="#00f0ff"
                />
              </div>
              <h4 className="text-center font-bold text-green-800 mb-2">
                4. Funds Released 💰
              </h4>
              <div className="space-y-1 text-xs text-green-800 bg-white p-3 rounded border border-green-300">
                <p>
                  <strong>InvoiceStatus:</strong> PAID
                </p>
                <p>
                  <strong>EscrowStatus:</strong> RELEASED
                </p>
                <p>
                  <strong>Visual:</strong> Checkmark + animated coins flowing
                </p>
                <p>
                  <strong>Meaning:</strong> Payment transferred to freelancer
                  wallet
                </p>
                <p>
                  <strong>Color:</strong> Green (#10b981) - Success/Terminal
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-purple-300">
            <h3 className="text-lg font-bold text-purple-900 mb-3">
              🔄 Backend Alignment Check
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white p-3 rounded border border-purple-200">
                <p className="font-semibold text-purple-800 mb-2">
                  📋 InvoiceStatus (Java Enum)
                </p>
                <ul className="space-y-1 text-xs text-gray-700 font-mono">
                  <li>✓ DRAFT</li>
                  <li>✓ SENT</li>
                  <li>✓ CRYPTO_ESCROW_WAITING</li>
                  <li>✓ DEPOSIT_DETECTED</li>
                  <li>✓ LOCKED</li>
                  <li>✓ DISPUTED</li>
                  <li>✓ PAID</li>
                  <li>✓ REFUNDED</li>
                  <li>✓ OVERDUE</li>
                  <li>✓ EXPIRED</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded border border-purple-200">
                <p className="font-semibold text-purple-800 mb-2">
                  🔐 EscrowStatus (Java Enum)
                </p>
                <ul className="space-y-1 text-xs text-gray-700 font-mono">
                  <li>✓ NOT_STARTED</li>
                  <li>✓ DEPOSITED</li>
                  <li>✓ RELEASED</li>
                  <li>✓ REFUNDED</li>
                  <li>✓ DISPUTED</li>
                </ul>
                <p className="text-xs text-purple-600 mt-3">
                  <strong>Note:</strong> EscrowStatus tracks smart contract
                  state separately from InvoiceStatus
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <IconCard name="Wallet Connection" icon={WalletIcon} />
            <IconCard name="Network (Polygon)" icon={NetworkPolygonIcon} />
          </div>
        </Section>

        {/* Dynamic Confirmation Progress Demo */}
        <Section title="🔄 Dynamic Blockchain Progress (1→11 Confirmations)">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-lg border-2 border-amber-400">
            <p className="text-sm text-amber-900 mb-4 text-center font-medium">
              ⏳ <strong>DEPOSIT_DETECTED</strong> state updates dynamically as
              blockchain confirmations increase
            </p>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {[1, 2, 4, 6, 8, 11].map((conf) => (
                <div
                  key={conf}
                  className="flex flex-col items-center gap-2 bg-white p-3 rounded border border-amber-300"
                >
                  <BlockchainPendingIcon
                    className="w-16 h-16"
                    primaryColor="#f59e0b"
                    accentColor="#00f0ff"
                    showProgress={true}
                    confirmations={conf}
                  />
                  <span className="text-xs font-bold text-amber-800">
                    {conf} conf
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-white rounded border border-amber-300 text-xs text-amber-900 space-y-1">
              <p>
                📊 <strong>Visual Changes:</strong>
              </p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>
                  <strong>Text:</strong> `1/12` → `2/12` → ... → `11/12` updates
                  real-time
                </li>
                <li>
                  <strong>Sand level:</strong> Top chamber empties as bottom
                  fills (visual progress metaphor)
                </li>
                <li>
                  <strong>Network nodes:</strong> Light up at 4 confirmations &
                  8 confirmations
                </li>
                <li>
                  <strong>At 12 confirmations:</strong> Transitions to{" "}
                  <strong>CryptographicLockIcon</strong> (status becomes LOCKED)
                </li>
              </ul>
            </div>

            <div className="mt-3 flex items-center justify-center gap-3 text-xs">
              <div className="flex items-center gap-2 bg-amber-100 px-3 py-2 rounded border border-amber-400">
                <BlockchainPendingIcon className="w-5 h-5" confirmations={1} />
                <span className="font-semibold">1-11 conf = Pending</span>
              </div>
              <span className="text-amber-700 font-bold">→</span>
              <div className="flex items-center gap-2 bg-blue-100 px-3 py-2 rounded border border-blue-400">
                <CryptographicLockIcon className="w-5 h-5" />
                <span className="font-semibold text-blue-800">
                  12 conf = LOCKED
                </span>
              </div>
            </div>
          </div>
        </Section>

        {/* Audit & Verification */}
        <Section title="✅ Audit & Verification">
          <div className="space-y-6">
            {/* Audit Logging Icon - Active vs Inactive */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-400">
              <h3 className="text-lg font-bold text-green-900 mb-4 text-center">
                📋 Audit Logging System
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active State */}
                <div className="bg-white p-6 rounded-lg border-2 border-green-500 shadow-lg">
                  <div className="flex justify-center mb-4">
                    <AuditLoggingIcon className="w-24 h-24" isActive={true} />
                  </div>
                  <h4 className="text-center font-bold text-green-800 mb-2 text-lg">
                    🟢 ACTIVE - Logging Enabled
                  </h4>
                  <div className="space-y-2 text-xs text-gray-700">
                    <p>
                      <strong>Color:</strong> Green (#10b981)
                    </p>
                    <p>
                      <strong>Status Indicator:</strong> 🟢 Pulsing green dot
                    </p>
                    <p>
                      <strong>Visual Elements:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li>Server logs (stacked lines) - Records visible</li>
                      <li>Eye icon - Monitoring active</li>
                      <li>Checkmark - Verified logging</li>
                      <li>Pulsing animation - Live system</li>
                    </ul>
                    <p className="mt-3 text-green-800 font-semibold">
                      Meaning: Blockchain audit trail actively recording all
                      transactions
                    </p>
                  </div>
                </div>

                {/* Inactive State */}
                <div className="bg-white p-6 rounded-lg border-2 border-gray-400 shadow-lg">
                  <div className="flex justify-center mb-4">
                    <AuditLoggingIcon className="w-24 h-24" isActive={false} />
                  </div>
                  <h4 className="text-center font-bold text-gray-700 mb-2 text-lg">
                    ⚪ INACTIVE - Logging Paused
                  </h4>
                  <div className="space-y-2 text-xs text-gray-600">
                    <p>
                      <strong>Color:</strong> Gray (#94a3b8)
                    </p>
                    <p>
                      <strong>Status Indicator:</strong> ⚪ Static gray dot
                    </p>
                    <p>
                      <strong>Visual Elements:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li>Server logs - Faded/dimmed</li>
                      <li>Eye icon - Monitoring paused</li>
                      <li>No checkmark - Not verifying</li>
                      <li>No animation - System idle</li>
                    </ul>
                    <p className="mt-3 text-gray-700 font-semibold">
                      Meaning: Audit logging temporarily disabled or in
                      maintenance mode
                    </p>
                  </div>
                </div>
              </div>

              {/* Usage Examples */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-300">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  💡 Usage Examples:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-blue-800">
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <strong>✓ Invoice Audit Trail</strong>
                    <p className="mt-1 text-gray-600">
                      Show next to invoice history to indicate blockchain
                      verification is active
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <strong>✓ Smart Contract Events</strong>
                    <p className="mt-1 text-gray-600">
                      Display on escrow page when monitoring contract events
                      (deposit, release, refund)
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <strong>✓ Admin Dashboard</strong>
                    <p className="mt-1 text-gray-600">
                      System status indicator showing if audit logging service
                      is running
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Blockchain Verification Badge (keep existing) */}
            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
              <IconCard
                name="Blockchain Verification Badge"
                icon={BlockchainVerificationBadge}
              />
              <p className="text-xs text-green-700 mt-2 text-center">
                <strong>Usage:</strong> Immutable Audit Trail - Data anchored to
                blockchain
                <br />
                <strong>Meaning:</strong> Cryptographic proof of data integrity
                (merkle root stored on-chain)
                <br />
                <strong>Color:</strong> Green (#10b981) - Verified &
                Tamper-proof
              </p>
            </div>
          </div>
        </Section>

        {/* AI & Status Icons */}
        <Section title="✨ AI & Status Icons">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <IconCard name="AI Magic" icon={AiMagicIcon} />
            <IconCard name="Milestone" icon={MilestoneIcon} />
            <IconCard name="Risk Warning" icon={RiskWarningIcon} />
          </div>
        </Section>

        {/* Controls (Form) Icons) */}
        <Section title="🔧 Controls (Form Icons)">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <IconCard name="Email" icon={EmailIcon} />
            <IconCard name="Password" icon={PasswordIcon} />
            <IconCard name="Visibility" icon={VisibilityOpenIcon} />
            <IconCard name="Visibility Off" icon={VisibilityClosedIcon} />
            <IconCard name="Workspace Domain" icon={WorkspaceDomainIcon} />
          </div>
        </Section>

        <footer className="mt-10 pt-6 border-t text-center text-slate-500 text-sm">
          <strong>Icon Gallery</strong> - Client Hub Design System
          <br />
          Last Updated: February 4, 2026
        </footer>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold text-blue-600 mb-5 pb-2 border-b-2 border-emerald-400 inline-block">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function LogoCard({
  label,
  size,
  showText = true,
}: {
  label: string;
  size: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-sm p-5 rounded-lg border border-white/20">
      <div className="text-emerald-300 text-sm font-semibold mb-3">{label}</div>
      <ClientHubLogo size={size} showText={showText} />
    </div>
  );
}

function IconCard({
  name,
  icon: Icon,
}: {
  name: string;
  icon: React.ComponentType<IconComponentProps>;
}) {
  return (
    <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-5 hover:border-blue-500 hover:shadow-lg transition-all">
      <div className="font-semibold text-slate-800 mb-4 text-sm">{name}</div>
      <div className="space-y-3">
        <IconRow label="Inactive">
          <Icon className="w-4 h-4" />
          <Icon className="w-6 h-6" />
          <Icon className="w-8 h-8" />
        </IconRow>
        <IconRow label="Active">
          <Icon className="w-4 h-4" isActive />
          <Icon className="w-6 h-6" isActive />
          <Icon className="w-8 h-8" isActive />
        </IconRow>
      </div>
    </div>
  );
}

function NotificationCard() {
  return (
    <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-5 hover:border-blue-500 hover:shadow-lg transition-all">
      <div className="font-semibold text-slate-800 mb-4 text-sm">
        Notification Bell{" "}
        <span className="ml-2 text-xs bg-emerald-500 text-white px-2 py-0.5 rounded">
          Conditional
        </span>
      </div>
      <div className="space-y-3">
        <IconRow label="No Notifs">
          <NotificationBellIcon className="w-4 h-4" />
          <NotificationBellIcon className="w-6 h-6" />
          <NotificationBellIcon className="w-8 h-8" />
        </IconRow>
        <IconRow label="Has Notifs">
          <NotificationBellIcon className="w-4 h-4" hasNotifications />
          <NotificationBellIcon className="w-6 h-6" hasNotifications />
          <NotificationBellIcon className="w-8 h-8" hasNotifications />
        </IconRow>
        <IconRow label="Count: 5">
          <NotificationBellIcon
            className="w-4 h-4"
            hasNotifications
            notificationCount={5}
          />
          <NotificationBellIcon
            className="w-6 h-6"
            hasNotifications
            notificationCount={5}
          />
          <NotificationBellIcon
            className="w-8 h-8"
            hasNotifications
            notificationCount={5}
          />
        </IconRow>
        <IconRow label="Count: 9+">
          <NotificationBellIcon
            className="w-4 h-4"
            hasNotifications
            notificationCount={15}
          />
          <NotificationBellIcon
            className="w-6 h-6"
            hasNotifications
            notificationCount={15}
          />
          <NotificationBellIcon
            className="w-8 h-8"
            hasNotifications
            notificationCount={15}
          />
        </IconRow>
      </div>
    </div>
  );
}

function IconRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 p-3 bg-white rounded-lg">
      <div className="text-xs text-slate-600 font-medium min-w-[80px]">
        {label}
      </div>
      <div className="flex items-center gap-5">{children}</div>
    </div>
  );
}
