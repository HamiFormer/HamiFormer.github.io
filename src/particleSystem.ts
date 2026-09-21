// Illustrative unit-mass disks, harmonic confinement and Hookean springs.
// Kick-drift-kick integration; exact time-of-impact for each ballistic drift.
export type Body = { x: number; y: number; vx: number; vy: number };
export type Sample = { t: number; bodies: Body[]; jump?: boolean };
export type Contact = { t: number; a: number; b: number; before: Body[]; after: Body[] };
export const radius = .085;
export const duration = 4.2;
export const restitution = .82;
export const bounds = { x: 1.45, y: 1.15 };
export const springs = [[0, 2], [2, 4]] as const;
const copy = (b: Body[]) => b.map(v => ({ ...v }));
const initial = (): Body[] => [
  { x: .81403524, y: -.12492623, vx: .39089666, vy: .65351043 },
  { x: .04358222, y: .51948151, vx: -.48514134, vy: -.16601613 },
  { x: -.42849467, y: .64898011, vx: -.23353078, vy: -.29085599 },
  { x: -.69120506, y: -.19557510, vx: -.24120064, vy: -.47850787 },
  { x: .21828749, y: -.77938851, vx: .83971753, vy: .16579228 },
];
function forces(b: Body[]) {
  const f = b.map(v => ({ x: -.72 * v.x, y: -.72 * v.y }));
  for (const [a, c] of springs) {
    const dx = b[c].x - b[a].x, dy = b[c].y - b[a].y;
    const d = Math.hypot(dx, dy), k = 1.15 * (d - .44) / Math.max(d, 1e-12);
    f[a].x += k * dx; f[a].y += k * dy;
    f[c].x -= k * dx; f[c].y -= k * dy;
  }
  return f;
}
export function simulate(substeps = 32, initialState = initial()) {
  const b = copy(initialState), samples: Sample[] = [{ t: 0, bodies: copy(b) }], contacts: Contact[] = [];
  const frames: Body[][] = [copy(b)];
  const dt = duration / (192 * substeps);
  let clock = 0;
  for (let step = 0; step < 192 * substeps; step++) {
    let f = forces(b);
    b.forEach((v, i) => { v.vx += .5 * dt * f[i].x; v.vy += .5 * dt * f[i].y; });
    let remaining = dt;
    while (remaining > 1e-12) {
      let hit = remaining + 1, a = -1, c = -1, axis: 'x' | 'y' = 'x';
      for (let i = 0; i < b.length; i++) {
        for (const dim of ['x', 'y'] as const) {
          const v = dim === 'x' ? b[i].vx : b[i].vy;
          if (Math.abs(v) < 1e-12) continue;
          const wall = Math.sign(v) * (bounds[dim] - radius);
          const time = (wall - b[i][dim]) / v;
          if (time >= -1e-10 && time < hit) { hit = Math.max(0, time); a = i; c = -1; axis = dim; }
        }
        for (let j = i + 1; j < b.length; j++) {
          const dx = b[j].x - b[i].x, dy = b[j].y - b[i].y;
          const vx = b[j].vx - b[i].vx, vy = b[j].vy - b[i].vy;
          const dot = dx * vx + dy * vy, speed = vx * vx + vy * vy;
          const disc = dot * dot - speed * (dx * dx + dy * dy - 4 * radius * radius);
          if (dot >= -1e-12 || disc < 0 || speed < 1e-12) continue;
          const time = (-dot - Math.sqrt(disc)) / speed;
          if (time >= -1e-9 && time < hit) { hit = Math.max(0, time); a = i; c = j; }
        }
      }
      const advance = Math.min(hit, remaining);
      b.forEach(v => { v.x += advance * v.vx; v.y += advance * v.vy; });
      clock += advance; remaining -= advance;
      if (hit > advance) break;
      const before = copy(b);
      if (c < 0) {
        if (axis === 'x') b[a].vx *= -restitution; else b[a].vy *= -restitution;
      } else {
        const dx = b[c].x - b[a].x, dy = b[c].y - b[a].y, d = Math.hypot(dx, dy);
        const nx = dx / d, ny = dy / d;
        const relative = (b[c].vx - b[a].vx) * nx + (b[c].vy - b[a].vy) * ny;
        const impulse = -(1 + restitution) * relative / 2;
        b[a].vx -= impulse * nx; b[a].vy -= impulse * ny;
        b[c].vx += impulse * nx; b[c].vy += impulse * ny;
      }
      const after = copy(b);
      contacts.push({ t: clock, a, b: c, before, after });
      samples.push({ t: clock, bodies: before }, { t: clock, bodies: after, jump: true });
    }
    f = forces(b);
    b.forEach((v, i) => { v.vx += .5 * dt * f[i].x; v.vy += .5 * dt * f[i].y; });
    if ((step + 1) % (substeps / 4) === 0) samples.push({ t: clock, bodies: copy(b) });
    if ((step + 1) % substeps === 0) frames.push(copy(b));
  }
  return { frames, samples, contacts };
}
export const system = simulate();
export type View = 'xy' | 'phase';
export function projectBody(t: number, b: Body, view: View): [number, number] {
  const depth = view === 'xy' ? b.x / bounds.x : b.vx / 1.35;
  const height = view === 'xy' ? b.y / bounds.y : b.x / .95;
  return [112 + 440 * t / duration + 36 * depth, 235 - 48 * t / duration - 76 * height - 19 * depth];
}
export function trajectory(i: number, view: View) {
  return system.samples.map((s, k) => {
    const [x, y] = projectBody(s.t, s.bodies[i], view);
    return `${k === 0 || (view === 'phase' && s.jump) ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
}
