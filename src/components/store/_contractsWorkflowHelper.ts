export interface WorkflowTask { id: string; title: string; done: boolean; due?: string | null; note?: string }
export interface WorkflowCategory { id: string; name: string; tasks: WorkflowTask[] }
export interface ContractLike { eventDate?: string; eventTime?: string; depositPaid?: boolean; finalPaymentPaid?: boolean }
export interface WorkflowTemplate { id: string; name: string; categories: WorkflowCategory[]; createdAt: string; updatedAt: string }

export function defaultWorkflow(c: ContractLike): WorkflowCategory[] {
  const baseDate = c.eventDate ? new Date(c.eventDate) : new Date();
  const eventDT = c.eventDate ? new Date(`${c.eventDate}T${c.eventTime || '00:00'}`) : null;
  const d = (offsetDays: number) => new Date(baseDate.getTime() + offsetDays*86400000).toISOString();
  return [
    {
      id: 'lead', name: 'LEAD', tasks: [
        { id: 'lead-created', title: 'Lead creado', done: true, due: d(0) },
        { id: 'lead-email', title: 'Respuesta al lead (email automático)', done: false, due: d(0) },
        { id: 'lead-follow', title: 'Seguimiento al lead (email)', done: false, due: d(0) },
      ]
    },
    {
      id: 'produccion', name: 'PRODUCCIÓN', tasks: [
        { id: 'accepted', title: 'Trabajo aceptado', done: Boolean(c.depositPaid), due: d(0) },
        { id: 'thanks', title: 'Gracias por reservar (email auto)', done: false, due: d(1) },
        { id: 'gift', title: 'Enviar regalo a la novia', done: false, due: d(60) },
        { id: 'schedule', title: 'Organizar cronograma', done: false, due: d(320) },
        { id: 'pre-meeting', title: 'Reunión previa', done: false, due: d(-14) },
        { id: 'main-shoot', title: 'Sesión principal', done: false, due: eventDT ? eventDT.toISOString() : d(365) },
      ]
    },
    {
      id: 'post', name: 'POST PRODUCCIÓN', tasks: [
        { id: 'sneak', title: 'Subir sneak peek', done: false, due: d(1) },
        { id: 'email-sneak', title: 'Enviar sneak peek (email)', done: false, due: d(1) },
        { id: 'deliver', title: 'Entregar galería completa', done: false, due: d(21) },
        { id: 'done', title: 'Trabajo completo', done: Boolean(c.finalPaymentPaid), due: d(30) },
      ]
    },
  ];
}

function hslToHex(h: number, s: number, l: number) {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h/30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) => Math.round(255 * x).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

export function categoryColors(count: number): string[] {
  if (count <= 1) return ['#ef4444'];
  // Generate colors from red (0) -> yellow (60) -> green (120)
  const stops = [0, 60, 120];
  const segments = stops.length - 1; // 2
  const totalSteps = Math.max(count - 1, 1);
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / totalSteps; // 0..1
    const seg = Math.min(Math.floor(t * segments), segments - 1);
    const segT = (t - seg / segments) * segments;
    const h = stops[seg] + (stops[seg + 1] - stops[seg]) * segT;
    const s = 85; // vivid
    const l = 50; // mid lightness
    colors.push(hslToHex(h, s, l));
  }
  return colors;
}
