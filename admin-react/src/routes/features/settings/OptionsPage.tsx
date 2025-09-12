// /src/routes/features/settings/OptionsPage.tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'

import InnerTabs from './components/InnerTabs'
import Shell from './components/Shell'
import TopBar from './components/TopBar'
import { SECTIONS } from './fields'
import { optionsSchema } from './schema'
import { fetchOptions } from './store'

import type { JSX } from 'react'
import type { OptionsFormValues } from './schema'
import type { Resolver } from 'react-hook-form'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

export default function OptionsPage(): JSX.Element {
  const dispatch = useAppDispatch()
  const apiErr = useAppSelector((s) => s.settings.error)
  const data = useAppSelector((s) => s.settings.data)

  // fetch once on mount
  useEffect(() => {
    dispatch(fetchOptions())
  }, [dispatch])

  const form = useForm<OptionsFormValues>({
    defaultValues: data,
    resolver: zodResolver(
      optionsSchema,
    ) as unknown as Resolver<OptionsFormValues>,
    mode: 'onChange',
  })

  // keep form in sync after load/save
  useEffect(() => {
    form.reset(data)
  }, [data, form])

  const [active, setActive] = useState(SECTIONS[0].id)

  return (
    <div className="p-6">
      <section className="py-6 !pt-0">
        <FormProvider {...form}>
          <div className="space-y-4">
            <TopBar />
            <Shell sections={SECTIONS} activeId={active} onSelect={setActive}>
              <>
                {apiErr && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {apiErr}
                  </div>
                )}
                {SECTIONS.filter((s) => s.id === active).map((s) => (
                  <InnerTabs key={s.id} section={s} />
                ))}
              </>
            </Shell>
          </div>
        </FormProvider>
      </section>
    </div>
  )
}
