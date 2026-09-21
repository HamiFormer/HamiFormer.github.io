import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Dataset, Metric } from './data';
import perEdge from './mse-per-edge.json';

const series = Object.fromEntries(Object.entries(perEdge).map(([dataset, methods]) => [
  dataset, Object.entries(methods).map(([method, values]) => {
    const sum = [0, 0, 0];
    return { method, prefix: values.map((row, i) => row.map((v, j) => (sum[j] += v) / (i + 1))) };
  }),
]));
const colors: Record<string, string> = {
  HamiFormer: '#7470b5', PhysiFormer: '#719bc6', DiT: '#70a9a5',
  'Transformer-AR (ctx=1)': '#b39ac4', 'Transformer-AR (ctx=4)': '#a8afbf',
  'HG-DPF': '#a8afbf',
};
function valuesAt(dataset: Dataset, metric: Metric, time: number) {
  const component = { z: 0, q: 1, p: 2 }[metric];
  const index = Math.min(191, Math.max(0, time - 1));
  const left = Math.floor(index), fraction = index - left;
  return series[dataset].map(s => ({
    method: s.method,
    value: s.prefix[left][component] * (1 - fraction) + s.prefix[Math.min(191, left + 1)][component] * fraction,
  }));
}
function ranksAt(dataset: Dataset, metric: Metric, time: number) {
  return Object.fromEntries(valuesAt(dataset, metric, time)
    .sort((a, b) => a.value - b.value || a.method.localeCompare(b.method))
    .map((row, i) => [row.method, i]));
}

export function MseRace({ dataset, metric }: { dataset: Dataset; metric: Metric }) {
  const [target, setTarget] = useState(192);
  const [playing, setPlaying] = useState(false);
  const [smooth, setSmooth] = useState(true);
  const clock = useRef(192);
  const positions = useRef(ranksAt(dataset, metric, 192));
  const [frame, setFrame] = useState({ time: 192, positions: { ...positions.current } });
  useEffect(() => {
    let id = 0, previous = performance.now();
    const reduced = !smooth;
    function tick(now: number) {
      const dt = Math.min(50, now - previous);
      previous = now;
      if (playing) clock.current = Math.min(192, clock.current + dt / 95);
      else {
        const delta = target - clock.current;
        clock.current = reduced || Math.abs(delta) < .002 ? target : clock.current + delta * (1 - Math.exp(-dt / 65));
      }
      const ranks = ranksAt(dataset, metric, clock.current);
      let moving = false;
      for (const [name, rank] of Object.entries(ranks)) {
        const before = positions.current[name] ?? rank;
        const delta = rank - before;
        positions.current[name] = reduced || Math.abs(delta) < .001 ? rank : before + delta * (1 - Math.exp(-dt / 170));
        moving ||= positions.current[name] !== rank;
      }
      setFrame({ time: clock.current, positions: { ...positions.current } });
      if (playing && clock.current === 192) {
        setTarget(192); setPlaying(false);
      } else if (playing || clock.current !== target || moving) id = requestAnimationFrame(tick);
    }
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [playing, target, metric, dataset, smooth]);

  const rows = valuesAt(dataset, metric, frame.time);
  const sorted = [...rows].sort((a, b) => a.value - b.value || a.method.localeCompare(b.method));
  const max = Math.max(...rows.map(r => r.value));
  const step = Math.round(frame.time);
  return <div className="mse-race">
    <div className="race-key"><span>Ranked by error · lower is better</span><span>Longest bar = current maximum</span><button className="race-motion" aria-pressed={smooth} onClick={() => setSmooth(!smooth)}>Smooth motion {smooth ? 'on' : 'off'}</button></div>
    <div className="race-chart" style={{ '--race-count': rows.length } as CSSProperties} role="img"
      aria-label={`Cumulative normalized ${metric}-MSE through step ${step}. ${sorted.map((r, i) => `${i + 1}: ${r.method}, ${r.value.toFixed(5)}`).join('; ')}`}>
      {rows.map(row => {
        const rank = sorted.findIndex(r => r.method === row.method);
        return <div className={`race-row ${row.method === 'HamiFormer' ? 'ours' : ''}`} key={row.method}
          style={{ transform: `translate3d(0, ${frame.positions[row.method] * 100}%, 0)`, zIndex: row.method === 'HamiFormer' ? 2 : 1 }}>
          <span className="race-rank">{String(rank + 1).padStart(2, '0')}</span>
          <span className="race-name">{row.method}{row.method === 'HamiFormer' && <small>Ours</small>}</span>
          <div className="race-track"><div className="race-fill" style={{ width: `${max ? row.value / max * 100 : 0}%`, background: colors[row.method] }} /></div>
          <span className="race-value">{row.value.toFixed(5)}</span>
        </div>;
      })}
    </div>
    <div className="race-controls">
      <button className="race-play" aria-label={playing ? 'Pause error timeline' : 'Play error timeline'} onClick={() => {
        if (playing) { setTarget(clock.current); setPlaying(false); }
        else { if (clock.current >= 191.999) clock.current = 1; setPlaying(true); }
      }}>{playing ? <span aria-hidden="true">Ⅱ</span> : <span aria-hidden="true">▶</span>}</button>
      <div className="race-scrubber">
        <label htmlFor="mse-horizon">Cumulative MSE <span>physical steps 1–{step}</span></label>
        <input id="mse-horizon" type="range" min="1" max="192" step="1" value={playing ? step : Math.round(target)}
          aria-valuetext={`Steps 1 through ${step}`} onChange={e => { setPlaying(false); setTarget(Number(e.target.value)); }} />
        <div className="race-ticks" aria-hidden="true"><span>1</span><span>48</span><span>96</span><span>144</span><span>192</span></div>
      </div>
      <output className="race-step" htmlFor="mse-horizon">{String(step).padStart(3, '0')}<small>/ 192</small></output>
    </div>
    <p className="race-note">Mean normalized error over steps 1–t. Animation interpolates between recorded steps; the table below reports the full 192-step results.</p>
  </div>;
}
