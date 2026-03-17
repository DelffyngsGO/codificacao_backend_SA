import { useState, useEffect, useRef } from "react"

const API = "http://localhost:3000/kb"

// ─── Estilos globais ───────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:        #0a0c10;
      --surface:   #111318;
      --border:    #1e2230;
      --key-top:   #1d2235;
      --key-glow:  #00ffe0;
      --key-press: #ff4fd8;
      --text:      #c8d6f0;
      --muted:     #4a556e;
      --accent:    #00ffe0;
      --accent2:   #ff4fd8;
      --accent3:   #ffe066;
      --font-mono: 'Share Tech Mono', monospace;
      --font-ui:   'Rajdhani', sans-serif;
    }
    html, body, #root { height: 100%; background: var(--bg); color: var(--text); font-family: var(--font-ui); }
    body::after {
      content: ''; position: fixed; inset: 0;
      background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.15) 2px, rgba(0,0,0,.15) 4px);
      pointer-events: none; z-index: 9999;
    }
    input::placeholder { color: #2e3a50; }
    @keyframes fadeIn { from { opacity:0; transform: translateY(6px) } to { opacity:1; transform: translateY(0) } }
    @keyframes pulse  { 0%,100% { box-shadow: 0 0 8px var(--accent3) } 50% { box-shadow: 0 0 20px var(--accent3) } }
  `}</style>
)

// ─── Hook de fetch da API ──────────────────────────────────────────────────────
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

  function handleClick() {
    setPressed(true); setTimeout(() => setPressed(false), 200); onClick(keyData)
  }

  return (
    <button onClick={handleClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      width: isWide ? (keyData.name === 'Space' ? 280 : ['Backspace','Enter'].includes(keyData.name) ? 100 : 80) : 52,
      height: 52,
      background: pressed ? 'var(--key-press)' : highlight ? 'var(--key-glow)' : 'var(--key-top)',
      border: `1px solid ${highlight ? 'var(--accent)' : pressed ? 'var(--accent2)' : 'var(--border)'}`,
      borderRadius: 6,
      color: pressed || highlight ? '#000' : keyData.category === 'special' ? 'var(--muted)' : 'var(--text)',
      fontFamily: 'var(--font-mono)', fontSize: isWide ? 11 : 14, fontWeight: 600,
      cursor: 'pointer', transition: 'all .12s ease',
      boxShadow: highlight ? '0 0 12px var(--key-glow), 0 4px 0 #0a0c10' : pressed ? '0 0 12px var(--key-press)' : '0 4px 0 #07080c',
      transform: pressed ? 'translateY(3px)' : 'translateY(0)',
      outline: 'none', letterSpacing: '.5px', textTransform: 'uppercase', flexShrink: 0,
    }}>
      {keyData.alter && keyData.alter !== keyData.name.toLowerCase() && (
        <span style={{ fontSize: 9, opacity: .55, lineHeight: 1 }}>{keyData.alter}</span>
      )}
      <span>{keyData.name}</span>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: 'flex', gap: 6 }}>
          {row.map(name => { const k = byName(name); return k ? <Key key={k.id} keyData={k} highlight={isHighlighted(k)} onClick={onKeyClick} /> : null })}
        </div>
      ))}
    </div>
  )
}

// ─── Card de informações de uma tecla ─────────────────────────────────────────
function KeyInfo({ data, label, color }) {
  const c = color || 'var(--accent)'
  if (!data) return null
  return (
    <div style={{
      background: 'var(--surface)', border: `1px solid ${c}44`,
      borderRadius: 10, padding: '16px 20px', fontFamily: 'var(--font-mono)',
      fontSize: 13, lineHeight: 2.2, animation: 'fadeIn .2s ease', minWidth: 200,
    }}>
      {label && (
        <div style={{ color: c, fontSize: 10, letterSpacing: 3, marginBottom: 8, textTransform: 'uppercase' }}>
          {label}
        </div>
      )}
      {data.letters ? (
        <>
          {[['id', data.id], ['letters', null], ['category', data.category]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--muted)', width: 80, flexShrink: 0 }}>{k}</span>
              {k === 'letters'
                ? <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {data.letters.map((l, i) => (
                      <span key={i} style={{
                        background: `${c}22`, border: `1px solid ${c}55`,
                        borderRadius: 4, padding: '1px 7px', color: c, fontSize: 12,
                      }}>{l}</span>
                    ))}
                  </div>
                : <span style={{ color: c }}>{String(v)}</span>
              }
            </div>
          ))}
        </>
      ) : (
        [['id', data.id], ['name', data.name], ['alter', data.alter ?? 'null'], ['category', data.category]].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', gap: 16 }}>
            <span style={{ color: 'var(--muted)', width: 80 }}>{k}</span>
            <span style={{ color: c }}>{String(v)}</span>
          </div>
        ))
      )}
    </div>
  )
}

// ─── Barra de busca ────────────────────────────────────────────────────────────
function SearchBar({ value, onChange, onSearch, inputRef }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '8px 16px', width: '100%', maxWidth: 520,
    }}>
      <span style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 12, whiteSpace: 'nowrap' }}>
        localhost:3000/kb
      </span>
      <input
        ref={inputRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onSearch()}
        placeholder="/name/A  ou  /1  ou  /category/letters"
        style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 13 }}
      />
      <button onClick={onSearch} style={{
        background: 'var(--accent)', border: 'none', borderRadius: 4, padding: '4px 14px',
        color: '#000', fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12, cursor: 'pointer', letterSpacing: 1,
      }}>GO</button>
    </div>
  )
}

// ─── Formulário de criação de entrada customizada ──────────────────────────────
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
    setLetter('')
    setError('')
  }

  function removeLetter(l) { setLetters(prev => prev.filter(x => x !== l)) }

  function handleCreate() {
    setError('')
    const numId = parseInt(id)
    if (!id || isNaN(numId))          { setError('ID deve ser um número'); return }
    if (existingIds.includes(numId))  { setError(`ID ${numId} já existe na API`); return }
    if (letters.length === 0)         { setError('Adicione ao menos um valor'); return }

    onCreated({ id: numId, letters, category })
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
    setId(''); setLetter(''); setLetters([]); setCategory('custom')
  }

  const inputStyle = {
    width: '100%', background: '#0d1017', border: '1px solid var(--border)',
    borderRadius: 6, padding: '7px 10px', color: 'var(--accent3)',
    fontFamily: 'var(--font-mono)', fontSize: 13, outline: 'none',
    transition: 'border-color .15s',
  }

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid #ffe06633',
      borderRadius: 12, padding: '20px 24px', width: '100%', maxWidth: 520,
      fontFamily: 'var(--font-mono)', fontSize: 13,
    }}>
      <div style={{ color: 'var(--accent3)', fontSize: 10, letterSpacing: 3, marginBottom: 16, textTransform: 'uppercase' }}>
        + nova entrada customizada
      </div>

      {/* ID + Category */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <div style={{ flex: '0 0 90px' }}>
          <div style={{ color: 'var(--muted)', fontSize: 10, marginBottom: 4 }}>ID</div>
          <input value={id} onChange={e => setId(e.target.value)} placeholder="ex: 99"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--accent3)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: 'var(--muted)', fontSize: 10, marginBottom: 4 }}>CATEGORY</div>
          <input value={category} onChange={e => setCategory(e.target.value)} placeholder="custom"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--accent3)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
      </div>

      {/* Campo de letras */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ color: 'var(--muted)', fontSize: 10, marginBottom: 4 }}>LETRAS / VALORES</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={letter}
            onChange={e => setLetter(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addLetter()}
            placeholder="digite e pressione Enter ou +"
            style={{ ...inputStyle, color: 'var(--text)' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent3)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <button onClick={addLetter} style={{
            background: '#1a1e2a', border: '1px solid #ffe06666', borderRadius: 6,
            color: 'var(--accent3)', padding: '7px 14px', cursor: 'pointer',
            fontFamily: 'var(--font-mono)', fontSize: 18, lineHeight: 1,
          }}>+</button>
        </div>
      </div>

      {/* Tags */}
      {letters.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {letters.map((l, i) => (
            <span key={i} style={{
              background: '#ffe0661a', border: '1px solid #ffe06655',
              borderRadius: 4, padding: '2px 10px', color: 'var(--accent3)',
              fontSize: 12, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {l}
              <span onClick={() => removeLetter(l)} style={{ cursor: 'pointer', opacity: .6, fontSize: 14 }}>×</span>
            </span>
          ))}
        </div>
      )}

      {error && <p style={{ color: 'var(--accent2)', fontSize: 11, marginBottom: 10 }}>⚠ {error}</p>}

      <button onClick={handleCreate} style={{
        width: '100%',
        background: success ? 'var(--accent3)' : 'transparent',
        border: '1px solid var(--accent3)', borderRadius: 6,
        color: success ? '#000' : 'var(--accent3)',
        fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13,
        letterSpacing: 2, padding: '9px', cursor: 'pointer',
        transition: 'all .2s', textTransform: 'uppercase',
      }}>
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
  const customEntriesRef = useRef([]) // ref para evitar stale closure no handleSearch

  const { data: allKeys }                       = useKeyData('')
  const { data: searchResult, loading, error }  = useKeyData(activePath || '__none__')

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
    setActivePath(path)
    setSelectedKey(null)
    // verifica se é busca por ID numérico e tenta achar entrada custom
    const idMatch = path.match(/^\/(\d+)$/)
    setCustomResult(idMatch ? (customEntriesRef.current.find(e => e.id === parseInt(idMatch[1])) || null) : null)
  }

  function handleKeyClick(k) {
    setSelectedKey(k); setCustomResult(null)
    const path = `/name/${k.name}`
    setSearchInput(path); setActivePath(path)
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
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 28, padding: '40px 20px',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 28, letterSpacing: 6, color: 'var(--accent)', textShadow: '0 0 20px var(--accent)', textTransform: 'uppercase' }}>
            KB_MAP
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, letterSpacing: 2, marginTop: 4 }}>KEYBOARD MAPPING API</p>
        </div>

        {/* Barra de busca */}
        <SearchBar value={searchInput} onChange={setSearchInput} onSearch={handleSearch} inputRef={searchInputRef} />

        {/* Resultados lado a lado */}
        {activePath && activePath !== '/__none__' && (
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: 720 }}>
            {loading && <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>buscando...</p>}
            {error && !customResult && (
              <p style={{ color: 'var(--accent2)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>erro {error} — rota não encontrada</p>
            )}
            {apiResult   && <KeyInfo data={apiResult}    label="api"    color="var(--accent)"  />}
            {customResult && <KeyInfo data={customResult} label="custom" color="var(--accent3)" />}
          </div>
        )}

        {/* Teclado virtual */}
        {allKeys && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 32px', boxShadow: '0 0 40px rgba(0,255,224,.04)' }}>
            <KeyboardLayout allKeys={allKeys} highlight={highlightKey} onKeyClick={handleKeyClick} />
          </div>
        )}

        {/* Formulário de criação */}
        <CreateForm existingIds={existingIds} onCreated={handleCreated} />

        {/* Entradas customizadas salvas */}
        {customEntries.length > 0 && (
          <div style={{ width: '100%', maxWidth: 520 }}>
            <div style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 3, marginBottom: 10, textTransform: 'uppercase' }}>
              entradas salvas localmente
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {customEntries.map(e => (
                <span key={e.id}
                  onClick={() => {
                    const path = `/${e.id}`
                    setSearchInput(path); setActivePath(path); setCustomResult(e); setSelectedKey(null)
                  }}
                  style={{
                    background: '#ffe06611', border: '1px solid #ffe06644',
                    borderRadius: 6, padding: '4px 12px', cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent3)',
                    transition: 'background .15s',
                  }}
                  onMouseEnter={ev => ev.currentTarget.style.background = '#ffe06622'}
                  onMouseLeave={ev => ev.currentTarget.style.background = '#ffe06611'}
                >
                  #{e.id} [{e.letters.join(', ')}]
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Rodapé */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: physicalPressed ? 'var(--accent)' : 'var(--muted)', letterSpacing: 2, transition: 'color .2s' }}>
            {physicalPressed ? `[ ${physicalPressed} ] detectada` : '— pressione qualquer tecla do teclado —'}
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>
            {['/name/A', '/1', '/category/letters', '/category/numbers', '/category/specials', '/all'].map(r => (
              <span key={r} onClick={() => { setSearchInput(r); setActivePath(r); setSelectedKey(null); setCustomResult(null) }}
                style={{ cursor: 'pointer', transition: 'color .15s' }}
                onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                onMouseLeave={e => e.target.style.color = 'var(--muted)'}
              >{r}</span>
            ))}
          </div>
        </div>

      </div>
    </>
  )
}