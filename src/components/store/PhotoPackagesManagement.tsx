import { Plus, Edit, Trash2, Eye, EyeOff, RefreshCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { DBPackage, fetchPackages, createPackage, updatePackage, deletePackage } from '../../utils/packagesService';
import PackageEditorModal from '../admin/PackageEditorModal';
import { eventPackages } from '../../data/eventsData';
import { sessionPackages } from '../../data/sessionsData';
import { maternityPackages } from '../../data/maternityData';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../utils/firebaseClient';

function parsePrice(value: string): number {
  const n = Number(String(value).replace(/[^0-9,\.]/g, '').replace('.', '').replace(',', '.'));
  return isFinite(n) ? n : 0;
}

const PhotoPackagesManagement = () => {
  const [packages, setPackages] = useState<DBPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<DBPackage | null>(null);
  const [selectedSections, setSelectedSections] = useState<Record<string, string>>({});

  const grouped = useMemo(() => {
    return {
      portrait: packages.filter(p => p.type === 'portrait'),
      maternity: packages.filter(p => p.type === 'maternity'),
      events: packages.filter(p => p.type === 'events'),
    };
  }, [packages]);

  const load = async () => {
    try {
      setLoading(true);
      const all = await fetchPackages();
      setPackages(all);
    } catch (e: any) {
      setError(e?.message || 'No se pudieron cargar los paquetes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);


  const handleCreate = async () => {
    const title = prompt('Título del paquete:');
    if (!title) return;
    const priceStr = prompt('Precio (ej: 1200):', '0') || '0';
    const duration = prompt('Duración (ej: 2 horas):', '') || '';
    const description = prompt('Descripción:', '') || '';
    const image_url = prompt('Imagen (URL):', '') || '';
    const type = (prompt('Tipo (portrait|maternity|events):', 'portrait') || 'portrait') as DBPackage['type'];
    const featuresStr = prompt('Características (una por línea):', '') || '';
    const category = prompt('Categoría (opcional):', '') || undefined;

    const features = featuresStr.split('\n').map(s => s.trim()).filter(Boolean);

    await createPackage({
      type,
      title,
      price: Number(priceStr) || 0,
      duration,
      description,
      features,
      image_url,
      category,
      // @ts-expect-error allow
      active: true,
    });
    await load();
  };

  const handleToggle = async (p: DBPackage) => {
    // @ts-expect-error allow
    const newActive = !(p as any).active;
    await updatePackage(p.id, { /* @ts-expect-error */ active: newActive });
    await load();
  };

  const handleAddSection = async (p: DBPackage) => {
    const name = prompt('Nombre de la sección:');
    if (!name) return;
    const current = Array.isArray((p as any).sections) ? (p as any).sections.slice() : [];
    current.push(name);
    await updatePackage(p.id, { sections: current });
    await load();
    setSelectedSections(s => ({ ...s, [p.id]: name }));
  };

  const handleRemoveSection = async (p: DBPackage) => {
    const sel = selectedSections[p.id];
    if (!sel) { alert('Selecciona una sección para eliminar'); return; }
    if (!confirm(`Eliminar la sección "${sel}"?`)) return;
    const current = Array.isArray((p as any).sections) ? (p as any).sections.filter((x: string) => x !== sel) : [];
    await updatePackage(p.id, { sections: current });
    await load();
    setSelectedSections(s => ({ ...s, [p.id]: current[0] || '' }));
  };

  const handleSelectSection = (pkgId: string, value: string) => {
    setSelectedSections(s => ({ ...s, [pkgId]: value }));
  };

  const handleDelete = async (p: DBPackage) => {
    if (!confirm(`Eliminar paquete "${p.title}"?`)) return;
    await deletePackage(p.id);
    await load();
  };

  const importFromDataCore = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'packages'));
      await Promise.all(snap.docs.map(d => deleteDoc(doc(db, 'packages', d.id))));
      const toCreate: Array<Omit<DBPackage, 'id' | 'created_at'>> = [] as any;
      for (const s of sessionPackages) {
        toCreate.push({
          type: 'portrait',
          title: s.title,
          price: parsePrice(s.price),
          duration: s.duration,
          description: s.description,
          features: s.features,
          image_url: s.image,
          category: 'portrait',
        } as any);
      }
      for (const m of maternityPackages) {
        toCreate.push({
          type: 'maternity',
          title: m.title,
          price: parsePrice(m.price),
          duration: m.duration,
          description: m.description,
          features: m.features,
          image_url: m.image,
          category: 'maternity',
        } as any);
      }
      for (const e of eventPackages) {
        const cat = e.id.split('-')[0];
        toCreate.push({
          type: 'events',
          title: e.title,
          price: parsePrice(e.price),
          duration: e.duration,
          description: e.description,
          features: e.features,
          image_url: e.image,
          category: cat,
        } as any);
      }
      for (const c of toCreate) {
        await createPackage({ ...c });
      }
      await load();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleImportFromData = async () => {
    if (!confirm('Esto eliminará todos los paquetes actuales y los reemplazará por los paquetes predefinidos. ¿Continuar?')) return;
    const ok = await importFromDataCore();
    if (ok) alert('Paquetes importados correctamente'); else alert('Error al importar paquetes');
  };


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="section-title">Gestión de Paquetes</h2>
        <div className="flex items-center gap-2">
          <button onClick={handleCreate} className="px-4 py-2 border-2 border-black text-black rounded-none hover:bg-black hover:text-white flex items-center gap-2"><Plus size={16}/>Nuevo</button>
        </div>
      </div>

      {loading && <div className="text-gray-600">Cargando...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {(['portrait','maternity','events'] as const).map((type) => (
        <div key={type} className="mb-8">
          <h3 className="text-lg font-semibold mb-3 capitalize">{type === 'portrait' ? 'Retratos' : type === 'maternity' ? 'Gestantes' : 'Eventos'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {grouped[type].map((p) => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="relative">
                  <img loading="lazy" src={p.image_url} alt={p.title} className="w-full h-44 object-cover" data-pkg-id={p.id} />
                  {(p as any).active === false && (
                    <span className="absolute top-2 left-2 text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">inactivo</span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-semibold">{p.title}</h4>
                    <span className="text-primary font-bold">R$ {Number(p.price).toFixed(0)}</span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{p.description}</p>

                  {/* Sections selector */}
                  <div className="mt-4 flex items-center gap-2">
                    <select
                      value={selectedSections[p.id] || ((p as any).sections && (p as any).sections[0]) || ''}
                      onChange={(e) => handleSelectSection(p.id, e.target.value)}
                      className="border px-3 py-2 text-sm rounded w-full">
                      <option value="">Sin secciones</option>
                      {Array.isArray((p as any).sections) && (p as any).sections.map((s: string) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button onClick={() => handleAddSection(p)} className="px-3 py-2 border-2 border-black text-black rounded-none hover:bg-black hover:text-white flex items-center gap-2"><Plus size={14}/>Agregar</button>
                    <button onClick={() => handleRemoveSection(p)} className="px-3 py-2 border-2 border-black text-black rounded-none hover:bg-black hover:text-white flex items-center gap-2"><Trash2 size={14}/>Eliminar</button>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button onClick={() => { setEditing(p); setEditorOpen(true); }} className="flex-1 border-2 border-black text-black px-3 py-2 rounded-none hover:bg-black hover:text-white flex items-center gap-2"><Edit size={14}/>Editar</button>
                    <button onClick={() => handleToggle(p)} className={`flex-1 border-2 border-black px-3 py-2 rounded-none flex items-center justify-center gap-2 ${
                      (p as any).active === false ? 'bg-white text-black hover:bg-black hover:text-white' : 'bg-black text-white hover:opacity-90'
                    }`}>{(p as any).active === false ? (<><Eye size={14}/>Activar</>) : (<><EyeOff size={14}/>Desactivar</>)}</button>
                    <button onClick={() => handleDelete(p)} className="border-2 border-black text-black px-3 py-2 rounded hover:bg-black hover:text-white"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <PackageEditorModal open={editorOpen} onClose={() => setEditorOpen(false)} pkg={editing} onSaved={() => load()} />
    </div>
  );
};

export default PhotoPackagesManagement;
