import { Component } from '@angular/core';
import { BadgeDollarSign, Clock3, FileText, ShieldCheck, UsersRound } from 'lucide-angular';
import { TableColumn } from '../../core/models/table-column.model';
import { MetricCardComponent } from '../../shared/components/metric-card/metric-card';
import { PageTitleComponent } from '../../shared/components/page-title/page-title';
import { UiCardComponent } from '../../shared/components/ui-card/ui-card';
import { UiTableComponent } from '../../shared/components/ui-table/ui-table';

@Component({
  selector: 'app-dashboard',
  imports: [PageTitleComponent, MetricCardComponent, UiCardComponent, UiTableComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent {
  readonly metrics = [
    { title: 'Ventas del mes', value: 'S/ 48,230.50', icon: BadgeDollarSign, variant: 'primary' as const },
    {
      title: 'Comprobantes emitidos',
      value: '234',
      icon: FileText,
      variant: 'neutral' as const,
    },
    { title: 'Aceptados por SUNAT', value: '228', icon: ShieldCheck, variant: 'accent' as const },
    { title: 'Pendientes', value: '6', icon: Clock3, variant: 'neutral' as const },
    { title: 'Clientes activos', value: '42', icon: UsersRound, variant: 'primary' as const },
  ];

  readonly comprobantesColumns: TableColumn[] = [
    { key: 'comprobante', label: 'Comprobante' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'total', label: 'Total' },
    { key: 'estado', label: 'Estado' },
  ];

  readonly comprobantesRows = [
    {
      comprobante: 'F001-000234',
      cliente: 'Inversiones Lima S.A.C.',
      fecha: '2026-05-05',
      total: 'S/ 1,250.00',
      estado: 'Aceptado',
    },
    {
      comprobante: 'B001-001045',
      cliente: 'Servicios Integrales San Martín E.I.R.L.',
      fecha: '2026-05-05',
      total: 'S/ 350.00',
      estado: 'Aceptado',
    },
    {
      comprobante: 'F001-000233',
      cliente: 'Comercial Oriente del Perú S.A.C.',
      fecha: '2026-05-04',
      total: 'S/ 2,800.00',
      estado: 'Aceptado',
    },
    {
      comprobante: 'B001-001044',
      cliente: 'Distribuidora Norte S.R.L.',
      fecha: '2026-05-04',
      total: 'S/ 890.00',
      estado: 'Pendiente',
    },
    {
      comprobante: 'F001-000232',
      cliente: 'Inversiones Lima S.A.C.',
      fecha: '2026-05-03',
      total: 'S/ 4,120.00',
      estado: 'Aceptado',
    },
  ];
}
