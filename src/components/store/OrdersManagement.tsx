import { useEffect, useMemo, useState } from 'react';
import { db } from '../../utils/firebaseClient';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc } from 'firebase/firestore';
import { Clock, Loader, CheckCircle, List, Mail, CreditCard, FileText, Plus, Trash } from 'lucide-react';
import { defaultWorkflow, categoryColors, WorkflowTemplate } from './_contractsWorkflowHelper';

export type OrderStatus = 'pendiente' | 'procesando' | 'completado';

interface WorkflowTask { id: string; title: string; done: boolean; due?: string | null; note?: string }
interface WorkflowCategory { id: string; name: string; tasks: WorkflowTask[] }

interface OrderLineItem {
  product_id?: string;
  productId?: string;
  name?: string;
  qty?: number;
  quantity?: number;
  price?: number;
  total?: number;
}

interface OrderAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

interface OrderItem {
  id: string;
  customer_name?: string;
  customer_email?: string;
  payment_method?: string;
  notes?: string;
  items?: OrderLineItem[];
  total?: number;
  created_at?: string;
  status?: OrderStatus | string;
  workflow?: WorkflowCategory[];
  contractId?: string;
}

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const OrdersManagement = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'todas' | OrderStatus>('todas');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const [viewing, setViewing] = useState<OrderItem | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowCategory[] | null>(null);
  const [wfEditMode, setWfEditMode] = useState(false);
  const [savingWf, setSavingWf] = useState(false);

  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [defaults, setDefaults] = useState<{ products?: string; packages?: string }>({});

  const [contractsMap, setContractsMap] = useState<Record<string, any>>({});
  const [contractsByEmail, setContractsByEmail] = useState<Record<string, any>>({});
  const [linking, setLinking] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setOrders([]);
        return;
      }
      let items: OrderItem[] = [];
      try {
        const snap = await getDocs(query(collection(db, 'orders'), orderBy('created_at', 'desc')));
        items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      } catch (_) {
        try {
          const snap = await getDocs(collection(db, 'orders'));
          items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
          items.sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
        } catch (e) {
          console.warn('No se pudieron cargar las órdenes', e);
          items = [];
        }
      }

      // If there are no explicit orders, fall back to building 'virtual' orders from contracts
      if ((!items || items.length === 0)) {
        try {
          const csnap = await getDocs(query(collection(db, 'contracts'), orderBy('createdAt', 'desc')));
          const contractsList = csnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
          const virtual: OrderItem[] = contractsList.map((c: any) => {
            const storeItems = Array.isArray(c.storeItems) ? c.storeItems : [];
            const itemsForOrder = storeItems.map((si: any) => ({ name: si.name, quantity: Number(si.quantity || 1), price: Number(si.price || 0), total: Number(si.price || 0) * Number(si.quantity || 1) }));
            const total = itemsForOrder.reduce((s, it) => s + Number(it.total || 0), 0) + Number(c.travelFee || 0);
            return {
              id: `contract-${c.id}`,
              customer_name: c.clientName || c.client_name || '',
              customer_email: c.clientEmail || c.client_email || '',
              items: itemsForOrder,
              total,
              created_at: c.contractDate || c.createdAt || new Date().toISOString(),
              status: 'pendiente',
              workflow: c.workflow || undefined,
              contractId: c.id,
            } as OrderItem;
          });
          items = virtual;
        } catch (e) {
          console.warn('No se pudieron generar órdenes desde contratos', e);
        }
      }

      setOrders(items);
    } catch (e) {
      console.warn('Error inesperado al cargar órdenes', e);
      setOrders([]);
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

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    const loadContracts = async () => {
      try {
        const snap = await getDocs(collection(db, 'contracts'));
        const map: Record<string, any> = {};
        const byEmail: Record<string, any> = {};
        snap.docs.forEach(d => {
          const data = { id: d.id, ...(d.data() as any) };
          map[d.id] = data;
          const email = String((data.clientEmail || data.client_email || '').toLowerCase()).trim();
          if (email) byEmail[email] = data;
        });
        setContractsMap(map);
        setContractsByEmail(byEmail);
      } catch (e) {
        setContractsMap({});
        setContractsByEmail({});
      }
    };
    loadContracts();
  }, []);

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const byStatus = statusFilter === 'todas' ? true : (o.status === statusFilter);
      const s = search.trim().toLowerCase();
      const bySearch = s ? ((o.customer_name || '').toLowerCase().includes(s) || (o.customer_email || '').toLowerCase().includes(s)) : true;
      return byStatus && bySearch;
    });
  }, [orders, statusFilter, search]);

  const counts = useMemo(() => ({
    todas: orders.length,
    pendiente: orders.filter(o => o.status === 'pendiente').length,
    procesando: orders.filter(o => o.status === 'procesando').length,
    completado: orders.filter(o => o.status === 'completado').length,
  }), [orders]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    await updateDoc(doc(db, 'orders', id), { status });
    await fetchOrders();
  };

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar esta orden?')) return;
    await deleteDoc(doc(db, 'orders', id));
    await fetchOrders();
  };

  const normalize = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

  const getDisplayItems = (o: OrderItem) => {
    if (!o) return o.items || [];
    let c = o.contractId ? contractsMap[o.contractId] : null;
    if (!c && o.customer_email) {
      const key = String(o.customer_email).toLowerCase().trim();
      c = contractsByEmail[key] || Object.values(contractsMap).find((x: any) => String((x.clientEmail || x.client_email || '')).toLowerCase().trim() === key) || null;
    }
    if (c && Array.isArray(c.storeItems) && c.storeItems.length) {
      const names = new Set((c.storeItems || []).map((it: any) => normalize(String(it.name || ''))));
      return (o.items || []).filter(it => names.has(normalize(String(it.name || it.product_id || it.productId || ''))));
    }
    return o.items || [];
  };

  const ensureDeliveryTasks = (base: WorkflowCategory[], productNames: string[]) => {
    const cloned = JSON.parse(JSON.stringify(base)) as WorkflowCategory[];
    const findIdx = cloned.findIndex(c => normalize(c.name).includes('entrega'));
    const idx = findIdx >= 0 ? findIdx : cloned.length;
    if (findIdx < 0) cloned.push({ id: uid(), name: 'Entrega de productos', tasks: [] });
    const cat = cloned[idx];
    productNames.forEach(n => {
      const title = `Entregar ${n}`;
      if (!cat.tasks.some(t => normalize(t.title) === normalize(title))) {
        cat.tasks.push({ id: uid(), title, done: false });
      }
    });
    cloned[idx] = cat;
    return cloned;
  };

  const openWorkflow = async (o: OrderItem) => {
    setViewing(o);
    const base = (o.workflow && o.workflow.length) ? o.workflow : [];
    const items = getDisplayItems(o);
    const names = items.map(it => String(it.name || it.product_id || it.productId || ''));
    const wf = ensureDeliveryTasks(base, names);
    setWorkflow(JSON.parse(JSON.stringify(wf)));
    if (templates.length === 0) await fetchTemplates();
    setWfEditMode(false);
  };

  const saveWorkflow = async () => {
    if (!viewing || !workflow) return;
    setSavingWf(true);
    try {
      await updateDoc(doc(db, 'orders', viewing.id), { workflow } as any);

      // Try to sync to contract: prefer explicit contractId, otherwise match by customer_email
      let targetContractId = viewing.contractId || null;
      let targetRef: any = null;
      if (!targetContractId && viewing.customer_email) {
        const key = String(viewing.customer_email).toLowerCase().trim();
        const matched = contractsByEmail[key] || Object.values(contractsMap).find((x: any) => String((x.clientEmail || x.client_email || '')).toLowerCase().trim() === key) || null;
        if (matched) targetContractId = matched.id;
      }
      if (targetContractId) {
        const cRef = doc(db, 'contracts', targetContractId);
        const cSnap = await getDoc(cRef);
        if (cSnap.exists()) {
          const contract = { id: cSnap.id, ...(cSnap.data() as any) } as any;
          const base = (contract.workflow && contract.workflow.length) ? contract.workflow : [];
          const items = getDisplayItems(viewing);
          const names = items.map(it => String(it.name || it.product_id || it.productId || ''));
          const merged = ensureDeliveryTasks(base, names);
          const ordDeliveryCat = (workflow as WorkflowCategory[]).find(c => normalize(c.name).includes('entrega'));
          if (ordDeliveryCat) {
            merged.forEach(cat => {
              if (normalize(cat.name).includes('entrega')) {
                cat.tasks = cat.tasks.map(t => {
                  const match = ordDeliveryCat.tasks.find(ot => normalize(ot.title) === normalize(t.title));
                  return match ? { ...t, done: !!match.done } : t;
                });
              }
            });
          }
          await updateDoc(cRef, { workflow: merged } as any);
        }
      }

      await fetchOrders();
    } finally {
      setSavingWf(false);
    }
  };

  const applyTemplateToOrder = (tpl: WorkflowTemplate | null) => {
    if (!tpl) return;
    const cloned = tpl.categories.map(c => ({ id: c.id || uid(), name: c.name, tasks: c.tasks.map(t => ({ ...t, id: t.id || uid(), done: false })) }));
    setWorkflow(cloned);
  };

  const colorsFor = (len: number) => categoryColors(len);

  const autoLinkOrders = async () => {
    if (!confirm('Vincular órdenes sin contractId a contratos coincidentes por email o productos?')) return;
    setLinking(true);
    try {
      const toProcess = (orders || []).filter(o => !o.contractId);
      let count = 0;
      for (const o of toProcess) {
        let target: any = null;
        if (o.customer_email) {
          const key = String(o.customer_email).toLowerCase().trim();
          target = contractsByEmail[key] || Object.values(contractsMap).find((x: any) => String((x.clientEmail || x.client_email || '')).toLowerCase().trim() === key) || null;
        }
        if (!target) {
          const onames = new Set((o.items || []).map(it => String(it.name || it.product_id || it.productId || '').toLowerCase().trim()));
          target = Object.values(contractsMap).find((c: any) => Array.isArray(c.storeItems) && c.storeItems.some((si: any)=> onames.has(String(si.name||'').toLowerCase().trim())) );
        }
        if (target) {
          try {
            await updateDoc(doc(db,'orders', o.id), { contractId: target.id } as any);
            count++;
          } catch (e) {
            console.warn('Error linking order', o.id, e);
          }
        }
      }
      await fetchOrders();
      const snap = await getDocs(collection(db, 'contracts'));
      const map: Record<string, any> = {};
      const byEmail: Record<string, any> = {};
      snap.docs.forEach(d => { const data = { id: d.id, ...(d.data() as any) }; map[d.id] = data; const email = String((data.clientEmail || data.client_email || '').toLowerCase()).trim(); if (email) byEmail[email] = data; });
      setContractsMap(map);
      setContractsByEmail(byEmail);
      alert('Vinculadas ' + count + ' órdenes');
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Gestión de Órdenes</h2>
        <div className="flex items-center gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por cliente/email" className="px-3 py-2 border rounded-full" />
          <button onClick={autoLinkOrders} className={`px-3 py-2 border rounded-none ${linking? 'opacity-60': ''}`}>{linking? 'Vinculando...':'Vincular órdenes'}</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['todas','pendiente','procesando','completado'] as const).map(s => {
          const Icon = s === 'todas' ? List : s === 'pendiente' ? Clock : s === 'procesando' ? Loader : CheckCircle;
          const count = (counts as any)[s];
          const color = s === 'pendiente'
            ? 'border-red-600 text-red-600 hover:bg-red-600 hover:text-white'
            : s === 'procesando'
            ? 'border-yellow-500 text-yellow-700 hover:bg-yellow-500 hover:text-black'
            : s === 'completado'
            ? 'border-green-600 text-green-600 hover:bg-green-600 hover:text-white'
            : 'border-black text-black hover:bg-black hover:text-white';
          const active = statusFilter === s
            ? (s === 'pendiente' ? 'bg-red-600 text-white border-red-600'
              : s === 'procesando' ? 'bg-yellow-500 text-black border-yellow-500'
              : s === 'completado' ? 'bg-green-600 text-white border-green-600'
              : 'bg-black text-white border-black')
            : '';
          return (
            <button key={s} onClick={() => setStatusFilter(s)} title={s} className={`px-3 py-2 rounded-full border-2 inline-flex items-center gap-2 ${active || color}`}>
              <Icon size={16} />
              <span className="text-xs px-1.5 py-0.5 border rounded">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-12 p-3 text-xs font-medium border-b">
          <div className="col-span-1" />
          <div className="col-span-3">Cliente</div>
          <div className="col-span-2">Fecha</div>
          <div className="col-span-1">Total</div>
          <div className="col-span-3">Progreso del flujo</div>
          <div className="col-span-2 text-right">Acciones</div>
        </div>
        {loading && <div className="p-4 text-sm text-gray-500">Cargando...</div>}
        {!loading && filtered.length === 0 && <div className="p-4 text-sm text-gray-500">Sin resultados</div>}
        <div className="divide-y">
          {filtered.map(o => {
            const wf = (o.workflow && o.workflow.length) ? o.workflow : [];
            const segments = wf.map(cat => {
              const total = cat.tasks.length || 1;
              const done = cat.tasks.filter(t => t.done).length;
              return total === 0 ? 0 : Math.round((done/total)*100);
            });
            const cols = colorsFor(wf.length);
            return (
              <div key={o.id} className="grid grid-cols-12 p-3 items-center hover:bg-gray-50 cursor-pointer" onClick={() => openWorkflow(o)}>
                    <div className="col-span-3 lowercase first-letter:uppercase">{o.customer_name || 'cliente'}</div>
                <div className="col-span-2 text-sm text-gray-600">{o.created_at ? new Date(o.created_at).toLocaleDateString() : ''}</div>
                <div className="col-span-1 font-semibold">${Number(o.total || 0).toFixed(0)}</div>
                <div className="col-span-3">
                  <div className="w-full h-3 rounded bg-gray-200 overflow-hidden flex">
                    {segments.map((p, i) => (
                      <div key={i} className="relative flex-1 bg-gray-200">
                        <div className="absolute inset-y-0 left-0" style={{ width: `${p}%`, backgroundColor: cols[i] }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  {/* Row opens modal on click; actions removed */}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {viewing && workflow && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={()=> setViewing(null)}>
          <div className="bg-white rounded-xl border border-gray-200 w-full max-w-5xl p-0 overflow-hidden" onClick={(e)=> e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <div className="text-lg font-medium">{viewing.customer_name || 'Cliente'} — Orden #{viewing.id}</div>
                <div className="text-xs text-gray-500">Fecha: {viewing.created_at ? new Date(viewing.created_at).toLocaleString() : '-'}</div>
              </div>
              <button onClick={()=> setViewing(null)} className="text-gray-500 hover:text-gray-900">✕</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
              <div className="md:col-span-1 border-r p-4 max-h-[70vh] overflow-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">Workflow</h3>
                  <button onClick={()=> setWfEditMode(v=> !v)} className="text-xs border px-2 py-1 rounded-none">{wfEditMode ? 'Salir de edición' : 'Editar'}</button>
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
                              setWorkflow(w=>{ const n = w? [...w]:[]; n.splice(ci,1); return n;});
                            }} className="text-red-600 hover:text-red-800" title="Eliminar categoría"><Trash size={14}/></button>
                          )}
                        </div>
                        <div className="space-y-2">
                          {cat.tasks.map((t, ti) => (
                            <div key={t.id} className="flex items-start gap-2">
                              {!wfEditMode && (
                                <input type="checkbox" checked={t.done} onChange={async (e)=>{
                                  const checked = e.target.checked;
                                  if (!workflow || !viewing) return;
                                  const updated = workflow.map((c, ci2) => ci2===ci ? { ...c, tasks: c.tasks.map((x, ti2)=> ti2===ti ? { ...x, done: checked } : x) } : c);
                                  setWorkflow(updated);
                                  try {
                                    const isVirtual = String(viewing.id || '').startsWith('contract-');
                                    if (isVirtual) {
                                      const contractId = viewing.contractId || String(viewing.id || '').replace(/^contract-/, '');
                                      if (contractId) {
                                        const cRef = doc(db, 'contracts', contractId);
                                        const cSnap = await getDoc(cRef);
                                        if (cSnap.exists()) {
                                          const contract = { id: cSnap.id, ...(cSnap.data() as any) } as any;
                                          const base = (contract.workflow && contract.workflow.length) ? contract.workflow : [];
                                          const items = getDisplayItems(viewing as OrderItem);
                                          const names = items.map(it => String(it.name || it.product_id || it.productId || ''));
                                          const merged = ensureDeliveryTasks(base, names);
                                          const ordDeliveryCat = updated.find(cu => normalize(cu.name).includes('entrega'));
                                          if (ordDeliveryCat) {
                                            merged.forEach(cat => {
                                              if (normalize(cat.name).includes('entrega')) {
                                                cat.tasks = cat.tasks.map(t => {
                                                  const match = ordDeliveryCat.tasks.find(ot => normalize(ot.title) === normalize(t.title));
                                                  return match ? { ...t, done: !!match.done } : t;
                                                });
                                              }
                                            });
                                          }
                                          await updateDoc(cRef, { workflow: merged } as any);
                                        }
                                      }
                                    } else {
                                      await updateDoc(doc(db, 'orders', viewing.id), { workflow: updated } as any);
                                      let targetContractId = viewing.contractId || null;
                                      if (!targetContractId && viewing.customer_email) {
                                        const key = String(viewing.customer_email).toLowerCase().trim();
                                        const matched = contractsByEmail[key] || Object.values(contractsMap).find((x: any) => String((x.clientEmail || x.client_email || '')).toLowerCase().trim() === key) || null;
                                        if (matched) targetContractId = matched.id;
                                      }
                                      if (targetContractId) {
                                        const cRef = doc(db, 'contracts', targetContractId);
                                        const cSnap = await getDoc(cRef);
                                        if (cSnap.exists()) {
                                          const contract = { id: cSnap.id, ...(cSnap.data() as any) } as any;
                                          const base = (contract.workflow && contract.workflow.length) ? contract.workflow : [];
                                          const items = getDisplayItems(viewing as OrderItem);
                                          const names = items.map(it => String(it.name || it.product_id || it.productId || ''));
                                          const merged = ensureDeliveryTasks(base, names);
                                          const ordDeliveryCat = updated.find(cu => normalize(cu.name).includes('entrega'));
                                          if (ordDeliveryCat) {
                                            merged.forEach(cat => {
                                              if (normalize(cat.name).includes('entrega')) {
                                                cat.tasks = cat.tasks.map(t => {
                                                  const match = ordDeliveryCat.tasks.find(ot => normalize(ot.title) === normalize(t.title));
                                                  return match ? { ...t, done: !!match.done } : t;
                                                });
                                              }
                                            });
                                          }
                                          await updateDoc(cRef, { workflow: merged } as any);
                                        }
                                      }
                                    }
                                  } catch (err) {
                                    console.warn('Error persisting workflow change', err);
                                  }
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
                                      setWorkflow(w=>{ const n = w? [...w]:[]; const ts = n[ci].tasks.filter((_,idx)=> idx!==ti); n[ci] = { ...n[ci], tasks: ts }; return n;});
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
                    );
                  })}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {wfEditMode && (
                    <button onClick={()=>{
                      setWorkflow(w=>{ const n = w? [...w]:[]; n.push({ id: uid(), name: 'Nueva categoría', tasks: [] }); return n;});
                    }} className="border-2 border-black text-black px-3 py-2 rounded-none hover:bg-black hover:text-white inline-flex items-center gap-2"><Plus size={14}/> Añadir categoría</button>
                  )}
                  <div className="ml-auto flex items-center gap-2">
                    <select onChange={(e)=>{ const id = e.target.value; const tpl = templates.find(t=>t.id===id) || null; applyTemplateToOrder(tpl); }} className="border px-2 py-2 rounded-none text-sm">
                      <option value="">Elegir plantilla…</option>
                      {templates.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <button onClick={async()=>{ const d = await getDoc(doc(db,'settings','workflowDefaults')); const defs = (d.exists()? d.data(): {}) as any; setDefaults(defs); const tpl = templates.find(t=>t.id===defs.products) || null; applyTemplateToOrder(tpl); }} className="border px-2 py-2 text-sm rounded-none">Aplicar def. Productos</button>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2 p-4 max-h-[70vh] overflow-auto space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-600">Cliente:</span> <span className="font-medium">{viewing.customer_name || '-'}</span></div>
                  <div><span className="text-gray-600">Email:</span> <span className="font-medium">{viewing.customer_email || '-'}</span></div>
                  <div><span className="text-gray-600">Fecha:</span> <span className="font-medium">{viewing.created_at ? new Date(viewing.created_at).toLocaleString() : '-'}</span></div>
                  <div><span className="text-gray-600">Método de pago:</span> <span className="font-medium">{viewing.payment_method || '-'}</span></div>
                  <div><span className="text-gray-600">Total:</span> <span className="font-medium">${Number(viewing.total || 0).toFixed(0)}</span></div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Productos</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-600">
                          <th className="py-1">Producto</th>
                          <th className="py-1">Cant.</th>
                          <th className="py-1">Precio</th>
                          <th className="py-1">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getDisplayItems(viewing).map((it, idx) => {
                          const qty = Number(it.qty ?? it.quantity ?? 1);
                          const price = Number(it.price ?? 0);
                          const total = it.total != null ? Number(it.total) : price * qty;
                          return (
                            <tr key={idx} className="border-t">
                              <td className="py-1">{it.name || it.product_id || it.productId || '—'}</td>
                              <td className="py-1">{qty}</td>
                              <td className="py-1">${price.toFixed(0)}</td>
                              <td className="py-1">${total.toFixed(0)}</td>
                            </tr>
                          );
                        })}
                        {getDisplayItems(viewing).length === 0 && (
                          <tr className="border-t"><td className="py-2 text-gray-500" colSpan={4}>Sin productos</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;
