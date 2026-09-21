import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { ReactNode } from 'react';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import '@fontsource/space-grotesk/latin-400.css';
import '@fontsource/space-grotesk/latin-500.css';
import '@fontsource/space-grotesk/latin-600.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import './styles.css';
import './dynamics-gallery.css';
import { MotionWindow } from './MotionWindow';
import { DynamicsGallery } from './DynamicsGallery';
import { resources, results } from './data';
import { MseRace } from './MseRace';
import type { Dataset, Metric } from './data';

function Icon({ kind = 'arrow' }: { kind?: 'arrow' | 'paper' | 'code' | 'expand' | 'close' }) {
  const paths = {
    arrow: <><path d="M5 15 15 5M5 5h10v10" /></>,
    paper: <><path d="M12 2H4v16h12V6zM12 2v4h4M7 10h6M7 13h6" /></>,
    code: <><path d="m6 5-5 5 5 5m8-10 5 5-5 5M12 3 8 17" /></>,
    expand: <><path d="M7 2H2v5m11-5h5v5M2 13v5h5m11-5v5h-5" /></>,
    close: <><path d="m4 4 12 12M16 4 4 16" /></>,
  };
  return <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[kind]}</svg>;
}

function Header() {
  return <header className="site-header"><div className="header-inner">
    <a className="wordmark" href="#top" aria-label="HamiFormer, back to top"><span className="brand-symbol" aria-hidden="true">H<span>↗</span></span>HamiFormer</a>
    <nav aria-label="Main navigation"><a href="#predictions">Predictions</a><a href="#method">Method</a><a href="#results">Results</a><a className="nav-paper" aria-disabled="true" title="TODO" role="link" tabIndex={0}>Read paper <Icon /></a></nav>
  </div></header>;
}

function Hero() {
  return <section className="hero" aria-labelledby="project-title"><div className="hero-grid">
    <div className="hero-copy"><p className="eyebrow"><span className="eyebrow-line" /> LEARNING PHYSICAL DYNAMICS</p>
    <h1 id="project-title">HamiFormer</h1>
    <p className="paper-title">Dual-Expert Diffusion Fields<br className="desktop-break" /> with Affine Symplectic Maps</p>
    <p className="hero-description">A whole-window view of motion.<br />A structured step through time.</p>
    <div className="hero-links">
      <a className="button primary" aria-disabled="true" title="TODO" role="link" tabIndex={0}><Icon kind="paper" /> Read the paper</a>
      <a className="button" href={resources[1].href} target="_blank" rel="noreferrer"><Icon kind="code" /> Code</a>
      <a className="text-action" href="#resources">Data & weights <span aria-hidden="true">↗</span></a>
    </div><p className="authors">Anonymous authors <span>·</span> Under review</p></div>
    <MotionWindow />
    </div><div className="hero-baseline"><p>SMOOTH DYNAMICS <span>×</span> INELASTIC COLLISIONS <span>×</span> LONG HORIZONS</p><a href="#predictions">Explore the predictions <span aria-hidden="true">↓</span></a></div>
  </section>;
}

function EvidenceStrip() {
  return <div className="evidence-strip"><div className="evidence-inner"><div className="evidence-context"><span>THE LONG VIEW</span><p>Prediction over <strong>192</strong> physical steps.</p></div><div className="evidence-stat"><strong>−26.3<span>%</span></strong><p>HamiBalls-1 <span>2D</span></p></div><div className="evidence-stat"><strong>−24.1<span>%</span></strong><p>HamiBalls-2 <span>3D</span></p></div><p className="evidence-note">Lower normalized phase-space MSE <br />relative to PhysiFormer.<a href="#results">Inspect the results ↗</a></p></div></div>;
}

