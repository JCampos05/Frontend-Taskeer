import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SvgCampana } from '../../components/svgs/svg-campana/svg-campana';
import { SvgCandado } from '../../components/svgs/svg-candado/svg-candado';
import { SvgEstrellaLlena } from '../../components/svgs/svg-estrella-llena/svg-estrella-llena';
import { SvgLogo } from '../../components/svgs/svg-logo/svg-logo';
import { SvgLuna } from '../../components/svgs/svg-luna/svg-luna';
import { SvgTablero } from '../../components/svgs/svg-tablero/svg-tablero';
import { SvgUsuarios } from '../../components/svgs/svg-usuarios/svg-usuarios';

interface Feature {
  icono: 'tablero' | 'estrella' | 'campana' | 'usuarios' | 'candado' | 'luna';
  titulo: string;
  descripcion: string;
}

interface Plan {
  nombre: string;
  precio: string;
  descripcion: string;
  caracteristicas: string[];
  textoBoton: string;
  /** El plan con el que todos empiezan (Free) — lleva el botón principal. */
  inicio?: boolean;
}

/** Landing pública. Identidad fija (no responde a modo claro/oscuro): usa
 * `.tema-neutro-fijo` (styles/theme.css), la paleta neutra de la app en claro,
 * con el azul de marca solo como acento en las acciones. */
@Component({
  selector: 'app-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    SvgTablero,
    SvgCampana,
    SvgUsuarios,
    SvgCandado,
    SvgEstrellaLlena,
    SvgLuna,
    SvgLogo,
  ],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
  host: { class: 'tema-neutro-fijo' },
})
export class Landing {
  protected readonly anioActual = new Date().getFullYear();

  // Solo capacidades que existen hoy en la app (ver document/ y PROGRESS.md);
  // nada de prueba social inventada.
  protected readonly features: Feature[] = [
    {
      icono: 'tablero',
      titulo: 'Tableros kanban a tu medida',
      descripcion:
        'Cada tablero nace con columnas listas para usar. Agrega las tuyas, ponles un límite de trabajo en curso y reordénalas arrastrando.',
    },
    {
      icono: 'estrella',
      titulo: 'Mi día, siempre claro',
      descripcion:
        'Marca con una estrella lo que toca hoy. Juntamos tus tareas marcadas, las asignadas con fecha y tus recordatorios, de todos tus workspaces.',
    },
    {
      icono: 'campana',
      titulo: 'Recordatorios que sí te avisan',
      descripcion:
        'Te llegan en el momento exacto, estés donde estés dentro de la app — no solo cuando tienes el tablero abierto.',
    },
    {
      icono: 'usuarios',
      titulo: 'Workspaces para tu equipo',
      descripcion:
        'Invita por correo con roles claros, e incluso da un rol distinto en un tablero puntual. Cada quien ve y hace lo que le corresponde.',
    },
    {
      icono: 'candado',
      titulo: 'Seguro desde el diseño',
      descripcion:
        'Contraseñas con argon2id, sesiones con rotación, y recuperación por códigos de un solo uso — no por correo.',
    },
    {
      icono: 'luna',
      titulo: 'Claro, oscuro o automático',
      descripcion:
        'Elige cómo se ve Taskeer, o deja que siga la configuración de tu dispositivo. Tus fechas, en tu zona horaria.',
    },
  ];

  // Contenido real de Backend/prisma/plans-seed-data.ts — Pro y Team todavía
  // no tienen precio definido (`priceMonthlyCents: null`) y ningún plan de
  // pago tiene checkout implementado, así que ningún botón promete algo que
  // hoy no existe: los 4 llevan a /crear-cuenta (empezar en Free), y subir
  // de plan queda para cuando exista el cobro (ver docs/08-planes-suscripciones.md).
  protected readonly planes: Plan[] = [
    {
      nombre: 'Free',
      precio: '$0/mes',
      descripcion: 'Para empezar a organizarte sin costo.',
      caracteristicas: ['Hasta 3 workspaces propios', 'Personalización básica', 'Uso personal completo'],
      textoBoton: 'Empezar gratis',
      inicio: true,
    },
    {
      nombre: 'Pro',
      precio: 'Precio por definir',
      descripcion: 'Para cuando necesitas más espacio y personalización.',
      caracteristicas: [
        'Hasta 10 workspaces propios',
        'Archivos y fotos habilitados',
        'Personalización avanzada',
      ],
      textoBoton: 'Empezar en Free',
    },
    {
      nombre: 'Team',
      precio: 'Precio por definir',
      descripcion: 'Pensado para equipos grandes.',
      caracteristicas: [
        'Workspaces compartidos ilimitados',
        'Archivos y fotos habilitados',
        'Personalización avanzada',
      ],
      textoBoton: 'Empezar en Free',
    },
    {
      nombre: 'Business',
      precio: 'Personalizado',
      descripcion: 'Precio y funciones negociadas por cliente.',
      caracteristicas: ['Todo lo de Team', 'Condiciones a la medida', 'Te escribimos tras registrarte'],
      textoBoton: 'Empezar',
    },
  ];
}
