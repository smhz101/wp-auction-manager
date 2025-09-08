// /features/settings/OptionsPage.tsx

import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { Provider } from 'react-redux'
import { useEffect, useMemo, useState } from 'react'

import InnerTabs from './components/InnerTabs'
import Shell from './components/Shell'
import TopBar from './components/TopBar'
import { SECTIONS } from './fields'
import { optionsSchema } from './schema'
import { fetchOptions, makeStore, useAppSelector } from './store'

import type { JSX } from 'react'
import type { OptionsApiConfig } from './types'
import type { OptionsFormValues } from './schema'
import type { Resolver } from 'react-hook-form'

function Content(): JSX.Element {
  const apiErr = useAppSelector((s) => s.options.error)
  const data = useAppSelector((s) => s.options.data)

  const form = useForm<OptionsFormValues>({
    defaultValues: data,
    resolver: zodResolver(
      optionsSchema,
    ) as unknown as Resolver<OptionsFormValues>,
    mode: 'onChange',
  })

  // keep form in sync when data changes (after load/save)
  useEffect(() => {
    form.reset(data)
  }, [data])

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

export default function OptionsPage(props: {
  api: OptionsApiConfig
}): JSX.Element {
  const store = useMemo(() => makeStore(props.api), [props.api])

  // fetch once on mount
  useEffect(() => {
    store.dispatch(fetchOptions() as any)
  }, [store])

  return (
    <Provider store={store}>
      <Content />
    </Provider>
  )
}
