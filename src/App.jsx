import { useEffect, useReducer, useRef } from 'react'
import { BOSS, COLS, DECOR, EXIT, ROWS, START, STORY, ZONES } from './data.js'

const fa = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d])
const SAVE_KEY = 'safety-quest-fa'

const isWall = (x, y) => {
  if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return true
  if (DECOR.some((d) => d.x === x && d.y === y)) return true
  const ring = x >= 3 && x <= 7 && y >= 1 && y <= 8 && (y === 1 || y === 8 || x === 3 || x === 7)
  return ring && !(x === 5 && y === 8)
}

const initialWorkers = () => [
  { x: 2, y: 4, d: 1, axis: 'y', min: 0, max: 9, icon: 'green' },
  { x: 8, y: 6, d: -1, axis: 'y', min: 1, max: 9, icon: 'navy' },
  { x: 7, y: 9, d: 1, axis: 'x', min: 6, max: 8, icon: 'orange' },
]

const fresh = (screen = 'register', extra = {}) => ({
  screen, name: '', badge: '', step: 0, pos: START, workers: initialWorkers(),
  done: [], lives: 3, score: 0, modal: null, msg: '', boss: { i: 0, right: 0, picked: null }, ...extra,
})

const hit = (s) => {
  const lives = s.lives - 1
  return { ...s, lives, pos: START, msg: 'با یک همکار برخورد کردی! یک جان از دست رفت.', screen: lives <= 0 ? 'over' : s.screen }
}
const collide = (s) => s.workers.some((w) => w.x === s.pos.x && w.y === s.pos.y)

function reducer(s, a) {
  switch (a.type) {
    case 'register': return { ...s, screen: 'intro', name: a.name, badge: a.badge }
    case 'next': return s.step >= STORY.length - 1 ? { ...s, screen: 'play' } : { ...s, step: s.step + 1 }
    case 'move': {
      if (s.screen !== 'play' || s.modal) return s
      const x = s.pos.x + a.dx
      const y = s.pos.y + a.dy
      if (isWall(x, y)) return s
      let n = { ...s, pos: { x, y }, msg: '' }
      if (collide(n)) return hit(n)
      const z = ZONES.find((q) => q.x === x && q.y === y)
      if (z && !s.done.includes(z.id)) return { ...n, modal: { id: z.id, picked: null } }
      if (x === EXIT.x && y === EXIT.y) {
        if (s.done.length === ZONES.length) return { ...n, screen: 'boss', boss: { i: 0, right: 0, picked: null } }
        n = { ...n, msg: `اول باید هر ${fa(ZONES.length)} منطقه را تمام کنی.` }
      }
      return n
    }
    case 'tick': {
      if (s.screen !== 'play' || s.modal) return s
      const workers = s.workers.map((w) => {
        let p = w[w.axis] + w.d
        let d = w.d
        if (p > w.max || p < w.min) { d = -d; p = w[w.axis] + d }
        return { ...w, [w.axis]: p, d }
      })
      const n = { ...s, workers }
      return collide(n) ? hit(n) : n
    }
    case 'pick': {
      if (!s.modal || s.modal.picked !== null) return s
      const z = ZONES.find((q) => q.id === s.modal.id)
      const ok = a.i === z.a
      return {
        ...s, modal: { ...s.modal, picked: a.i },
        done: ok ? [...s.done, z.id] : s.done,
        score: ok ? s.score + 10 : s.score,
        lives: ok ? s.lives : s.lives - 1,
      }
    }
    case 'close': return { ...s, modal: null, screen: s.lives <= 0 ? 'over' : s.screen }
    case 'bossPick': {
      if (s.boss.picked !== null) return s
      const ok = a.i === BOSS[s.boss.i].a
      return { ...s, boss: { ...s.boss, picked: a.i, right: s.boss.right + (ok ? 1 : 0) } }
    }
    case 'bossNext': {
      if (s.boss.i >= BOSS.length - 1) {
        const pass = s.boss.right >= 4
        return { ...s, screen: pass ? 'win' : 'bossfail', score: s.score + (pass ? s.boss.right * 10 : 0) }
      }
      return { ...s, boss: { ...s.boss, i: s.boss.i + 1, picked: null } }
    }
    case 'bossRetry': return { ...s, screen: 'boss', boss: { i: 0, right: 0, picked: null } }
    case 'restart': return fresh('play', { name: s.name, badge: s.badge })
    default: return s
  }
}

let audio
const beep = (freq, dur = 0.15) => {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)()
    const o = audio.createOscillator()
    const g = audio.createGain()
    o.frequency.value = freq
    g.gain.value = 0.08
    o.connect(g)
    g.connect(audio.destination)
    o.start()
    o.stop(audio.currentTime + dur)
  } catch { /* صدا در دسترس نیست */ }
}

