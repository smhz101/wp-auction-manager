// /src/routes/features/settings/components/TopBar.tsx
import { Loader2, RotateCcw, Save, Undo2 } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { fetchOptions, saveOptions } from '../store'

import type { JSX } from 'react'
import type { OptionsFormValues } from '../schema'
import type { FlatOptions } from '../types'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Button } from '@/components/ui/button'

export default function TopBar(): JSX.Element {
  const form = useFormContext<OptionsFormValues>()
  const dispatch = useAppDispatch()

  const load = useAppSelector((s) => s.settings.loadState)
  const save = useAppSelector((s) => s.settings.saveState)

  const isLoading = load === 'loading'
  const isSaving = save === 'saving'

  return (
    <header
      className="mb-6 flex items-center justify-between"
      aria-busy={isLoading || isSaving}
    >
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          onClick={() => form.reset()}
          disabled={isSaving || isLoading}
          title="Reset local form changes"
        >
          <Undo2 className="mr-2 h-4 w-4" />
          Reset
        </Button>

        <Button
          variant="outline"
          onClick={() => dispatch(fetchOptions())}
          disabled={isLoading || isSaving}
          title="Reload settings from server"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'Loading…' : 'Reload'}
        </Button>

        <Button
          onClick={form.handleSubmit((values) =>
            dispatch(saveOptions(values as unknown as FlatOptions)),
          )}
          disabled={isSaving}
          title="Save changes"
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isSaving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </header>
  )
}
