import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageTitleComponent } from '../../shared/components/page-title/page-title';
import { UiCardComponent } from '../../shared/components/ui-card/ui-card';

interface FaqItem {
  id: number;
  question: string;
  paragraphs?: string[];
  bullets?: string[];
}

@Component({
  selector: 'app-faq',
  imports: [RouterLink, PageTitleComponent, UiCardComponent],
  templateUrl: './faq.html',
  styleUrl: './faq.css',
})
export class FaqComponent {
  readonly title = 'Sección FAQ — E-Factzy Perú';
  readonly subtitle = 'Preguntas frecuentes';

  readonly faqItems: FaqItem[] = [
    {
      id: 1,
      question: '¿Qué es E-Factzy Perú?',
      paragraphs: [
        'E-Factzy Perú es un sistema de facturación electrónica diseñado para registrar ventas, emitir comprobantes electrónicos y gestionar información relacionada con clientes, productos, series, correlativos, envíos a SUNAT/OSE, reportes y auditoría del sistema.',
      ],
    },
    {
      id: 2,
      question: '¿Qué comprobantes puedo emitir desde el sistema?',
      paragraphs: ['Desde el sistema se podrá emitir:', 'Además, el sistema permitirá generar los archivos necesarios como PDF, XML y CDR, según el flujo de emisión configurado.'],
      bullets: ['Factura electrónica.', 'Boleta electrónica.', 'Nota de crédito electrónica.', 'Nota de débito electrónica.'],
    },
    {
      id: 3,
      question: '¿Qué necesito configurar antes de emitir comprobantes?',
      paragraphs: ['Antes de emitir comprobantes electrónicos, debes tener configurados como mínimo:'],
      bullets: [
        'Empresa emisora.',
        'RUC y razón social.',
        'Dirección fiscal.',
        'Series y correlativos.',
        'Clientes.',
        'Productos o servicios.',
        'Certificado digital.',
        'Credenciales de emisión.',
        'Ambiente de emisión: Beta o Producción.',
        'Proveedor de emisión: SUNAT u OSE.',
      ],
    },
    {
      id: 4,
      question: '¿Qué significa que la empresa esté “lista para emitir”?',
      paragraphs: [
        'Significa que la empresa cuenta con la configuración mínima necesaria para emitir comprobantes electrónicos. El sistema validará si tiene datos tributarios completos, certificado digital, credenciales de emisión, proveedor configurado y estado activo.',
      ],
    },
    {
      id: 5,
      question: '¿Qué pasa si la empresa no está lista para emitir?',
      paragraphs: [
        'El sistema mostrará una lista de pendientes, por ejemplo:',
        'Mientras existan pendientes críticos, el sistema podrá bloquear la emisión de comprobantes.',
      ],
      bullets: [
        'Falta cargar el certificado digital.',
        'Faltan credenciales de emisión.',
        'Falta configurar el proveedor SUNAT/OSE.',
        'La empresa está inactiva.',
        'Falta completar datos tributarios obligatorios.',
      ],
    },
    {
      id: 6,
      question: '¿Puedo trabajar en modo pruebas antes de emitir en producción?',
      paragraphs: ['Sí. El sistema permite configurar el ambiente de emisión como:', 'Se recomienda validar primero el flujo en ambiente Beta antes de pasar a Producción.'],
      bullets: ['Beta: para pruebas.', 'Producción: para emisión real.'],
    },
    {
      id: 7,
      question: '¿Qué diferencia hay entre SUNAT y OSE?',
      paragraphs: [
        'SUNAT permite el envío directo de comprobantes al servicio de emisión correspondiente.',
        'OSE corresponde a un Operador de Servicios Electrónicos autorizado, que valida y comunica los comprobantes según la configuración del contribuyente.',
        'El sistema permite configurar cualquiera de los dos proveedores según la necesidad de la empresa.',
      ],
    },
    {
      id: 8,
      question: '¿Qué es el certificado digital?',
      paragraphs: [
        'Es un archivo utilizado para firmar electrónicamente los comprobantes. Normalmente tiene formato .pfx o .p12 y requiere una clave de acceso.',
        'El sistema lo usa para firmar los XML antes de enviarlos a SUNAT u OSE.',
      ],
    },
    {
      id: 9,
      question: '¿El sistema guarda mi clave SOL o clave del certificado?',
      paragraphs: ['Sí, pero deben almacenarse de forma segura y cifrada. Por seguridad:'],
      bullets: [
        'No se mostrarán en pantalla.',
        'No se enviarán en respuestas del sistema.',
        'No deben aparecer en reportes.',
        'No deben registrarse en logs visibles.',
      ],
    },
    {
      id: 10,
      question: '¿Puedo registrar clientes con DNI y RUC?',
      paragraphs: ['Sí. El sistema permite registrar clientes con distintos tipos de documento, como:', 'Para emitir una factura electrónica, el cliente debe contar con RUC.'],
      bullets: ['DNI.', 'RUC.', 'Carnet de extranjería.', 'Pasaporte.', 'Consumidor final.'],
    },
    {
      id: 11,
      question: '¿Puedo registrar productos y servicios?',
      paragraphs: ['Sí. El sistema permite registrar tanto productos como servicios, indicando datos como:'],
      bullets: ['Código interno.', 'Nombre.', 'Descripción.', 'Unidad de medida.', 'Precio unitario.', 'Afectación IGV.', 'Estado.'],
    },
    {
      id: 12,
      question: '¿Qué es la afectación IGV?',
      paragraphs: ['Es la condición tributaria aplicada al producto o servicio. Los valores básicos son:', 'Esta información se utiliza para calcular correctamente el subtotal, IGV y total del comprobante.'],
      bullets: ['Gravado.', 'Exonerado.', 'Inafecto.'],
    },
    {
      id: 13,
      question: '¿Qué son las series y correlativos?',
      paragraphs: ['Las series y correlativos permiten numerar los comprobantes emitidos. Por ejemplo:', 'El sistema controla que no se repitan los números.'],
      bullets: [
        'Factura: F001-00000001',
        'Boleta: B001-00000001',
        'Nota de crédito: FC01-00000001',
        'Nota de débito: FD01-00000001',
      ],
    },
    {
      id: 14,
      question: '¿Puedo registrar una venta sin emitir inmediatamente el comprobante?',
      paragraphs: [
        'Sí. El sistema puede permitir registrar una venta como borrador o pendiente, y luego emitir el comprobante desde el módulo correspondiente.',
        'También puede configurarse la opción para emitir el comprobante inmediatamente al registrar la venta.',
      ],
    },
    {
      id: 15,
      question: '¿Qué ocurre cuando emito un comprobante?',
      paragraphs: ['El flujo general es:'],
      bullets: [
        'Se registra la venta.',
        'Se genera el comprobante.',
        'Se genera el XML.',
        'Se firma digitalmente.',
        'Se envía a SUNAT u OSE.',
        'Se recibe una respuesta.',
        'Se almacena el CDR.',
        'Se genera el PDF.',
        'Se puede enviar el comprobante por correo al cliente.',
      ],
    },
    {
      id: 16,
      question: '¿Qué significan los estados de un comprobante?',
      paragraphs: ['Los estados principales pueden ser:'],
      bullets: [
        'Registrado: comprobante creado en el sistema.',
        'Pendiente: aún no enviado o esperando respuesta.',
        'Enviado: enviado a SUNAT/OSE.',
        'Aceptado: validado correctamente.',
        'Rechazado: no fue aceptado por errores.',
        'Observado: aceptado con observaciones o advertencias.',
        'Anulado: comprobante invalidado según el flujo correspondiente.',
      ],
    },
    {
      id: 17,
      question: '¿Qué hago si un comprobante fue rechazado?',
      paragraphs: [
        'Debes revisar el mensaje de error retornado por SUNAT u OSE. El sistema mostrará el motivo del rechazo para que puedas corregir la información y volver a emitir o generar la nota correspondiente, según el caso.',
      ],
    },
    {
      id: 18,
      question: '¿Puedo descargar el PDF, XML y CDR?',
      paragraphs: ['Sí. Desde el módulo de comprobantes podrás descargar:', 'Estos archivos son importantes para respaldo, consulta y trazabilidad.'],
      bullets: ['PDF.', 'XML.', 'CDR.'],
    },
    {
      id: 19,
      question: '¿Puedo enviar el comprobante por correo al cliente?',
      paragraphs: [
        'Sí. El sistema puede enviar el comprobante al correo registrado del cliente, adjuntando el PDF y XML, según la configuración del módulo de correo.',
      ],
    },
    {
      id: 20,
      question: '¿Qué son las notas de crédito y débito?',
      paragraphs: [
        'Las notas de crédito y débito son documentos electrónicos relacionados con un comprobante emitido.',
        'La nota de crédito se usa, por ejemplo, para anulación, devolución, descuento o corrección.',
        'La nota de débito se usa para aumentar el valor de una operación, aplicar intereses, penalidades u otros cargos.',
      ],
    },
    {
      id: 21,
      question: '¿Qué reportes puedo consultar?',
      paragraphs: ['El sistema contempla reportes como:'],
      bullets: [
        'Reporte de ventas.',
        'Reporte por cliente.',
        'Reporte por comprobante.',
        'Reporte por estado SUNAT/OSE.',
        'Reporte tributario básico.',
        'Exportación a Excel o PDF.',
      ],
    },
    {
      id: 22,
      question: '¿Qué información registra la auditoría?',
      paragraphs: ['La auditoría registra operaciones importantes del sistema, como:', 'Esto permite mantener trazabilidad y control interno.'],
      bullets: [
        'Creación de usuarios.',
        'Cambios en empresa emisora.',
        'Emisión de comprobantes.',
        'Cambios de estado.',
        'Carga de certificados.',
        'Configuración de credenciales.',
        'Generación de notas.',
        'Acciones críticas realizadas por usuarios.',
      ],
    },
    {
      id: 23,
      question: '¿Puedo crear diferentes usuarios?',
      paragraphs: ['Sí. El sistema permite gestionar usuarios y roles. Los roles básicos son:', 'Cada rol puede tener permisos diferentes según las funciones del sistema.'],
      bullets: ['Administrador.', 'Vendedor.', 'Consulta.', 'Soporte.'],
    },
    {
      id: 24,
      question: '¿Qué pasa si desactivo un usuario?',
      paragraphs: [
        'Un usuario inactivo no podrá iniciar sesión ni realizar operaciones dentro del sistema. Sin embargo, sus registros históricos se mantienen para auditoría.',
      ],
    },
    {
      id: 25,
      question: '¿Puedo usar el sistema para varias empresas?',
      paragraphs: [
        'En la versión inicial se recomienda trabajar con una sola empresa emisora para simplificar el sistema. La opción multiempresa puede implementarse en una versión posterior.',
      ],
    },
  ];
}
