# GroupBy y agregaciones

## Introducción

Una de las tareas más frecuentes al analizar datos es resumir información por categorías: ventas totales por región, promedio de edad por ciudad, cantidad de pedidos por cliente. Pandas resuelve esto con `groupby`, una herramienta que agrupa filas según valores compartidos y luego aplica un cálculo a cada grupo.

En esta lección aprenderás el patrón que hace posible todo esto, llamado split-apply-combine, y cómo aplicarlo con una o varias columnas a la vez. También verás cómo calcular varias estadísticas al mismo tiempo con `agg`, la diferencia entre `transform` y `agg`, y cómo construir tablas dinámicas con `pivot_table` para presentar resultados de forma clara.

Estas herramientas son el corazón de cualquier reporte de datos. Cuando alguien te pide "el total de ventas por región y por mes", lo que en realidad te está pidiendo es un `groupby` bien construido.

## Conceptos clave

- **Split-apply-combine**: el patrón que divide los datos en grupos, aplica una función a cada uno, y combina los resultados en una sola estructura.
- **`groupby`**: método que agrupa un DataFrame según una o varias columnas.
- **`agg`**: método que permite aplicar una o varias funciones de agregación (suma, promedio, conteo) a un grupo.
- **`transform`**: método que aplica una función a cada grupo pero devuelve un resultado con el mismo tamaño que los datos originales, en vez de resumirlos.
- **`pivot_table`**: herramienta para reorganizar datos en forma de tabla cruzada, con categorías en filas y columnas.

## Desarrollo

### El patrón split-apply-combine

Cuando agrupas datos, pandas primero divide el DataFrame en subgrupos según la columna indicada, luego aplica una función a cada subgrupo, y finalmente combina los resultados en una tabla nueva.

```python
import pandas as pd

ventas = pd.DataFrame({
    "region": ["Norte", "Norte", "Sur", "Sur", "Centro"],
    "producto": ["Teclado", "Mouse", "Teclado", "Mouse", "Teclado"],
    "unidades": [30, 45, 20, 60, 15],
    "precio_unitario": [25, 10, 25, 10, 25]
})

total_por_region = ventas.groupby("region")["unidades"].sum()
print(total_por_region)
```

Aquí pandas dividió los datos por región, sumó las unidades de cada una, y devolvió una sola fila por región.

### GroupBy con múltiples columnas

Puedes agrupar por más de una columna para obtener combinaciones más específicas, como región y producto a la vez.

```python
detalle = ventas.groupby(["region", "producto"])["unidades"].sum()
print(detalle)
```

El resultado tiene un multiíndice con región y producto, lo que te permite consultar, por ejemplo, cuántos mouse se vendieron en el Sur.

### `agg` con varias funciones

Cuando necesitas más de una estadística por grupo, `agg` te permite indicar una lista de funciones o incluso funciones distintas por columna.

```python
resumen = ventas.groupby("region").agg(
    total_unidades=("unidades", "sum"),
    promedio_unidades=("unidades", "mean"),
    cantidad_productos=("producto", "count")
)
print(resumen)
```

Esta forma de usar `agg`, con nombres explícitos para cada columna resultante, es la más clara para reportes porque cada columna queda identificada de inmediato.

### `transform` frente a `agg`

`agg` resume cada grupo en un solo valor. `transform` en cambio devuelve un valor por cada fila original, replicando el resultado del grupo. Esto es útil para comparar cada fila contra el promedio de su grupo.

```python
ventas["promedio_region"] = ventas.groupby("region")["unidades"].transform("mean")
ventas["diferencia_vs_promedio"] = ventas["unidades"] - ventas["promedio_region"]
print(ventas)
```

Con `transform` puedes agregar una columna nueva al DataFrame original sin perder ninguna fila, algo que `agg` no permite directamente.

### Tablas dinámicas con `pivot_table`

`pivot_table` reorganiza los datos poniendo una columna como filas y otra como columnas, con una función de agregación en las celdas.

```python
tabla = pd.pivot_table(
    ventas,
    values="unidades",
    index="region",
    columns="producto",
    aggfunc="sum",
    fill_value=0
)
print(tabla)
```

El resultado es una tabla cruzada: cada fila es una región, cada columna un producto, y cada celda la suma de unidades correspondiente. Es el formato ideal para presentar resúmenes comparativos.

## Errores comunes

- **Olvidar que `groupby` por sí solo no calcula nada**: escribir `ventas.groupby("region")` solo crea el objeto agrupado. Necesitas aplicar una función como `.sum()` o `.agg()` para obtener un resultado.
- **Confundir `agg` con `transform`**: usar `agg` cuando en realidad necesitas mantener el tamaño original del DataFrame produce una tabla resumida que no se puede unir de vuelta fácilmente. Si necesitas agregar una columna al DataFrame original, `transform` es la opción correcta.
- **No usar `fill_value` en `pivot_table`**: cuando una combinación de fila y columna no tiene datos, pandas coloca `NaN`. Si vas a sumar o comparar esos valores después, es mejor rellenar con `fill_value=0` desde el inicio.

## Resumen

- `groupby` sigue el patrón dividir, aplicar y combinar.
- Puedes agrupar por una o varias columnas para obtener distintos niveles de detalle.
- `agg` permite calcular varias estadísticas con nombres claros por columna.
- `transform` conserva el tamaño original del DataFrame, ideal para comparar filas contra su grupo.
- `pivot_table` construye tablas cruzadas listas para presentar o comparar visualmente.
