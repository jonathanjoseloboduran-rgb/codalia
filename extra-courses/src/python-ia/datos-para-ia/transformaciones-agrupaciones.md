# Transformaciones y agrupaciones

## Introducción

Una vez que tus datos están limpios, el siguiente paso es transformarlos para extraer información útil. Rara vez el dataset original tiene exactamente las columnas que necesitas: quizás debas calcular una nueva a partir de otras, o resumir cientos de filas en unas pocas cifras agregadas por categoría.

Pandas resuelve esto con dos herramientas centrales: funciones para aplicar transformaciones fila por fila o valor por valor, y `groupby`, que permite agrupar datos y calcular estadísticas por grupo, como el promedio de ventas por región o el total de pedidos por cliente. Estas operaciones son el puente entre datos crudos y las variables que finalmente alimentan un modelo de IA.

En esta lección aprenderás a usar `apply` y `map`, a crear columnas derivadas, a agrupar datos con `groupby` y a ordenar resultados. Cerraremos combinando todo en un mini análisis, tal como lo harías en un proyecto real.

## Conceptos clave

- **apply()**: aplica una función a cada fila o columna de un DataFrame, o a cada valor de una Serie.
- **map()**: aplica una función o un diccionario de reemplazo a cada valor de una Serie.
- **Columna derivada**: una columna nueva calculada a partir de otras ya existentes.
- **groupby()**: agrupa filas según el valor de una o más columnas para calcular agregaciones.
- **sort_values()**: ordena un DataFrame según los valores de una columna.

## Desarrollo

### Creando una columna derivada

```python
import pandas as pd

ventas = pd.DataFrame({
    "producto": ["laptop", "mouse", "teclado", "monitor", "mouse"],
    "precio_unitario": [3200, 45, 90, 850, 45],
    "cantidad": [2, 10, 5, 3, 7]
})

ventas["total"] = ventas["precio_unitario"] * ventas["cantidad"]
print(ventas)
```

`total` es una columna derivada: no vino en los datos originales, sino que se calculó combinando dos columnas existentes. Este patrón es muy común al preparar variables para un modelo.

### Usando map para reemplazar valores

`map()` funciona muy bien cuando quieres traducir categorías usando un diccionario.

```python
categorias = {"laptop": "computo", "mouse": "accesorios", "teclado": "accesorios", "monitor": "computo"}
ventas["categoria"] = ventas["producto"].map(categorias)
print(ventas)
```

Cada valor de `producto` se reemplaza por su categoría correspondiente, según el diccionario. Si un producto no aparece en el diccionario, `map()` devuelve `NaN` para esa fila.

### Usando apply para lógica más compleja

Cuando el reemplazo necesita una función en lugar de un simple diccionario, usa `apply`.

```python
def clasificar_venta(total):
    if total >= 1000:
        return "alta"
    elif total >= 300:
        return "media"
    else:
        return "baja"

ventas["nivel_venta"] = ventas["total"].apply(clasificar_venta)
print(ventas)
```

`apply` pasa cada valor de la columna `total` a la función `clasificar_venta`, y guarda el resultado en la nueva columna `nivel_venta`. También puedes usar `apply` sobre filas completas pasando `axis=1`.

### Agrupando datos con groupby

```python
resumen_categoria = ventas.groupby("categoria")["total"].sum()
print(resumen_categoria)
```

`groupby("categoria")` agrupa las filas según la categoría, y `["total"].sum()` suma el total de ventas dentro de cada grupo. El resultado es una Serie con una fila por categoría.

Puedes calcular varias agregaciones a la vez con `agg`:

```python
resumen_completo = ventas.groupby("categoria").agg(
    total_vendido=("total", "sum"),
    ventas_promedio=("total", "mean"),
    productos_distintos=("producto", "nunique")
)
print(resumen_completo)
```

Esta forma con nombres explícitos (`total_vendido`, `ventas_promedio`) deja columnas de salida claras y fáciles de leer.

### Ordenando resultados

```python
resumen_ordenado = resumen_completo.sort_values("total_vendido", ascending=False)
print(resumen_ordenado)
```

`sort_values` ordena el DataFrame según una columna; con `ascending=False` el orden es de mayor a menor, útil para ver de inmediato qué categoría vende más.

### Mini análisis combinando todo

```python
ventas["total"] = ventas["precio_unitario"] * ventas["cantidad"]
ventas["categoria"] = ventas["producto"].map(categorias)
ventas["nivel_venta"] = ventas["total"].apply(clasificar_venta)

analisis_final = (
    ventas.groupby("categoria")
    .agg(total_vendido=("total", "sum"), unidades=("cantidad", "sum"))
    .sort_values("total_vendido", ascending=False)
)
print(analisis_final)
```

En pocas líneas pasamos de datos crudos de ventas a un resumen listo para interpretar: cuánto se vendió y cuántas unidades se movieron por categoría, ordenado de mayor a menor.

## Errores comunes

- **Usar apply cuando map es suficiente**: para reemplazos simples con un diccionario, `map` es más claro y directo que `apply` con una función auxiliar.
- **Olvidar que groupby no devuelve un DataFrame plano de inmediato**: el resultado agrupado necesita una función de agregación (`sum`, `mean`, `agg`, etc.) para convertirse en algo utilizable directamente.
- **No verificar valores nulos después de un map**: si el diccionario de reemplazo no cubre todos los valores posibles, aparecerán `NaN` silenciosamente en la columna nueva.

## Resumen

- Las columnas derivadas se calculan combinando columnas existentes con operaciones normales.
- `map()` es ideal para reemplazos simples con diccionario; `apply()` para lógica más compleja.
- `groupby()` agrupa filas para calcular agregaciones como suma, promedio o conteo.
- `agg()` permite calcular varias agregaciones con nombres de columna claros.
- `sort_values()` ordena los resultados para facilitar la interpretación final.
