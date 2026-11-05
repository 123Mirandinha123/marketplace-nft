import { useState, useRef } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  Activity,
  Download,
  Headphones,
  Heart,
  LogOut,
  Tag,
  User as UserIcon,
  Wallet as WalletIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { isApiError } from '@/lib/api'
import {
  useChangePassword,
  useLogout,
  useSession,
  useUpdateProfile,
} from '@/features/auth/use-auth'

const MAX_AVATAR_SIZE = 262144 // 256 KB
const ALLOWED_AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const ENS_DOMAINS = ['.eth', '.crypto', '.sol'] as const

const LABEL_ROW = 'flex items-center font-mono text-[15px] leading-[15px] text-foreground'
const REQUIRED_STAR = (
  <span className="ml-0.5 font-mono text-[22px] leading-[15px] text-coral">*</span>
)
const FIELD_COL = 'flex w-full flex-col gap-1 sm:w-[417px]'
const ROW_WRAP = 'flex w-full flex-col justify-between gap-3 sm:flex-row sm:gap-[28px]'

export function ProfilePage() {
  const { data: user, isLoading } = useSession()
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form states
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [ensName, setEnsName] = useState('')
  const [ensDomain, setEnsDomain] = useState<string>('.eth')
  const [walletNickname, setWalletNickname] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)

  // Initial populate
  const [initialized, setInitialized] = useState(false)
  if (user && !initialized) {
    setName(user.displayName || '')
    setUsername(user.username || '')
    setEmail(user.email || '')
    if (user.ensName) {
      const match = user.ensName.match(/^(.*?)(\.(?:eth|crypto|sol))$/)
      if (match) {
        setEnsName(match[1])
        setEnsDomain(match[2])
      } else {
        setEnsName(user.ensName)
      }
    }
    setWalletNickname(user.walletAlias || '')
    setAvatarUrl(user.avatarUrl || null)
    setInitialized(true)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError('Use uma imagem PNG, JPEG ou WebP.')
      toast.error('Use uma imagem PNG, JPEG ou WebP.')
      return
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError('A imagem deve ter no máximo 256 KB.')
      toast.error('A imagem deve ter no máximo 256 KB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setAvatarUrl(result)
      setAvatarError(null)
    }
    reader.onerror = () => {
      setAvatarError('Erro ao ler arquivo de imagem.')
      toast.error('Erro ao ler arquivo de imagem.')
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSuccess(null)

    if (username.trim() && !/^[a-z0-9_.-]{3,20}$/.test(username.trim())) {
      toast.error('Nome de usuário deve ter 3 a 20 caracteres (minúsculas, números, ponto ou _).')
      return
    }

    try {
      const fullEns = ensName.trim() ? `${ensName.trim()}${ensDomain}` : undefined
      await updateProfile.mutateAsync({
        displayName: name.trim() || undefined,
        username: username.trim() || undefined,
        email: email.trim() || undefined,
        ensName: fullEns,
        walletAlias: walletNickname.trim() || undefined,
        avatarUrl: avatarUrl || undefined,
      })
      setProfileSuccess('Dados atualizados com sucesso.')
      toast.success('Perfil salvo com sucesso!')
    } catch (err) {
      toast.error(isApiError(err) ? err.message : 'Falha ao atualizar dados.')
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)

    if (!currentPassword) {
      setPasswordError('Informe a senha atual.')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }

    try {
      await changePassword.mutateAsync({
        currentPassword,
        newPassword,
      })
      setPasswordSuccess('Senha alterada com sucesso.')
      setCurrentPassword('')
      setNewPassword('')
      toast.success('Senha alterada com sucesso!')
    } catch (err) {
      const msg = isApiError(err) ? err.message : 'Falha ao alterar senha.'
      setPasswordError(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1248px] flex-col px-4 py-6 pb-24 sm:px-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start gap-5 sm:gap-[28px] lg:flex-row">
        <AccountSidebar active="profile" />

        <section
          aria-label="Dados do perfil"
          className="flex w-full flex-col gap-6 sm:gap-8 lg:min-w-0 lg:flex-1"
        >
          {/* Header */}
          <div className="flex w-full flex-col gap-1.5 sm:gap-2">
            <h1 className="font-mono text-[17px] font-bold leading-[16px] text-foreground">
              Perfil do colecionador
            </h1>
            <p className="font-mono text-[14px] font-normal leading-[15px] text-text-secondary">
              Gerencie suas informações pessoais, identidade na Web3 e segurança da conta.
            </p>
          </div>

          {isLoading ? (
            <p role="status" className="font-mono text-sm text-text-secondary">
              Carregando perfil…
            </p>
          ) : (
            <form onSubmit={handleSaveProfile} noValidate className="flex w-full flex-col gap-6 sm:gap-8">
              {/* Linha 1: Nome de exibição + Nome de usuário */}
              <div className={ROW_WRAP}>
                <div className={FIELD_COL}>
                  <label htmlFor="name" className={LABEL_ROW}>
                    Nome de exibição
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo ou apelido público"
                    className="h-10 w-full rounded border border-field bg-transparent px-3 font-mono text-[14px] text-foreground placeholder:text-text-secondary/60 focus-visible:border-primary"
                  />
                </div>

                <div className={FIELD_COL}>
                  <label htmlFor="username" className={LABEL_ROW}>
                    Nome de usuário
                  </label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ex: anderson.silva"
                    className="h-10 w-full rounded border border-field bg-transparent px-3 font-mono text-[14px] text-foreground placeholder:text-text-secondary/60 focus-visible:border-primary"
                  />
                  <p className="font-mono text-[11px] text-text-secondary">
                    3 a 20 caracteres: letras minúsculas, números, ponto ou _.
                  </p>
                </div>
              </div>

              {/* Linha 2: E-mail + Nome ENS */}
              <div className={ROW_WRAP}>
                <div className={FIELD_COL}>
                  <label htmlFor="email" className={LABEL_ROW}>
                    E-mail {REQUIRED_STAR}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="h-10 w-full rounded border border-field bg-transparent px-3 font-mono text-[14px] text-foreground placeholder:text-text-secondary/60 focus-visible:border-primary"
                  />
                </div>

                <div className={FIELD_COL}>
                  <label htmlFor="ensName" className={LABEL_ROW}>
                    Nome ENS
                  </label>
                  <div className="flex w-full gap-2">
                    <Input
                      id="ensName"
                      value={ensName}
                      onChange={(e) => setEnsName(e.target.value)}
                      placeholder="seunome"
                      className="h-10 flex-1 rounded border border-field bg-transparent px-3 font-mono text-[14px] text-foreground placeholder:text-text-secondary/60 focus-visible:border-primary"
                    />
                    <select
                      aria-label="Domínio ENS"
                      value={ensDomain}
                      onChange={(e) => setEnsDomain(e.target.value)}
                      className="h-10 shrink-0 cursor-pointer rounded border border-field bg-surface-card px-3 font-mono text-[14px] text-foreground focus-visible:border-primary focus-visible:outline-none"
                    >
                      {ENS_DOMAINS.map((domain) => (
                        <option key={domain} value={domain}>
                          {domain}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Linha 3: Apelido da carteira + Avatar inline (mesma linha) */}
              <div className={ROW_WRAP}>
                <div className={FIELD_COL}>
                  <label htmlFor="walletNickname" className={LABEL_ROW}>
                    Apelido da carteira
                  </label>
                  <Input
                    id="walletNickname"
                    value={walletNickname}
                    onChange={(e) => setWalletNickname(e.target.value)}
                    placeholder="Minha Carteira Principal"
                    className="h-10 w-full rounded border border-field bg-transparent px-3 font-mono text-[14px] text-foreground placeholder:text-text-secondary/60 focus-visible:border-primary"
                  />
                </div>

                <div className={FIELD_COL}>
                  <label className={LABEL_ROW}>Foto de perfil</label>
                  <div className="flex h-10 w-full items-center gap-3">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-surface-dark bg-surface-raised font-mono text-sm font-bold text-foreground">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Avatar do colecionador"
                          className="size-full object-cover"
                        />
                      ) : (
                        (name || user?.displayName || '?').slice(0, 1).toUpperCase()
                      )}
                    </span>

                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-10 font-mono text-[13px]"
                    >
                      Alterar avatar
                    </Button>

                    {avatarUrl && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setAvatarError(null)
                          setAvatarUrl(null)
                        }}
                        className="h-10 font-mono text-[13px] text-text-secondary hover:text-coral"
                      >
                        Remover
                      </Button>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      aria-label="Selecionar avatar"
                      onChange={handleAvatarChange}
                    />
                  </div>
                  {avatarError && (
                    <p role="alert" className="font-mono text-xs text-coral">
                      {avatarError}
                    </p>
                  )}
                  <p className="font-mono text-[11px] text-text-secondary">
                    PNG, JPEG ou WebP, até 256 KB.
                  </p>
                </div>
              </div>

              {/* Botão Salvar dados */}
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="h-[42px] w-full rounded bg-primary font-mono text-[15px] font-bold text-surface-card transition-colors hover:bg-primary-hover sm:w-[220px]"
                >
                  {updateProfile.isPending ? 'Salvando…' : 'Salvar dados'}
                </Button>

                {profileSuccess && (
                  <p role="status" className="font-mono text-sm text-lime">
                    {profileSuccess}
                  </p>
                )}
              </div>
            </form>
          )}

          {/* Seção Alterar senha */}
          <div className="mt-8 flex w-full flex-col gap-4 border-t border-surface-dark pt-8">
            <div className="flex w-full flex-col gap-1">
              <h2 className="font-mono text-[17px] font-bold leading-[16px] text-foreground">
                Alterar senha
              </h2>
              <p className="font-mono text-[14px] font-normal leading-[15px] text-text-secondary">
                Para sua segurança, informe sua senha atual antes de cadastrar uma nova senha.
              </p>
            </div>

            <form onSubmit={handleChangePassword} noValidate className="flex w-full flex-col gap-6">
              <div className={ROW_WRAP}>
                <div className={FIELD_COL}>
                  <label htmlFor="currentPassword" className={LABEL_ROW}>
                    Senha atual {REQUIRED_STAR}
                  </label>
                  <Input
                    id="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Digite sua senha atual"
                    className="h-10 w-full rounded border border-field bg-transparent px-3 font-mono text-[14px] text-foreground placeholder:text-text-secondary/60 focus-visible:border-primary"
                  />
                </div>

                <div className={FIELD_COL}>
                  <label htmlFor="newPassword" className={LABEL_ROW}>
                    Nova senha {REQUIRED_STAR}
                  </label>
                  <Input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo de 6 caracteres"
                    className="h-10 w-full rounded border border-field bg-transparent px-3 font-mono text-[14px] text-foreground placeholder:text-text-secondary/60 focus-visible:border-primary"
                  />
                  <p className="font-mono text-[11px] text-text-secondary">
                    Mínimo de 6 caracteres.
                  </p>
                </div>
              </div>

              {passwordError && (
                <p role="alert" className="font-mono text-sm text-coral">
                  {passwordError}
                </p>
              )}

              {passwordSuccess && (
                <p role="status" className="font-mono text-sm text-lime">
                  {passwordSuccess}
                </p>
              )}

              <Button
                type="submit"
                disabled={changePassword.isPending}
                className="h-[42px] w-full rounded border border-field bg-surface-card font-mono text-[15px] font-bold text-foreground transition-colors hover:bg-white/5 sm:w-[220px]"
              >
                {changePassword.isPending ? 'Alterando…' : 'Alterar senha'}
              </Button>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}

export function AccountSidebar({
  active = 'profile',
}: {
  active?: 'profile' | 'wallets'
}) {
  const logout = useLogout()
  const navigate = useNavigate()

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => {
        toast.success('Você saiu da sua conta.')
        navigate({ to: '/' })
      },
      onError: () => toast.error('Não foi possível encerrar a sessão.'),
    })
  }

  const getItemClass = (tabName: 'profile' | 'wallets') =>
    active === tabName
      ? 'box-border flex h-[45px] w-full items-center gap-3 border-l-[6px] border-primary px-4 bg-white/5 font-mono text-[15px] font-bold text-highlight'
      : 'flex h-[45px] w-full items-center gap-4 px-4 font-mono text-[15px] text-highlight transition-colors hover:bg-white/5'

  return (
    <aside
      aria-label="Menu da conta"
      className="flex w-full shrink-0 flex-col bg-surface-card py-2 rounded-[16px] border border-surface-dark lg:w-[310px]"
    >
      <div className="flex h-[36px] w-full items-center px-[10px]">
        <h2 className="font-mono text-[18px] font-bold leading-[16px] text-foreground">
          Meu perfil
        </h2>
      </div>

      <nav className="flex w-full flex-col">
        {/* Dados do perfil */}
        <Link
          to="/perfil"
          aria-current={active === 'profile' ? 'page' : undefined}
          className={getItemClass('profile')}
        >
          <UserIcon className="size-[18px] shrink-0 text-text-secondary" />
          <span className="font-mono text-[15px] leading-[45px] text-highlight">
            Dados do perfil
          </span>
        </Link>

        {/* Carteiras */}
        <Link
          to="/carteiras"
          aria-current={active === 'wallets' ? 'page' : undefined}
          className={getItemClass('wallets')}
        >
          <WalletIcon className="size-[20px] shrink-0 text-highlight" />
          <span className="font-mono text-[15px] leading-[45px] text-highlight">
            Carteiras
          </span>
        </Link>

        {/* Atividade (Em breve) */}
        <button
          type="button"
          aria-disabled="true"
          title="Em breve"
          className="flex h-[45px] w-full cursor-not-allowed items-center gap-3 px-4 text-left opacity-70"
        >
          <Activity className="size-[18px] shrink-0 text-sand" />
          <span className="font-mono text-[15px] leading-[45px] text-highlight">
            Atividade
          </span>
          <span className="sr-only"> (em breve)</span>
        </button>

        {/* Lista de interesse (Em breve) */}
        <button
          type="button"
          aria-disabled="true"
          title="Em breve"
          className="flex h-[45px] w-full cursor-not-allowed items-center gap-3 px-4 text-left opacity-70"
        >
          <Heart className="size-[16px] shrink-0 text-sand" />
          <span className="font-mono text-[15px] leading-[45px] text-highlight">
            Lista de interesse
          </span>
          <span className="sr-only"> (em breve)</span>
        </button>

        {/* Ofertas (Em breve) */}
        <button
          type="button"
          aria-disabled="true"
          title="Em breve"
          className="flex h-[45px] w-full cursor-not-allowed items-center gap-3 px-4 text-left opacity-70"
        >
          <Tag className="size-[18px] shrink-0 text-sand" />
          <span className="font-mono text-[15px] leading-[45px] text-highlight">
            Ofertas
          </span>
          <span className="sr-only"> (em breve)</span>
        </button>

        {/* Arquivos baixados (Em breve) */}
        <button
          type="button"
          aria-disabled="true"
          title="Em breve"
          className="flex h-[45px] w-full cursor-not-allowed items-center gap-3 px-4 text-left opacity-70"
        >
          <Download className="size-[18px] shrink-0 text-sand" />
          <span className="font-mono text-[15px] leading-[45px] text-highlight">
            Arquivos baixados
          </span>
          <span className="sr-only"> (em breve)</span>
        </button>

        {/* Suporte (Em breve) */}
        <button
          type="button"
          aria-disabled="true"
          title="Em breve"
          className="flex h-[45px] w-full cursor-not-allowed items-center gap-3 px-4 text-left opacity-70"
        >
          <Headphones className="size-[18px] shrink-0 text-sand" />
          <span className="font-mono text-[15px] leading-[45px] text-highlight">
            Suporte
          </span>
          <span className="sr-only"> (em breve)</span>
        </button>

        {/* Divisor */}
        <div className="my-1 h-[1px] w-full border-b border-primary/30" />

        {/* Sair da conta */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={logout.isPending}
          className="flex h-[40px] w-full items-center gap-2 px-4 transition-colors hover:bg-white/5 cursor-pointer"
        >
          <LogOut className="size-[20px] shrink-0 text-primary" />
          <span className="font-mono text-[15px] font-bold leading-[15px] text-highlight">
            Sair
          </span>
        </button>
      </nav>
    </aside>
  )
}
