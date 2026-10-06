import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

export function formatDate(date: Date | Timestamp | null | undefined): string {
  if (!date) return '—';
  const d = date instanceof Timestamp ? date.toDate() : new Date(date);
  return format(d, 'dd MMM yyyy');
}

export function formatDateShort(date: Date | Timestamp | null | undefined): string {
  if (!date) return '—';
  const d = date instanceof Timestamp ? date.toDate() : new Date(date);
  return format(d, 'dd/MM/yy');
}

export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined) return '—';
  return score.toFixed(2);
}

export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined) return '—';
  return `${value.toFixed(decimals)}%`;
}

export function formatTime(seconds: number): string {
  if (seconds <= 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function parseTimeInput(value: string): number {
  // Accept MM:SS or HH:MM:SS
  const parts = value.split(':').map((p) => parseInt(p, 10));
  if (parts.length === 2) return (parts[0] || 0) * 60 + (parts[1] || 0);
  if (parts.length === 3) return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  return parseInt(value, 10) * 60 || 0;
}

export function formatImprovement(value: number): string {
  if (value > 0) return `+${value.toFixed(2)}`;
  return value.toFixed(2);
}

export function formatImprovementPercent(value: number): string {
  if (value > 0) return `+${value.toFixed(1)}%`;
  return `${value.toFixed(1)}%`;
}

export function toISODate(date: Date | Timestamp): string {
  const d = date instanceof Timestamp ? date.toDate() : date;
  return format(d, 'yyyy-MM-dd');
}
