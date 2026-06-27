import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardNav from './nav'
import { headers } from 'next/headers'
import ChatbotDMS from '@/components/ChatbotDMS'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'
  const name = user.user_metadata?.name ?? user.email?.split('@')[0] ?? ''
  const email = user.email ?? ''
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? headersList.get('referer') ?? ''
  const isPageBuilder = pathname.includes('page-builder')

  if (isAdmin) {
    if (isPageBuilder) {
      return <>{children}</>
    }
    return (
      <div style={{ minHeight: '100vh', display: 'flex', background: '#f5f5f5' }}>
        <DashboardNav name={name} email={email} />
        <main style={{ flex: 1, overflow: 'auto' }} className="pt-14 md:pt-0">
          {children}
        </main>
        <ChatbotDMS />
      </div>
    )
  }
  return <>{children}</>
}
