import { useEffect, useMemo, useState } from 'react';
import { db } from '../../utils/firebaseClient';
import { doc, getDoc, updateDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';
import { List, Clock, Loader, CheckCircle, Trash, Plus } from 'lucide-react';
import { uid } from '../../utils/uid';
import { categoryColors } from '../../utils/colors';

const OrdersManagement = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [contractsMap, setContractsMap] = useState<Record<string, any>>({});
  const [contractsByEmail, setContractsByEmail] = useState<Record<string, any>>({});
  const [statusFilter, setStatusFilter] = useState<'todas'|'pendiente'|'procesando'|'completado'>('todas');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewing, setViewing] = useState<OrderItem | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowCategory[] | null>(null);
  const [wfEditMode, setWfEditMode] = useState(false);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [linking, setLinking] = useState(false);

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const status = getDerivedStatusForOrder(o);
      const byStatus = statusFilter === 'todas' ? true : (status === statusFilter);
      const s = search.trim().toLowerCase();
      const bySearch = s ? ((o.customer_name || '').toLowerCase().includes(s) || (o.customer_email || '').toLowerCase().includes(s)) : true;
      const hasStoreServices = (getDisplayItems(o) || []).length > 0;
      return byStatus && bySearch && hasStoreServices;
    });
  }, [orders, statusFilter, search, contractsMap, contractsByEmail]);

  const counts = useMemo(() => {
    const statuses = orders.map(o => getDerivedStatusForOrder(o));
    return {
      todas: orders.length,
      pendiente: statuses.filter(s => s === 'pendiente').length,
      procesando: statuses.filter(s => s === 'procesando').length,
      completado: statuses.filter(s => s === 'completado').length,
    };
  }, [orders, contractsMap]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    await updateDoc(doc(db, 'orders', id), { status });
    await fetchOrders();
  };

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar esta orden?')) return;
    await deleteDoc(doc(db, 'orders', id));
    await fetchOrders();
  };

  function normalize(s: string) { return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim(); }

  function getDisplayItems(o: OrderItem) {
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
  }

  function getContractForOrder(o: OrderItem) {
    let c = o.contractId ? contractsMap[o.contractId] : null;
    if (!c && o.customer_email) {
      const key = String(o.customer_email).toLowerCase().trim();
      c = contractsByEmail[key] || Object.values(contractsMap).find((x: any) => String((x.clientEmail || x.client_email || '')).toLowerCase().trim() === key) || null;
    }
    return c;
  }

  function getWorkflowForRow(o: OrderItem): WorkflowCategory[] {
    if (o.workflow && o.workflow.length) return o.workflow as WorkflowCategory[];
    const c = getContractForOrder(o);
    return (c && Array.isArray(c.workflow)) ? (c.workflow as WorkflowCategory[]) : [];
  }

  function isDeliveryCompleteForOrder(o: OrderItem): boolean {
    const items = getDisplayItems(o);
    if (!items || items.length === 0) return false;
    const wf = getWorkflowForRow(o);
    const deliveryCat = wf.find(c => normalize(c.name).includes('entrega'));
    if (!deliveryCat || !deliveryCat.tasks || deliveryCat.tasks.length === 0) return false;
    const doneSet = new Set(
      deliveryCat.tasks.filter(t => t.done).map(t => normalize(t.title))
    );
    const productNames = items.map(it => String(it.name || it.product_id || it.productId || ''));
    return productNames.every(n => doneSet.has(normalize(`Entregar ${n}`)));
  }

  function getDerivedStatusForOrder(o: OrderItem): OrderStatus {
    if (isDeliveryCompleteForOrder(o)) return 'completado';
    const wf = getWorkflowForRow(o);
    const hasAnyTasks = wf.some(c => (c.tasks || []).length > 0);
    const hasAnyDone = wf.some(c => (c.tasks || []).some(t => t.done));
    if (hasAnyDone) return 'procesando';
    if (hasAnyTasks) return 'pendiente';
    return 'pendiente';
  }

  function getDueDateString(o: OrderItem): string {
    if (!o.created_at) return '-';
    const d = new Date(o.created_at);
    if (isNaN(d.getTime())) return '-';
    const due = new Date(d.getTime() + 15 * 24 * 60 * 60 * 1000);
    return due.toLocaleDateString();
  }

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

  const persistTaskChange = async (ci: number, ti: number, checked: boolean) => {
    if (!workflow || !viewing) return;
    const updated = workflow.map((c, ci2) => ci2 === ci ? { ...c, tasks: c.tasks.map((t, ti2) => ti2 === ti ? { ...t, done: checked } : t) } : c);
    setWorkflow(updated);

    try {
      const isVirtual = String(viewing.id || '').startsWith('contract-');
      const orderId = viewing.id;

      // Actualizar orden
      if (!isVirtual) {
        await updateDoc(doc(db, 'orders', orderId), { workflow: updated } as any);
        setOrders(prev => prev.map(x => x.id === orderId ? { ...x, workflow: updated } : x));
        setViewing(v => v ? { ...v, workflow: updated } : v);
      }

      // Actualizar contrato si existe
      let targetContractId = viewing.contractId || null;
      if (!targetContractId && viewing.customer_email) {
        const key = String(viewing.customer_email).toLowerCase().trim();
        const matched = contractsByEmail[key] || Object.values(contractsMap).find((x: any) =>
          String((x.clientEmail || x.client_email || '')).toLowerCase().trim() === key
        ) || null;
        if (matched) targetContractId = matched.id;
      }

      if (targetContractId) {
        const cRef = doc(db, 'contracts', targetContractId);
        const cSnap = await getDoc(cRef);
        if (cSnap.exists()) {
          const contract = { id: cSnap.id, ...(cSnap.data() as any) };
          const baseWorkflow: WorkflowCategory[] = Array.isArray(contract.workflow) ? contract.workflow : [];
          const items = getDisplayItems(viewing);
          const productNames = items.map(it => String(it.name || it.product_id || it.productId || ''));
          const mergedWorkflow = ensureDeliveryTasks(baseWorkflow, productNames);

          const ordDeliveryCat = updated.find(c => normalize(c.name).includes('entrega'));
          if (ordDeliveryCat) {
            mergedWorkflow.forEach(cat => {
              if (normalize(cat.name).includes('entrega')) {
                cat.tasks = cat.tasks.map(t => {
                  const match = ordDeliveryCat.tasks.find(ot => normalize(ot.title) === normalize(t.title));
                  return match ? { ...t, done: !!match.done } : t;
                });
              }
            });
          }

          await updateDoc(cRef, { workflow: mergedWorkflow } as any);
          setContractsMap(prev => ({ ...prev, [cRef.id]: { ...(prev[cRef.id] || {}), workflow: mergedWorkflow } }));
        }
      }
    } catch (err) {
      console.warn('Error persisting workflow change', err);
    }
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

  const applyTemplateToOrder = (tpl: WorkflowTemplate | null) => {
    if (!tpl) return;
    const cloned = tpl.categories.map(c => ({ id: c.id || uid(), name: c.name, tasks: c.tasks.map(t => ({ ...t, id: t.id || uid(), done: false })) }));
    setWorkflow(cloned);
  };

  const colorsFor = (len: number) => categoryColors(len);

  // ...aquí continúa el resto del código de filtrado, counts, autoLinkOrders y renderizado de tabla como ya lo tenías
  // Solo reemplaza la parte del modal de workflow:
  // En los checkbox de las tareas, llama a persistTaskChange(ci, ti, checked) en onChange

  return (
    <div className="space-y-6">
      {/* ... encabezado y filtros ... */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* ... cabecera de tabla ... */}
        <div className="divide-y">
          {filtered.map(o => {
            const wfRow = getWorkflowForRow(o);
            const deliveryComplete = isDeliveryCompleteForOrder(o);
            const segments = wfRow.map(cat => {
              const total = cat.tasks.length || 1;
              const done = cat.tasks.filter(t => t.done).length;
              return total === 0 ? 0 : Math.round((done/total)*100);
            });
            const cols = colorsFor(wfRow.length);
            return (
              <div key={o.id} className="p-3 flex justify-between items-center">
                <div>
                  <div className="font-semibold">{o.customer_name}</div>
                  <div className="text-xs">{o.customer_email}</div>
                  <div className="text-xs">{getDueDateString(o)}</div>
                </div>
                <div className="flex gap-2">
                  {wfRow.map((cat, ci) => (
                    <div key={ci} className="flex flex-col">
                      <div className="font-semibold text-xs">{cat.name}</div>
                      {cat.tasks.map((t, ti) => (
                        <label key={t.id} className="flex items-center gap-1 text-xs">
                          <input type="checkbox" checked={t.done} onChange={e => persistTaskChange(ci, ti, e.target.checked)} />
                          {t.title}
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrdersManagement;