function FigureViewer({ src, title, alt, caption, className = '' }: { src: string; title: string; alt: string; caption: ReactNode; className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const dimensions = src.includes('qualitative-aligned') ? [2610, 1254] : src.endsWith('teaser.svg') ? [396, 187.2] : src.includes('architecture-web') ? [1300, 1300 * 440.713 / 917.693] : src.endsWith('architecture.svg') ? [935.35, 517.25] : [2600, 1278];
  return <figure className={`paper-figure ${className}`}>
    <div className={`figure-surface ${!loaded ? 'is-loading' : ''}`} aria-busy={!loaded && !failed}>
      {failed ? <div className="asset-error"><p>This figure could not be loaded.</p><button className="button" onClick={() => { setFailed(false); setLoaded(false); setAttempt(attempt + 1); }}>Try again</button><a aria-disabled="true" title="TODO" role="link" tabIndex={0}>View it in the paper</a></div> : <>
        <button className="figure-button" aria-label={`Enlarge ${title}`} onClick={() => dialog.current?.showModal()} disabled={!loaded}>
          <img key={attempt} src={src} alt={alt} width={dimensions[0]} height={dimensions[1]} onLoad={() => setLoaded(true)} onError={() => { setLoaded(true); setFailed(true); }} />
          <span className="expand-label"><Icon kind="expand" /><span>Expand</span></span>
        </button>
        {!loaded && <span className="loading-label" role="status">Loading figure…</span>}
      </>}
    </div>
    <figcaption>{caption}</figcaption>
    <dialog ref={dialog} className="figure-dialog" aria-label={title} onClick={e => { if (e.target === dialog.current) dialog.current?.close(); }}>
      <div className="dialog-header"><span>{title}</span><button className="icon-button" aria-label="Close enlarged figure" onClick={() => dialog.current?.close()}><Icon kind="close" /></button></div>
      <img src={src} alt={alt} />
      <p>Scroll to inspect on smaller screens. Press Esc to close.</p>
    </dialog>
  </figure>;
}

function SectionHeading({ number, label, children }: { number: string; label: string; children: ReactNode }) {
  return <div className="section-heading"><p className="eyebrow"><span className="section-number">{number}</span>{label}</p><h2>{children}</h2></div>;
}

function PredictionsSection() {
  return <section id="predictions" className="section predictions-section">
    <div className="section-top"><SectionHeading number="01" label="HAMIBALLS">Motion, under a closer lens.</SectionHeading><p className="section-aside">Explore trajectories in two and three dimensions.</p></div>
    <DynamicsGallery />
    <div className="qualitative-comparisons">
      <div className="qualitative-heading"><h3>Several prediction snapshots</h3><p>Two sequences per system, three recorded states per sequence.</p></div>
      <h4>HamiBalls-1 <span>2D dynamics</span></h4>
      <FigureViewer src="./assets/hami1-qualitative-aligned.webp" title="HamiBalls-1 prediction snapshots" alt="Six columns and three rows comparing GT, PhysiFormer and Ours. Left sequence: edges 32, 128, 176. Right sequence: edges 16, 96, 192. Dashed outlines mark ground truth; filled spheres mark predictions." caption="In the prediction rows, dashed outlines show ground truth and filled spheres show predictions; trails cover the preceding 32 edges." />
      <h4>HamiBalls-2 <span>3D dynamics</span></h4>
      <FigureViewer src="./assets/hami2-qualitative-aligned.webp" title="HamiBalls-2 trajectory comparison" alt="Two trajectories at three recorded steps, comparing ground truth, PhysiFormer and HamiFormer. Red circles identify significant object-wise prediction errors." caption="Red circles highlight prediction errors." />
    </div>
  </section>;
}

const methodSteps = [
  { index: '01', title: 'Predict together', body: 'The diffusion expert revises the entire future window. The Hamiltonian expert propagates a local candidate with learned residual corrections.' },
  { index: '02', title: 'Mix, then propagate', body: 'A router blends the two candidates. The blended state becomes the next predecessor, feeding the whole-window estimate back into local dynamics.' },
  { index: '03', title: 'Refine across denoising', body: 'PLAS builds affine maps from cached trajectory anchors and carries refinement across RF steps. The Regime Model Tree specializes residuals and routing.' },
];

function MethodSection() {
  return <section id="method" className="section method">
    <div className="section-top"><SectionHeading number="02" label="THE METHOD">Two experts. One closed loop.</SectionHeading><p className="section-aside">Each mixed prediction guides <br />the next physical step.</p></div>
    <div className="method-intro"><span className="expert-pair" aria-hidden="true">D <span>⇄</span> H</span><div><p>Physical motion combines smooth evolution with abrupt collisions. HamiFormer connects a whole-window diffusion expert with a residual-corrected Hamiltonian expert through mixed-state feedback.</p><p>Parallel Local Affine Scan (PLAS) amortizes implicit refinement across denoising steps. A Regime Model Tree adapts corrections and expert mixing to the observed dynamical state.</p></div></div>
    <FigureViewer className="architecture-figure" src="./assets/architecture-web-final-palette.svg" title="HamiFormer architecture" alt="The dual-expert denoiser mixes diffusion and Hamiltonian candidates. PLAS uses previous RF anchors, and the Regime Model Tree supplies residual and routing corrections." caption={<><span>Architecture</span> Whole-window denoising, mixed-state propagation, and regime-conditioned correction.</>} />
    <div className="method-steps">{methodSteps.map(step => <article key={step.index}><span className="step-index">{step.index}</span><h3>{step.title}</h3><p>{step.body}</p></article>)}</div>
    <div className="theory-note"><span className="note-label">ANALYSIS</span><p>We establish conditions for physical consistency, refinement convergence and tracking, and finite-window error control through diffusion feedback. <a aria-disabled="true" title="TODO" role="link" tabIndex={0}>Theory & proofs ↗</a></p></div>
  </section>;
}

function ResultsSection() {
  const [dataset, setDataset] = useState<Dataset>('HamiBalls-2');
  const [metric, setMetric] = useState<Metric>('z');
  const rows = results[dataset];
  return <section id="results" className="section results-section">
    <div className="section-top"><SectionHeading number="03" label="THE EVIDENCE">Better predictions, further ahead.</SectionHeading><a className="inline-link" aria-disabled="true" title="TODO" role="link" tabIndex={0}>Full evaluation <Icon /></a></div>
    <p className="results-intro">Over 192 physical steps, HamiFormer lowers normalized phase-space MSE by <strong>26.3% on HamiBalls-1</strong> and <strong>24.1% on HamiBalls-2</strong> relative to capacity-comparable PhysiFormer baselines.</p>
    <div className="results-panel">
      <div className="results-toolbar"><div className="dataset-switch" role="group" aria-label="Dataset">{(['HamiBalls-1', 'HamiBalls-2'] as Dataset[]).map(name => <button key={name} aria-pressed={dataset === name} onClick={() => setDataset(name)}>{name}</button>)}</div><label className="metric-select">Metric<select value={metric} onChange={e => setMetric(e.target.value as Metric)}><option value="z">Phase space (z)</option><option value="q">Position (q)</option><option value="p">Momentum (p)</option></select></label></div>
      <div className="result-meta"><span>{dataset === 'HamiBalls-1' ? '2D · 5 objects · Central springs' : '3D · 5–10 objects · Sparse springs & gravity'}</span><span>Normalized MSE ↓</span></div>
      <MseRace key={dataset} dataset={dataset} metric={metric} />
      <details className="data-details"><summary>View exact values <span aria-hidden="true">+</span></summary><div className="table-scroll"><table><caption>{dataset} · Pooled 192-edge normalized MSE (lower is better)</caption><thead><tr><th scope="col">Method</th><th scope="col">Phase space (z)</th><th scope="col">Position (q)</th><th scope="col">Momentum (p)</th></tr></thead><tbody>{rows.map(row => <tr key={row.method} className={row.ours ? 'ours' : ''}><th scope="row">{row.method}</th><td>{row.z.toFixed(5)}</td><td>{row.q.toFixed(5)}</td><td>{row.p.toFixed(5)}</td></tr>)}</tbody></table></div></details>
      <p className="protocol">Table 1 of the paper. 512 physical sources per dataset, two sampling-noise realizations for diffusion models. Ground truth is supplied only at initialization.</p>
    </div>
    <div className="solver-row"><div><p className="eyebrow">NUMERICAL REFINEMENT</p><h3>Structure, with an efficient solver.</h3><p>On HamiBalls-1, PLAS combines 49.4× lower solver RMSE than Explicit Euler with 37.7% less sampling time than SymEuler2. The comparison pairs numerical accuracy with runtime under the same evaluation protocol.</p><a className="inline-link" aria-disabled="true" title="TODO" role="link" tabIndex={0}>Solver experiments <Icon /></a></div><div className="solver-comparison"><table aria-label="HamiBalls-1 solver accuracy and sampling time"><thead><tr><th scope="col">Solver</th><th scope="col">Time (s) ↓</th><th scope="col">Solver RMSE ↓</th></tr></thead><tbody><tr><th scope="row">Explicit Euler</th><td>0.8875</td><td>4.846 × 10<sup>−4</sup></td></tr><tr><th scope="row">SymEuler2<small>2-iteration symplectic Euler</small></th><td>1.2752</td><td><strong>5.319 × 10<sup>−8</sup></strong></td></tr><tr className="solver-plas"><th scope="row">PLAS</th><td><strong>0.7940</strong></td><td>9.801 × 10<sup>−6</sup></td></tr></tbody></table><p>RMSE: phase-space agreement with an FP64 Newton reference, over 512 sources and two noises. Time: median of 11 warmed, synchronized B64 × 48 runs.</p></div></div>
  </section>;
}

function ResourcesSection() {
  return <section id="resources" className="section resources"><SectionHeading number="04" label="EXPLORE THE WORK">Paper, code, and data.</SectionHeading><div className="resource-list">{resources.map(resource => <a key={resource.name} href={resource.href || undefined} aria-disabled={!resource.href || undefined} title={!resource.href ? "TODO" : undefined} role={!resource.href ? "link" : undefined} tabIndex={!resource.href ? 0 : undefined} target={resource.href ? "_blank" : undefined} rel={resource.href ? "noreferrer" : undefined}><span className="resource-name">{resource.name}</span><span className="resource-detail">{resource.detail}</span><span className="resource-type">{resource.type}</span><Icon /></a>)}</div></section>;
}

function App() {
  return <><a className="skip-link" href="#predictions">Skip to content</a><Header /><div className="dark-stage" id="top"><Hero /></div><main><EvidenceStrip /><div className="container"><PredictionsSection /><MethodSection /><ResultsSection /><ResourcesSection /></div></main><footer className="site-footer"><div className="container footer-inner"><a className="wordmark" href="#top">HamiFormer<span className="footer-arrow" aria-hidden="true">↗</span></a><span>Dual-Expert Diffusion Fields<br />with Affine Symplectic Maps</span><a href="#top">Back to top ↑</a></div></footer></>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
