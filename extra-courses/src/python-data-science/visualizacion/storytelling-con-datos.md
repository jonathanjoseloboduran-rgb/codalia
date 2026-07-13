# Storytelling con datos

## Introducción

Saber generar un gráfico técnicamente correcto no es lo mismo que saber comunicar un hallazgo. Puedes tener el histograma perfecto y aun así perder a tu audiencia si el gráfico no responde a la pregunta que les importa. El storytelling con datos es la disciplina de presentar un análisis de forma que cualquier persona, técnica o no, entienda la conclusión en segundos.

Esta lección es distinta de las anteriores: el foco no está en el código, sino en las decisiones de comunicación que conviertes en gráficos. Vas a aprender principios para simplificar, resaltar lo importante con color, escribir títulos que cuenten la conclusión, y adaptar tus gráficos para audiencias sin formación técnica.

Estas habilidades separan un análisis archivado en una carpeta de uno que realmente influye en una decisión. Tu trabajo no termina al obtener el resultado correcto; termina cuando logras que otra persona lo entienda y actúe con base en él.

## Conceptos clave

- **Menos es más**: cada elemento visual que no ayude a entender el mensaje central debe eliminarse.
- **Jerarquía visual**: usar tamaño, color y posición para guiar la mirada hacia lo más importante primero.
- **Título con conclusión**: un título que afirma el hallazgo en lugar de solo describir los ejes.
- **Color con propósito**: usar color para resaltar un dato relevante, no para decorar el gráfico.
- **Audiencia no técnica**: personas que entienden el negocio pero no necesariamente estadística ni jerga de análisis.

## Desarrollo

### Simplificar: menos es más

Un gráfico saturado de líneas de cuadrícula, bordes, colores y etiquetas compite consigo mismo por la atención de quien lo mira. Antes de agregar un elemento visual, pregúntate si realmente ayuda a transmitir el mensaje o si es solo ruido.

Piensa en un gráfico de ventas mensuales. Si tu objetivo es mostrar que crecieron en el segundo semestre, no necesitas doce colores distintos, ni cuadrícula completa, ni etiquetas en cada punto. Necesitas una línea clara, un rango de eje razonable y quizás una anotación donde comenzó el crecimiento.

Cada elemento adicional —una tercera dimensión de color, una leyenda con ocho categorías, textos superpuestos— le pide a tu audiencia un esfuerzo mental extra. Ese esfuerzo es presupuesto limitado: si lo gastas en decodificar el gráfico, no queda para pensar en la conclusión.

### Resaltar lo importante con color

El color es la herramienta más poderosa para dirigir la atención, y también la más fácil de usar mal. Si todas las barras tienen el mismo color, ninguna destaca. Si cada barra tiene un color distinto sin razón, la audiencia busca significado en la paleta y se distrae del dato real.

La técnica más efectiva suele ser usar un color neutro (gris o azul apagado) para la mayoría de los elementos, y reservar un color vivo (naranja, rojo) solo para el dato que quieres que la audiencia note. Si el punto central es que la región Sur tuvo una caída, pinta las demás barras en gris y solo la de Sur en rojo. La mirada va directo ahí, sin explicación adicional.

Este principio aplica igual en líneas, mapas de calor o dispersión: el color no describe categorías por costumbre, señala lo que importa para el mensaje específico que estás dando.

### Títulos que cuentan la conclusión

Un título como "Ventas por mes" describe el contenido, pero no dice qué deberías concluir. Compáralo con "Las ventas crecieron 40% en el segundo semestre": ese segundo título ya te dio la conclusión antes de mirar una sola barra.

Esto no significa manipular los datos ni exagerar. Significa que, si ya hiciste el trabajo de analizar e interpretar, no deberías obligar a tu audiencia a repetirlo desde cero. Un buen título funciona como resumen ejecutivo de una sola línea: si alguien solo lo lee, ya debería llevarse el mensaje correcto.

### Preparar gráficos para una audiencia no técnica

Cuando presentas a un equipo de negocio o dirección, no necesitan ver un coeficiente de correlación de 0.73 ni un p-valor. Necesitan saber qué significa eso en su trabajo diario: "los clientes que reciben el correo de bienvenida compran un 20% más en el primer mes".

Evita jerga técnica en las etiquetas; usa unidades familiares como dólares o porcentajes en lugar de escalas normalizadas. Reduce los decimales a los que realmente importan: "42%" comunica mejor que "42.37%" en contextos de negocio. Y acompaña el gráfico con una frase corta que explique la implicación práctica.

Por último, prueba tu gráfico con alguien ajeno al análisis. Si necesita más de diez segundos para identificar el mensaje principal, el gráfico necesita simplificarse más.

## Errores comunes

- **Mostrar todos los datos disponibles "por si acaso"**: agregar cada variable disponible, en lugar de solo las que sostienen el mensaje, diluye la conclusión y confunde a la audiencia.
- **Usar la misma paleta para todo**: cuando todos los elementos tienen el mismo peso visual, nadie sabe dónde mirar primero. Reserva el color con más contraste para lo importante.
- **Escribir títulos descriptivos en lugar de conclusivos**: titular con solo el nombre de las variables ("Edad vs. Ingreso") obliga a la audiencia a interpretar el hallazgo por su cuenta, cuando ese trabajo ya lo hiciste tú.

## Resumen

- Elimina todo elemento visual que no ayude directamente al mensaje central.
- Usa el color para señalar lo importante, no para decorar o diferenciar todo por igual.
- Escribe títulos que afirmen la conclusión, no solo que describan los ejes.
- Adapta lenguaje, unidades y nivel de detalle según si tu audiencia es técnica o de negocio.
