// /src/lib/api/boot.ts

export type WPBoot = {
  /** e.g. '/wp-json/' */
  restRoot?: string
  /** optional namespace if you want it: 'wpam/v1' */
  namespace?: string
  /** wp nonce for REST auth */
  nonce?: string
  /** optional extras you localized */
  siteUrl?: string
  currentUser?: { id?: number; email?: string; name?: string }
}

/**
 * Read the boot payload injected by PHP:
 *  - Preferred: window.WPAM_BOOT (your plugin)
 *  - Fallback: window.wpApiSettings (WP core)
 */
export function getBoot(): WPBoot {
  if (typeof window === 'undefined') return {}

  const w = window as unknown as Record<string, any>

  // Preferred: your plugin payload
  if (w.WPAM_BOOT && typeof w.WPAM_BOOT === 'object') {
    const b = w.WPAM_BOOT as Record<string, any>
    return {
      restRoot:
        (b.restRoot as string) ?? (b.rest?.root as string) ?? '/wp-json/',
      namespace: (b.namespace as string) ?? (b.rest?.namespace as string),
      nonce: (b.nonce as string) ?? undefined,
      siteUrl: (b.siteUrl as string) ?? undefined,
      currentUser: (b.currentUser as WPBoot['currentUser']) ?? undefined,
    }
  }

  // Fallback: WP core global
  if (w.wpApiSettings && typeof w.wpApiSettings === 'object') {
    const core = w.wpApiSettings as Record<string, any>
    return {
      restRoot: (core.root as string) ?? '/wp-json/',
      nonce: core.nonce as string | undefined,
    }
  }

  return {}
}
