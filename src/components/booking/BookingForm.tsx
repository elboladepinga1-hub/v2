import { useState, useEffect } from 'react';
import { BookingFormData } from '../../types/booking';
import { maternityPackages } from '../../data/maternityData';
import { dressOptions } from '../../data/dressData';
import DressSelector from './DressSelector';
import BookingCart from './BookingCart';
import { Check } from 'lucide-react';
import { formatPrice } from '../../utils/format';

// Helpers for BR formatting/validation
function onlyDigits(s: string) { return s.replace(/\D/g, ''); }
function formatCPF(value: string) {
  const v = onlyDigits(value).slice(0, 11);
  const part = [v.slice(0,3), v.slice(3,6), v.slice(6,9), v.slice(9,11)];
  return [part[0], part[1] && `.${part[1]}`, part[2] && `.${part[2]}`, part[3] && `-${part[3]}`].filter(Boolean).join('');
}
function validateCPF(value: string) {
  const v = onlyDigits(value);
  if (v.length !== 11 || /^(\d)\1{10}$/.test(v)) return false;
  const calc = (base: string, factor: number) => {
    let sum = 0; for (let i=0;i<base.length;i++) sum += parseInt(base[i],10) * (factor - i);
    const rest = (sum * 10) % 11; return rest === 10 ? 0 : rest;
  };
  const d1 = calc(v.slice(0,9), 10);
  const d2 = calc(v.slice(0,10), 11);
  return d1 === parseInt(v[9],10) && d2 === parseInt(v[10],10);
}
function formatRG(value: string) {
  const v = onlyDigits(value).slice(0, 9);
  const part = [v.slice(0,2), v.slice(2,5), v.slice(5,8), v.slice(8,9)];
  return [part[0], part[1] && `.${part[1]}`, part[2] && `.${part[2]}`, part[3] && `-${part[3]}`].filter(Boolean).join('');
}
function validateRG(value: string) {
  const v = onlyDigits(value);
  return v.length >= 8 && v.length <= 10; // RG formats vary by state; basic sanity
}
function formatPhoneBR(value: string) {
  const v = onlyDigits(value).slice(0, 11);
  if (v.length <= 10) {
    // (AA) NNNN-NNNN
    const p = [v.slice(0,2), v.slice(2,6), v.slice(6,10)];
    return [p[0] && `(${p[0]})`, p[1], p[2] && `-${p[2]}`].filter(Boolean).join(' ');
  }
  const p = [v.slice(0,2), v.slice(2,7), v.slice(7,11)];
  return [p[0] && `(${p[0]})`, p[1], p[2] && `-${p[2]}`].filter(Boolean).join(' ');
}
function validatePhoneBR(value: string) {
  const v = onlyDigits(value);
  return v.length === 10 || v.length === 11;
}
function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.toLowerCase());
}

