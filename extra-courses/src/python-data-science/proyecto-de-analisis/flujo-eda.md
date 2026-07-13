# Análisis exploratorio (EDA)

## Introducción

Antes de construir un modelo o escribir un informe, todo análisis serio empieza con una pregunta clara y una mirada honesta a los datos. El análisis exploratorio de datos, conocido como EDA, es el proceso mediante el cual conoces tu dataset: qué contiene, qué le falta, dónde hay errores y qué patrones se insinúan antes de sacar conclusiones apresuradas.

Saltarse el EDA es una de las causas más comunes de análisis fallidos. Puedes entrenar un modelo perfecto sobre datos sucios y obtener resultados inútiles, o puedes presentar una conclusión de negocio basada en una columna mal interpretada. El EDA no es un paso opcional ni decorativo: es la base sobre la que se sostiene todo lo demás.

En esta lección vas a aprender el flujo completo de un EDA, desde la pregunta inicial hasta los hallazgos, con un ejemplo guiado de principio a fin usando ventas de una tienda.

## Conceptos clave

- **EDA (análisis exploratorio de datos)**: proceso sistemático para entender un dataset antes de modelarlo o reportarlo.
- **Análisis univariado**: estudio de una sola variable a la vez (su distribución, valores típicos, valores extremos).
- **Análisis bivariado**: estudio de la relación entre dos variables (por ejemplo, precio y cantidad vendida).
- **Valores atípicos (outliers)**: datos que se alejan mucho del resto y pueden ser errores o casos reales excepcionales.
- **Hallazgo**: una observación concreta y respaldada por datos, distinta de una opinión o una suposición.

## Desarrollo

### El flujo completo

Un EDA ordenado sigue estos pasos: definir preguntas, cargar los datos, limpiarlos, explorar cada variable por separado (univariado), explorar relaciones entre variables (bivariado) y, finalmente, redactar los hallazgos. Saltar pasos suele llevar a conclusiones equivocadas.

```python
import pandas as pd

# Paso 1: definimos la pregunta antes de tocar los datos
# ¿Qué productos generan más ingresos y hay diferencias por región?

# Paso 2: cargamos los datos (aquí los creamos inline para el ejemplo)
ventas = pd.DataFrame({
    "producto": ["Café", "Té", "Café", "Jugo", "Té", "Café", "Jugo", None],
    "region": ["Norte", "Sur", "Norte", "Sur", "Norte", "Sur", "Norte", "Sur"],
    "precio": [3.5, 2.8, 3.5, 4.0, 2.8, 3.5, 4.0, 4.0],
    "cantidad": [120, 95, 110, 60, 88, 130, 55, 40],
})
print(ventas.shape)
```

### Limpieza básica

Antes de explorar, revisa duplicados, valores nulos y tipos de datos. Una columna numérica guardada como texto puede arruinar cualquier cálculo posterior.

```python
print(ventas.isna().sum())

# Eliminamos filas sin producto, ya que no aportan al análisis
ventas_limpias = ventas.dropna(subset=["producto"]).copy()

# Verificamos tipos
print(ventas_limpias.dtypes)
```

### Análisis univariado

Aquí observas cada variable de forma aislada: su distribución, sus valores más frecuentes y si hay algo raro.

```python
print(ventas_limpias["producto"].value_counts())
print(ventas_limpias["precio"].describe())
```

El `describe()` te da mínimo, máximo, promedio y percentiles en una sola línea. Es el primer lugar donde suelen aparecer outliers, como un precio negativo o una cantidad absurdamente alta.

### Análisis bivariado

Ahora cruzas variables para encontrar relaciones. Por ejemplo, ¿varían las ventas por región?

```python
ventas_limpias["ingreso"] = ventas_limpias["precio"] * ventas_limpias["cantidad"]

resumen_region = ventas_limpias.groupby("region")["ingreso"].sum()
print(resumen_region)

resumen_producto = ventas_limpias.groupby("producto")["ingreso"].sum().sort_values(ascending=False)
print(resumen_producto)
```

Este cruce revela, por ejemplo, si el café domina los ingresos en ambas regiones o si hay una diferencia clara entre Norte y Sur, algo que no se veía mirando cada variable por separado.

### Checklist práctico

Un buen hábito es repasar mentalmente esta lista antes de cerrar el EDA: ¿definiste la pregunta?, ¿revisaste nulos y duplicados?, ¿validaste los tipos de datos?, ¿miraste cada variable por separado?, ¿cruzaste al menos dos variables relevantes?, ¿escribiste los hallazgos en frases claras?

```python
hallazgos = []
if resumen_producto.iloc[0] > resumen_producto.iloc[1] * 1.5:
    hallazgos.append("El producto líder genera notablemente más ingresos que el segundo.")

print(hallazgos)
```

## Errores comunes

Un error frecuente es saltar directo al modelado sin mirar los datos, lo que lleva a construir sobre nulos o tipos incorrectos sin darse cuenta. Siempre revisa `isna()` y `dtypes` antes de avanzar.

Otro error típico es confundir correlación con relación causal: que dos variables se muevan juntas no significa que una provoque la otra. Un hallazgo bien redactado describe el patrón observado, no una causa que no se probó.

También es común quedarse solo con el análisis univariado y nunca cruzar variables, perdiendo así los patrones más interesantes, que casi siempre aparecen en las relaciones entre columnas.

## Resumen

- El EDA sigue un flujo: preguntas, carga, limpieza, univariado, bivariado, hallazgos.
- La limpieza (nulos, duplicados, tipos) es un paso obligatorio, no opcional.
- El análisis univariado describe cada variable; el bivariado revela relaciones entre ellas.
- Un checklist simple evita saltarse pasos importantes.
- Los hallazgos deben redactarse como observaciones concretas respaldadas por los datos.
