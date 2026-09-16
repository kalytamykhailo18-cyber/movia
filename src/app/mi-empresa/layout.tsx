import { DashboardNav } from '@/components/dashboard/dashboard-nav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <DashboardNav />
      <div className="min-w-0">{children}</div>
    </div>
  )
}
