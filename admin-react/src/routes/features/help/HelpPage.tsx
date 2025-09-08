// /features/help/HelpPage.tsx
import React from 'react'
import { MessageCircleQuestion } from 'lucide-react'

import HelpHero from './components/HelpHero'
import HelpSearch from './components/HelpSearch'
import GuidesGrid from './components/GuidesGrid'
import FaqAccordion from './components/FaqAccordion'
import ShortcutsTable from './components/ShortcutsTable'
import ChangelogList from './components/ChangelogList'
import ContactSupportDialog from './components/ContactSupportDialog'
import type { JSX } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

// simple query context so search filters all sections
export const HelpQueryContext = React.createContext<{
  query: string
  setQuery: (v: string) => void
}>({
  query: '',
  setQuery: () => {},
})

export default function HelpPage(): JSX.Element {
  const [query, setQuery] = React.useState<string>('')
  const [contactOpen, setContactOpen] = React.useState<boolean>(false)

  return (
    <div className="p-6">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-6">Help & Docs</h1>

      {/* Body */}
      <section className="py-6">
        <HelpQueryContext.Provider value={{ query, setQuery }}>
          <div className="mb-6 space-y-4">
            <HelpHero onContact={() => setContactOpen(true)} />
            <HelpSearch />
          </div>

          <Tabs defaultValue="guides" className="space-y-4">
            <TabsList>
              <TabsTrigger value="guides">Guides</TabsTrigger>
              <TabsTrigger value="faqs">FAQs</TabsTrigger>
              <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
              <TabsTrigger value="changelog">Changelog</TabsTrigger>
            </TabsList>

            <TabsContent value="guides">
              <GuidesGrid />
            </TabsContent>

            <TabsContent value="faqs">
              <FaqAccordion />
            </TabsContent>

            <TabsContent value="shortcuts">
              <ShortcutsTable />
            </TabsContent>

            <TabsContent value="changelog">
              <ChangelogList />
            </TabsContent>
          </Tabs>

          <div className="mt-8">
            <Button onClick={() => setContactOpen(true)}>
              <MessageCircleQuestion className="mr-2 h-4 w-4" />
              Contact support
            </Button>
          </div>

          <ContactSupportDialog
            open={contactOpen}
            onOpenChange={setContactOpen}
          />
        </HelpQueryContext.Provider>
      </section>
    </div>
  )
}
