import { useEffect, useRef } from 'react'

export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  active = true,
) {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    if (!active) return

    const element = ref.current
    if (!element) return

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',')

    const focusables = Array.from(
      element.querySelectorAll<HTMLElement>(focusableSelectors),
    ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null)

    if (focusables.length > 0) {
      focusables[0].focus()
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Tab') return

      const currentFocusables = Array.from(
        element!.querySelectorAll<HTMLElement>(focusableSelectors),
      ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null)

      if (currentFocusables.length === 0) {
        event.preventDefault()
        return
      }

      const first = currentFocusables[0]
      const last = currentFocusables[currentFocusables.length - 1]

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [active])

  return ref
}