// Simple DatePicker
const DatePicker: React.FC<{ value: string; onChange: (val: string) => void; min?: string }>=({ value, onChange, min })=>{
  const today = new Date();
  const [view, setView] = useState(() => {
    const d = value ? new Date(value) : today;
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const first = new Date(view.year, view.month, 1);
  const startWeekday = (first.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(view.year, view.month+1, 0).getDate();
  const minDate = min ? new Date(min) : today;
  const asStr = (y:number,m:number,d:number)=> `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

  const cells: (string|null)[] = Array.from({length: startWeekday}, ()=>null)
    .concat(Array.from({length: daysInMonth}, (_,i)=>asStr(view.year, view.month, i+1)));
  const canSelect = (d: string) => new Date(d) >= new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());

  return (
    <div className="border rounded-md p-3">
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={()=>setView(v=>({year: v.month===0? v.year-1:v.year, month: v.month===0?11:v.month-1}))} className="px-2 py-1 border rounded">«</button>
        <div className="font-medium">{new Date(view.year, view.month, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</div>
        <button type="button" onClick={()=>setView(v=>({year: v.month===11? v.year+1:v.year, month: v.month===11?0:v.month+1}))} className="px-2 py-1 border rounded">»</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-1">
        {['S','T','Q','Q','S','S','D'].map((d, i) => <div key={`${d}-${i}`}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, idx)=> d ? (
          <button key={idx} type="button" disabled={!canSelect(d)} onClick={()=>onChange(d)}
            className={`px-2 py-1 text-sm rounded ${value===d? 'bg-primary text-white':'hover:bg-gray-100'} ${!canSelect(d)?'opacity-40 cursor-not-allowed':''}`}>
            {Number(d.slice(-2))}
          </button>
        ) : <div key={idx} />)}
      </div>
    </div>
  );
};

// Simple 24h Time Picker
const TimePicker24: React.FC<{ value: string; onChange: (val: string) => void }>=({ value, onChange })=>{
  const [hour, minute] = (value || '').split(':');
  const h = Math.min(23, Math.max(0, parseInt(hour||'12', 10)));
  const m = Math.min(59, Math.max(0, parseInt(minute||'00', 10)));
  const setH = (hh: number)=> onChange(`${String(hh).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
  const setM = (mm: number)=> onChange(`${String(h).padStart(2,'0')}:${String(mm).padStart(2,'0')}`);
  return (
    <div className="border rounded-md p-3 space-y-3">
      <div className="text-xs text-gray-600 mb-1">Selecione o horário (24h)</div>
      <div className="grid grid-cols-6 gap-1">
        {Array.from({length:24}, (_,i)=> (
          <button key={i} type="button" onClick={()=>setH(i)} className={`text-xs px-2 py-1 rounded ${h===i? 'bg-primary text-white':'hover:bg-gray-100'}`}>{String(i).padStart(2,'0')}</button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs w-14">Minutos</span>
        <input type="range" min={0} max={59} step={5} value={m} onChange={(e)=>setM(parseInt(e.target.value,10))} className="flex-1" />
        <span className="text-sm font-medium w-10 text-right">{String(m).padStart(2,'0')}</span>
      </div>
    </div>
  );
};

interface BookingFormProps {
  initialData: BookingFormData;
  packages: any[];
  onSubmit: (data: BookingFormData) => void;
  onBack: () => void;
  isStoreOnly?: boolean;
}

const BookingForm: React.FC<BookingFormProps> = ({ initialData, packages, onSubmit, onBack, isStoreOnly = false }) => {
  const [formData, setFormData] = useState<BookingFormData>({
    ...initialData,
    discountCoupon: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const serviceTypes = [
    { id: 'portrait', name: 'Retratos' },
    { id: 'maternity', name: 'Gestantes' },
    { id: 'events', name: 'Eventos' }
  ];

  // Set PIX as default payment method
  useEffect(() => {
    if (!formData.paymentMethod) {
      setFormData(prev => ({ ...prev, paymentMethod: 'pix' }));
    }
  }, []);

  const getPackagesForService = (serviceType: string) => {
    if (!serviceType) return [];
    return packages.filter(pkg => {
      if (serviceType === 'portrait') return pkg.id.includes('basic') || pkg.id.includes('premium') || pkg.id.includes('exclusive');
      if (serviceType === 'maternity') return pkg.id.includes('maternity');
      if (serviceType === 'events') return pkg.id.includes('wedding');
      return false;
    });
  };

  const LOOKS_REGEX = /troca de (?:até )?(\d+) looks?/i;
  const parseLooksFromFeatures = (features?: string[]) => {
    if (!features) return 0;
    for (const f of features) {
      const m = String(f).match(LOOKS_REGEX);
      if (m) return parseInt(m[1], 10) || 0;
    }
    return 0;
  };
  const getMaxLooks = (item: any): number => {
    // 1) If item carries features, parse them
    const fromItem = parseLooksFromFeatures(item?.features);
    if (fromItem) return fromItem;
    // 2) Try static maternity packages by id
    const byId = maternityPackages.find(p => p.id === item?.id);
    if (byId?.looks) return byId.looks;
    // 3) Try static packages by title/name
    const byTitle = maternityPackages.find(p => p.title === item?.name);
    if (byTitle?.looks) return byTitle.looks;
    // 4) Try to parse from a generic packages list if available
    const anyPkg = packages?.find((p: any) => p.id === item?.id || p.title === item?.name);
    const fromPkgFeatures = parseLooksFromFeatures(anyPkg?.features);
    if (fromPkgFeatures) return fromPkgFeatures;
    const looksProp = Number((anyPkg as any)?.looks || 0);
    if (looksProp) return looksProp;
    return 0;
  };

  const handleDressSelection = (selectedDresses: string[]) => {
    setFormData(prev => ({ ...prev, selectedDresses }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let v: any = value;
    if (name === 'cpf') v = formatCPF(value);
    else if (name === 'rg') v = formatRG(value);
    else if (name === 'phone') v = formatPhoneBR(value);
    else if (name === 'email') v = value.toLowerCase();
    else if (name === 'travelCost') v = Number(value) || 0;
    setFormData(prev => ({ ...prev, [name]: v }));
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`
    };
  };

  const validateDateTime = (date: string, time: string) => {
    if (!date || !time) return false;
    
    const selectedDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    
    return selectedDateTime > now;
  };
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    let firstKey: string | undefined;

    const setErr = (key: string, msg: string) => {
      if (!newErrors[key]) newErrors[key] = msg;
      if (!firstKey) firstKey = key;
    };

    if (!formData.name.trim()) setErr('name', 'Nome é obrigatório');
    if (!formData.cpf.trim()) setErr('cpf', 'CPF é obrigatório');
    else if (!validateCPF(formData.cpf)) setErr('cpf', 'CPF inválido');

    if (!formData.rg.trim()) setErr('rg', 'RG é obrigatório');
    else if (!validateRG(formData.rg)) setErr('rg', 'RG inválido');

    if (!formData.address.trim()) setErr('address', 'Endereço é obrigatório');

    if (!formData.email.trim()) setErr('email', 'Email é obrigatório');
    else if (!validateEmail(formData.email)) setErr('email', 'Email inválido');

    if (!formData.phone.trim()) setErr('phone', 'Telefone é obrigatório');
    else if (!validatePhoneBR(formData.phone)) setErr('phone', 'Telefone inválido');

    // Validate each service in cart
    if (formData.cartItems && formData.cartItems.length > 0) {
      formData.cartItems.forEach((item, index) => {
        if (!formData[`date_${index}`]) setErr(`date_${index}`, 'Data é obrigatória');
        if (!formData[`time_${index}`]) setErr(`time_${index}`, 'Horário é obrigatório');

        // Validate date and time are not in the past
        if (formData[`date_${index}`] && formData[`time_${index}`]) {
          if (!validateDateTime(formData[`date_${index}`], formData[`time_${index}`])) {
            setErr(`date_${index}`, 'Data e horário devem ser futuros');
            setErr(`time_${index}`, 'Data e horário devem ser futuros');
          }
        }

        if (!formData[`eventLocation_${index}`] || !formData[`eventLocation_${index}`].trim()) {
          setErr(`eventLocation_${index}`, 'Localização é obrigatória');
        }
      });
    } else if (!formData.storeItems || formData.storeItems.length === 0) {
      setErr('general', 'Nenhum serviço selecionado');
    }

    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, firstErrorKey: firstKey, errors: newErrors };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateForm();
    if (result.isValid) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      setTimeout(() => onSubmit(formData), 100);
    } else if (result.firstErrorKey) {
      const el = document.querySelector(`[name="${result.firstErrorKey}"]`) as HTMLElement | null;
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        try { (el as HTMLInputElement).focus?.(); } catch {}
      }
    }
  };

  const formatPrice = (price: string | number): number => {
    if (typeof price === 'string') {
      return Number(price.replace(/[^0-9]/g, ''));
    }
    return price;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 pt-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          {isStoreOnly ? (
            <h1 className="text-3xl font-playfair mb-2">Preencha os dados para garantir sua compra.</h1>
          ) : (
            <>
              <h1 className="text-3xl font-playfair mb-2">Reservar Sessão ou Evento</h1>
              <p className="text-gray-600">Preencha os dados abaixo para finalizar sua reserva</p>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white shadow-md p-8 space-y-8">
              {/* Personal Information */}
              <section>
                <h2 className="text-xl font-medium mb-6 pb-2 border-b">Informações Pessoais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome completo *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`input-base focus:outline-none focus:ring-2 focus:ring-secondary ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Seu nome completo"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CPF *
                    </label>
                    <input
                      type="text"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleInputChange}
                      className={`input-base focus:outline-none focus:ring-2 focus:ring-secondary ${
                        errors.cpf ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="000.000.000-00"
                    />
                    {errors.cpf && <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      RG *
                    </label>
                    <input
                      type="text"
                      name="rg"
                      value={formData.rg}
                      onChange={handleInputChange}
                      className={`input-base focus:outline-none focus:ring-2 focus:ring-secondary ${
                        errors.rg ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="00.000.000-0"
                    />
                    {errors.rg && <p className="text-red-500 text-sm mt-1">{errors.rg}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Endereço completo *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`input-base focus:outline-none focus:ring-2 focus:ring-secondary ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Rua, número, bairro, cidade, CEP"
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`input-base focus:outline-none focus:ring-2 focus:ring-secondary ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="seu@email.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`input-base focus:outline-none focus:ring-2 focus:ring-secondary ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="(00) 00000-0000"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </section>

              {/* Service Information */}
              {/* Service Information Sections - One for each cart item */}
              {formData.cartItems && formData.cartItems.length > 0 ? (
                formData.cartItems.map((item, index) => (
                  <section key={`service-${index}`}>
                    <h2 className="text-xl font-medium mb-6 pb-2 border-b">
                      Informações do Serviço {formData.cartItems.length > 1 ? `#${index + 1}` : ''}
                      {formData.cartItems.length > 1 && (
                        <span className="text-base font-normal text-gray-600 ml-2">
                          ({item.name})
                        </span>
                      )}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de Serviço *
                        </label>
                        <input
                          type="text"
                          value={item.type === 'events' ? 'Eventos' : item.type === 'portrait' ? 'Retratos' : item.type === 'maternity' ? 'Gestantes' : item.type}
                          className="input-base bg-gray-50"
                          disabled
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pacote *
                        </label>
                        <input
                          type="text"
                          value={`${item.name} - ${item.price}`}
                          className="input-base bg-gray-50"
                          disabled
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duração
                        </label>
                        <input
                          type="text"
                          value={item.duration}
                          className="input-base bg-gray-50"
                          disabled
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantidade
                        </label>
                        <input
                          type="text"
                          value={`${item.quantity} ${item.quantity === 1 ? 'sessão' : 'sessões'}`}
                          className="input-base bg-gray-50"
                          disabled
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Data *
                        </label>
                        <DatePicker
                          value={formData[`date_${index}`] || ''}
                          onChange={(val) => setFormData(prev => ({ ...prev, [`date_${index}`]: val }))}
                          min={getCurrentDateTime().date}
                        />
                        {errors[`date_${index}`] && <p className="text-red-500 text-sm mt-1">{errors[`date_${index}`]}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Horário *
                        </label>
                        <TimePicker24
                          value={formData[`time_${index}`] || ''}
                          onChange={(val) => setFormData(prev => ({ ...prev, [`time_${index}`]: val }))}
                        />
                        {errors[`time_${index}`] && <p className="text-red-500 text-sm mt-1">{errors[`time_${index}`]}</p>}
                      </div>

                      {/* Dress selection just below time selection */}
                      {item.type === 'maternity' && (
                        <div className="md:col-span-2">
                          <DressSelector
                            dresses={dressOptions}
                            maxSelections={getMaxLooks(item)}
                            selectedDresses={formData.selectedDresses || []}
                            onChange={handleDressSelection}
                          />
                        </div>
                      )}

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Localização do Evento *
                          <a
                            href="https://maps.google.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 link-luxe text-sm"
                          >
                            (Buscar no Google Maps)
                          </a>
                        </label>
                        <input
                          type="text"
                          name={`eventLocation_${index}`}
                          value={formData[`eventLocation_${index}`] || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, [`eventLocation_${index}`]: e.target.value }))}
                          className={`input-base focus:outline-none focus:ring-2 focus:ring-secondary ${
                            errors[`eventLocation_${index}`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Endereço completo do evento ou link do Google Maps"
                        />
                        {errors[`eventLocation_${index}`] && <p className="text-red-500 text-sm mt-1">{errors[`eventLocation_${index}`]}</p>}
                        <p className="text-xs text-gray-500 mt-1">
                          Você pode colar o link do Google Maps aqui para maior precisão
                        </p>
                      </div>
                    </div>

                    {/* Cupón de descuento individual para cada servicio */}
                    <div className="md:col-span-2 mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cupom de Desconto
                      </label>
                      <input
                        type="text"
                        name={`discountCoupon_${index}`}
                        value={formData[`discountCoupon_${index}`] || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, [`discountCoupon_${index}`]: e.target.value }))}
                        className={`input-base focus:outline-none focus:ring-2 focus:ring-secondary ${
                          (() => {
                            const coupon = formData[`discountCoupon_${index}`];
                            if (!coupon || coupon.trim() === '') {
                              return 'border-gray-300 text-gray-900';
                            }
                            const hasDiscount = coupon === 'FREE' && item.id && item.id.includes('prewedding') && !item.id.includes('teaser');
                            return hasDiscount 
                              ? 'border-green-500 text-green-600 bg-green-50' 
                              : 'border-red-500 text-red-600 bg-red-50';
                          })()
                        }`}
                        placeholder="Insira seu cupom de descuento"
                      />
                      {(() => {
                        const coupon = formData[`discountCoupon_${index}`];
                        if (!coupon || coupon.trim() === '') {
                          return (
                            <p className="text-xs text-gray-500 mt-1">
                              Insira seu cupom de desconto se disponível
                            </p>
                          );
                        }
                        const hasDiscount = coupon === 'FREE' && item.id && item.id.includes('prewedding') && !item.id.includes('teaser');
                        
                        if (hasDiscount) {
                          return (
                            <p className="text-xs text-green-600 mt-1 font-medium">
                              ��� Cupom aplicado com sucesso! Desconto de 100%
                            </p>
                          );
                        }
                        
                        return (
                          <p className="text-xs text-red-600 mt-1 font-medium">
                            ❌ Cupom inválido ou não aplicável a este serviço
                          </p>
                        );
                      })()}
                    </div>
                  </section>
                ))
              ) : (
                (!formData.storeItems || formData.storeItems.length === 0) ? (
                  <section>
                    <h2 className="text-xl font-medium mb-6 pb-2 border-b">Informações do Servi��o</h2>
                    <div className="bg-yellow-50 border border-yellow-200 p-4">
                      <p className="text-yellow-800">Nenhum serviço selecionado. Por favor, adicione serviços ao carrinho primeiro.</p>
                    </div>
                  </section>
                ) : null
              )}

              {/* Serviços adicionais contratados */}
              {formData.storeItems && formData.storeItems.length > 0 && (
                <section>
                  <h2 className="text-xl font-medium mb-6 pb-2 border-b">Serviços adicionais contratados</h2>
                  <div className="bg-gray-50 p-6 border border-gray-200">
                    <div className="space-y-3">
                      {formData.storeItems.map((item, index) => (
                        <div key={`store-form-${index}`} className="flex justify-between text-sm">
                          <span className="text-gray-800">{item.name} ({item.quantity}x)</span>
                          <span className="font-medium text-gray-900">{formatPrice(Number(item.price) * Number(item.quantity))}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Global Service Settings */}
              <section>
                <h2 className="text-xl font-medium mb-6 pb-2 border-b">Configurações Gerais</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {!isStoreOnly && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Taxa de Deslocamento (R$)
                      </label>
                      <input
                        type="number"
                        name="travelCost"
                        value={formData.travelCost}
                        onChange={handleInputChange}
                        className="input-base focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Forma de Pagamento *
                    </label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      className="input-base focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                      <option value="pix">PIX</option>
                      <option value="credit">Cartão de Crédito</option>
                      <option value="cash">Dinheiro (5% desconto)</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Additional Information */}
              <section>
                <h2 className="text-xl font-medium mb-6 pb-2 border-b">Informações Adicionais</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="input-base focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="Informações adicionais sobre o evento..."
                  />
                </div>
              </section>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <button 
                  type="button"
                  onClick={onBack}
                  className="btn-secondary mr-2"
                >
                  Voltar ao Contrato
                </button>
                <button 
                  type="submit"
                  className="btn-primary ml-2"
                >
                  Revisar e Assinar
                </button>
              </div>
            </form>
          </div>

          {/* Cart */}
          <div className="lg:col-span-1">
            <BookingCart
              cartItems={formData.cartItems || []}
              travelCost={formData.travelCost}
              paymentMethod={formData.paymentMethod}
              formData={formData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
