import { useState } from 'react'
import { CustomerRolesProvider } from './store'
import UsersTab from './components/UsersTab'
import RolesTab from './components/RolesTab'
import type { JSX } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function CustomerRolesPage(): JSX.Element {
  const [tab, setTab] = useState<'users' | 'roles'>('users')

  return (
    <div className="p-6 !pt-0">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-6">Customer Roles</h1>

      {/* Body */}
      <section className="py-6">
        <CustomerRolesProvider>
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as 'users' | 'roles')}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="roles">Create new role</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <UsersTab />
            </TabsContent>

            <TabsContent value="roles">
              <RolesTab />
            </TabsContent>
          </Tabs>
        </CustomerRolesProvider>
      </section>
    </div>
  )
}
