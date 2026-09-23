import { useEffect, useRef, useState } from 'react';

function sceneLabel(name: string) {
  const value = name.split('-')[1];
  return name.startsWith('hami1') ? `HamiBalls-1, trajectory ${value}` : `HamiBalls-2, ${value} objects`;
}

function SceneVideo({ name, active, visible, onReady, onError }: {
  name: string;
  active: boolean;
  visible: boolean;
  onReady: (name: string) => void;
  onError: (name: string) => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);
  const isH2 = name.startsWith('hami2');
  const markReady = () => {
    if (ready) return;
    setReady(true);
    onReady(name);
  };

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (active && visible && ready) {
      void element.play().catch(() => {});
    } else {
      element.pause();
    }
  }, [active, visible, ready, fallback]);

  if (fallback) return <img className={active ? 'is-active' : 'is-incoming'} src={`./assets/scenes/${name}.webp`} alt={sceneLabel(name)} width={900} height={900} onLoad={markReady} onError={() => onError(name)} />;

  return <video ref={video} className={active ? 'is-active' : 'is-incoming'} src={`./assets/scenes/${name}.mp4`} poster={`./assets/scenes/${name}${isH2 ? '-cover.webp' : '.png'}`} aria-label={sceneLabel(name)} preload="auto" muted playsInline loop onCanPlay={markReady} onError={() => setFallback(true)} />;
}

function MotionClip({ name }: { name: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [moving, setMoving] = useState(true);
  const [activeName, setActiveName] = useState(name);
  const [incomingName, setIncomingName] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(!document.hidden);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '100px 0px' });
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  useEffect(() => {
    setIncomingName(name === activeName ? null : name);
    if (name !== activeName) {
      setMoving(true);
      setFailed(false);
    }
  }, [name, activeName]);

  const handleReady = (readyName: string) => {
    if (readyName === name && readyName !== activeName) {
      setActiveName(readyName);
      setIncomingName(null);
    }
    setLoaded(true);
  };

  const showStill = () => {
    if (moving) {
      setActiveName(name);
      setIncomingName(null);
      setMoving(false);
    } else {
      setLoaded(false);
      setMoving(true);
    }
  };

  return <div className="dynamics-clip" ref={root}>
    <div className="dynamics-image" aria-busy={(!loaded || Boolean(incomingName)) && !failed}>
      {failed ? <div className="asset-error" role="alert"><p>Animation unavailable.</p><button onClick={() => { setFailed(false); setLoaded(false); setAttempt(value => value + 1); }}>Retry</button></div> : moving ? <>
        {[activeName, incomingName].filter((value): value is string => value !== null).map(mediaName => <SceneVideo key={`${mediaName}-${attempt}`} name={mediaName} active={mediaName === activeName} visible={visible && pageVisible} onReady={handleReady} onError={failedName => { if (failedName === name) setFailed(true); }} />)}
      </> : <img src={`./assets/scenes/${name}.png`} alt={sceneLabel(name)} width={900} height={900} onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />}
    </div>
    <button className="dynamics-motion-toggle" onClick={showStill} aria-label={`${moving ? 'Show still image of' : 'Play'} ${sceneLabel(name)}`}>{moving ? 'Ⅱ Still view' : '▷ Play'}</button>
  </div>;
}

export function DynamicsGallery() {
  const [trajectory, setTrajectory] = useState(1);
  const [count, setCount] = useState(5);
  return <div className="dynamics-gallery">
    <section className="dynamics-panel" aria-label="HamiBalls-1 motion">
      <div className="dynamics-title"><h3>HamiBalls-1</h3><span>2D</span></div>
      <MotionClip name={`hami1-${trajectory}`} />
      <div className="dynamics-controls"><span>Trajectory</span><div role="group" aria-label="HamiBalls-1 trajectory">{[1,2,3].map(n => <button key={n} aria-pressed={trajectory === n} onClick={() => setTrajectory(n)}>{n}</button>)}</div></div>
    </section>
    <section className="dynamics-panel" aria-label="HamiBalls-2 motion">
      <div className="dynamics-title"><h3>HamiBalls-2</h3><span>3D</span></div>
      <MotionClip name={`hami2-${count}`} />
      <div className="dynamics-controls"><span>Objects</span><div className="object-counter"><button aria-label="Fewer objects" disabled={count === 5} onClick={() => setCount(n => Math.max(5,n-1))}>−</button><output aria-live="polite">{count}</output><button aria-label="More objects" disabled={count === 10} onClick={() => setCount(n => Math.min(10,n+1))}>+</button></div></div>
    </section>
    <aside className="dynamics-description"><p className="eyebrow">TWO PHYSICAL SYSTEMS</p><h3>Two systems.<br />Rich dynamics.</h3><dl><dt>HamiBalls-1</dt><dd>Five balls move in 2D, each connected by a spring to a fixed central anchor.</dd><dt>HamiBalls-2</dt><dd>Five to ten balls move in 3D under gravity, coupled through a random spring graph.</dd></dl><p className="dynamics-conventions">Both systems include confining boundaries and collisions. Higher surface gloss denotes a higher coefficient of restitution.</p></aside>
  </div>;
}
