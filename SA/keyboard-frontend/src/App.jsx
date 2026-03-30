import { useState, useEffect, useRef } from "react"

const API = "http://localhost:3000/kb"

// ─── Estilos globais (fontes + scanline — não dá pra fazer só com Tailwind) ────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&display=swap');
    body::after {
      content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 9999;
      background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.15) 2px, rgba(0,0,0,.15) 4px);
    }
    input::placeholder { color: #2e3a50; }
    @keyframes fadeIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
    .fade-in { animation: fadeIn .2s ease; }
  `}</style>
)

// ─── Hook de fetch ─────────────────────────────────────────────────────────────
function useKeyData(path) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    setLoading(true); setError(null)
    fetch(`${API}${path}`)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json() })
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [path])

  return { data, loading, error }
}

// ─── Tecla individual ──────────────────────────────────────────────────────────
function Key({ keyData, highlight, onClick }) {
  const [pressed, setPressed] = useState(false)
  const isWide = ['Tab','CapsLock','Shift','Control','Alt','Backspace','Enter','Space'].includes(keyData.name)
  const isSpecial = keyData.category === 'special'

  function handleClick() {
    setPressed(true); setTimeout(() => setPressed(false), 200); onClick(keyData)
  }

  // larguras fixas via style pois são valores específicos não cobertos pelo Tailwind base
  const width = isWide
    ? keyData.name === 'Space' ? 280
    : ['Backspace','Enter'].includes(keyData.name) ? 100 : 80
    : 52

  let bg     = 'bg-[#1d2235]'
  let border = 'border-[#1e2230]'
  let text   = isSpecial ? 'text-[#4a556e]' : 'text-[#c8d6f0]'
  let shadow = 'shadow-[0_4px_0_#07080c]'

  if (highlight) {
    bg     = 'bg-[#00ffe0]'
    border = 'border-[#00ffe0]'
    text   = 'text-black'
    shadow = 'shadow-[0_0_12px_#00ffe0,0_4px_0_#0a0c10]'
  }
  if (pressed) {
    bg     = 'bg-[#ff4fd8]'
    border = 'border-[#ff4fd8]'
    text   = 'text-black'
    shadow = 'shadow-[0_0_12px_#ff4fd8]'
  }

  return (
    <button
      onClick={handleClick}
      style={{ width, height: 52 }}
      className={`
        flex flex-col items-center justify-center flex-shrink-0
        ${bg} border ${border} rounded-md ${text} ${shadow}
        font-mono text-sm font-semibold tracking-wide uppercase
        cursor-pointer outline-none transition-all duration-100
        ${pressed ? 'translate-y-0.5' : 'translate-y-0'}
      `}
    >
      {keyData.alter && keyData.alter !== keyData.name.toLowerCase() && (
        <span className="text-[9px] opacity-50 leading-none">{keyData.alter}</span>
      )}
      <span className={isWide ? 'text-[11px]' : 'text-sm'}>{keyData.name}</span>
    </button>
  )
}

// ─── Layout do teclado ─────────────────────────────────────────────────────────
function KeyboardLayout({ allKeys, highlight, onKeyClick }) {
  if (!allKeys) return null
  const flat = [...allKeys.letters, ...allKeys.numbers, ...allKeys.specials]
  const byName = name => flat.find(k => k.name === name)
  const rows = [
    ['1','2','3','4','5','6','7','8','9','0','Backspace'],
    ['Tab','Q','W','E','R','T','Y','U','I','O','P'],
    ['CapsLock','A','S','D','F','G','H','J','K','L','Enter'],
    ['Shift','Z','X','C','V','B','N','M','Comma','Period'],
    ['Control','Alt','Space'],
  ]
  const isHighlighted = k => highlight && (k.id === highlight.id || k.name === highlight.name)

  return (
    <div className="flex flex-col gap-2 items-center">
      {rows.map((row, ri) => (
        <div key={ri} className="flex gap-1.5">
          {row.map(name => { const k = byName(name); return k ? <Key key={k.id} keyData={k} highlight={isHighlighted(k)} onClick={onKeyClick} /> : null })}
        </div>
      ))}
    </div>
  )
}

// ─── Card de informações ───────────────────────────────────────────────────────
function KeyInfo({ data, label, accent }) {
  // accent: 'cyan' | 'yellow'
  const isCyan   = accent !== 'yellow'
  const textAccent  = isCyan ? 'text-[#00ffe0]' : 'text-[#ffe066]'
  const borderAccent = isCyan ? 'border-[#00ffe033]' : 'border-[#ffe06633]'
  const tagBg    = isCyan ? 'bg-[#00ffe011] border-[#00ffe044]' : 'bg-[#ffe06611] border-[#ffe06644]'

  if (!data) return null
  return (
    <div className={`fade-in bg-[#111318] border ${borderAccent} rounded-xl p-4 font-mono text-[13px] min-w-[200px]`}>
      {label && (
        <div className={`${textAccent} text-[10px] tracking-[3px] uppercase mb-2`}>{label}</div>
      )}
      {data.letters ? (
        <div className="space-y-1.5">
          {[['id', data.id], ['letters', null], ['category', data.category]].map(([k, v]) => (
            <div key={k} className="flex gap-4 items-start">
              <span className="text-[#4a556e] w-20 shrink-0">{k}</span>
              {k === 'letters'
                ? <div className="flex gap-1.5 flex-wrap">
                    {data.letters.map((l, i) => (
                      <span key={i} className={`${tagBg} border rounded px-1.5 py-px ${textAccent} text-[12px]`}>{l}</span>
                    ))}
                  </div>
                : <span className={textAccent}>{String(v)}</span>
              }
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1.5">
          {[['id', data.id], ['name', data.name], ['alter', data.alter ?? 'null'], ['category', data.category]].map(([k, v]) => (
            <div key={k} className="flex gap-4">
              <span className="text-[#4a556e] w-20">{k}</span>
              <span className={textAccent}>{String(v)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Barra de busca ────────────────────────────────────────────────────────────
function SearchBar({ value, onChange, onSearch, inputRef }) {
  return (
    <div className="flex items-center gap-2 bg-[#111318] border border-[#1e2230] rounded-lg px-4 py-2 w-full max-w-xl">
      <span className="text-[#4a556e] font-mono text-xs whitespace-nowrap">localhost:3000/kb</span>
      <input
        ref={inputRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onSearch()}
        placeholder="/name/A  ou  /1  ou  /category/letters"
        className="flex-1 bg-transparent border-none outline-none text-[#00ffe0] font-mono text-[13px]"
      />
      <button
        onClick={onSearch}
        className="bg-[#00ffe0] text-black font-bold text-xs tracking-widest px-3 py-1 rounded cursor-pointer hover:bg-[#00e8cc] transition-colors"
      >
        GO
      </button>
    </div>
  )
}

// ─── Formulário de criação ─────────────────────────────────────────────────────
function CreateForm({ existingIds, onCreated }) {
  const [id, setId]           = useState('')
  const [letter, setLetter]   = useState('')
  const [letters, setLetters] = useState([])
  const [category, setCategory] = useState('custom')
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)

  function addLetter() {
    const val = letter.trim()
    if (!val) return
    if (letters.includes(val)) { setError('Valor já adicionado'); return }
    setLetters(prev => [...prev, val])
    setLetter(''); setError('')
  }

  function removeLetter(l) { setLetters(prev => prev.filter(x => x !== l)) }

  function handleCreate() {
    setError('')
    const numId = parseInt(id)
    if (!id || isNaN(numId))         { setError('ID deve ser um número'); return }
    if (existingIds.includes(numId)) { setError(`ID ${numId} já existe na API`); return }
    if (letters.length === 0)        { setError('Adicione ao menos um valor'); return }
    onCreated({ id: numId, letters, category })
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
    setId(''); setLetter(''); setLetters([]); setCategory('custom')
  }

  const inputCls = "w-full bg-[#0d1017] border border-[#1e2230] rounded-md px-2.5 py-1.5 text-[#ffe066] font-mono text-[13px] outline-none focus:border-[#ffe066] transition-colors"

  return (
    <div className="bg-[#111318] border border-[#ffe06622] rounded-xl p-5 w-full max-w-xl font-mono text-[13px]">
      <div className="text-[#ffe066] text-[10px] tracking-[3px] uppercase mb-4">+ nova entrada customizada</div>

      {/* ID + Category */}
      <div className="flex gap-2.5 mb-3">
        <div className="w-24">
          <div className="text-[#4a556e] text-[10px] mb-1">ID</div>
          <input value={id} onChange={e => setId(e.target.value)} placeholder="ex: 99" className={inputCls} />
        </div>
        <div className="flex-1">
          <div className="text-[#4a556e] text-[10px] mb-1">CATEGORY</div>
          <input value={category} onChange={e => setCategory(e.target.value)} placeholder="custom" className={inputCls} />
        </div>
      </div>

      {/* Letras */}
      <div className="mb-2.5">
        <div className="text-[#4a556e] text-[10px] mb-1">LETRAS / VALORES</div>
        <div className="flex gap-2">
          <input
            value={letter}
            onChange={e => setLetter(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addLetter()}
            placeholder="digite e pressione Enter ou +"
            className={`${inputCls} flex-1 text-[#c8d6f0]`}
          />
          <button
            onClick={addLetter}
            className="bg-[#1a1e2a] border border-[#ffe06666] rounded-md text-[#ffe066] px-3.5 text-lg cursor-pointer hover:bg-[#222840] transition-colors"
          >+</button>
        </div>
      </div>

      {/* Tags */}
      {letters.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-3">
          {letters.map((l, i) => (
            <span key={i} className="flex items-center gap-1.5 bg-[#ffe06611] border border-[#ffe06644] rounded px-2.5 py-px text-[#ffe066] text-[12px]">
              {l}
              <span onClick={() => removeLetter(l)} className="cursor-pointer opacity-60 text-sm hover:opacity-100">×</span>
            </span>
          ))}
        </div>
      )}

      {error && <p className="text-[#ff4fd8] text-[11px] mb-2.5">⚠ {error}</p>}

      <button
        onClick={handleCreate}
        className={`w-full border border-[#ffe066] rounded-md py-2 font-bold text-[13px] tracking-widest uppercase cursor-pointer transition-all duration-200
          ${success ? 'bg-[#ffe066] text-black' : 'bg-transparent text-[#ffe066] hover:bg-[#ffe06611]'}`}
      >
        {success ? '✓ criado!' : 'criar entrada'}
      </button>
    </div>
  )
}

// ─── Mapa tecla física → nome API ─────────────────────────────────────────────
const KEY_MAP = {
  ' ': 'Space', ',': 'Comma', '.': 'Period', "'": 'Quote', '"': 'Quote',
  'Backspace': 'Backspace', 'Enter': 'Enter', 'Tab': 'Tab',
  'CapsLock': 'CapsLock', 'Shift': 'Shift', 'Control': 'Control', 'Alt': 'Alt',
}
function resolveKeyName(e) {
  if (KEY_MAP[e.key]) return KEY_MAP[e.key]
  if (e.key.length === 1) return e.key.toUpperCase()
  return null
}

// ─── App principal ─────────────────────────────────────────────────────────────
export default function App() {
  const [searchInput, setSearchInput]         = useState('')
  const [activePath, setActivePath]           = useState('')
  const [selectedKey, setSelectedKey]         = useState(null)
  const [physicalPressed, setPhysicalPressed] = useState(null)
  const [customEntries, setCustomEntries]     = useState([])
  const [customResult, setCustomResult]       = useState(null)
  const searchInputRef   = useRef(null)
  const customEntriesRef = useRef([])

  const { data: allKeys }                      = useKeyData('')
  const { data: searchResult, loading, error } = useKeyData(activePath || '__none__')

  const existingIds = allKeys
    ? [...allKeys.letters, ...allKeys.numbers, ...allKeys.specials].map(k => k.id)
    : []

  // ── Teclado físico ───────────────────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e) {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return
      if (e.ctrlKey && e.key !== 'Control') return
      if (e.altKey && e.key !== 'Alt') return
      const name = resolveKeyName(e)
      if (!name) return
      e.preventDefault()
      setPhysicalPressed(name)
      const path = `/name/${name}`
      setSearchInput(path); setActivePath(path); setSelectedKey(null); setCustomResult(null)
    }
    function onKeyUp(e) { const name = resolveKeyName(e); if (name) setPhysicalPressed(null) }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp) }
  }, [])

  function handleSearch() {
    const path = searchInput.startsWith('/') ? searchInput : '/' + searchInput
    setActivePath(path); setSelectedKey(null)
    const idMatch = path.match(/^\/(\d+)$/)
    setCustomResult(idMatch ? (customEntriesRef.current.find(e => e.id === parseInt(idMatch[1])) || null) : null)
  }

  function handleKeyClick(k) {
    setSelectedKey(k)
    const path = `/name/${k.name}`
    setSearchInput(path); setActivePath(path)
    const matches = customEntriesRef.current.filter(e =>
      e.letters.some(l =>
        l.toLowerCase() === k.name.toLowerCase() ||
        (k.alter && l.toLowerCase() === k.alter.toLowerCase())
      )
    )
    setCustomResult(matches.length > 0 ? matches : null)
  }

  function handleCreated(entry) {
    const updated = [...customEntriesRef.current.filter(e => e.id !== entry.id), entry]
    customEntriesRef.current = updated
    setCustomEntries(updated)
  }

  const highlightKey = selectedKey
    || (physicalPressed && allKeys ? [...allKeys.letters, ...allKeys.numbers, ...allKeys.specials].find(k => k.name === physicalPressed) : null)
    || (searchResult && !Array.isArray(searchResult) && searchResult.id ? searchResult : null)

  const apiResult = !loading && !error && searchResult && !Array.isArray(searchResult) && searchResult.id ? searchResult : null

  return (
    <>
      <GlobalStyle />
      <div className="min-h-screen bg-[#0a0c10] text-[#c8d6f0] flex flex-col items-center justify-center gap-7 px-5 py-10"
           style={{ fontFamily: "'Rajdhani', sans-serif" }}>

        {/* Header */}
        <div className="text-center">
          <h1 className="font-mono text-3xl tracking-[6px] text-[#00ffe0] uppercase"
              style={{ textShadow: '0 0 20px #00ffe0', fontFamily: "'Share Tech Mono', monospace" }}>
            KB_MAP
          </h1>
          <p className="text-[#4a556e] text-[13px] tracking-[3px] mt-1">KEYBOARD MAPPING API</p>
        </div>

        {/* Barra de busca */}
        <SearchBar value={searchInput} onChange={setSearchInput} onSearch={handleSearch} inputRef={searchInputRef} />

        {/* Resultados */}
        {activePath && activePath !== '/__none__' && (
          <div className="flex gap-4 flex-wrap justify-center w-full max-w-2xl">
            {loading && <p className="text-[#4a556e] font-mono text-xs">buscando...</p>}
            {error && !customResult && (
              <p className="text-[#ff4fd8] font-mono text-xs">erro {error} — rota não encontrada</p>
            )}
            {apiResult && <KeyInfo data={apiResult} label="api" accent="cyan" />}
            {customResult && (Array.isArray(customResult) ? customResult : [customResult]).map((cr, i) => (
              <KeyInfo key={i} data={cr} label={`custom #${cr.id}`} accent="yellow" />
            ))}
          </div>
        )}

        {/* Teclado virtual */}
        {allKeys && (
          <div className="bg-[#111318] border border-[#1e2230] rounded-2xl px-8 py-7 shadow-[0_0_40px_rgba(0,255,224,0.04)]">
            <KeyboardLayout allKeys={allKeys} highlight={highlightKey} onKeyClick={handleKeyClick} />
          </div>
        )}

        {/* Formulário */}
        <CreateForm existingIds={existingIds} onCreated={handleCreated} />

        {/* Entradas salvas */}
        {customEntries.length > 0 && (
          <div className="w-full max-w-xl">
            <div className="text-[#4a556e] font-mono text-[10px] tracking-[3px] uppercase mb-2.5">
              entradas salvas localmente
            </div>
            <div className="flex gap-2 flex-wrap">
              {customEntries.map(e => (
                <span
                  key={e.id}
                  onClick={() => { const p = `/${e.id}`; setSearchInput(p); setActivePath(p); setCustomResult(e); setSelectedKey(null) }}
                  className="bg-[#ffe06611] hover:bg-[#ffe06622] border border-[#ffe06644] rounded-md px-3 py-1 cursor-pointer font-mono text-[12px] text-[#ffe066] transition-colors"
                >
                  #{e.id} [{e.letters.join(', ')}]
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Rodapé */}
        <div className="flex flex-col items-center gap-2.5">
          <p className={`font-mono text-[11px] tracking-widest transition-colors duration-200 ${physicalPressed ? 'text-[#00ffe0]' : 'text-[#4a556e]'}`}>
            {physicalPressed ? `[ ${physicalPressed} ] detectada` : '— pressione qualquer tecla do teclado —'}
          </p>
          <div className="flex gap-4 flex-wrap justify-center font-mono text-[11px] text-[#4a556e]">
            {['/name/A', '/1', '/category/letters', '/category/numbers', '/category/specials', '/all'].map(r => (
              <span
                key={r}
                onClick={() => { setSearchInput(r); setActivePath(r); setSelectedKey(null); setCustomResult(null) }}
                className="cursor-pointer hover:text-[#00ffe0] transition-colors"
              >{r}</span>
            ))}
          </div>
        </div>

      </div>
    </>
  )
}