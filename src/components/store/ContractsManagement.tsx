import { useEffect, useMemo, useState } from 'react';
import { db } from '../../utils/firebaseClient';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc } from 'firebase/firestore';
import { ChevronDown, ChevronUp, CheckCircle, Clock, FileText, Loader, Mail, MapPin, Phone, Settings, Trash2, User, DollarSign, Link as LinkIcon, Calendar, Pencil, Plus, X, Trash } from 'lucide-react';
import { defaultWorkflow, categoryColors, WorkflowTemplate } from './_contractsWorkflowHelper';

interface WorkflowTask { id: string; title: string; done: boolean; due?: string | null; note?: string }
interface WorkflowCategory { id: string; name: string; tasks: WorkflowTask[] }

interface ContractItem {
  id: string;
  clientName: string;
  clientEmail: string;
  eventType?: string;
  eventDate?: string;
  eventTime?: string;
  contractDate?: string;
  totalAmount?: number;
  travelFee?: number;
  paymentMethod?: string;
  depositPaid?: boolean;
  finalPaymentPaid?: boolean;
  eventCompleted?: boolean;
  services?: any[];
  storeItems?: any[];
  message?: string;
  createdAt?: string;
  pdfUrl?: string;
  workflow?: WorkflowCategory[];
  reminders?: { type: 'finalPayment'; sendAt: string }[];
  formSnapshot?: any;
  packageTitle?: string;
  packageDuration?: string;
  eventLocation?: string;
}

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const ContractsManagement = () => {
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<ContractItem | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [viewing, setViewing] = useState<ContractItem | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowCategory[] | null>(null);
  const [savingWf, setSavingWf] = useState(false);
  const [wfEditMode, setWfEditMode] = useState(false);

  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [tplEditing, setTplEditing] = useState<WorkflowTemplate | null>(null);
  const [defaults, setDefaults] = useState<{ packages?: string; products?: string }>({});

  const fetchContracts = async () => {
    setLoading(true);
    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setContracts([]);
        return;
      }
      let items: ContractItem[] = [];
      try {
        const snap = await getDocs(query(collection(db, 'contracts'), orderBy('createdAt', 'desc')));
        items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      } catch (_) {
        try {
          const snap = await getDocs(collection(db, 'contracts'));
          items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
          items.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
        } catch (e) {
          console.warn('No se pudieron cargar los contratos', e);
          items = [];
        }
      }
      setContracts(items);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    const snap = await getDocs(collection(db, 'workflowTemplates'));
    const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as WorkflowTemplate[];
    setTemplates(list);
    const defDoc = await getDoc(doc(db, 'settings', 'workflowDefaults'));
    setDefaults((defDoc.exists() ? defDoc.data() : {}) as any);
  };

  useEffect(() => { fetchContracts(); }, []);

  const filtered = useMemo(() => {
    const list = (() => {
      if (!search.trim()) return contracts;
      const s = search.toLowerCase();
      return contracts.filter(c =>
        (c.clientName || '').toLowerCase().includes(s) ||
        (c.clientEmail || '').toLowerCase().includes(s) ||
        (c.eventType || '').toLowerCase().includes(s)
      );
    })();

    const now = new Date().getTime();
    const mapped = list.map(c => {
      const ev = c.eventDate ? new Date(c.eventDate) : undefined;
      const t = ev && !isNaN(ev.getTime()) ? ev.getTime() : new Date(c.contractDate || c.createdAt || Date.now()).getTime();
      const diff = Math.abs(t - now);
      return { c, diff };
    });

    mapped.sort((a, b) => {
      const ap = a.c.eventCompleted ? 1 : 0;
      const bp = b.c.eventCompleted ? 1 : 0;
      if (ap !== bp) return ap - bp;
      return a.diff - b.diff;
    });

    return mapped.map(m => m.c);
  }, [contracts, search]);

  const toggleFlag = async (id: string, field: keyof ContractItem) => {
    const current = contracts.find(c => c.id === id);
    if (!current) return;
    const next = !Boolean(current[field]);
    await updateDoc(doc(db, 'contracts', id), { [field]: next } as any);
    await fetchContracts();
  };

  const openEdit = (c: ContractItem) => {
    setEditing(c);
    setEditForm({
      clientName: c.clientName || '',
      clientEmail: c.clientEmail || '',
      eventDate: c.eventDate || '',
      eventTime: (c as any).eventTime || '',
      totalAmount: Number(c.totalAmount || 0),
      travelFee: Number(c.travelFee || 0),
      message: c.message || ''
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    const id = editing.id;
    const payload: Partial<ContractItem> = {
      clientName: String(editForm.clientName || ''),
      clientEmail: String(editForm.clientEmail || ''),
      eventDate: String(editForm.eventDate || ''),
      eventCompleted: editing.eventCompleted,
      totalAmount: Number(editForm.totalAmount || 0),
      travelFee: Number(editForm.travelFee || 0),
      message: String(editForm.message || ''),
    } as any;
    if (editForm.eventTime != null) (payload as any).eventTime = String(editForm.eventTime || '');
    await updateDoc(doc(db, 'contracts', id), payload as any);
    setEditing(null);
    await fetchContracts();
  };

  const openView = async (c: ContractItem) => {
    setWfEditMode(false);
    setViewing(c);
    const base = (c.workflow && c.workflow.length) ? c.workflow : [];

    const normalize = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
    const merged = JSON.parse(JSON.stringify(base)) as WorkflowCategory[];
    const findIdx = merged.findIndex(cat => normalize(cat.name).includes('entrega'));
    const idx = findIdx >= 0 ? findIdx : merged.length;
    if (findIdx < 0) merged.push({ id: uid(), name: 'Entrega de productos', tasks: [] });
    const cat = merged[idx];
    (Array.isArray(c.storeItems) ? c.storeItems : []).forEach((it: any) => {
      const title = `Entregar ${String(it.name || '')}`;
      if (!cat.tasks.some(t => normalize(t.title) === normalize(title))) {
        cat.tasks.push({ id: uid(), title, done: false });
      }
    });
    merged[idx] = cat;

    setWorkflow(JSON.parse(JSON.stringify(merged)));
    if (templates.length === 0) await fetchTemplates();
  };

  const saveWorkflow = async () => {
    if (!viewing || !workflow) return;
    setSavingWf(true);
    try {
      await updateDoc(doc(db, 'contracts', viewing.id), { workflow } as any);
      await fetchContracts();
    } finally {
      setSavingWf(false);
    }
  };

  const applyTemplateToContract = async (tpl: WorkflowTemplate | null) => {
    if (!tpl || !viewing) return;
    const cloned = tpl.categories.map(c => ({ id: c.id || uid(), name: c.name, tasks: c.tasks.map(t => ({ ...t, id: t.id || uid(), done: false })) }));
    setWorkflow(cloned);
  };

  const loadDefaults = async () => {
    const d = await getDoc(doc(db, 'settings', 'workflowDefaults'));
    setDefaults((d.exists() ? d.data() : {}) as any);
  };

  const scheduleFinalPaymentEmail = async () => {
    if (!viewing) return;
    const dateStr = viewing.eventDate || '';
    const timeStr = viewing.eventTime || (viewing as any).eventTime || '00:00';
    const dt = new Date(`${dateStr}T${timeStr}`);
    if (isNaN(dt.getTime())) return;
    const sendAt = new Date(dt.getTime() - 30 * 60000).toISOString();
    const nextRem = [ ...(viewing.reminders || []).filter(r => r.type !== 'finalPayment'), { type: 'finalPayment' as const, sendAt } ];
    await updateDoc(doc(db, 'contracts', viewing.id), { reminders: nextRem } as any);
    await fetchContracts();
  };

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar este contrato?')) return;
    await deleteDoc(doc(db, 'contracts', id));
    await fetchContracts();
  };

  const isPast = (c: ContractItem) => {
    if (!c.eventDate) return false;
    const d = new Date(c.eventDate);
    if (isNaN(d.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    return d.getTime() < today.getTime();
  };

  const colorsFor = (len: number) => categoryColors(len);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Gestión de Contratos</h2>
        <div className="flex items-center gap-2">
          <button onClick={async ()=>{ await fetchTemplates(); setTemplatesOpen(true); }} className="border-2 border-black text-black px-3 py-2 rounded-none hover:bg-black hover:text-white">Workflows</button>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por cliente/email" className="px-3 py-2 border rounded-none" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-12 p-3 text-xs font-medium border-b">
          <div className="col-span-3">Fecha principal</div>
          <div className="col-span-3">Nombre del trabajo</div>
          <div className="col-span-2">Tipo</div>
          <div className="col-span-3">Progreso del flujo</div>
          <div className="col-span-1 text-right">Acciones</div>
        </div>
        {loading && <div className="p-4 text-sm text-gray-500">Cargando...</div>}
        {!loading && filtered.length === 0 && <div className="p-4 text-sm text-gray-500">Sin resultados</div>}
        <div className="divide-y">
          {filtered.map(c => {
            const wf = (c.workflow && c.workflow.length) ? c.workflow : defaultWorkflow(c);
            const segments = wf.map(cat => {
              const total = cat.tasks.length || 1;
              const done = cat.tasks.filter(t => t.done).length;
              return total === 0 ? 0 : Math.round((done/total)*100);
            });
            const cols = colorsFor(wf.length);
            return (
              <div key={c.id} className="grid grid-cols-12 p-3 items-center hover:bg-gray-50 cursor-pointer" onClick={() => openView(c)}>
                <div className="col-span-3 text-sm">{c.eventDate || '-'}</div>
                <div className="col-span-3 lowercase first-letter:uppercase">{c.clientName || 'Trabajo'}</div>
                <div className="col-span-2 text-sm">{c.eventType || '-'}</div>
                <div className="col-span-3">
                  <div className="w-full h-3 rounded bg-gray-200 overflow-hidden flex">
                    {segments.map((p, i) => (
                      <div key={i} className="relative flex-1 bg-gray-200">
                        <div className="absolute inset-y-0 left-0" style={{ width: `${p}%`, backgroundColor: cols[i] }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-1 text-right">
                  <button onClick={(e)=>{e.stopPropagation(); openEdit(c);}} title="Editar" className="border-2 border-black text-black px-2 py-1 rounded-none hover:bg-black hover:text-white inline-flex items-center"><Pencil size={14}/></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    {viewing && workflow && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={()=>setViewing(null)}>
        <div className="bg-white rounded-xl border border-gray-200 w-full max-w-5xl p-0 overflow-hidden" onClick={(e)=>e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <div className="text-lg font-medium">{viewing.clientName} — {viewing.eventType || 'Trabajo'}</div>
              <div className="text-xs text-gray-500">Fecha principal: {viewing.eventDate || '-' } • Hora: {viewing.eventTime || (viewing as any).eventTime || '-'}</div>
            </div>
            <button onClick={()=>setViewing(null)} className="text-gray-500 hover:text-gray-900">✕</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            <div className="md:col-span-1 border-r p-4 max-h-[70vh] overflow-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Workflow</h3>
                <div className="flex items-center gap-2">
                  <button onClick={()=>setWfEditMode(v=>!v)} className="text-xs border px-2 py-1 rounded-none">{wfEditMode? 'Salir de edición':'Editar'}</button>
                </div>
              </div>
              <div className="space-y-4">
                {workflow.map((cat, ci) => {
                  const cols = colorsFor(workflow.length);
                  return (
                  <div key={cat.id} className="relative pl-3">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded" style={{ backgroundColor: cols[ci] }} />
                    <div className="flex items-center gap-2 mb-2">
                      {wfEditMode ? (
                        <input value={cat.name} onChange={e=>{
                          const val = e.target.value; setWorkflow(w=>{ const n = w? [...w]:[]; n[ci] = { ...n[ci], name: val }; return n;});
                        }} className="text-sm font-semibold border px-2 py-1 rounded-none" />
                      ) : (
                        <div className="text-sm font-semibold">{cat.name}</div>
                      )}
                      {wfEditMode && (
                        <button onClick={()=>{
                          setWorkflow(w=>{
                            const n = w? [...w]:[]; n.splice(ci,1); return n;
                          });
                        }} className="text-red-600 hover:text-red-800" title="Eliminar categoría"><Trash size={14}/></button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {cat.tasks.map((t, ti) => (
                        <div key={t.id} className="flex items-start gap-2">
                          {!wfEditMode && (
                            <input type="checkbox" checked={t.done} onChange={(e)=>{
                              setWorkflow(wf=>{
                                const next = wf ? [...wf] : [];
                                next[ci] = { ...next[ci], tasks: next[ci].tasks.map((x, idx)=> idx===ti? { ...x, done: e.target.checked }: x)};
                                return next;
                              });
                            }} />
                          )}
                          <div className="flex-1">
                            {wfEditMode ? (
                              <input value={t.title} onChange={e=>{
                                const val = e.target.value; setWorkflow(w=>{ const n = w? [...w]:[]; const ts = [...n[ci].tasks]; ts[ti] = { ...ts[ti], title: val }; n[ci] = { ...n[ci], tasks: ts }; return n;});
                              }} className="text-sm border px-2 py-1 rounded-none w-full" />
                            ) : (
                              <div className="text-sm">{t.title}</div>
                            )}
                            {t.due && !wfEditMode && <div className="text-xs text-gray-500">Vence: {new Date(t.due).toLocaleString('es-ES')}</div>}
                            {wfEditMode && (
                              <div className="mt-1 flex items-center gap-2 text-xs">
                                <label className="text-gray-600">Vence:</label>
                                <input type="datetime-local" value={t.due ? new Date(t.due).toISOString().slice(0,16): ''} onChange={e=>{
                                  const iso = e.target.value ? new Date(e.target.value).toISOString(): null;
                                  setWorkflow(w=>{ const n = w? [...w]:[]; const ts = [...n[ci].tasks]; ts[ti] = { ...ts[ti], due: iso }; n[ci] = { ...n[ci], tasks: ts }; return n;});
                                }} className="border px-2 py-1 rounded-none" />
                                <button onClick={()=>{
                                  setWorkflow(w=>{ const n = w? [...w]:[]; const ts = n[ci].tasks.filter((_,idx)=>idx!==ti); n[ci] = { ...n[ci], tasks: ts }; return n;});
                                }} className="text-red-600 hover:text-red-800" title="Eliminar tarea"><Trash size={14}/></button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {wfEditMode && (
                        <button onClick={()=>{
                          setWorkflow(w=>{ const n = w? [...w]:[]; const ts = [...n[ci].tasks, { id: uid(), title: 'Nueva tarea', done: false }]; n[ci] = { ...n[ci], tasks: ts }; return n;});
                        }} className="text-xs border px-2 py-1 rounded-none inline-flex items-center gap-1"><Plus size={12}/> Añadir tarea</button>
                      )}
                    </div>
                  </div>
                );})}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {wfEditMode && (
                  <button onClick={()=>{
                    setWorkflow(w=>{ const n = w? [...w]:[]; n.push({ id: uid(), name: 'Nueva categoría', tasks: [] }); return n;});
                  }} className="border-2 border-black text-black px-3 py-2 rounded-none hover:bg-black hover:text-white inline-flex items-center gap-2"><Plus size={14}/> Añadir categoría</button>
                )}
                <button onClick={saveWorkflow} disabled={savingWf} className="border-2 border-black bg-black text-white px-3 py-2 rounded-none hover:opacity-90 disabled:opacity-50">Guardar</button>
                <div className="ml-auto flex items-center gap-2">
                  <select onChange={(e)=>{
                    const id = e.target.value; const tpl = templates.find(t=>t.id===id) || null; applyTemplateToContract(tpl);
                  }} className="border px-2 py-2 rounded-none text-sm">
                    <option value="">Elegir plantilla…</option>
                    {templates.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <button onClick={()=> loadDefaults()} className="text-xs text-gray-600 underline">Cargar predeterminados</button>
                  {defaults.packages && <button onClick={()=>{ const tpl = templates.find(t=>t.id===defaults.packages) || null; applyTemplateToContract(tpl || null); }} className="border px-2 py-2 text-sm rounded-none">Aplicar def. Paquetes</button>}
                  {defaults.products && <button onClick={()=>{ const tpl = templates.find(t=>t.id===defaults.products) || null; applyTemplateToContract(tpl || null); }} className="border px-2 py-2 text-sm rounded-none">Aplicar def. Productos</button>}
                </div>
              </div>
            </div>
            <div className="md:col-span-2 p-4 max-h-[70vh] overflow-auto space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-600">Nombre:</span> <span className="font-medium">{viewing.clientName}</span></div>
                <div><span className="text-gray-600">Email:</span> <span className="font-medium">{viewing.clientEmail}</span></div>
                <div><span className="text-gray-600">Tipo de evento:</span> <span className="font-medium">{viewing.eventType || '-'}</span></div>
                <div><span className="text-gray-600">Fecha evento:</span> <span className="font-medium">{viewing.eventDate || '-'}</span></div>
                <div><span className="text-gray-600">Hora:</span> <span className="font-medium">{(viewing as any).eventTime || '-'}</span></div>
                <div><span className="text-gray-600">Fecha contrato:</span> <span className="font-medium">{viewing.contractDate || '-'}</span></div>
                <div><span className="text-gray-600">Ubicación:</span> <span className="font-medium">{(viewing as any).eventLocation || '-'}</span></div>
                <div><span className="text-gray-600">Paquete:</span> <span className="font-medium">{(viewing as any).packageTitle || '-'}</span></div>
                <div><span className="text-gray-600">Duración:</span> <span className="font-medium">{(viewing as any).packageDuration || '-'}</span></div>
                <div><span className="text-gray-600">Método de pago:</span> <span className="font-medium">{viewing.paymentMethod || '-'}</span></div>
                <div className="flex items-center gap-2"><span className="text-gray-600">Depósito:</span> <span className={`px-2 py-0.5 rounded text-xs ${viewing.depositPaid? 'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{viewing.depositPaid? 'Pagado':'No pagado'}</span></div>
                <div className="flex items-center gap-2"><span className="text-gray-600">Restante:</span> <span className={`px-2 py-0.5 rounded text-xs ${viewing.finalPaymentPaid? 'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{viewing.finalPaymentPaid? 'Pagado':'No pagado'}</span></div>
                <div><span className="text-gray-600">Total:</span> <span className="font-medium">R$ {(viewing.totalAmount ?? 0).toFixed(0)}</span></div>
                <div><span className="text-gray-600">Deslocamento:</span> <span className="font-medium">R$ {(viewing.travelFee ?? 0).toFixed(0)}</span></div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Items del contrato</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-600">
                        <th className="py-1">Item</th>
                        <th className="py-1">Cant.</th>
                        <th className="py-1">Precio</th>
                        <th className="py-1">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(viewing.services || []).map((it: any, idx: number) => {
                        const qty = Number(it.quantity ?? 1);
                        const price = Number(String(it.price || '').replace(/[^0-9]/g, ''));
                        const total = price * qty;
                        return (
                          <tr key={idx} className="border-t">
                            <td className="py-1">{it.name || it.id || '—'}</td>
                            <td className="py-1">{qty}</td>
                            <td className="py-1">R$ {price.toFixed(0)}</td>
                            <td className="py-1">R$ {total.toFixed(0)}</td>
                          </tr>
                        );
                      })}
                      {Array.isArray(viewing.storeItems) && viewing.storeItems.map((it: any, idx: number) => (
                        <tr key={`store-${idx}`} className="border-t">
                          <td className="py-1">{it.name}</td>
                          <td className="py-1">{Number(it.quantity)}</td>
                          <td className="py-1">R$ {Number(it.price).toFixed(0)}</td>
                          <td className="py-1">R$ {(Number(it.price) * Number(it.quantity)).toFixed(0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {viewing.message && (
                <div>
                  <div className="text-sm font-medium mb-1">Mensaje del cliente</div>
                  <div className="text-sm text-gray-800 whitespace-pre-wrap">{viewing.message}</div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button onClick={scheduleFinalPaymentEmail} className="border-2 border-black text-black px-3 py-2 rounded-none hover:bg-black hover:text-white">Programar email de saldo (−30 min)</button>
                {viewing.reminders?.find(r=>r.type==='finalPayment') && (
                  <span className="text-xs text-gray-600">Programado para: {new Date(viewing.reminders.find(r=>r.type==='finalPayment')!.sendAt).toLocaleString('es-ES')}</span>
                )}
              </div>

              {viewing.formSnapshot && (
                <div>
                  <div className="text-sm font-medium mb-1">Formulario (resumen)</div>
                  <div className="text-xs text-gray-600 grid grid-cols-2 gap-2">
                    {Object.entries(viewing.formSnapshot).slice(0, 30).map(([k,v])=> (
                      <div key={k}><span className="text-gray-500">{k}:</span> <span className="text-gray-800">{String(v)}</span></div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )}
    {templatesOpen && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={()=>setTemplatesOpen(false)}>
        <div className="bg-white rounded-xl border border-gray-200 w-full max-w-5xl p-0 overflow-hidden" onClick={(e)=>e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 border-b">
            <div className="font-medium">Editor de Workflows</div>
            <button onClick={()=>setTemplatesOpen(false)} className="text-gray-500 hover:text-gray-900">✕</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="md:col-span-1 border-r p-3 space-y-2 max-h-[70vh] overflow-auto">
              <button onClick={()=> setTplEditing({ id: '', name: 'Nuevo workflow', categories: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })} className="w-full border px-2 py-2 rounded-none inline-flex items-center gap-2"><Plus size={14}/> Nuevo</button>
              {templates.map(t=> (
                <button key={t.id} onClick={()=> setTplEditing({ ...t })} className={`w-full text-left px-2 py-2 rounded-none border ${tplEditing?.id===t.id? 'bg-gray-100 border-black':'border-transparent hover:bg-gray-50'}`}>{t.name}</button>
              ))}
            </div>
            <div className="md:col-span-2 p-4 max-h-[70vh] overflow-auto">
              {!tplEditing ? (
                <div className="text-sm text-gray-600">Selecciona o crea un workflow para editar.</div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input value={tplEditing.name} onChange={e=> setTplEditing(v=> v? { ...v, name: e.target.value }: v)} className="border px-3 py-2 rounded-none flex-1" />
                    {tplEditing.id && (
                      <button onClick={async()=>{ if (!confirm('¿Eliminar plantilla?')) return; await deleteDoc(doc(db,'workflowTemplates', tplEditing.id)); await fetchTemplates(); setTplEditing(null); }} className="text-red-600 hover:text-red-800 inline-flex items-center gap-1"><Trash size={16}/> Eliminar</button>
                    )}
                  </div>
                  <div className="space-y-4">
                    {tplEditing.categories.map((cat, ci)=> (
                      <div key={cat.id} className="border rounded p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <input value={cat.name} onChange={e=> setTplEditing(v=>{ if(!v) return v; const cats=[...v.categories]; cats[ci] = { ...cats[ci], name: e.target.value }; return { ...v, categories: cats }; })} className="text-sm font-semibold border px-2 py-1 rounded-none" />
                          <button onClick={()=> setTplEditing(v=>{ if(!v) return v; const cats=[...v.categories]; cats.splice(ci,1); return { ...v, categories: cats }; })} className="text-red-600 hover:text-red-800" title="Eliminar categoría"><Trash size={14}/></button>
                        </div>
                        <div className="space-y-2">
                          {cat.tasks.map((t, ti)=> (
                            <div key={t.id} className="flex items-center gap-2">
                              <input value={t.title} onChange={e=> setTplEditing(v=>{ if(!v) return v; const cats=[...v.categories]; const ts=[...cats[ci].tasks]; ts[ti] = { ...ts[ti], title: e.target.value }; cats[ci] = { ...cats[ci], tasks: ts }; return { ...v, categories: cats }; })} className="text-sm border px-2 py-1 rounded-none flex-1" />
                              <button onClick={()=> setTplEditing(v=>{ if(!v) return v; const cats=[...v.categories]; const ts=cats[ci].tasks.filter((_,idx)=> idx!==ti); cats[ci] = { ...cats[ci], tasks: ts }; return { ...v, categories: cats }; })} className="text-red-600 hover:text-red-800" title="Eliminar tarea"><Trash size={14}/></button>
                            </div>
                          ))}
                          <button onClick={()=> setTplEditing(v=>{ if(!v) return v; const cats=[...v.categories]; cats[ci] = { ...cats[ci], tasks: [...cats[ci].tasks, { id: uid(), title: 'Nueva tarea', done: false }] }; return { ...v, categories: cats }; })} className="text-xs border px-2 py-1 rounded-none inline-flex items-center gap-1"><Plus size={12}/> Añadir tarea</button>
                        </div>
                      </div>
                    ))}
                    <button onClick={()=> setTplEditing(v=> v? { ...v, categories: [...v.categories, { id: uid(), name: 'Nueva categoría', tasks: [] }] }: v)} className="border px-3 py-2 rounded-none inline-flex items-center gap-2"><Plus size={14}/> Añadir categoría</button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={async()=>{
                      if (!tplEditing) return;
                      const payload = { name: tplEditing.name, categories: tplEditing.categories, createdAt: tplEditing.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() } as any;
                      if (tplEditing.id) {
                        await updateDoc(doc(db,'workflowTemplates', tplEditing.id), payload);
                      } else {
                        const created = await addDoc(collection(db,'workflowTemplates'), payload);
                        setTplEditing(v=> v? { ...v, id: created.id }: v);
                      }
                      await fetchTemplates();
                    }} className="border-2 border-black bg-black text-white px-3 py-2 rounded-none">Guardar plantilla</button>
                    <div className="ml-auto flex items-center gap-2">
                      <button onClick={async()=>{ if(!tplEditing?.id) return; await setDoc(doc(db,'settings','workflowDefaults'), { packages: tplEditing.id }, { merge: true }); await fetchTemplates(); }} className="border px-2 py-2 rounded-none text-sm">Definir por defecto: Paquetes</button>
                      <button onClick={async()=>{ if(!tplEditing?.id) return; await setDoc(doc(db,'settings','workflowDefaults'), { products: tplEditing.id }, { merge: true }); await fetchTemplates(); }} className="border px-2 py-2 rounded-none text-sm">Definir por defecto: Productos</button>
                      {defaults.packages && <span className="text-xs text-gray-600">Def Paquetes: {(templates.find(t=>t.id===defaults.packages)?.name) || defaults.packages}</span>}
                      {defaults.products && <span className="text-xs text-gray-600">Def Productos: {(templates.find(t=>t.id===defaults.products)?.name) || defaults.products}</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )}
    {editing && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-gray-200 w-full max-w-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Editar Contrato</h3>
            <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-gray-900">✕</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600">Nombre</label>
              <input value={editForm.clientName || ''} onChange={e => setEditForm((f: any) => ({ ...f, clientName: e.target.value }))} className="w-full px-3 py-2 border rounded-none" />
            </div>
            <div>
              <label className="text-xs text-gray-600">Email</label>
              <input value={editForm.clientEmail || ''} onChange={e => setEditForm((f: any) => ({ ...f, clientEmail: e.target.value }))} className="w-full px-3 py-2 border rounded-none" />
            </div>
            <div>
              <label className="text-xs text-gray-600">Fecha evento</label>
              <input type="date" value={editForm.eventDate || ''} onChange={e => setEditForm((f: any) => ({ ...f, eventDate: e.target.value }))} className="w-full px-3 py-2 border rounded-none" />
            </div>
            <div>
              <label className="text-xs text-gray-600">Hora</label>
              <input type="time" value={editForm.eventTime || ''} onChange={e => setEditForm((f: any) => ({ ...f, eventTime: e.target.value }))} className="w-full px-3 py-2 border rounded-none" />
            </div>
            <div>
              <label className="text-xs text-gray-600">Total</label>
              <input type="number" step="0.01" value={editForm.totalAmount ?? 0} onChange={e => setEditForm((f: any) => ({ ...f, totalAmount: e.target.value }))} className="w-full px-3 py-2 border rounded-none" />
            </div>
            <div>
              <label className="text-xs text-gray-600">Deslocamento</label>
              <input type="number" step="0.01" value={editForm.travelFee ?? 0} onChange={e => setEditForm((f: any) => ({ ...f, travelFee: e.target.value }))} className="w-full px-3 py-2 border rounded-none" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-600">Notas</label>
              <textarea value={editForm.message || ''} onChange={e => setEditForm((f: any) => ({ ...f, message: e.target.value }))} className="w-full px-3 py-2 border rounded-none" rows={3} />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={() => setEditing(null)} className="border-2 border-black text-black px-3 py-2 rounded-none hover:bg-black hover:text-white">Cancelar</button>
            <button onClick={saveEdit} className="border-2 border-black bg-black text-white px-3 py-2 rounded-none hover:opacity-90">Guardar</button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
};

export default ContractsManagement;
