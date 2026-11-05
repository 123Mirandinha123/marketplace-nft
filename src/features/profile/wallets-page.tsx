import { useState } from 'react'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { isApiError } from '@/lib/api'
import {
  useAddWallet,
  useSession,
  useWallets,
} from '@/features/auth/use-auth'
import { AccountSidebar } from './profile-page'

const NETWORK_OPTIONS = ['Ethereum', 'Polygon', 'Solana'] as const
const PROVIDER_OPTIONS = [
  { value: 'coinbase', label: 'Coinbase Wallet' },
  { value: 'metamask', label: 'MetaMask' },
  { value: 'phantom', label: 'Phantom' },
  { value: 'walletconnect', label: 'WalletConnect' },
] as const
const ENS_DOMAINS = ['.eth', '.xyz', '.id'] as const

const LABEL_ROW = 'flex items-center font-mono text-[15px] leading-[15px] text-foreground'
const REQUIRED_STAR = (
  <span className="ml-0.5 font-mono text-[22px] leading-[15px] text-coral">*</span>
)
const FIELD_COL = 'flex w-full flex-col gap-1 sm:w-[417px]'
const ROW_WRAP = 'flex w-full flex-col justify-between gap-3 sm:flex-row sm:gap-[28px]'

export function WalletsPage() {
  const { data: user } = useSession()
  const { data: wallets = [], isLoading, isError } = useWallets()
  const addWallet = useAddWallet()

  // State to toggle between primary and secondary wallet editing or creating new
  const [selectedWalletKind, setSelectedWalletKind] = useState<'primary' | 'secondary'>('primary')
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Form fields
  const [label, setLabel] = useState('')
  const [network, setNetwork] = useState<string>('Ethereum')
  const [address, setAddress] = useState('')
  const [secondaryAddress, setSecondaryAddress] = useState('')
  const [provider, setProvider] = useState<string>('coinbase')
  const [referralCode, setReferralCode] = useState('')
  const [ensName, setEnsName] = useState('')
  const [ensDomain, setEnsDomain] = useState<string>('.eth')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Find primary and secondary wallet from list
  const primaryWallet = wallets.length > 0 ? wallets[0] : null
  const secondaryWallet = wallets.length > 1 ? wallets[1] : null

  // Current active wallet being edited or configured
  const currentWallet = isCreatingNew
    ? null
    : selectedWalletKind === 'primary'
      ? primaryWallet
      : secondaryWallet

  // Sync state when wallet selection changes
  const [lastSyncId, setLastSyncId] = useState<string | null>(null)
  const currentId = `${selectedWalletKind}-${isCreatingNew}-${currentWallet?.address || 'new'}`
  if (lastSyncId !== currentId) {
    if (currentWallet) {
      setLabel(currentWallet.provider ? `${currentWallet.provider} Wallet` : 'Principal')
      setNetwork(currentWallet.kind || 'Ethereum')
      setAddress(currentWallet.address || '')
      setProvider(currentWallet.provider?.toLowerCase().includes('meta') ? 'metamask' : 'coinbase')
    } else {
      setLabel('')
      setNetwork('Ethereum')
      setAddress('')
      setSecondaryAddress('')
      setReferralCode('')
      setEnsName('')
    }
    setFieldErrors({})
    setSuccessMessage(null)
    setLastSyncId(currentId)
  }

  const handleSaveWallet = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})
    setSuccessMessage(null)

    const errors: Record<string, string> = {}
    if (!label.trim() || label.trim().length < 2) {
      errors.label = 'Informe um apelido (mínimo 2 caracteres).'
    }
    if (!address.trim()) {
      errors.address = 'Informe o endereço da carteira.'
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(address.trim()) && address.trim().length < 10) {
      errors.address = 'Informe um endereço de carteira válido.'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    try {
      await addWallet.mutateAsync(address.trim())
      setSuccessMessage('Carteira salva. Ela já pode ser usada no pagamento.')
      toast.success('Carteira salva com sucesso!')
      setIsCreatingNew(false)
    } catch (err) {
      toast.error(isApiError(err) ? err.message : 'Falha ao salvar carteira.')
    }
  }

  const statusText = isCreatingNew
    ? selectedWalletKind === 'primary'
      ? 'Nova carteira principal: a atual passa a ser secundária.'
      : 'Nova carteira secundária.'
    : currentWallet
      ? `Editando ${currentWallet.provider} (${currentWallet.address.slice(0, 6)}...${currentWallet.address.slice(-4)}).`
      : 'Cadastre sua primeira carteira.'

  return (
    <div className="mx-auto flex w-full max-w-[1248px] flex-col px-4 py-6 pb-24 sm:px-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start gap-5 sm:gap-[28px] lg:flex-row">
        <AccountSidebar active="wallets" />

        <section
          aria-label="Carteiras do colecionador"
          className="flex w-full flex-col gap-6 sm:gap-8 lg:min-w-0 lg:flex-1"
        >
          {/* Header */}
          <div className="flex w-full flex-col gap-1.5 sm:gap-2">
            <div className="flex w-full items-start justify-between">
              <h1 className="font-mono text-[15px] sm:text-[17px] font-bold leading-[16px] text-foreground">
                Carteira principal
              </h1>
              <button
                type="button"
                aria-label="Adicionar nova carteira principal"
                onClick={() => {
                  setSelectedWalletKind('primary')
                  setIsCreatingNew(true)
                }}
                className="cursor-pointer font-mono text-[15px] sm:text-[16px] font-medium leading-[16px] text-highlight transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Adicionar
              </button>
            </div>
            <p className="font-mono text-[13px] sm:text-[14px] font-normal leading-[15px] text-text-secondary">
              Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.
            </p>
            <p aria-live="polite" className="font-mono text-[13px] leading-4 text-highlight">
              {isLoading ? 'Carregando carteiras…' : statusText}
            </p>
          </div>

          {isError && (
            <p role="alert" className="font-mono text-sm text-coral">
              Não foi possível carregar suas carteiras.
            </p>
          )}

          {successMessage && (
            <p role="status" className="font-mono text-sm text-success">
              {successMessage}
            </p>
          )}

          {/* Form */}
          {!isLoading && (
            <form
              onSubmit={handleSaveWallet}
              noValidate
              className="flex w-full flex-col gap-6"
            >
              {/* Row 1: Nome de exibição + Apelido da carteira */}
              <div className={ROW_WRAP}>
                <div className={FIELD_COL}>
                  <label htmlFor="displayName" className={LABEL_ROW}>
                    <span>Nome de exibição</span>
                    {REQUIRED_STAR}
                  </label>
                  <Input
                    id="displayName"
                    value={user?.displayName ?? ''}
                    readOnly
                    className="border-field font-mono text-sm opacity-80"
                    aria-describedby="profile-fields-hint"
                  />
                </div>
                <div className={FIELD_COL}>
                  <label htmlFor="walletAlias" className={LABEL_ROW}>
                    <span>Apelido da carteira</span>
                    {REQUIRED_STAR}
                  </label>
                  <Input
                    id="walletAlias"
                    placeholder="Principal"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="border-field font-mono text-sm focus-visible:border-primary"
                  />
                  {fieldErrors.label && (
                    <p className="mt-1 font-mono text-[12px] leading-4 text-coral">
                      {fieldErrors.label}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Rede + Nome do perfil */}
              <div className={ROW_WRAP}>
                <div className={FIELD_COL}>
                  <label htmlFor="walletNetwork" className={LABEL_ROW}>
                    <span>Rede</span>
                    {REQUIRED_STAR}
                  </label>
                  <select
                    id="walletNetwork"
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="h-10 w-full rounded-md border border-field bg-card px-3 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
                  >
                    {NETWORK_OPTIONS.map((net) => (
                      <option key={net} value={net}>
                        {net}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={FIELD_COL}>
                  <label htmlFor="profileName" className={LABEL_ROW}>
                    <span>Nome do perfil</span>
                    {REQUIRED_STAR}
                  </label>
                  <Input
                    id="profileName"
                    value={user?.username ? `@${user.username}` : ''}
                    readOnly
                    className="border-field font-mono text-sm opacity-80"
                    aria-describedby="profile-fields-hint"
                  />
                </div>
              </div>

              {/* Row 3: Endereço da carteira + Carteira secundária */}
              <div className={`${ROW_WRAP} sm:items-end`}>
                <div className={FIELD_COL}>
                  <label htmlFor="walletAddress" className={LABEL_ROW}>
                    <span>Endereço da carteira</span>
                    {REQUIRED_STAR}
                  </label>
                  <Input
                    id="walletAddress"
                    placeholder="Endereço 0x da carteira"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="border-field font-mono text-sm focus-visible:border-primary"
                  />
                  {fieldErrors.address && (
                    <p className="mt-1 font-mono text-[12px] leading-4 text-coral">
                      {fieldErrors.address}
                    </p>
                  )}
                </div>
                <div className={FIELD_COL}>
                  <label htmlFor="secondaryAddress" className="sr-only">
                    ENS ou carteira secundária (opcional)
                  </label>
                  <Input
                    id="secondaryAddress"
                    placeholder="ENS ou carteira secundária (opcional)"
                    value={secondaryAddress}
                    onChange={(e) => setSecondaryAddress(e.target.value)}
                    className="border-field font-mono text-sm focus-visible:border-primary"
                  />
                </div>
              </div>

              {/* Row 4: Tipo de carteira + Código de indicação */}
              <div className={ROW_WRAP}>
                <div className={FIELD_COL}>
                  <label htmlFor="walletProvider" className={LABEL_ROW}>
                    <span>Tipo de carteira</span>
                    {REQUIRED_STAR}
                  </label>
                  <select
                    id="walletProvider"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="h-10 w-full rounded-md border border-field bg-card px-3 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
                  >
                    {PROVIDER_OPTIONS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={FIELD_COL}>
                  <label htmlFor="referralCode" className={LABEL_ROW}>
                    <span>Código de indicação</span>
                    {REQUIRED_STAR}
                  </label>
                  <Input
                    id="referralCode"
                    placeholder="ex: KURIO10"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    className="border-field font-mono text-sm focus-visible:border-primary"
                  />
                </div>
              </div>

              {/* Row 5: E-mail + Nome ENS */}
              <div className={ROW_WRAP}>
                <div className={FIELD_COL}>
                  <label htmlFor="email" className={LABEL_ROW}>
                    <span>E-mail</span>
                    {REQUIRED_STAR}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email ?? ''}
                    readOnly
                    className="border-field font-mono text-sm opacity-80"
                    aria-describedby="profile-fields-hint"
                  />
                </div>
                <div className={FIELD_COL}>
                  <label htmlFor="ensName" className={LABEL_ROW}>
                    <span>Nome ENS</span>
                    {REQUIRED_STAR}
                  </label>
                  <div className="flex w-full items-center gap-[10px]">
                    <select
                      aria-label="Domínio ENS"
                      value={ensDomain}
                      onChange={(e) => setEnsDomain(e.target.value)}
                      className="h-10 w-[78px] shrink-0 rounded-md border border-field bg-card px-2 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
                    >
                      {ENS_DOMAINS.map((dom) => (
                        <option key={dom} value={dom}>
                          {dom}
                        </option>
                      ))}
                    </select>
                    <Input
                      id="ensName"
                      placeholder="nome"
                      value={ensName}
                      onChange={(e) => setEnsName(e.target.value)}
                      className="border-field font-mono text-sm focus-visible:border-primary"
                    />
                  </div>
                </div>
              </div>

              <p id="profile-fields-hint" className="font-mono text-[12px] leading-4 text-text-secondary">
                Nome, nome do perfil e e-mail vêm de Dados do perfil.
              </p>

              <Button
                type="submit"
                size="sm"
                className="w-full sm:w-[131px] rounded-[3px] bg-primary font-mono text-ink hover:bg-highlight mt-2"
                disabled={addWallet.isPending}
              >
                {addWallet.isPending ? 'Salvando…' : 'Salvar carteira'}
              </Button>
            </form>
          )}

          {/* Secondary wallet section */}
          <div className="flex w-full flex-col gap-3 pt-6 border-t border-surface-dark">
            <div className="flex w-full items-start justify-between gap-4">
              <h2 className="font-mono text-[17px] font-bold leading-[16px] text-foreground">
                Carteira secundária
              </h2>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedWalletKind('secondary')
                    setIsCreatingNew(!secondaryWallet)
                  }}
                  className="cursor-pointer font-mono text-xs text-highlight hover:underline"
                >
                  {secondaryWallet ? 'Editar secundária' : 'Cadastrar secundária'}
                </button>
              </div>
            </div>

            {secondaryWallet ? (
              <div className="flex items-center justify-between rounded-lg border border-line/40 bg-card p-3">
                <div className="flex flex-col">
                  <span className="font-mono text-xs font-bold text-cream">
                    {secondaryWallet.provider} ({secondaryWallet.kind})
                  </span>
                  <span className="font-mono text-xs text-tan break-all">
                    {secondaryWallet.address}
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(secondaryWallet.address)
                    toast.success('Endereço copiado!')
                  }}
                  className="font-mono text-xs"
                >
                  <Copy className="mr-1 size-3" />
                  Copiar
                </Button>
              </div>
            ) : (
              <p className="font-mono text-xs text-text-secondary">
                Nenhuma carteira secundária cadastrada.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
