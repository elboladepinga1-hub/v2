import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Plus, Trash2, Upload, Check } from 'lucide-react';
import { db } from '../../utils/firebaseClient';
import { addDoc, collection, doc, updateDoc, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface ProductInput {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  tags?: string[];
  active?: boolean;
  allow_name?: boolean;
  allow_custom_image?: boolean;
  variants?: { name: string; priceDelta: number }[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  product: ProductInput | null; // if null => creating
  onSaved: () => void;
}

const ProductEditorModal: React.FC<Props> = ({ open, onClose, product, onSaved }) => {
  const [form, setForm] = useState<ProductInput & {
    tieneVariantes?: boolean;
    variantes?: { nombre: string; precio: number }[];
    permiteTexto?: boolean;
    permiteFoto?: boolean;
    permiteAudio?: boolean;
  }>({
    name: '',
    description: '',
    price: 0,
    category: 'otros',
    image_url: '',
    tags: [],
    active: true,
    allow_name: true,
    allow_custom_image: true,
    variants: [],
    tieneVariantes: false,
    variantes: [],
    permiteTexto: true,
    permiteFoto: true,
    permiteAudio: false
  });
  const [tagsText, setTagsText] = useState('');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [categories, setCategories] = useState<string[]>([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [showDeleteCatConfirm, setShowDeleteCatConfirm] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const [affectedProducts, setAffectedProducts] = useState<{ id: string; name: string; newCategory: string }[]>([]);
  const [loadingAffected, setLoadingAffected] = useState(false);
  const [bulkReassign, setBulkReassign] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      const basePrice = Number(product.price) || 0;
      const variantes = (product as any).variantes as any[] || [];
      const variants = (product.variants || []).map(v => ({ nombre: v.name, precio: v.price != null ? Number(v.price) : basePrice + Number(v.priceDelta || 0) }));
      const mergedVariantes = variantes.length ? variantes : variants;
      setForm({
        id: product.id,
        name: product.name || '',
        description: product.description || '',
        price: Number(product.price) || 0,
        category: product.category || 'otros',
        image_url: product.image_url || '',
        tags: product.tags || [],
        active: product.active !== false,
        allow_name: product.allow_name !== false,
        allow_custom_image: product.allow_custom_image !== false,
        variants: product.variants || [],
        tieneVariantes: (product as any).tieneVariantes === true || mergedVariantes.length > 0,
        variantes: mergedVariantes,
        permiteTexto: (product as any).permiteTexto != null ? !!(product as any).permiteTexto : (product.allow_name !== false),
        permiteFoto: (product as any).permiteFoto != null ? !!(product as any).permiteFoto : (product.allow_custom_image !== false),
        permiteAudio: !!(product as any).permiteAudio
      });
      setTagsText((product.tags || []).join(', '));
    } else {
      setForm({
        name: '',
        description: '',
        price: 0,
        category: 'otros',
        image_url: '',
        tags: [],
        active: true,
        allow_name: true,
        allow_custom_image: true,
        variants: [],
        tieneVariantes: false,
        variantes: [],
        permiteTexto: true,
        permiteFoto: true,
        permiteAudio: false
      });
      setTagsText('');
    }
  }, [product]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const snap = await getDocs(collection(db, 'products'));
        const cats = Array.from(new Set(snap.docs.map(d => ((d.data() as any).category || '').trim()).filter(Boolean)));
        setCategories(cats);
      } catch (e) {
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  const handleUpload = async (file: File) => {
    try {
      const storage = getStorage();
      const key = `product_images/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, key);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setForm(prev => ({ ...prev, image_url: url }));
    } catch (e: any) {
      console.error('Product image upload failed', e);
      if (e && e.code === 'storage/unauthorized') {
        alert('No tienes permiso para subir imágenes al Storage. Inicia sesión o verifica las reglas de Firebase.');
      } else {
        alert('Error al subir la imagen. Revisa la consola para más detalles.');
      }
    }
  };

  const addCategory = () => {
    const c = (newCategory || '').trim();
    if (!c) return;
    if (!categories.includes(c)) setCategories(prev => [...prev, c]);
    setForm(prev => ({ ...prev, category: c }));
    setNewCategory('');
    setShowNewCategory(false);
  };

  useEffect(() => {
    const loadAffected = async () => {
      if (!showDeleteCatConfirm) return;
      const cat = deletingCategory || form.category;
      if (!cat) return;
      setLoadingAffected(true);
      try {
        const snap = await getDocs(collection(db, 'products'));
        const list = snap.docs.map(d => ({ id: d.id, name: (d.data() as any).name || 'Producto' }));
        const affected = (snap.docs)
          .map(d => ({ id: d.id, name: (d.data() as any).name || 'Producto' , category: (d.data() as any).category || '' }))
          .filter(p => p.category === cat)
          .map(p => ({ id: p.id, name: p.name, newCategory: 'otros' }));
        setAffectedProducts(affected);
      } catch (e) {
        setAffectedProducts([]);
      } finally {
        setLoadingAffected(false);
      }
    };
    loadAffected();
  }, [showDeleteCatConfirm, deletingCategory, form.category]);

  const handleDeleteCategory = async () => {
    const cat = deletingCategory || form.category;
    if (!cat) return;
    try {
      const updates: Promise<any>[] = [];
      const targets = affectedProducts.length ? affectedProducts : [];
      for (const p of targets) {
        const targetCat = p.newCategory || 'otros';
        updates.push(updateDoc(doc(db, 'products', p.id), { category: targetCat }));
      }
      await Promise.all(updates);
      setCategories(prev => prev.filter(c => c !== cat));
      setForm(prev => ({ ...prev, category: 'otros' }));
      setShowDeleteCatConfirm(false);
      setDeletingCategory(null);
      setAffectedProducts([]);
      setBulkReassign(null);
    } catch (e) {
      console.error('Error deleting category', e);
      alert('Error al eliminar categoría');
      setShowDeleteCatConfirm(false);
      setDeletingCategory(null);
      setAffectedProducts([]);
      setBulkReassign(null);
    }
  };

  const save = async () => {
    try {
      setSaving(true);
      const basePrice = Number(form.price) || 0;
      const variantes = (form.variantes || []).map(v => ({ nombre: String(v.nombre||''), precio: Number(v.precio||0) }));
      const variants = variantes.map(v => ({ name: v.nombre, price: v.precio, priceDelta: Number(v.precio) - basePrice }));
      const payload: any = {
        name: form.name,
        description: form.description,
        price: basePrice,
        category: form.category,
        image_url: form.image_url,
        tags: (tagsText || '').split(',').map(t => t.trim()).filter(Boolean),
        active: !!form.active,
        allow_name: form.permiteTexto != null ? !!form.permiteTexto : !!form.allow_name,
        allow_custom_image: form.permiteFoto != null ? !!form.permiteFoto : !!form.allow_custom_image,
        variants,
        tieneVariantes: !!form.tieneVariantes || variantes.length > 0,
        variantes,
        permiteTexto: form.permiteTexto != null ? !!form.permiteTexto : !!form.allow_name,
        permiteFoto: form.permiteFoto != null ? !!form.permiteFoto : !!form.allow_custom_image,
        permiteAudio: !!form.permiteAudio,
        updated_at: new Date().toISOString(),
      };
      if (form.id) {
        await updateDoc(doc(db, 'products', form.id), payload);
      } else {
        await addDoc(collection(db, 'products'), { ...payload, created_at: new Date().toISOString() });
      }
      onSaved();
      onClose();
    } catch (e) {
      console.error('Error saving product', e);
      alert('Error al guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{form.id ? 'Editar Producto' : 'Agregar Producto'}</h3>
          <button onClick={onClose} className="p-2 rounded-none border border-black text-black hover:bg-black hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Nombre del Producto</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Precio</label>
              <input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-none" />
            </div>
            <div>
            <label className="block text-sm text-gray-700 mb-1">Categoría</label>
            <div className="flex items-center gap-2">
              <select value={form.category} onChange={(e) => {
                const v = e.target.value;
                if (v === '__add_new__') { setShowNewCategory(true); setNewCategory(''); } else {
                  setForm(prev => ({ ...prev, category: v }));
                }
              }} className="px-3 py-2 border rounded-md">
                <option value="">Seleccionar</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="__add_new__">+ Agregar nueva...</option>
              </select>

              <button type="button" title="Agregar" onClick={() => { setShowNewCategory(true); setNewCategory(''); }} className="p-2 border rounded text-gray-600">
                <Plus size={14} />
              </button>

              {form.category && form.category !== 'otros' && (
                <button type="button" title="Eliminar categoría" onClick={() => { setDeletingCategory(form.category); setShowDeleteCatConfirm(true); }} className="p-2 border rounded text-gray-600">
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {showNewCategory && (
              <div className="mt-2 flex items-center gap-2">
                <input value={newCategory} onChange={e => setNewCategory(e.target.value)} className="px-3 py-2 border rounded-md flex-1" placeholder="Nueva categoría" />
                <button type="button" onClick={addCategory} className="p-2 bg-primary text-white rounded"><Check size={14} /></button>
                <button type="button" onClick={() => { setShowNewCategory(false); setNewCategory(''); }} className="p-2 border rounded text-gray-600"><X size={14} /></button>
              </div>
            )}
          </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Imagen del Producto</label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center text-gray-500 cursor-pointer" onClick={() => fileRef.current?.click()}>
              <Upload size={18} className="inline mr-2" /> Haz clic para subir imagen (JPG, PNG, WebP)
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files && e.target.files[0] && handleUpload(e.target.files[0])} />
            </div>
            {form.image_url && (
              <div className="mt-3 relative">
                <img src={form.image_url} alt="preview" className="w-full h-48 object-cover rounded" />
                <button className="absolute top-2 right-2 bg-white border-2 border-black text-black rounded-none p-1 hover:bg-black hover:text-white" onClick={() => setForm({ ...form, image_url: '' })}>
                  <X size={14} />
                </button>
              </div>
            )}
            <input
              placeholder="o pega la URL manualmente"
              value={form.image_url}
              onChange={e => setForm({ ...form, image_url: e.target.value })}
              className="mt-2 w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Tags (separados por comas)</label>
            <input value={tagsText} onChange={e => setTagsText(e.target.value)} className="w-full px-3 py-2 border rounded-none" />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Descripción</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center gap-2 md:col-span-1"><input type="checkbox" checked={!!form.permiteTexto} onChange={e => setForm({ ...form, permiteTexto: e.target.checked })} /> Permite texto personalizado</label>
            <label className="flex items-center gap-2 md:col-span-1"><input type="checkbox" checked={!!form.permiteFoto} onChange={e => setForm({ ...form, permiteFoto: e.target.checked })} /> Permite foto personalizada</label>
            <label className="flex items-center gap-2 md:col-span-1"><input type="checkbox" checked={!!form.permiteAudio} onChange={e => setForm({ ...form, permiteAudio: e.target.checked })} /> Permite audio personalizado</label>
          </div>

          <div className="mt-2 border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!form.tieneVariantes} onChange={e => setForm({ ...form, tieneVariantes: e.target.checked })} /> Tiene variantes</label>
              <button disabled={!form.tieneVariantes} className={`flex items-center gap-1 text-sm border-2 px-2 py-1 rounded-none ${form.tieneVariantes? 'border-black text-black hover:bg-black hover:text-white' : 'border-gray-300 text-gray-400'}`} onClick={() => setForm(f => ({ ...f, variantes: [...(f.variantes || []), { nombre: '', precio: Number(f.price||0) }] }))}><Plus size={14} /> Agregar Variante</button>
            </div>
            {form.tieneVariantes && (
              <div className="space-y-2">
                {(form.variantes || []).map((v, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                    <input placeholder="Nombre" value={v.nombre} onChange={e => setForm(f => ({ ...f, variantes: (f.variantes || []).map((vv, idx) => idx === i ? { ...vv, nombre: e.target.value } : vv) }))} className="md:col-span-3 px-3 py-2 border rounded-none" />
                    <input type="number" step="0.01" placeholder="Precio" value={v.precio} onChange={e => setForm(f => ({ ...f, variantes: (f.variantes || []).map((vv, idx) => idx === i ? { ...vv, precio: Number(e.target.value) } : vv) }))} className="px-3 py-2 border rounded-none" />
                    <button className="justify-self-end border-2 border-black text-black px-2 py-2 rounded-none hover:bg-black hover:text-white" onClick={() => setForm(f => ({ ...f, variantes: (f.variantes || []).filter((_, idx) => idx !== i) }))}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t p-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-none border-2 border-black text-black hover:bg-black hover:text-white">Cancelar</button>
          <button onClick={save} disabled={saving} className="px-4 py-2 rounded-none bg-black text-white disabled:opacity-50">{saving ? 'Guardando...' : (form.id ? 'Actualizar Producto' : 'Crear Producto')}</button>
        </div>
      </div>

      {showDeleteCatConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-lg">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold">Confirmar exclusão</h3>
                <p className="text-sm text-gray-600">Você está prestes a excluir a categoria "{deletingCategory || form.category}".</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Produtos afetados</div>
                <div className="text-xl font-bold">{loadingAffected ? '...' : affectedProducts.length}</div>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm text-gray-600">Reasignar a todos:</label>
              <div className="flex items-center gap-2 mt-2">
                <select value={bulkReassign || ''} onChange={e => {
                  const v = e.target.value || null;
                  setBulkReassign(v);
                  if (v !== null) setAffectedProducts(prev => prev.map(p => ({ ...p, newCategory: v })));
                }} className="px-3 py-2 border rounded-md">
                  <option value="">Otros (predeterminado)</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="text-sm text-gray-500">(Opcional)</div>
              </div>
            </div>

            <div className="max-h-64 overflow-auto border rounded p-2 mb-4">
              {loadingAffected && <div className="text-sm text-gray-500">Carregando produtos afetados...</div>}
              {!loadingAffected && affectedProducts.length === 0 && <div className="text-sm text-gray-500">Não há produtos com esta categoria.</div>}
              {!loadingAffected && affectedProducts.length > 0 && (
                <ul className="space-y-2">
                  {affectedProducts.map((p, idx) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 p-2 rounded hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-600">{String(idx+1)}</div>
                        <div>
                          <div className="text-sm font-medium">{p.name}</div>
                          <div className="text-xs text-gray-500">ID: {p.id}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select value={p.newCategory} onChange={e => setAffectedProducts(prev => prev.map(pp => pp.id === p.id ? { ...pp, newCategory: e.target.value } : pp))} className="px-2 py-1 border rounded-md">
                          <option value="otros">Otros</option>
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowDeleteCatConfirm(false); setDeletingCategory(null); setAffectedProducts([]); setBulkReassign(null); }} className="px-4 py-2 border rounded">Cancelar</button>
              <button onClick={handleDeleteCategory} className="px-4 py-2 bg-red-600 text-white rounded">Excluir e reatribuir</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductEditorModal;
