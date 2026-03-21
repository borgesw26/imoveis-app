import { Property, Alert } from '../types';
import { daysUntil, formatDate } from './format';

export function generateAlerts(properties: Property[]): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date();

  properties.forEach((p) => {
    // Expired contracts
    if (p.endDate && new Date(p.endDate) < now && p.status === 'occupied') {
      alerts.push({
        property: p,
        type: 'expired',
        priority: 'high',
        message: 'Contrato vencido!',
        detail: `Venceu em ${formatDate(p.endDate)}`,
      });
    } else if (p.endDate && p.status === 'occupied') {
      const days = daysUntil(p.endDate);
      if (days <= 30 && days > 0) {
        alerts.push({
          property: p,
          type: 'expiring',
          priority: 'high',
          message: `Contrato vence em ${days} dias`,
          detail: `Vencimento: ${formatDate(p.endDate)}`,
        });
      } else if (days <= 60 && days > 30) {
        alerts.push({
          property: p,
          type: 'expiring',
          priority: 'medium',
          message: `Contrato vence em ${days} dias`,
          detail: `Vencimento: ${formatDate(p.endDate)}`,
        });
      } else if (days <= 90 && days > 60) {
        alerts.push({
          property: p,
          type: 'expiring',
          priority: 'low',
          message: `Contrato vence em ${days} dias`,
          detail: `Vencimento: ${formatDate(p.endDate)}`,
        });
      }
    }

    // Vacant properties
    if (p.status === 'vacant') {
      alerts.push({
        property: p,
        type: 'vacant',
        priority: 'high',
        message: 'Imóvel vago',
        detail: `Perda mensal: R$ ${(p.condoFee + p.iptu + p.extraFee).toFixed(2)}`,
      });
    }

    // Rent adjustment approaching (contract near 1 year)
    if (p.startDate && p.status === 'occupied') {
      const months = Math.floor(
        (now.getTime() - new Date(p.startDate).getTime()) / (30 * 86400000)
      );
      if (months >= 11 && months < 12) {
        alerts.push({
          property: p,
          type: 'adjustment',
          priority: 'medium',
          message: 'Reajuste em breve',
          detail: `Contrato completa 1 ano em ${12 - months} mês`,
        });
      }
    }
  });

  return alerts;
}
