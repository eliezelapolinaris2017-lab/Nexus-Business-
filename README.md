# Nexus Business PR v50 — Customer Success Center

Base oficial: v48D Dashboard Cotizaciones KPI Fix.

## Incluye
- Auth Email/Password con datos privados por usuario en Firestore.
- Clientes, Servicios, Cotizaciones Pro, Facturación, Cobros y Flujo de Caja.
- Dashboard con KPIs de cotizaciones.
- Nuevo módulo Seguimiento para mantenimientos, cotizaciones e instalaciones.
- Mantenimiento preventivo estándar cada 6 meses.
- Botón WhatsApp para seguimiento al cliente.
- Firestore Rules con colección `followups`.

## Flujo recomendado
Cliente → Cotización → Factura/Servicio → Cobro → Seguimiento → Próximo mantenimiento 6 meses.

## Publicación
Subir todos los archivos a GitHub Pages y publicar `firestore.rules` en Firebase.
