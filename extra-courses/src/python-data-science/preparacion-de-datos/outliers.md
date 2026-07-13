# Valores atípicos (outliers)

## Introducción

Un outlier, o valor atípico, es un dato que se aleja mucho del comportamiento general del resto de las observaciones. Puede ser un precio de producto capturado con un error de digitación, una transacción inusualmente grande, o simplemente un caso legítimo pero raro, como un cliente que compra diez veces más que el promedio.

Detectar outliers es importante porque muchos cálculos estadísticos, como la media o la desviación estándar, son sensibles a valores extremos. Un solo dato mal capturado puede distorsionar un promedio, inflar una correlación o hacer que un modelo de machine learning aprenda patrones equivocados. Por otro lado, no todo outlier es un error: a veces representa justamente el fenómeno más interesante de analizar, como una transacción fraudulenta o un producto con demanda excepcional.

En esta lección aprenderás dos métodos estándar para detectar outliers, cómo visualizarlos y, sobre todo, cómo decidir qué hacer con ellos según el contexto del problema, en vez de eliminarlos automáticamente.

## Conceptos clave

- **Outlier**: valor que se distancia notablemente del resto de las observaciones en una variable.
- **IQR (rango intercuartílico)**: diferencia entre el percentil 75 y el percentil 25 de una distribución, usada para definir límites de valores normales.
- **Z-score**: número de desviaciones estándar que un valor se aleja de la media.
- **Transformación**: técnica que reduce el impacto de valores extremos sin eliminarlos, como aplicar logaritmo.
- **Contexto del dato**: la razón de negocio detrás de un valor extremo, clave para decidir su tratamiento.

## Desarrollo

### Preparando datos con outliers a propósito

```python
import pandas as pd
import numpy as np

ventas = pd.DataFrame({
    "producto": ["camiseta", "pantalón", "zapatos", "camiseta", "chaqueta", "camiseta", "zapatos"],
    "precio": [25, 45, 60, 22, 80, 24, 2500]
})

print(ventas)
```

El precio de 2500 en la última fila es sospechosamente alto comparado con los demás; probablemente sea un error de captura (le sobra un cero) o un producto de lujo real. Vamos a detectarlo formalmente.

### Detección con IQR

El método del rango intercuartílico define como atípico cualquier valor fuera de un rango calculado con los cuartiles.

```python
q1 = ventas["precio"].quantile(0.25)
q3 = ventas["precio"].quantile(0.75)
iqr = q3 - q1

limite_inferior = q1 - 1.5 * iqr
limite_superior = q3 + 1.5 * iqr

outliers_iqr = ventas[
    (ventas["precio"] < limite_inferior) | (ventas["precio"] > limite_superior)
]
print(outliers_iqr)
```

El factor 1.5 es un estándar ampliamente usado, aunque puedes ajustarlo según qué tan estricto quieras ser.

### Detección con z-score

El z-score mide cuántas desviaciones estándar se aleja un valor de la media. Suele usarse un umbral de 3.

```python
media = ventas["precio"].mean()
desviacion = ventas["precio"].std()

ventas["z_score"] = (ventas["precio"] - media) / desviacion

outliers_zscore = ventas[ventas["z_score"].abs() > 3]
print(outliers_zscore[["producto", "precio", "z_score"]])
```

El z-score funciona bien cuando los datos siguen una distribución aproximadamente normal. Si la distribución está muy sesgada, el IQR suele ser más confiable.

### Visualizando outliers

Un boxplot (diagrama de caja) es la forma más rápida de ver outliers de un vistazo.

```python
import matplotlib.pyplot as plt

ventas["precio"].plot(kind="box")
plt.title("Distribución de precios")
plt.show()
```

En el boxplot, los puntos que aparecen fuera de los "bigotes" son justamente los outliers detectados por el método IQR.

### Decidiendo qué hacer con cada outlier

No existe una regla única. Depende de si el valor es un error o un caso real.

```python
# Caso 1: es un error de captura conocido -> corregir o eliminar
ventas_corregidas = ventas.copy()
ventas_corregidas.loc[ventas_corregidas["precio"] == 2500, "precio"] = 250

# Caso 2: es un valor real pero quieres reducir su impacto -> transformar
ventas["precio_log"] = np.log1p(ventas["precio"])
print(ventas[["producto", "precio", "precio_log"]])
```

Aplicar logaritmo (`log1p` evita problemas si hay ceros) comprime la escala de los valores grandes sin eliminarlos, lo cual es útil cuando el outlier es un dato legítimo que solo distorsiona por su magnitud.

## Errores comunes

- **Eliminar automáticamente todo outlier**: antes de borrar un dato, investiga su origen. Un outlier puede ser el caso más importante del análisis, como una compra fraudulenta.
- **Usar z-score en distribuciones muy sesgadas**: si los datos no son aproximadamente normales, el z-score puede fallar en detectar o exagerar outliers. El IQR es más robusto en esos casos.
- **Aplicar el mismo criterio a todas las columnas**: cada variable tiene su propia escala y comportamiento; el límite de outlier para "precio" no sirve para "cantidad vendida".

## Resumen

- Un outlier es un valor que se aleja notablemente del resto de la distribución.
- El método IQR usa los cuartiles y es robusto ante distribuciones sesgadas.
- El z-score mide desviaciones estándar respecto a la media y funciona mejor con datos normales.
- El boxplot es la visualización más directa para detectar outliers.
- La decisión de mantener, transformar o eliminar un outlier depende siempre del contexto del negocio.
