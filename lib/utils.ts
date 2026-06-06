import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Material } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}

export function getStockStatus(material: Material): 'healthy' | 'low' | 'critical' {
  const ratio = material.available_qty / material.min_stock;
  if (ratio <= 0) return 'critical';
  if (ratio <= 1.5) return 'low';
  return 'healthy';
}

export function stockStatusLabel(status: 'healthy' | 'low' | 'critical'): string {
  return { healthy: 'Saudável', low: 'Baixo', critical: 'Crítico' }[status];
}

export function stockStatusColor(status: 'healthy' | 'low' | 'critical'): string {
  return {
    healthy: 'text-emerald-600 bg-emerald-50',
    low: 'text-amber-600 bg-amber-50',
    critical: 'text-red-600 bg-red-50',
  }[status];
}

export function marginStatus(margin: number): 'healthy' | 'warning' | 'danger' {
  if (margin >= 30) return 'healthy';
  if (margin >= 15) return 'warning';
  return 'danger';
}

export const MATERIAL_UNITS = [
  'unidade', 'metro', 'centímetro', 'milímetro', 'metro quadrado',
  'quilograma', 'grama', 'litro', 'mililitro', 'folha',
  'caixa', 'pacote', 'rolo', 'kit',
];

export const MATERIAL_CATEGORIES = [
  'Papelaria', 'Artesanato', 'Confeitaria', 'Cosméticos', 'Brindes',
  'Personalizados', 'Sublimação', 'Costura', 'Velas', 'Outros',
];

export const FIXED_COST_SUGGESTIONS = [
  'Energia elétrica', 'Água', 'Internet', 'Aluguel', 'Canva',
  'Adobe', 'Funcionários', 'Pró-labore', 'Marketing', 'Telefone',
  'Contabilidade', 'Embalagens gerais',
];
