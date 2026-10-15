import { ActivatedRouteSnapshot, BaseRouteReuseStrategy } from '@angular/router';

/**
 * Por defecto Angular reutiliza el mismo componente cuando solo cambian los
 * parámetros de la ruta (ej. de /app/workspaces/A a /app/workspaces/B). Las
 * vistas de Taskeer (tableros, miembros, tablero) leen `workspaceId`/`boardId`
 * una sola vez al crearse, así que reutilizarlas dejaba en pantalla los datos
 * del workspace anterior aunque la URL (y el sidebar) ya hubieran cambiado.
 *
 * Esta estrategia solo permite reutilizar una ruta si no cambió ningún
 * parámetro de ruta — si cambió, el componente se destruye y se crea de
 * nuevo, cargando los datos del id nuevo. Los query params y el fragmento
 * no cuentan.
 */
export class ReusoDeRutasPorParametros extends BaseRouteReuseStrategy {
  override shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    if (!super.shouldReuseRoute(future, curr)) return false;

    const nuevos = future.params;
    const actuales = curr.params;
    const claves = new Set([...Object.keys(nuevos), ...Object.keys(actuales)]);
    for (const clave of claves) {
      if (nuevos[clave] !== actuales[clave]) return false;
    }
    return true;
  }
}
