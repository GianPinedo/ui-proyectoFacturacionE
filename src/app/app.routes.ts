import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'login',
	},
	{
		path: 'login',
		canActivate: [guestGuard],
		loadComponent: () => import('./features/auth/login/login').then((m) => m.LoginComponent),
	},
	{
		path: '',
		canActivate: [authGuard],
		loadComponent: () =>
			import('./layout/admin-layout/admin-layout').then((m) => m.AdminLayoutComponent),
		children: [
			{
				path: 'inicio',
				loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.DashboardComponent),
			},
			{
				path: 'empresa',
				loadComponent: () => import('./features/empresa/empresa').then((m) => m.EmpresaComponent),
			},
			{
				path: 'usuarios-roles',
				loadComponent: () =>
					import('./features/usuarios-roles/usuarios-roles').then((m) => m.UsuariosRolesComponent),
			},
			{
				path: 'clientes',
				loadComponent: () => import('./features/clientes/clientes').then((m) => m.ClientesComponent),
			},
			{
				path: 'productos-servicios',
				loadComponent: () =>
					import('./features/productos-servicios/productos-servicios').then(
						(m) => m.ProductosServiciosComponent,
					),
			},
			{
				path: 'catalogos-sunat',
				loadComponent: () =>
					import('./features/catalogos-sunat/catalogos-sunat').then((m) => m.CatalogosSunatComponent),
			},
			{
				path: 'series-correlativos',
				loadComponent: () =>
					import('./features/series-correlativos/series-correlativos').then(
						(m) => m.SeriesCorrelativosComponent,
					),
			},
			{
				path: 'ventas',
				loadComponent: () => import('./features/ventas/ventas').then((m) => m.VentasComponent),
			},
			{
				path: 'comprobantes',
				loadComponent: () =>
					import('./features/comprobantes/comprobantes').then((m) => m.ComprobantesComponent),
			},
			{
				path: 'notas',
				loadComponent: () => import('./features/notas/notas').then((m) => m.NotasComponent),
			},
			{
				path: 'sunat-ose',
				loadComponent: () => import('./features/sunat-ose/sunat-ose').then((m) => m.SunatOseComponent),
			},
			{
				path: 'correo',
				loadComponent: () => import('./features/correo/correo').then((m) => m.CorreoComponent),
			},
			{
				path: 'reportes-ventas',
				loadComponent: () =>
					import('./features/reportes-ventas/reportes-ventas').then((m) => m.ReportesVentasComponent),
			},
			{
				path: 'reportes-tributarios',
				loadComponent: () =>
					import('./features/reportes-tributarios/reportes-tributarios').then(
						(m) => m.ReportesTributariosComponent,
					),
			},
			{
				path: 'auditoria',
				loadComponent: () => import('./features/auditoria/auditoria').then((m) => m.AuditoriaComponent),
			},
			{
				path: 'mi-perfil',
				loadComponent: () => import('./features/mi-perfil/mi-perfil').then((m) => m.MiPerfilComponent),
			},
		],
	},
	{
		path: '**',
		redirectTo: 'login',
	},
];
