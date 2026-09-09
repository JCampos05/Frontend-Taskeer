// Conversión UTC ↔ hora local usando UserPreferences.timezoneId (IANA name
// del catálogo Timezone) — nunca al revés. `Task.dueAt` siempre viaja en
// UTC hacia/desde el backend (ver CLAUDE.md, reglas no negociables); estas
// funciones son el único lugar donde se cruza esa frontera.
//
// Sin `ianaName` (usuario sin zona horaria configurada todavía) se usa la
// zona del sistema del navegador — mismo comportamiento que omitir la
// opción `timeZone` en Intl.

function obtenerOffsetMinutos(fechaUtc: Date, ianaName: string): number {
  const formateador = new Intl.DateTimeFormat('en-US', {
    timeZone: ianaName,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const partes = Object.fromEntries(formateador.formatToParts(fechaUtc).map((p) => [p.type, p.value]));
  const horaComoUtc = Date.UTC(
    Number(partes['year']),
    Number(partes['month']) - 1,
    Number(partes['day']),
    Number(partes['hour']) === 24 ? 0 : Number(partes['hour']),
    Number(partes['minute']),
    Number(partes['second']),
  );
  return (horaComoUtc - fechaUtc.getTime()) / 60_000;
}

/** Convierte el valor de un `<input type="datetime-local">` (hora de pared
 * en la zona `ianaName`) al ISO 8601 en UTC que espera la API. */
export function datetimeLocalAUtcIso(valorLocal: string, ianaName: string | null): string {
  const [fecha, hora] = valorLocal.split('T');
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const [hh, mm] = hora.split(':').map(Number);

  if (!ianaName) {
    return new Date(anio, mes - 1, dia, hh, mm).toISOString();
  }

  // Primera aproximación: tratar los valores tal cual como si fueran UTC,
  // calcular el offset real de la zona en ese instante, y corregir.
  const aproximado = Date.UTC(anio, mes - 1, dia, hh, mm);
  const offsetMin = obtenerOffsetMinutos(new Date(aproximado), ianaName);
  return new Date(aproximado - offsetMin * 60_000).toISOString();
}

/** Convierte un ISO 8601 en UTC al valor que espera un
 * `<input type="datetime-local">`, en la hora de pared de `ianaName`. */
export function utcIsoADatetimeLocalInput(iso: string, ianaName: string | null): string {
  const formateador = new Intl.DateTimeFormat('en-US', {
    timeZone: ianaName ?? undefined,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  const partes = Object.fromEntries(
    formateador.formatToParts(new Date(iso)).map((p) => [p.type, p.value]),
  );
  const hora = partes['hour'] === '24' ? '00' : partes['hour'];
  return `${partes['year']}-${partes['month']}-${partes['day']}T${hora}:${partes['minute']}`;
}

/** Formato legible en español para mostrar en tarjetas/detalle de tarea. */
export function formatearFechaLegible(iso: string, ianaName: string | null): string {
  return new Intl.DateTimeFormat('es', {
    timeZone: ianaName ?? undefined,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

/** Solo para el badge corto de la tarjeta de tarea (sin hora, sin año si es
 * el actual — mantiene la tarjeta compacta). */
export function formatearFechaCorta(iso: string, ianaName: string | null): string {
  return new Intl.DateTimeFormat('es', {
    timeZone: ianaName ?? undefined,
    day: 'numeric',
    month: 'short',
  }).format(new Date(iso));
}
