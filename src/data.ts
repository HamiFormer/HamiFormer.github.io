export type Dataset = 'HamiBalls-1' | 'HamiBalls-2';
export type Metric = 'z' | 'q' | 'p';
export interface Result { method: string; z: number; q: number; p: number; ours?: boolean }

// Pooled 192-edge normalized MSE, Table 1 of the accompanying paper.
export const results: Record<Dataset, Result[]> = {
  'HamiBalls-1': [
    { method: 'HG-DPF', z: 1.17966, q: 1.29854, p: 1.06077 },
    { method: 'PhysiFormer', z: 0.34029, q: 0.34689, p: 0.33369 },
    { method: 'HamiFormer', z: 0.25071, q: 0.25596, p: 0.24546, ours: true },
  ],
  'HamiBalls-2': [
    { method: 'Transformer-AR (ctx=4)', z: 1.51165, q: 0.94036, p: 2.08295 },
    { method: 'Transformer-AR (ctx=1)', z: 0.90340, q: 0.56438, p: 1.24241 },
    { method: 'DiT', z: 0.88309, q: 0.60233, p: 1.16386 },
    { method: 'PhysiFormer', z: 0.91397, q: 0.59681, p: 1.23113 },
    { method: 'HamiFormer', z: 0.69398, q: 0.49281, p: 0.89516, ours: true },
  ],
};
export const resources = [
  { name: 'Paper', detail: 'Full paper & supplementary material', href: '', type: 'PDF', external: false },
  { name: 'Code', detail: 'Training, evaluation & numerical solvers', href: 'https://github.com/HamiFormer/HamiFormer', type: 'GitHub', external: true },
  { name: 'Datasets', detail: 'HamiBalls physical simulation datasets', href: 'https://huggingface.co/datasets/HamiFormer/Hamiballs', type: 'Hugging Face', external: true },
  { name: 'Model weights', detail: 'Pretrained model assets', href: 'https://huggingface.co/HamiFormer/HamiFormer-Assets', type: 'Hugging Face', external: true },
];
