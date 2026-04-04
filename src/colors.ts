const PALETTE: string[] = [
  '#4ec9b0', // teal
  '#ce9178', // orange
  '#569cd6', // blue
  '#c586c0', // purple
  '#b5cea8', // green
  '#f44747', // red
  '#dcdcaa', // yellow
  '#9cdcfe', // light blue
];

export function assignColor(index: number): string {
  return PALETTE[index % PALETTE.length];
}

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
