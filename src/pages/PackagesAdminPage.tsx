import { useEffect, useMemo, useState } from 'react';
import { Plus, Save, X, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { DBPackage, fetchPackages, createPackage, updatePackage, deletePackage } from '../utils/packagesService';

const defaultNew: Partial<DBPackage> = {
  type: 'portrait',
  title: '',
  price: 0,
  duration: '',
  description: '',
  features: [],
  image_url: '',
  category: ''
};

const PackagesAdminPage = () => {
  const [packages, setPackages] = useState<DBPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'portrait' | 'maternity' | 'events'>('all');
  const [isAdmin, setIsAdmin] = useState<boolean>(Boolean(typeof window !== 'undefined' && localStorage.getItem('site_admin_mode')));
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [editing, setEditing] = useState<DBPackage | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [draft, setDraft] = useState<typeof defaultNew>(defaultNew);

  useEffect(() => {
    const handler = (e: Event | any) => {
      const val = e?.detail ?? (localStorage.getItem('site_admin_mode') ? true : false);
      setIsAdmin(Boolean(val));
      if (val) setShowAdminPanel(true); else setShowAdminPanel(false);
    };
    window.addEventListener('siteAdminModeChanged', handler as EventListener);
    window.addEventListener('storage', handler as EventListener);

    load();

    return () => {
      window.removeEventListener('siteAdminModeChanged', handler as EventListener);
      window.removeEventListener('storage', handler as EventListener);
    };
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchPackages();
      setPackages(data);
    } catch (e) {
      console.error('Erro ao carregar pacotes', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (selectedType === 'all') return packages;
    return packages.filter(p => p.type === selectedType);
  }, [selectedType, packages]);

  const toggleAdminMode = () => {
    if (!isAdmin) {
      const pass = prompt('Senha de administrador:');
      if (pass === '1234') {
        setIsAdmin(true);
        setShowAdminPanel(true);
        try { localStorage.setItem('site_admin_mode', '1'); } catch (_) {}
        window.dispatchEvent(new CustomEvent('siteAdminModeChanged', { detail: true }));
      } else if (pass !== null) {
        alert('Senha incorreta');
      }
    } else {
      setIsAdmin(false);
      setShowAdminPanel(false);
      setEditing(null);
      setShowAddForm(false);
      try { localStorage.removeItem('site_admin_mode'); } catch (_) {}
      window.dispatchEvent(new CustomEvent('siteAdminModeChanged', { detail: false }));
    }
  };

  const startCreate = () => {
    setDraft(defaultNew);
    setShowAddForm(true);
    setEditing(null);
  };

  const startEdit = (p: DBPackage) => {
    setEditing(p);
    setShowAddForm(false);
  };

  const saveDraft = async () => {
    try {
      if (!draft.title || !draft.type) {
        alert('Preencha pelo menos tipo e título');
        return;
      }
      await createPackage({
        type: draft.type!,
        title: draft.title!,
        price: Number(draft.price) || 0,
        duration: draft.duration || '',
        description: draft.description || '',
        features: draft.features || [],
        image_url: draft.image_url || '',
        category: draft.category || ''
      });
      setShowAddForm(false);
      setDraft(defaultNew);
      await load();
    } catch (e) {
      console.error('Erro ao criar pacote', e);
      alert('Erro ao criar pacote');
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      await updatePackage(editing.id, editing);
      setEditing(null);
      await load();
    } catch (e) {
      console.error('Erro ao salvar pacote', e);
      alert('Erro ao salvar pacote');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Deseja excluir este pacote?')) return;
    try {
      await deletePackage(id);
      await load();
    } catch (e) {
      console.error('Erro ao excluir pacote', e);
      alert('Erro ao excluir pacote');
    }
  };

  return (
    <section className="pt-32 pb-16">
      <div className="container-custom">
        <div className="flex justify-between items-center mb-8">
          <h1 className="section-title">Pacotes</h1>
          <div className="flex items-center gap-3">
            <button onClick={toggleAdminMode} className={`p-2 rounded-full ${isAdmin ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'} hover:bg-opacity-80`}>
              {isAdmin ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Admin Panel */}
        {isAdmin && showAdminPanel && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-blue-800">Painel de Administração</h2>
              <button onClick={startCreate} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90">
                <Plus size={20} />
                Adicionar Pacote
              </button>
            </div>

            {showAddForm && (
              <div className="bg-white p-6 rounded-lg border border-gray-200 mb-4">
                <h3 className="text-lg font-medium mb-4">Novo Pacote</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select value={draft.type} onChange={(e) => setDraft(prev => ({ ...prev, type: e.target.value as any }))} className="px-4 py-2 border border-gray-300 rounded-lg">
                    <option value="portrait">Retratos</option>
                    <option value="maternity">Gestantes</option>
                    <option value="events">Eventos</option>
                  </select>
                  <input type="text" placeholder="Título" value={draft.title} onChange={(e) => setDraft(prev => ({ ...prev, title: e.target.value }))} className="px-4 py-2 border border-gray-300 rounded-lg" />
                  <input type="number" placeholder="Preço (R$)" value={draft.price} onChange={(e) => setDraft(prev => ({ ...prev, price: Number(e.target.value) }))} className="px-4 py-2 border border-gray-300 rounded-lg" />
                  <input type="text" placeholder="Dura��ão" value={draft.duration} onChange={(e) => setDraft(prev => ({ ...prev, duration: e.target.value }))} className="px-4 py-2 border border-gray-300 rounded-lg" />
                  <input type="text" placeholder="Categoria (ex.: wedding, prewedding)" value={draft.category} onChange={(e) => setDraft(prev => ({ ...prev, category: e.target.value }))} className="px-4 py-2 border border-gray-300 rounded-lg" />
                  <input type="url" placeholder="URL da imagem" value={draft.image_url} onChange={(e) => setDraft(prev => ({ ...prev, image_url: e.target.value }))} className="px-4 py-2 border border-gray-300 rounded-lg md:col-span-2" />
                  <textarea placeholder="Descrição" value={draft.description} onChange={(e) => setDraft(prev => ({ ...prev, description: e.target.value }))} className="px-4 py-2 border border-gray-300 rounded-lg md:col-span-2" rows={3} />
                  <textarea placeholder="Features (uma por linha)" value={(draft.features || []).join('\n')} onChange={(e) => setDraft(prev => ({ ...prev, features: e.target.value.split('\n').filter(Boolean) }))} className="px-4 py-2 border border-gray-300 rounded-lg md:col-span-2" rows={4} />
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={saveDraft} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700">
                    <Save size={16} />
                    Salvar
                  </button>
                  <button onClick={() => setShowAddForm(false)} className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700">
                    <X size={16} />
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          {['all','portrait','maternity','events'].map((t) => (
            <button key={t} onClick={() => setSelectedType(t as any)} className={`px-4 py-2 rounded-full ${selectedType === t ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {t === 'all' ? 'Todos' : t === 'portrait' ? 'Retratos' : t === 'maternity' ? 'Gestantes' : 'Eventos'}
            </button>
          ))}
        </div>

        {loading ? (
          <div>Carregando...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((p) => (
              <div key={p.id} className="bg-white rounded-lg shadow-md overflow-hidden relative">
                {isAdmin && (
                  <div className="absolute top-2 right-2 z-10 flex gap-1">
                    <button onClick={() => startEdit(p)} className="bg-blue-600 text-white p-1 rounded-full hover:bg-blue-700">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => remove(p.id)} className="bg-red-600 text-white p-1 rounded-full hover:bg-red-700">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
                <div className="relative">
                  <img loading="lazy" src={p.image_url} alt={p.title} className="w-full h-48 object-cover" />
                  {p.category && (
                    <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">{p.category}</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-1">{p.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">{p.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-playfair text-primary">R$ {Number(p.price).toFixed(0)}</span>
                    <span className="text-sm text-gray-500">/{p.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {editing && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h3 className="text-lg font-medium mb-4">Editar Pacote</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select value={editing.type} onChange={(e) => setEditing(prev => prev ? { ...prev, type: e.target.value as any } : null)} className="px-4 py-2 border border-gray-300 rounded-lg">
                  <option value="portrait">Retratos</option>
                  <option value="maternity">Gestantes</option>
                  <option value="events">Eventos</option>
                </select>
                <input type="text" placeholder="Título" value={editing.title} onChange={(e) => setEditing(prev => prev ? { ...prev, title: e.target.value } : null)} className="px-4 py-2 border border-gray-300 rounded-lg" />
                <input type="number" placeholder="Preço (R$)" value={editing.price} onChange={(e) => setEditing(prev => prev ? { ...prev, price: Number(e.target.value) } : null)} className="px-4 py-2 border border-gray-300 rounded-lg" />
                <input type="text" placeholder="Duração" value={editing.duration} onChange={(e) => setEditing(prev => prev ? { ...prev, duration: e.target.value } : null)} className="px-4 py-2 border border-gray-300 rounded-lg" />
                <input type="text" placeholder="Categoria" value={editing.category || ''} onChange={(e) => setEditing(prev => prev ? { ...prev, category: e.target.value } : null)} className="px-4 py-2 border border-gray-300 rounded-lg" />
                <input type="url" placeholder="URL da imagem" value={editing.image_url} onChange={(e) => setEditing(prev => prev ? { ...prev, image_url: e.target.value } : null)} className="px-4 py-2 border border-gray-300 rounded-lg md:col-span-2" />
                <textarea placeholder="Descrição" value={editing.description || ''} onChange={(e) => setEditing(prev => prev ? { ...prev, description: e.target.value } : null)} className="px-4 py-2 border border-gray-300 rounded-lg md:col-span-2" rows={3} />
                <textarea placeholder="Features (uma por linha)" value={(editing.features || []).join('\n')} onChange={(e) => setEditing(prev => prev ? { ...prev, features: e.target.value.split('\n').filter(Boolean) } : null)} className="px-4 py-2 border border-gray-300 rounded-lg md:col-span-2" rows={4} />
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={saveEdit} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700">
                  <Save size={16} />
                  Salvar
                </button>
                <button onClick={() => setEditing(null)} className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700">
                  <X size={16} />
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PackagesAdminPage;
