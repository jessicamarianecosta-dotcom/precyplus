'use client';

import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, MessageCircle, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, Button, Modal, Input, Textarea, EmptyState } from '@/components/ui';
import type { Client } from '@/types';

const DEMO: Client[] = [
  { id: '1', user_id: 'u1', name: 'Ana Paula Silva', whatsapp: '41999990001', email: 'ana@email.com', observations: 'Gosta de personalizados florais', created_at: '' },
  { id: '2', user_id: 'u1', name: 'Mariana Costa', whatsapp: '41999990002', email: 'mari@email.com', observations: '', created_at: '' },
];

const EMPTY = { name: '', whatsapp: '', email: '', observations: '' };

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>(DEMO);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  function openNew() { setEditing(null); setForm(EMPTY); setModalOpen(true); }
  function openEdit(c: Client) { setEditing(c); setForm({ name: c.name, whatsapp: c.whatsapp || '', email: c.email || '', observations: c.observations || '' }); setModalOpen(true); }

  async function handleSave() {
    if (!form.name) { toast.error('Nome é obrigatório'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    if (editing) {
      setClients(prev => prev.map(c => c.id === editing.id ? { ...c, ...form } : c));
      toast.success('Cliente atualizado!');
    } else {
      setClients(prev => [{ id: Date.now().toString(), user_id: 'u1', ...form, created_at: '' }, ...prev]);
      toast.success('Cliente cadastrado! 👤');
    }
    setModalOpen(false);
    setLoading(false);
  }

  function handleDelete(id: string) {
    if (!confirm('Excluir este cliente?')) return;
    setClients(prev => prev.filter(c => c.id !== id));
    toast.success('Cliente removido.');
  }

  return (
    <div>
      <PageHeader title="Clientes" subtitle="Gerencie seus clientes e histórico." action={<Button icon={Plus} onClick={openNew}>Novo cliente</Button>} />

      <div className="relative mb-6 max-w-sm">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-100 outline-none text-sm font-semibold focus:border-pink-300 bg-white" style={{ fontFamily: 'Nunito, sans-serif' }} />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100">
          <EmptyState icon="👥" title="Nenhum cliente ainda" description="Cadastre seus clientes para vincular orçamentos e acompanhar pedidos."
            action={<Button icon={Plus} onClick={openNew}>Adicionar cliente</Button>} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(c => (
            <div key={c.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm card-hover group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm"
                    style={{ background: 'linear-gradient(135deg, #FF6BAD, #FF8DC7)' }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-800">{c.name}</h3>
                    {c.email && <p className="text-xs text-gray-500 font-semibold">{c.email}</p>}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-pink-50 text-pink-500"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
              {c.observations && <p className="text-xs text-gray-500 font-semibold mb-3 bg-gray-50 rounded-lg px-3 py-2">{c.observations}</p>}
              <div className="flex gap-2">
                {c.whatsapp && (
                  <a href={`https://wa.me/55${c.whatsapp.replace(/\D/g, '')}`} target="_blank"
                    className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors">
                    <MessageCircle size={12} /> WhatsApp
                  </a>
                )}
                {c.email && (
                  <a href={`mailto:${c.email}`}
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
                    <Mail size={12} /> E-mail
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar cliente' : 'Novo cliente'} size="md">
        <div className="space-y-4">
          <Input label="Nome completo *" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Maria Silva" />
          <Input label="WhatsApp" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="41 99999-0000" />
          <Input label="E-mail" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="cliente@email.com" />
          <Textarea label="Observações" value={form.observations} onChange={e => set('observations', e.target.value)} rows={3} placeholder="Preferências, histórico, anotações..." />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} loading={loading}>{editing ? 'Salvar' : 'Cadastrar cliente'}</Button>
        </div>
      </Modal>
    </div>
  );
}
