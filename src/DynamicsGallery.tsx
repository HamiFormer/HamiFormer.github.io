import { useState } from 'react';

function MotionClip({ name, label }: { name: string; label: string }) {
  const [moving, setMoving] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  return <div className="dynamics-clip">
    <div className="dynamics-image" aria-busy={!loaded && !failed}>
      {failed ? <div className="asset-error" role="alert"><p>Animation unavailable.</p><button onClick={() => { setFailed(false); setLoaded(false); setAttempt(attempt + 1); }}>Retry</button></div> : <>
        <img key={`${moving}-${attempt}`} src={`./assets/scenes/${name}.${moving ? 'webp' : 'png'}`} alt={label} width={900} height={900} onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />
        {!loaded && <span className="loading-label" role="status">Loading animation…</span>}
      </>}
    </div>
    <button className="dynamics-motion-toggle" onClick={() => { setMoving(!moving); setLoaded(false); }} aria-label={`${moving ? 'Show still image of' : 'Play'} ${label}`}>{moving ? 'Ⅱ Still view' : '▷ Play'}</button>
  </div>;
}

export function DynamicsGallery() {
  const [trajectory, setTrajectory] = useState(1);
  const [count, setCount] = useState(5);
  return <div className="dynamics-gallery">
    <section className="dynamics-panel" aria-label="HamiBalls-1 motion">
      <div className="dynamics-title"><h3>HamiBalls-1</h3><span>2D</span></div>
      <MotionClip key={`h1-${trajectory}`} name={`hami1-${trajectory}`} label={`HamiBalls-1, trajectory ${trajectory}`} />
      <div className="dynamics-controls"><span>Trajectory</span><div role="group" aria-label="HamiBalls-1 trajectory">{[1,2,3].map(n => <button key={n} aria-pressed={trajectory === n} onClick={() => setTrajectory(n)}>{n}</button>)}</div></div>
    </section>
    <section className="dynamics-panel" aria-label="HamiBalls-2 motion">
      <div className="dynamics-title"><h3>HamiBalls-2</h3><span>3D</span></div>
      <MotionClip key={`h2-${count}`} name={`hami2-${count}`} label={`HamiBalls-2, ${count} objects`} />
      <div className="dynamics-controls"><span>Objects</span><div className="object-counter"><button aria-label="Fewer objects" disabled={count === 5} onClick={() => setCount(n => Math.max(5,n-1))}>−</button><output aria-live="polite">{count}</output><button aria-label="More objects" disabled={count === 10} onClick={() => setCount(n => Math.min(10,n+1))}>+</button></div></div>
    </section>
    <aside className="dynamics-description"><p className="eyebrow">TWO PHYSICAL SYSTEMS</p><h3>Two systems.<br />Rich dynamics.</h3><dl><dt>HamiBalls-1</dt><dd>Five balls move in 2D, each connected by a spring to a fixed central anchor.</dd><dt>HamiBalls-2</dt><dd>Five to ten balls move in 3D under gravity, coupled through a random spring graph.</dd></dl><p className="dynamics-conventions">Both systems include confining boundaries and collisions. Higher surface gloss denotes a higher coefficient of restitution.</p></aside>
  </div>;
}