function Register({ dispatch }) {
  const submit = (e) => {
    e.preventDefault()
    const f = new FormData(e.target)
    const name = String(f.get('name')).trim()
    if (!name) return
    dispatch({ type: 'register', name, badge: String(f.get('badge')).trim() || 'N/A' })
  }
  return (
    <form className="card center" onSubmit={submit}>
      <div className="logo">🏭</div>
      <div className="kicker">آموزش کارخانه خودروسازی</div>
      <h1>ماجراجویی ایمنی</h1>
      <p className="muted">برای شروع اطلاعات خود را وارد کن</p>
      <label className="label" htmlFor="name">نام و نام خانوادگی</label>
      <input id="name" name="name" required autoComplete="off" placeholder="مثلاً مرتضی محمدی" />
      <label className="label" htmlFor="badge">شماره پرسنلی / کارت</label>
      <input id="badge" name="badge" autoComplete="off" placeholder="مثلاً EMP-4821 (اختیاری)" dir="ltr" />
      <button className="btn" type="submit">شروع آموزش ←</button>
      <p className="hint">شماره پرسنلی‌ات را نمی‌دانی؟ فقط نام را وارد کن و برای شماره «N/A» بگذار. این اطلاعات فقط برای ثبت تکمیل آموزش استفاده می‌شود.</p>
    </form>
  )
}

function Intro({ s, dispatch }) {
  const st = STORY[s.step]
  return (
    <div className="card">
      <div className="kicker">◆ توجیه کارکنان جدید — {s.name}</div>
      <div className="talk">
        <div className="avatar">{st.icon}</div>
        <div className="bubble-wrap">
          <div className="who">{st.who}</div>
          <div className="bubble">«{st.text}»</div>
        </div>
      </div>
      <div className="row">
        <div className="dots">{STORY.map((_, i) => <i key={i} className={i === s.step ? 'on' : ''} />)}</div>
        <button className="btn small" onClick={() => dispatch({ type: 'next' })}>{s.step === STORY.length - 1 ? 'شروع ←' : 'بعدی ←'}</button>
      </div>
    </div>
  )
}

