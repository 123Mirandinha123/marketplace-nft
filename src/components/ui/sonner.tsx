import { Toaster as Sonner, type ToasterProps } from 'sonner'

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            'border border-line bg-card text-cream shadow-lg shadow-black/20',
          description: 'text-tan',
          actionButton: 'bg-primary text-primary-foreground',
          cancelButton: 'bg-secondary text-secondary-foreground',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
