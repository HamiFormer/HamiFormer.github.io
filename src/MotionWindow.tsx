import { useEffect, useRef, useState } from 'react';
import { duration, projectBody, springs, system, type View } from './particleSystem';

const plane = (t: number) => {
  const x = 72 + t * 440, y = 148 - t * 48;
  return `${x},${y} ${x + 80},${y - 42} ${x + 80},${y + 132} ${x},${y + 174}`;
};
const colors = ['#7776c5', '#a18dcc', '#b49bca', '#479ba9', '#749dc4'];
// Small continuous-looking width changes add depth without changing the paths.
const fiberSegments = (i: number, view: View, until: number) => Array.from({ length: 32 }, (_, part) => {
  const start = Math.floor(part * (system.samples.length - 1) / 32);
  const end = Math.floor((part + 1) * (system.samples.length - 1) / 32);
  const points = system.samples.slice(start, end + 1).filter(s => s.t <= until + 1e-9);
  if (!points.length) return { d: '', width: 1, opacity: 0 };
  const middle = points[Math.floor(points.length / 2)];
  const wave = .5 + .5 * Math.sin(middle.t / duration * Math.PI * 2 - i * .65);
  return {
    d: points.map((s, k) => {
      const [x, y] = projectBody(s.t, s.bodies[i], view);
      return `${k === 0 || (view === 'phase' && s.jump) ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' '),
    width: 1.18 + .22 * wave,
    opacity: .86 + .1 * wave,
  };
});
const lanes = [-3, -2, -1, 1, 2, 3];
// Screen-space filaments are decorative texture, not additional simulated bodies.
const filament = (i: number, view: View, lane: number, from = 0, to = duration, tip?: number) => {
  const points = system.samples.filter(s => s.t >= from - 1e-9 && s.t <= to + 1e-9);
  return points.map((s, k) => {
    const [x, y] = projectBody(s.t, s.bodies[i], view);
    let spread = .8 + 1.28 * Math.sin(s.t / duration * Math.PI * 2 + i * .45) ** 2;
    for (const c of system.contacts) if (c.a === i || c.b === i) spread *= Math.min(1, Math.abs(s.t - c.t) / .13);
    if (tip !== undefined) spread *= Math.min(1, Math.max(0, (tip - s.t) / .13));
    const offset = lane * spread;
    return `${k === 0 || (view === 'phase' && s.jump) ? 'M' : 'L'}${(x + .22 * offset).toFixed(2)},${(y + offset).toFixed(2)}`;
  }).join(' ');
};
const firstContact = system.contacts.find(c => c.b >= 0)!;
const coil = (a: [number, number], b: [number, number], amplitude = 1.6) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], length = Math.hypot(dx, dy);
  if (length < 1) return `M${a}L${b}`;
  const turns = Math.max(4, Math.min(12, Math.round(length / 5)));
  const width = Math.min(amplitude, length / 12);
  const points = [a, [a[0] + dx * .14, a[1] + dy * .14]];
  for (let j = 1; j < turns; j++) {
    const t = .14 + .72 * j / turns, offset = (j % 2 ? 1 : -1) * width;
    points.push([a[0] + dx * t - dy / length * offset, a[1] + dy * t + dx / length * offset]);
  }
  points.push([a[0] + dx * .86, a[1] + dy * .86], b);
  return points.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
};

export function MotionWindow() {
  const root = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(Math.round(firstContact.t / duration * 192));
  const [view, setView] = useState<View>('xy');
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!playing || !visible) return;
    let id: number, last = 0;
    const advance = (time: number) => {
      if (time - last > 45 && !document.hidden) {
        setStep(value => value >= 192 ? 0 : value + 1);
        last = time;
      }
      id = requestAnimationFrame(advance);
    };
    id = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(id);
  }, [playing, visible]);

  const time = step / 192 * duration;
  const bodies = system.frames[step];
  const anchor = projectBody(time, { x: 0, y: 0, vx: 0, vy: 0 }, 'xy');
  const nearby = system.contacts.filter(c => Math.abs(c.t - time) < .07);
  return <div className="motion-window" ref={root}>
    <div className="motion-top"><span>5 BODIES / SPRINGS & CONTACTS</span><span>ILLUSTRATIVE SIMULATION</span></div>
    <div className="motion-stage">
    <div className="motion-view-switch" role="group" aria-label="Trajectory coordinates">{(['xy', 'phase'] as const).map(mode => <button key={mode} aria-label={mode === 'xy' ? 'XY space' : 'Phase space'} title={mode === 'xy' ? 'Position trajectories (x, y, t)' : 'Phase trajectories (x, pₓ, t)'} aria-pressed={view === mode} onClick={() => setView(mode)}>
      <svg viewBox="0 0 66 58" aria-hidden="true"><path d="M15 39V14m0 25 26-15m-26 15 32 6" /><text x="11" y="10">{mode === 'xy' ? 'y' : 'x'}</text><text x="43" y="22">{mode === 'xy' ? 'x' : 'pₓ'}</text><text x="51" y="49">t</text></svg>
    </button>)}</div>
    <svg className="motion-svg" viewBox="0 0 650 405" role="img" aria-label={`Five simulated spring-connected disks, ${view === 'xy' ? 'position' : 'position and momentum'} against time. Two actual contacts are marked. Illustration, not model predictions.`}>
      <g className="window-rails"><path d="M72 148 512 100M152 106 592 58M152 280 592 232M72 322 512 274" />
        {[0, 1].map(t => <polygon key={t} points={plane(t)} />)}
        {[1 / 3, 2 / 3].map(t => <polygon key={t} points={plane(t)} opacity=".65" />)}
      </g>
      {system.contacts.map((c, i) => {
        const a = projectBody(c.t, c.before[c.a], view), b = projectBody(c.t, c.before[c.b], view);
        const x = (a[0] + b[0]) / 2, y = (a[1] + b[1]) / 2;
        return <g key={i}><polygon className="contact-plane" points={plane(c.t / duration)} />
          <rect x={x - 39} y={y - 59} width="78" height="16" fill="white" fillOpacity=".94" />
          <text className="contact-label" x={x} y={y - 47} textAnchor="middle">CONTACT {i + 1}</text>
          <path className="contact-leader" d={`M${x} ${y - 39}V${y}`} fill="none" />
          <circle cx={x} cy={y} r="2.6" fill="#b37b35" />
        </g>;
      })}
      <g fill="none" strokeLinecap="round" aria-hidden="true">{colors.map((color, i) => <g key={i} stroke={color}>
        {lanes.map(lane => <path key={lane} d={filament(i, view, lane, 0, time, time)} strokeWidth=".6" opacity={Math.abs(lane) === 1 ? .5 : Math.abs(lane) === 2 ? .25 : .13} />)}
        {Array.from({ length: 12 }, (_, j) => {
          const age = (11 - j) / 12, tail = duration * .2;
          const from = Math.max(0, time - tail * (1 - j / 12)), to = Math.max(0, time - tail * (1 - (j + 1) / 12));
          if (to <= from) return null;
          return <g key={`tail-${j}`} opacity={.18 + .54 * (1 - age) ** 1.5}>{lanes.map(lane => <path key={lane} d={filament(i, view, lane, from, to, time)} strokeWidth=".7" opacity={Math.abs(lane) === 1 ? 1 : Math.abs(lane) === 2 ? .7 : .4} />)}</g>;
        })}
      </g>)}</g>
      <g className="trajectory-paths" strokeLinecap="round">{colors.map((color, i) => <g key={i} stroke={color}>{fiberSegments(i, view, time).map((segment, j) => <path key={j} d={segment.d} strokeWidth={segment.width} opacity={segment.opacity} />)}</g>)}</g>
      {view === 'phase' && <g fill="none" strokeWidth=".7" strokeDasharray="2 3">{system.contacts.filter(c => c.t <= time).flatMap((c, n) => [c.a, c.b].filter(i => i >= 0).map(i => {
        const a = projectBody(c.t, c.before[i], view), b = projectBody(c.t, c.after[i], view);
        return <path key={`${n}-${i}`} d={`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`} stroke={colors[i]} opacity=".4" />;
      }))}</g>}
      <polygon className="active-plane" points={plane(step / 192)} />
      {view === 'xy' && <g className="spring-links">
        <g className="center-springs">{bodies.map((b, i) => <path key={i} d={coil(anchor, projectBody(time, b, view), 1.2)} />)}</g>
        {springs.map(([a, b]) => {
        const p = projectBody(time, bodies[a], view), q = projectBody(time, bodies[b], view);
        return <path key={`${a}-${b}`} d={coil(p, q)} />;
      })}<path className="spring-anchor" d={`M${anchor[0]-3} ${anchor[1]}h6m-3-3v6`}><title>Fixed center: zero-rest-length springs to all five bodies</title></path></g>}
      {colors.map((color, i) => { const [x, y] = projectBody(time, bodies[i], view); return <circle key={i} cx={x} cy={y} r={view === 'xy' ? 4.3 : 3.2} fill={color} stroke="white" strokeWidth=".6" />; })}
      {nearby.map((c, i) => { const [x, y] = projectBody(time, bodies[c.a], view); return <circle key={i} cx={x} cy={y} r="7.4" fill="none" stroke="#b37b35" strokeWidth="1.35" />; })}
      <g className="time-labels">{[0, 48, 96, 144, 192].map((value, i) => <g key={value}><path d={`M${72 + i * 110} ${334 - i * 12}v5`} /><text x={72 + i * 110} y={358 - i * 12} textAnchor="middle">{String(value).padStart(3, '0')}</text></g>)}
        <text x="589" y="309">t →</text>
      </g>
    </svg>
    </div>
    <div className="motion-controls">
      <button className="motion-toggle" onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause conceptual animation' : 'Play conceptual animation'}>{playing ? <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 5v10M13 5v10" /></svg> : <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 9 6-9 6z" /></svg>}</button>
      <label className="sr-only" htmlFor="conceptual-time">Conceptual physical step</label>
      <input id="conceptual-time" type="range" min="0" max="192" value={step} onChange={event => { setPlaying(false); setStep(Number(event.target.value)); }} />
      <span className="motion-value">{String(step).padStart(3, '0')} <span>/ 192</span></span>
    </div>
  </div>;
}