function Modal({ s, dispatch }) {
  const z = ZONES.find((q) => q.id === s.modal.id)
  const { picked } = s.modal
  return (
    <div className="overlay">
      <div className="card modal" style={{ borderColor: z.color }}>
        <div className="mhead"><span className="mi">{z.icon}</span><h2>{z.title}</h2></div>
        <div className="tip">{z.tip}</div>
        <h3>{z.q}</h3>
        {z.o.map((t, i) => (
          <button key={i} disabled={picked !== null}
            className={`opt ${picked === null ? '' : i === z.a ? 'ok' : i === picked ? 'no' : ''}`}
            onClick={() => { dispatch({ type: 'pick', i }); beep(i === z.a ? 880 : 180, 0.2) }}>{t}</button>
        ))}
        {picked !== null && (
          <>
            <div className="tip">{picked === z.a ? '✅ آفرین! ' : '❌ اشتباه بود؛ یک جان کم شد. '}{z.why}</div>
            <button className="btn" onClick={() => dispatch({ type: 'close' })}>
              {picked === z.a || s.lives <= 0 ? 'ادامه' : 'تلاش دوباره'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function Play({ s, dispatch, sound, setSound }) {
  const move = (dx, dy) => dispatch({ type: 'move', dx, dy })
  useEffect(() => {
    const keys = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] }
    const onKey = (e) => {
      const k = keys[e.key]
      if (!k) return
      e.preventDefault()
      dispatch({ type: 'move', dx: k[0], dy: k[1] })
    }
    window.addEventListener('keydown', onKey)
    const t = setInterval(() => dispatch({ type: 'tick' }), 700)
    return () => { window.removeEventListener('keydown', onKey); clearInterval(t) }
  }, [dispatch])

  const initials = (s.name.trim()[0] || '؟') + ' · ' + (s.badge[0] || '؟')
  const cells = []
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const z = ZONES.find((q) => q.x === x && q.y === y)
      const dec = DECOR.find((q) => q.x === x && q.y === y)
      const isExit = x === EXIT.x && y === EXIT.y
      const w = s.workers.find((q) => q.x === x && q.y === y)
      const me = s.pos.x === x && s.pos.y === y
      cells.push(
        <div key={`${x}-${y}`} className={`cell${isWall(x, y) && !dec ? ' belt' : ''}${z && s.done.includes(z.id) ? ' done' : ''}${isExit ? ' exit' : ''}`}>
          {z && <span className="zone" style={{ '--c': z.color }}>{s.done.includes(z.id) ? '✅' : z.icon}</span>}
          {dec && <span className="zone" style={{ '--c': '#eab308' }}>{dec.icon}</span>}
          {isExit && <span className="zone exitz" style={{ '--c': '#22c55e' }}>✅<small>خروج</small></span>}
          {w && <span className={`man ${w.icon}`} />}
          {me && <span className="man me" />}
        </div>,
      )
    }
  }
  return (
    <>
      <div className="hud">
        <span className="pill">{initials}</span>
        <span>{'❤️'.repeat(Math.max(s.lives, 0))}{'🖤'.repeat(3 - Math.max(s.lives, 0))}</span>
        <span className="gold">★ {fa(s.score)}</span>
        <span className="green">✓ {fa(s.done.length)}/{fa(ZONES.length)}</span>
        <button className="pill btnlike" onClick={() => setSound(!sound)} aria-label="صدا">{sound ? '🔊' : '🔇'}</button>
      </div>
      <div className="map" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>{cells}</div>
      <div className="dpad" dir="ltr">
        <button className="k up" onClick={() => move(0, -1)} aria-label="بالا">▲</button>
        <button className="k left" onClick={() => move(-1, 0)} aria-label="چپ">◀</button>
        <button className="k right" onClick={() => move(1, 0)} aria-label="راست">▶</button>
        <button className="k down" onClick={() => move(0, 1)} aria-label="پایین">▼</button>
      </div>
      <p className="muted center">{s.msg || `وارد مناطق درخشان شو · با تکمیل هر ${fa(ZONES.length)} منطقه آزمون نهایی باز می‌شود`}</p>
      {s.modal && <Modal s={s} dispatch={dispatch} />}
    </>
  )
}

function Boss({ s, dispatch }) {
  const q = BOSS[s.boss.i]
  const p = s.boss.picked
  return (
    <div className="card">
      <div className="kicker">آزمون نهایی — سؤال {fa(s.boss.i + 1)} از {fa(BOSS.length)}</div>
      <h2>{q.q}</h2>
      {q.o.map((t, i) => (
        <button key={i} disabled={p !== null} className={`opt ${p === null ? '' : i === q.a ? 'ok' : i === p ? 'no' : ''}`}
          onClick={() => { dispatch({ type: 'bossPick', i }); beep(i === q.a ? 880 : 180, 0.2) }}>{t}</button>
      ))}
      {p !== null && <button className="btn" onClick={() => dispatch({ type: 'bossNext' })}>{s.boss.i === BOSS.length - 1 ? 'مشاهده نتیجه' : 'سؤال بعد ←'}</button>}
    </div>
  )
}

function End({ s, dispatch }) {
  const win = s.screen === 'win'
  const over = s.screen === 'over'
  return (
    <div className="card center">
      <div className="logo">{win ? '🏆' : '😕'}</div>
      <h1>{win ? 'تبریک! آموزش تکمیل شد' : over ? 'جان‌هایت تمام شد' : 'آزمون نهایی قبول نشد'}</h1>
      {win && <p>{s.name} (شماره پرسنلی: {s.badge}) آموزش ایمنی را با امتیاز <b className="gold">{fa(s.score)}</b> به پایان رساند.</p>}
      {!win && <p className="muted">{over ? 'مرور کن و دوباره تلاش کن.' : `برای قبولی حداقل ${fa(4)} پاسخ درست لازم است (شما ${fa(s.boss.right)} پاسخ درست دادی).`}</p>}
      <button className="btn" onClick={() => dispatch({ type: win || over ? 'restart' : 'bossRetry' })}>
        {win ? 'بازی دوباره' : over ? 'شروع دوباره' : 'تلاش دوباره'}
      </button>
    </div>
  )
}

export default function App() {
  const [s, dispatch] = useReducer(reducer, undefined, () => fresh())
  const soundState = useRef(true)
  const [sound, setSoundState] = useReducer((_, v) => v, true)
  const setSound = (v) => { soundState.current = v; setSoundState(v) }
  const prev = useRef({ lives: s.lives, score: s.score })

  useEffect(() => {
    if (sound) {
      if (s.lives < prev.current.lives) beep(150, 0.3)
      else if (s.score > prev.current.score) beep(660, 0.12)
    }
    prev.current = { lives: s.lives, score: s.score }
  }, [s.lives, s.score, sound])

  useEffect(() => {
    if (s.screen !== 'win') return
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ name: s.name, badge: s.badge, score: s.score, at: new Date().toISOString() })) } catch { /* ذخیره‌سازی در دسترس نیست */ }
  }, [s.screen, s.name, s.badge, s.score])

  return (
    <main className="app">
      {s.screen === 'register' && <Register dispatch={dispatch} />}
      {s.screen === 'intro' && <Intro s={s} dispatch={dispatch} />}
      {s.screen === 'play' && <Play s={s} dispatch={dispatch} sound={sound} setSound={setSound} />}
      {s.screen === 'boss' && <Boss s={s} dispatch={dispatch} />}
      {['win', 'over', 'bossfail'].includes(s.screen) && <End s={s} dispatch={dispatch} />}
      <footer className="foot">ساخته‌شده توسط BG · شرکت Asset Systems</footer>
    </main>
  )
}
