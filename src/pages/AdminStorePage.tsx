import React, { useEffect, useMemo, useState } from 'react';
import AdminStoreDashboard from '../components/store/AdminStoreDashboard';
import OrdersManagement from '../components/store/OrdersManagement';
import ContractsManagement from '../components/store/ContractsManagement';
import PhotoPackagesManagement from '../components/store/PhotoPackagesManagement';
import StoreSettings from '../components/store/StoreSettings';
import ProductEditorModal from '../components/store/ProductEditorModal';
import { db } from '../utils/firebaseClient';
import { collection, getDocs, deleteDoc, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { Trash2 } from 'lucide-react';

const AdminStorePage: React.FC = () => {
  const [adminView, setAdminView] = useState<'dashboard' | 'products' | 'orders' | 'contracts' | 'packages' | 'settings'>(() => {
    try { return (localStorage.getItem('admin_view') as any) || 'dashboard'; } catch { return 'dashboard'; }
  });
  const [adminFullscreen, setAdminFullscreen] = useState<boolean>(() => {
    try { return localStorage.getItem('admin_fullscreen') === '1'; } catch { return false; }
  });

  // products state copied from StorePage
  const [products, setProducts] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) { setProducts([]); return; }
      const col = collection(db, 'products');
      let q: any = col;
      try { q = query(col, orderBy('created_at', 'desc')); } catch (_) { q = col; }
      const snap = await getDocs(q);
      const raw = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      // unique by name/price/category
      const seen = new Set<string>();
      const unique: any[] = [];
      for (const p of raw) {
        const key = `${String(p.name||'').trim().toLowerCase()}|${Number(p.price)||0}|${String(p.category||'').trim().toLowerCase()}`;
        if (!seen.has(key)) { seen.add(key); unique.push(p); }
      }
      setProducts(unique);
    } catch (error) {
      console.warn('Não foi possível carregar produtos no momento.');
      setProducts([]);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    try { localStorage.setItem('admin_view', adminView); } catch {}
  }, [adminView]);

  useEffect(() => {
    try { adminFullscreen ? localStorage.setItem('admin_fullscreen', '1') : localStorage.removeItem('admin_fullscreen'); } catch {}
  }, [adminFullscreen]);

  const handleDeactivate = async (productId: string, activate: boolean) => {
    try {
      await updateDoc(doc(db, 'products', productId), { active: activate, updated_at: new Date().toISOString() });
      await fetchProducts();
    } catch (e) {
      console.error('Erro ao atualizar status do produto:', e);
      alert('No se pudo actualizar el estado');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Tem certeza de que deseja excluir este produto?')) {
      try {
        await deleteDoc(doc(db, 'products', productId));
        fetchProducts();
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        alert('Erro ao excluir o produto');
      }
    }
  };

  return (
    <section className="pt-32 pb-16">
      <div className="container-custom">
        <div className="mb-8 space-y-6">
          <div className="flex items-center gap-2">
            <button onClick={() => setAdminView('dashboard')} className={`px-4 py-2 rounded-none border-2 ${adminView==='dashboard' ? 'bg-black text-white border-black' : 'border-black text-black hover:bg-black hover:text-white'}`}>Panel</button>
            <button onClick={() => setAdminView('products')} className={`px-4 py-2 rounded-none border-2 ${adminView==='products' ? 'bg-black text-white border-black' : 'border-black text-black hover:bg-black hover:text-white'}`}>Productos</button>
            <button onClick={() => setAdminView('orders')} className={`px-4 py-2 rounded-none border-2 ${adminView==='orders' ? 'bg-black text-white border-black' : 'border-black text-black hover:bg-black hover:text-white'}`}>Órdenes</button>
            <button onClick={() => setAdminView('contracts')} className={`px-4 py-2 rounded-none border-2 ${adminView==='contracts' ? 'bg-black text-white border-black' : 'border-black text-black hover:bg-black hover:text-white'}`}>Contratos</button>
            <button onClick={() => setAdminView('packages')} className={`px-4 py-2 rounded-none border-2 ${adminView==='packages' ? 'bg-black text-white border-black' : 'border-black text-black hover:bg-black hover:text-white'}`}>Paquetes</button>
            <button onClick={() => setAdminView('settings')} className={`px-4 py-2 rounded-none border-2 ${adminView==='settings' ? 'bg-black text-white border-black' : 'border-black text-black hover:bg-black hover:text-white'}`}>Ajustes</button>
            <div className="ml-auto">
              <button onClick={() => setAdminFullscreen(v => !v)} className="px-4 py-2 rounded-none border-2 border-black text-black hover:bg-black hover:text-white">{adminFullscreen ? 'Restaurar' : 'Maximizar'}</button>
            </div>
          </div>

          {adminView === 'dashboard' && (
            <AdminStoreDashboard onNavigate={(v) => setAdminView(v)} />
          )}

          {adminView === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="section-title">Gestión de Productos</h2>
                <div className="flex items-center gap-2">
                  <button onClick={async () => {
                    if (!confirm('Buscar y eliminar productos duplicados por nombre y precio?')) return;
                    const seen = new Map<string, string>();
                    for (const p of products) {
                      const key = `${String(p.name||'').trim().toLowerCase()}|${Number(p.price)||0}|${String(p.category||'').trim().toLowerCase()}`;
                      if (seen.has(key)) {
                        try { await deleteDoc(doc(db, 'products', p.id)); } catch {}
                      } else {
                        seen.set(key, p.id);
                      }
                    }
                    fetchProducts();
                  }} className="px-4 py-2 rounded-none border-2 border-black text-black hover:bg-black hover:text-white transition-colors">Eliminar Duplicados</button>
                  <button onClick={() => { setEditingProduct(null); setEditorOpen(true); }} className="px-4 py-2 rounded-none border-2 border-black text-black hover:bg-black hover:text-white transition-colors">+ Agregar Producto</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden h-full flex flex-col">
                    <div className="relative">
                      <img loading="lazy" src={product.image_url} alt={product.name} className="w-full h-44 object-cover" />
                      {(product as any).active === false && (
                        <span className="absolute top-2 left-2 text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">inactivo</span>
                      )}
                    </div>
                    <div className="p-4 flex flex-col h-full">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold">{product.name}</h3>
                        <span className="text-primary font-bold">${Number(product.price).toFixed(0)}</span>
                      </div>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                        <span className="px-2 py-1 bg-gray-100 rounded">{product.category || 'General'}</span>
                      </div>
                      <div className="mt-4 flex items-center gap-2 mt-auto">
                        <button onClick={() => { setEditingProduct(product); setEditorOpen(true); }} className="flex-1 border-2 border-black text-black px-3 py-2 rounded-none hover:bg-black hover:text-white">Editar</button>
                        <button onClick={() => handleDeactivate(product.id, (product as any).active === false ? true : false)} className={`flex-1 border-2 border-black px-3 py-2 rounded-none ${(product as any).active === false ? 'bg-white text-black hover:bg-black hover:text-white' : 'bg-black text-white hover:opacity-90'}`}>{(product as any).active === false ? 'Activar' : 'Desactivar'}</button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="border-2 border-black text-black px-3 py-2 rounded hover:bg-black hover:text-white"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <ProductEditorModal open={editorOpen} onClose={() => setEditorOpen(false)} product={editingProduct as any} onSaved={fetchProducts} />
            </div>
          )}

          {adminView === 'orders' && <OrdersManagement />}
          {adminView === 'contracts' && <ContractsManagement />}
          {adminView === 'packages' && <PhotoPackagesManagement />}
          {adminView === 'settings' && <StoreSettings />}
        </div>

        {adminFullscreen && (
          <div className="fixed inset-0 z-50 bg-white overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-2 mb-6">
                <button onClick={() => setAdminView('dashboard')} className={`px-4 py-2 rounded-none border-2 ${adminView==='dashboard' ? 'bg-black text-white border-black' : 'border-black text-black hover:bg-black hover:text-white'}`}>Panel</button>
                <button onClick={() => setAdminView('products')} className={`px-4 py-2 rounded-none border-2 ${adminView==='products' ? 'bg-black text-white border-black' : 'border-black text-black hover:bg-black hover:text-white'}`}>Productos</button>
                <button onClick={() => setAdminView('orders')} className={`px-4 py-2 rounded-none border-2 ${adminView==='orders' ? 'bg-black text-white border-black' : 'border-black text-black hover:bg-black hover:text-white'}`}>Órdenes</button>
                <button onClick={() => setAdminView('contracts')} className={`px-4 py-2 rounded-none border-2 ${adminView==='contracts' ? 'bg-black text-white border-black' : 'border-black text-black hover:bg-black hover:text-white'}`}>Contratos</button>
            <button onClick={() => setAdminView('packages')} className={`px-4 py-2 rounded-none border-2 ${adminView==='packages' ? 'bg-black text-white border-black' : 'border-black text-black hover:bg-black hover:text-white'}`}>Paquetes</button>
            <button onClick={() => setAdminView('settings')} className={`px-4 py-2 rounded-none border-2 ${adminView==='settings' ? 'bg-black text-white border-black' : 'border-black text-black hover:bg-black hover:text-white'}`}>Ajustes</button>
            <div className="ml-auto">
                  <button onClick={() => setAdminFullscreen(false)} className="px-4 py-2 rounded-none border-2 border-black text-black hover:bg-black hover:text-white">Cerrar pantalla completa</button>
                </div>
              </div>

              {adminView === 'dashboard' && <AdminStoreDashboard onNavigate={v => setAdminView(v)} />}
              {adminView === 'products' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="section-title">Gestión de Productos</h2>
                    <div className="flex items-center gap-2">
                      <button onClick={async () => {
                        if (!confirm('Buscar y eliminar productos duplicados por nombre y precio?')) return;
                        const seen = new Map<string, string>();
                        for (const p of products) {
                          const key = `${String(p.name||'').trim().toLowerCase()}|${Number(p.price)||0}|${String(p.category||'').trim().toLowerCase()}`;
                          if (seen.has(key)) {
                            try { await deleteDoc(doc(db, 'products', p.id)); } catch {}
                          } else {
                            seen.set(key, p.id);
                          }
                        }
                        fetchProducts();
                      }} className="px-4 py-2 rounded-none border-2 border-black text-black hover:bg-black hover:text-white transition-colors">Eliminar Duplicados</button>
                      <button onClick={() => { setEditingProduct(null); setEditorOpen(true); }} className="px-4 py-2 rounded-none border-2 border-black text-black hover:bg-black hover:text-white transition-colors">+ Agregar Producto</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => (
                      <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden h-full flex flex-col">
                        <div className="relative">
                          <img loading="lazy" src={product.image_url} alt={product.name} className="w-full h-44 object-cover" />
                          {(product as any).active === false && (
                            <span className="absolute top-2 left-2 text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">inactivo</span>
                          )}
                        </div>
                        <div className="p-4 flex flex-col h-full">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="font-semibold">{product.name}</h3>
                            <span className="text-primary font-bold">${Number(product.price).toFixed(0)}</span>
                          </div>
                          <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
                          <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                            <span className="px-2 py-1 bg-gray-100 rounded">{product.category || 'General'}</span>
                          </div>
                          <div className="mt-4 flex items-center gap-2 mt-auto">
                            <button onClick={() => { setEditingProduct(product); setEditorOpen(true); }} className="flex-1 border-2 border-black text-black px-3 py-2 rounded-none hover:bg-black hover:text-white">Editar</button>
                            <button onClick={() => handleDeactivate(product.id, (product as any).active === false ? true : false)} className={`flex-1 border-2 border-black px-3 py-2 rounded-none ${(product as any).active === false ? 'bg-white text-black hover:bg-black hover:text-white' : 'bg-black text-white hover:opacity-90'}`}>{(product as any).active === false ? 'Activar' : 'Desactivar'}</button>
                            <button onClick={() => handleDeleteProduct(product.id)} className="border-2 border-black text-black px-3 py-2 rounded hover:bg-black hover:text-white"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <ProductEditorModal open={editorOpen} onClose={() => setEditorOpen(false)} product={editingProduct as any} onSaved={fetchProducts} />
                </div>
              )}

              {adminView === 'orders' && <OrdersManagement />}
              {adminView === 'contracts' && <ContractsManagement />}
              {adminView === 'packages' && <PhotoPackagesManagement />}
              {adminView === 'settings' && <StoreSettings />}
          {adminView === 'settings' && <StoreSettings />}
        </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default AdminStorePage;
