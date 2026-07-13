# Fechas y series temporales

## Introducción

Casi todo dataset de negocio tiene una dimensión de tiempo: fecha de compra, fecha de registro, fecha de envío. Trabajar bien con fechas te permite responder preguntas como "¿cuáles fueron las ventas del último trimestre?" o "¿cómo varían los pedidos semana a semana?". Pandas tiene un tipo de dato especializado para fechas que hace estas tareas mucho más simples que manejar texto.

En esta lección aprenderás a convertir texto en fechas reales con `to_datetime`, a extraer partes de una fecha como el mes o el día de la semana, a filtrar datos por rangos de tiempo, y a usar `resample` para agrupar información por periodos como semanas o meses. Cerrarás con un ejemplo de ventas a lo largo del tiempo, uno de los análisis más comunes en cualquier negocio.

Estas herramientas son esenciales porque casi cualquier reporte gerencial pregunta "cómo evolucionó algo en el tiempo", y responder eso sin dominar fechas en pandas resulta mucho más lento y propenso a errores.

## Conceptos clave

- **`to_datetime`**: función que convierte texto o números en un tipo de fecha que pandas entiende y puede operar.
- **Componentes de fecha**: partes individuales de una fecha, como año, mes, día o día de la semana, accesibles mediante el atributo `.dt`.
- **Filtrado por rango de tiempo**: seleccionar filas cuya fecha cae dentro de un periodo específico.
- **`resample`**: método que agrupa datos de una serie temporal por intervalos regulares, como semanas o meses, de forma similar a `groupby` pero pensado para fechas.
- **Índice de tiempo**: un DataFrame cuyo índice es de tipo fecha, lo que habilita operaciones como `resample` directamente.

## Desarrollo

### Convertir texto en fechas con `to_datetime`

Cuando los datos vienen de un archivo o de una API, las fechas suelen llegar como texto. `to_datetime` las convierte a un tipo que pandas puede procesar de verdad.

```python
import pandas as pd

ventas = pd.DataFrame({
    "fecha": ["2026-01-05", "2026-01-12", "2026-02-01", "2026-02-15", "2026-03-03"],
    "monto": [150.0, 200.0, 320.0, 180.0, 275.0]
})

ventas["fecha"] = pd.to_datetime(ventas["fecha"])
print(ventas.dtypes)
```

Una vez convertida, la columna `fecha` permite comparaciones, ordenamientos y cálculos que no funcionarían con texto plano.

### Extraer componentes de una fecha

El atributo `.dt` da acceso a partes individuales de la fecha, como el año, el mes o el nombre del día.

```python
ventas["anio"] = ventas["fecha"].dt.year
ventas["mes"] = ventas["fecha"].dt.month
ventas["dia_semana"] = ventas["fecha"].dt.day_name()
print(ventas)
```

Esto es útil para agrupar después por mes, o para analizar si las ventas se concentran en ciertos días de la semana.

### Filtrar por rangos de tiempo

Puedes comparar directamente la columna de fecha con valores de fecha para obtener un subconjunto de filas.

```python
inicio = "2026-01-01"
fin = "2026-02-28"

ventas_ene_feb = ventas[(ventas["fecha"] >= inicio) & (ventas["fecha"] <= fin)]
print(ventas_ene_feb)
```

Pandas convierte automáticamente las cadenas `inicio` y `fin` para compararlas con la columna de tipo fecha, así que no necesitas convertirlas manualmente.

### Agrupar en el tiempo con `resample`

`resample` agrupa una serie temporal por intervalos regulares. Para usarlo, primero necesitas que la fecha sea el índice del DataFrame.

```python
ventas_indexadas = ventas.set_index("fecha")

ventas_mensuales = ventas_indexadas["monto"].resample("ME").sum()
print(ventas_mensuales)
```

Aquí `"ME"` significa fin de mes (month end). El resultado es una fila por mes con la suma de montos correspondiente, incluso si algún mes no tuvo ventas registradas.

```python
ventas_semanales = ventas_indexadas["monto"].resample("W").sum()
print(ventas_semanales)
```

Cambiar `"ME"` por `"W"` agrupa por semana en vez de por mes. Este pequeño cambio te permite mirar el mismo dato con distintos niveles de detalle.

### Ejemplo completo: ventas en el tiempo

Uniendo lo anterior, puedes construir un resumen mensual con promedio y total en pocas líneas.

```python
resumen_mensual = (
    ventas_indexadas["monto"]
    .resample("ME")
    .agg(["sum", "mean", "count"])
    .rename(columns={"sum": "total", "mean": "promedio", "count": "cantidad_ventas"})
)
print(resumen_mensual)
```

Este tipo de resumen es exactamente lo que se pide en un reporte mensual de ventas: cuánto se vendió, cuál fue el ticket promedio, y cuántas transacciones hubo.

## Errores comunes

- **Olvidar convertir la columna a fecha antes de operar**: si la columna sigue siendo texto, comparaciones como `fecha >= "2026-01-01"` funcionan por orden alfabético y no por fecha real, lo que puede dar resultados incorrectos en casos poco comunes de formato.
- **Usar `resample` sin un índice de tipo fecha**: `resample` necesita que el índice del DataFrame sea de tipo fecha. Si lo aplicas sobre una columna común, pandas lanza un error.
- **Confundir el código de frecuencia**: usar `"M"` en vez de `"ME"`, o `"D"` cuando se necesita `"W"`, produce agrupaciones distintas a las esperadas. Vale la pena verificar el resultado con `print` antes de seguir con el análisis.

## Resumen

- `to_datetime` convierte texto en fechas reales que pandas puede procesar.
- El atributo `.dt` da acceso a año, mes, día de la semana y más.
- Puedes filtrar filas comparando la columna de fecha con un rango.
- `resample` agrupa datos por periodos regulares, pero requiere un índice de tipo fecha.
- Combinar `resample` con `agg` genera resúmenes temporales completos en pocas líneas.
