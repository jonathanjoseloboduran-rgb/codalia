# Comunicar resultados

## Introducción

Un análisis brillante que nadie entiende no genera ningún impacto. La habilidad de comunicar resultados es tan importante como la de producirlos, y con frecuencia se le presta mucha menos atención. Quien recibe tu informe casi nunca tiene el mismo contexto técnico que tú, así que la forma en que presentas tus hallazgos determina si se convierten en una decisión o si se quedan olvidados en un archivo.

Comunicar bien no significa simplificar hasta perder precisión, sino traducir el trabajo técnico a un lenguaje que conecte con quien va a usar esa información: un gerente, un equipo de marketing o un cliente. Esto exige pensar primero en la audiencia y después en cómo estructurar el mensaje.

En esta lección vas a aprender a estructurar un informe de análisis, pasar del notebook a un reporte legible, elegir visualizaciones que realmente comuniquen y hablar en términos de negocio en lugar de jerga técnica.

## Conceptos clave

- **Informe de análisis**: documento que resume el proceso y los resultados de un análisis para una audiencia no técnica.
- **Hallazgo accionable**: una conclusión que sugiere una decisión concreta, no solo un dato curioso.
- **Visualización clave**: el gráfico mínimo necesario para transmitir un hallazgo, sin ruido adicional.
- **Jerga técnica**: vocabulario propio del análisis de datos (p-valor, outlier, dataframe) que suele confundir a audiencias no técnicas.

## Desarrollo

### Estructura de un informe de análisis

Un informe efectivo sigue un orden lógico: contexto, método, hallazgos y recomendaciones. El contexto explica por qué se hizo el análisis. El método resume, en pocas frases, qué datos se usaron y cómo se procesaron, sin entrar en detalles de código. Los hallazgos presentan lo que se descubrió, ordenado del más importante al menos importante. Las recomendaciones traducen esos hallazgos en próximos pasos.

Esta estructura funciona porque respeta cómo lee la mayoría de las personas: quieren saber primero el porqué, después el qué se encontró y finalmente qué hacer al respecto. El método casi nunca necesita más de un párrafo.

### Del notebook al reporte

Un notebook está lleno de exploración: celdas de prueba, gráficos descartados, código de limpieza. Ese proceso es valioso para ti, pero no debe llegar completo a un informe. La regla práctica es dejar en el reporte solo lo que sostiene un hallazgo, y mover el resto a un apéndice o eliminarlo. Antes de compartir, pregúntate si alguien que solo lee los títulos y mira los gráficos entiende el mensaje completo; si la respuesta es no, el reporte todavía depende demasiado del código que lo generó.

### Elegir visualizaciones clave

No se trata de incluir todos los gráficos posibles, sino los que responden directamente a la pregunta del análisis. Un gráfico de barras que compara ingresos por región comunica más rápido que una tabla con veinte filas. Una línea de tiempo muestra tendencia mejor que una lista de números.

Cada visualización debe tener un título que exprese la conclusión, no solo el nombre de las variables. Por ejemplo, es más útil un título como "Las ventas de diciembre duplican el promedio anual" que uno genérico como "Ventas por mes". El título hace el trabajo de guiar la lectura antes de que la persona interprete el gráfico por su cuenta.

### Hablar al negocio, no en jerga técnica

Términos como "outlier", "p-valor" o "correlación de Pearson" tienen significado preciso para quien trabaja con datos, pero generan confusión en una audiencia de negocio. La solución no es evitar el rigor, sino traducirlo: en vez de "detectamos un outlier en la columna gasto", se puede decir "un cliente gastó diez veces más que el resto, lo que puede distorsionar el promedio". La misma idea aplica a hallazgos generales: en vez de "la variable X tiene una correlación de 0.82 con Y", una versión más clara es "cuando aumenta X, Y casi siempre aumenta también, de forma consistente". Se mantiene la honestidad del hallazgo sin exigir que la audiencia conozca estadística.

### Recomendaciones accionables

Un hallazgo sin una recomendación clara deja a la audiencia preguntándose qué hacer con la información. Si el análisis muestra que los clientes de categoría "bajo gasto" tienen más probabilidad de dejar de comprar, la recomendación debería apuntar a una acción concreta, como diseñar una campaña de retención dirigida a ese grupo, y no quedarse solo en la observación del patrón.

## Errores comunes

Un error frecuente es entregar el notebook completo como si fuera el informe final, obligando a la audiencia a navegar código y celdas de prueba que no les interesan. El informe debe ser un documento aparte, editado para lectura.

Otro error típico es saturar el reporte con demasiados gráficos, lo que diluye el mensaje principal en lugar de reforzarlo. Es mejor elegir dos o tres visualizaciones potentes que veinte mediocres.

También es común mezclar hallazgos con opiniones personales sin aclararlo, lo que puede confundir a quien lee el informe sobre qué está respaldado por los datos y qué es una interpretación adicional.

## Resumen

- Un informe efectivo sigue el orden: contexto, método, hallazgos, recomendaciones.
- El notebook es para explorar; el reporte es para comunicar, y deben mantenerse separados.
- Las visualizaciones clave llevan títulos que expresan la conclusión, no solo las variables.
- Traducir la jerga técnica a lenguaje de negocio hace que los hallazgos se entiendan y se usen.
- Toda recomendación debe apuntar a una acción concreta, no quedarse en la observación.
