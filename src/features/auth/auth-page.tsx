import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { isApiError } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useLogin, useRegister } from './use-auth'
import {
  loginSchema,
  registerSchema,
  type LoginValues,
  type RegisterValues,
} from './schemas'

const FOCUS_OUTLINE =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

interface AuthModalProps {
  open: boolean
  mode: 'login' | 'register'
  redirectTo?: string
  onClose?: () => void
}

export function AuthModal({
  open,
  mode,
  redirectTo,
  onClose,
}: AuthModalProps) {
  const navigate = useNavigate()

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      if (onClose) {
        onClose()
      } else {
        handleClose()
      }
    }
  }

  function handleClose() {
    navigate({
      to: '/',
      search: {},
    })
  }

  function handleSwitchMode(targetMode: 'login' | 'register') {
    navigate({
      to: '/',
      search: {
        auth: targetMode === 'login' ? 'login' : 'cadastro',
        redirect: redirectTo,
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[440px] w-full p-0 border-0 sm:border border-surface-dark bg-[#140d0a] sm:bg-card rounded-[28px] sm:rounded-none overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9)] max-h-[95vh] flex flex-col justify-between"
      >
        <div className="relative w-full overflow-y-auto px-6 py-8 sm:px-0 sm:py-0">
          {/* Close Button */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar"
            className={cn(
              'absolute top-4 right-4 z-30 flex size-8 cursor-pointer items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-raised hover:text-highlight',
              FOCUS_OUTLINE,
            )}
          >
            <X className="size-5" strokeWidth={2} />
          </button>

          {/* Logo KURIO em destaque para Mobile */}
          <div className="flex flex-col items-center pt-2 pb-1 sm:hidden">
            <span className="font-mono text-[28px] font-bold tracking-[0.2em] text-cream">
              KURIO
            </span>
          </div>

          {/* Header / Tabs */}
          <div className="flex flex-col items-center pt-4 pb-2 sm:pt-10">
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className={cn(
                  'font-mono text-[20px] font-bold leading-5 transition-colors cursor-pointer',
                  mode === 'login' ? 'text-cream' : 'text-text-secondary hover:text-cream',
                  FOCUS_OUTLINE,
                )}
              >
                Entrar
              </button>
              <div className="hidden sm:block h-5 w-[1px] bg-coral" />
              <button
                type="button"
                onClick={() => handleSwitchMode('register')}
                className={cn(
                  'hidden sm:block font-mono text-[20px] font-medium leading-4 transition-colors cursor-pointer',
                  mode === 'register' ? 'text-highlight' : 'text-foreground hover:text-highlight',
                  FOCUS_OUTLINE,
                )}
              >
                Criar conta
              </button>
            </div>
            <DialogTitle className="sr-only">
              {mode === 'login' ? 'Entrar' : 'Criar conta'}
            </DialogTitle>
            <p className="mt-2 max-w-[404px] px-4 text-center font-mono text-[13px] font-normal leading-4 text-text-secondary sm:text-foreground">
              {mode === 'login'
                ? 'Entre para gerenciar sua carteira, coleção e perfil de criador.'
                : 'Cadastre-se para começar a colecionar e negociar artes digitais.'}
            </p>
          </div>

          {/* Form Content */}
          {mode === 'login' ? (
            <LoginFormContent redirectTo={redirectTo} onSuccessClose={handleClose} />
          ) : (
            <RegisterFormContent redirectTo={redirectTo} onSuccessClose={handleClose} />
          )}

          {/* Bottom accent stripe */}
          <div className="h-[8px] w-full bg-primary mt-2" />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function LoginFormContent({
  redirectTo,
  onSuccessClose,
}: {
  redirectTo?: string
  onSuccessClose: () => void
}) {
  const [showPassword, setShowPassword] = useState(false)
  const login = useLogin()

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const formError = login.error
    ? isApiError(login.error)
      ? login.error.message
      : 'Erro ao entrar. Verifique suas credenciais e tente novamente.'
    : null

  function onSubmit(values: LoginValues) {
    login.mutate(values, {
      onSuccess: () => {
        toast.success('Bem-vindo de volta à Kurio.')
        if (redirectTo && redirectTo.startsWith('/') && !redirectTo.includes('login') && !redirectTo.includes('cadastro')) {
          window.location.assign(redirectTo)
        } else {
          onSuccessClose()
        }
      },
      onError: (err) => {
        if (isApiError(err) && err.details) {
          Object.entries(err.details).forEach(([field, msg]) => {
            form.setError(field as any, { message: String(msg) })
          })
        }
      },
    })
  }

  function fillTestCredentials() {
    form.setValue('email', 'nova@kurio.test', { shouldValidate: true })
    form.setValue('password', 'kurio123', { shouldValidate: true })
    form.clearErrors()
    if (login.error) login.reset()
  }

  return (
    <>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="mt-4 flex flex-col items-center px-6 sm:px-[80px]"
      >
        {/* Email Field */}
        <div className="w-full max-w-[340px]">
          <label htmlFor="modal-email" className="sr-only">
            E-mail
          </label>
          <input
            id="modal-email"
            type="email"
            placeholder="contato@email.com"
            aria-label="E-mail"
            autoComplete="email"
            aria-invalid={Boolean(form.formState.errors.email)}
            aria-describedby={
              form.formState.errors.email ? 'login-email-error' : undefined
            }
            className={cn(
              'h-[40px] w-full rounded-[5px] border border-field bg-transparent px-4 font-mono text-[14px] text-foreground placeholder:text-text-secondary focus:border-primary focus:outline-none transition-colors',
              form.formState.errors.email && 'border-error',
            )}
            {...form.register('email', {
              onChange: () => {
                if (form.formState.errors.email) form.clearErrors('email')
                if (login.error) login.reset()
              },
            })}
          />
          {form.formState.errors.email ? (
            <p
              id="login-email-error"
              role="alert"
              className="mt-1 font-mono text-xs text-error"
            >
              {form.formState.errors.email.message}
            </p>
          ) : null}
        </div>

        {/* Password Field */}
        <div className="mt-3 w-full max-w-[340px]">
          <label htmlFor="modal-password" className="sr-only">
            Senha
          </label>
          <div className="relative">
            <input
              id="modal-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="***********"
              aria-label="Senha"
              autoComplete="current-password"
              aria-invalid={Boolean(form.formState.errors.password)}
              aria-describedby={
                form.formState.errors.password ? 'login-password-error' : undefined
              }
              className={cn(
                'h-[40px] w-full rounded-[5px] border border-field bg-transparent pr-10 pl-4 font-mono text-[16px] text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none transition-colors',
                form.formState.errors.password && 'border-error',
              )}
              {...form.register('password', {
                onChange: () => {
                  if (form.formState.errors.password)
                    form.clearErrors('password')
                  if (login.error) login.reset()
                },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-text-secondary transition-colors hover:text-foreground"
              aria-label={showPassword ? 'Ocultar' : 'Exibir'}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {form.formState.errors.password ? (
            <p
              id="login-password-error"
              role="alert"
              className="mt-1 font-mono text-xs text-error"
            >
              {form.formState.errors.password.message}
            </p>
          ) : null}
        </div>

        {/* Forgot Password */}
        <div className="mt-2 flex w-full max-w-[340px] justify-end">
          <button
            type="button"
            onClick={fillTestCredentials}
            className="font-mono text-[14px] leading-4 text-highlight transition-colors hover:underline cursor-pointer"
          >
            Esqueceu a senha?
          </button>
        </div>

        {/* General Form Error */}
        {formError ? (
          <p
            role="alert"
            className="mt-3 w-full max-w-[340px] text-center font-mono text-xs text-error"
          >
            {formError}
          </p>
        ) : null}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={login.isPending}
          className={cn(
            'mt-5 flex h-[50px] w-full max-w-[340px] cursor-pointer items-center justify-center rounded-[8px] sm:rounded-[5px] bg-[#d28a4c] font-mono text-[16px] font-bold text-ink transition-colors hover:bg-highlight disabled:opacity-50 shadow-md',
            FOCUS_OUTLINE,
          )}
        >
          {login.isPending ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      {/* Divider */}
      <div className="mt-5 flex w-full items-center gap-3 px-6 sm:px-12">
        <div className="h-[1px] flex-1 bg-field" />
        <span className="whitespace-nowrap font-mono text-[13px] leading-4 text-text-secondary sm:text-foreground">
          Ou continue com
        </span>
        <div className="h-[1px] flex-1 bg-field" />
      </div>

      {/* Social Logins and Test Account */}
      <div className="mt-4 flex w-full flex-col items-center gap-3 px-6 pb-4 sm:px-[80px]">
        {/* Google */}
        <button
          type="button"
          onClick={fillTestCredentials}
          className="flex h-[46px] w-full max-w-[340px] cursor-pointer items-center justify-center gap-3 rounded-[8px] sm:rounded-[5px] border border-field/80 bg-transparent font-mono text-[14px] font-medium text-sand transition-colors hover:border-primary/60 hover:text-foreground"
        >
          <svg className="size-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="var(--color-brand-google-blue)"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="var(--color-brand-google-green)"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="var(--color-brand-google-yellow)"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="var(--color-brand-google-red)"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continuar com Google</span>
        </button>

        {/* Facebook */}
        <button
          type="button"
          onClick={fillTestCredentials}
          className="flex h-[46px] w-full max-w-[340px] cursor-pointer items-center justify-center gap-3 rounded-[8px] sm:rounded-[5px] border border-field/80 bg-transparent font-mono text-[14px] font-medium text-sand transition-colors hover:border-primary/60 hover:text-foreground"
        >
          <svg
            className="size-5 shrink-0"
            viewBox="0 0 24 24"
            fill="var(--color-brand-facebook)"
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span>Continuar com Facebook</span>
        </button>

        {/* Link para criar conta mobile */}
        <div className="mt-4 flex items-center justify-center sm:hidden">
          <p className="font-mono text-[14px] text-cream">
            Novo na Kurio?{' '}
            <span className="text-[#d28a4c] font-bold">Crie uma conta</span>
          </p>
        </div>
      </div>
    </>
  )
}

function RegisterFormContent({
  redirectTo,
  onSuccessClose,
}: {
  redirectTo?: string
  onSuccessClose: () => void
}) {
  const [showPassword, setShowPassword] = useState(false)
  const register = useRegister()

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const formError = register.error
    ? isApiError(register.error)
      ? register.error.message
      : 'Erro ao criar conta.'
    : null

  function onSubmit(values: RegisterValues) {
    register.mutate(values, {
      onSuccess: () => {
        toast.success('Seu perfil de colecionador foi criado.')
        if (redirectTo && redirectTo.startsWith('/') && redirectTo !== '/login' && redirectTo !== '/cadastro') {
          window.location.assign(redirectTo)
        } else {
          onSuccessClose()
        }
      },
      onError: (err) => {
        if (isApiError(err) && err.details) {
          Object.entries(err.details).forEach(([field, msg]) => {
            form.setError(field as any, { message: String(msg) })
          })
        }
      },
    })
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="mt-4 flex flex-col items-center px-6 pb-6 sm:px-[80px]"
    >
      <div className="w-full max-w-[340px] space-y-3">
        <div>
          <label htmlFor="modal-reg-username" className="sr-only">
            Nome de usuário
          </label>
          <input
            id="modal-reg-username"
  autoComplete="username"
  type="text"
  placeholder="Nome de usuário"
            className={cn(
              'h-[40px] w-full rounded-[5px] border border-field bg-transparent px-4 font-mono text-[14px] text-foreground placeholder:text-text-secondary focus:border-primary focus:outline-none transition-colors',
              form.formState.errors.username && 'border-error',
            )}
            {...form.register('username')}
          />
          {form.formState.errors.username ? (
            <p className="mt-1 font-mono text-xs text-error">
              {form.formState.errors.username.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="modal-reg-email" className="sr-only">
            E-mail
          </label>
          <input
            id="modal-reg-email"
            name="email"
            autoComplete="email"
            type="email"
            placeholder="contato@email.com"
            className={cn(
              'h-[40px] w-full rounded-[5px] border border-field bg-transparent px-4 font-mono text-[14px] text-foreground placeholder:text-text-secondary focus:border-primary focus:outline-none transition-colors',
              form.formState.errors.email && 'border-error',
            )}
            {...form.register('email')}
          />
          {form.formState.errors.email ? (
            <p className="mt-1 font-mono text-xs text-error">
              {form.formState.errors.email.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="modal-reg-password" className="sr-only">
            Senha
          </label>
          <div className="relative">
            <input
              id="modal-reg-password"
              name="password"
              autoComplete="new-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha (mín. 8 caracteres)"
              className={cn(
                'h-[40px] w-full rounded-[5px] border border-field bg-transparent pr-10 pl-4 font-mono text-[16px] text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none transition-colors',
                form.formState.errors.password && 'border-error',
              )}
              {...form.register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-text-secondary transition-colors hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {form.formState.errors.password ? (
            <p className="mt-1 font-mono text-xs text-error">
              {form.formState.errors.password.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="modal-reg-confirm" className="sr-only">
            Confirmar Senha
          </label>
          <input
            id="modal-reg-confirm"
            name="confirmPassword"
            autoComplete="new-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirme sua senha"
            className={cn(
              'h-[40px] w-full rounded-[5px] border border-field bg-transparent px-4 font-mono text-[16px] text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none transition-colors',
              form.formState.errors.confirmPassword && 'border-error',
            )}
            {...form.register('confirmPassword')}
          />
          {form.formState.errors.confirmPassword ? (
            <p className="mt-1 font-mono text-xs text-error">
              {form.formState.errors.confirmPassword.message}
            </p>
          ) : null}
        </div>
      </div>

      {formError ? (
        <p className="mt-3 font-mono text-xs text-error">{formError}</p>
      ) : null}

      <button
        type="submit"
        disabled={register.isPending}
        className={cn(
          'mt-5 flex h-[45px] w-full max-w-[340px] cursor-pointer items-center justify-center rounded-[5px] bg-primary font-mono text-[16px] font-bold text-ink transition-colors hover:bg-highlight disabled:opacity-50',
          FOCUS_OUTLINE,
        )}
      >
        {register.isPending ? 'Criando conta…' : 'Criar conta'}
      </button>
    </form>
  )
}

// Fallback AuthPage component keeping backward compatibility
export function AuthPage({
  mode,
  redirectTo,
}: {
  mode: 'login' | 'register'
  redirectTo?: string
}) {
  return <AuthModal open={true} mode={mode} redirectTo={redirectTo} />
}
