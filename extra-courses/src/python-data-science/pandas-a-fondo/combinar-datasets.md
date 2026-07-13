# Combinar datasets

## Introducción

Los datos reales casi nunca viven en una sola tabla. Tienes una tabla de clientes, otra de pedidos, otra de productos, y necesitas juntarlas para responder preguntas completas, como "¿qué productos compró cada cliente y cuánto pagó por ellos?". Pandas ofrece dos herramientas principales para esto: `concat`, que apila DataFrames uno junto a otro o uno debajo de otro, y `merge`, que combina tablas según columnas en común, igual que las uniones (joins) de SQL.

En esta lección aprenderás cuándo usar cada una, los distintos tipos de unión que existen con `merge` (inner, left, right, outer), y los problemas más comunes que aparecen al combinar datos, como duplicados inesperados o columnas con el mismo nombre. Cerrarás con un ejemplo completo de dos tablas relacionadas, como las que encontrarías en cualquier sistema de ventas.

Saber combinar datasets correctamente evita uno de los errores más costosos en análisis de datos: perder filas sin darte cuenta, o multiplicarlas por accidente.

## Conceptos clave

- **`concat`**: función que apila DataFrames, ya sea agregando filas nuevas o columnas nuevas, sin necesidad de una clave en común.
- **`merge`**: función que combina dos DataFrames usando una o más columnas como clave de unión, similar a un JOIN de SQL.
- **Tipo de unión (inner, left, right, outer)**: determina qué filas se conservan cuando las claves no coinciden exactamente entre las dos tablas.
- **Clave de unión**: la columna o columnas que pandas usa para decidir qué filas de una tabla corresponden a qué filas de la otra.
- **Sufijos**: texto que pandas agrega automáticamente a columnas con el mismo nombre en ambas tablas, para poder distinguirlas después de unirlas.

## Desarrollo

### Apilar tablas con `concat`

`concat` es útil cuando tienes dos tablas con la misma estructura y quieres juntarlas, por ejemplo, ventas de enero y ventas de febrero.

```python
import pandas as pd

ventas_enero = pd.DataFrame({
    "id_pedido": [1, 2],
    "total": [120.0, 89.5]
})

ventas_febrero = pd.DataFrame({
    "id_pedido": [3, 4],
    "total": [200.0, 75.0]
})

ventas_completas = pd.concat([ventas_enero, ventas_febrero], ignore_index=True)
print(ventas_completas)
```

`ignore_index=True` evita que se repitan los índices originales de cada tabla, generando uno nuevo y continuo.

### Merge tipo SQL: inner, left, right, outer

`merge` combina dos tablas usando una clave en común. El parámetro `how` decide qué filas sobreviven a la unión.

```python
clientes = pd.DataFrame({
    "id_cliente": [1, 2, 3],
    "nombre": ["Ana", "Luis", "Marta"]
})

pedidos = pd.DataFrame({
    "id_pedido": [101, 102, 103, 104],
    "id_cliente": [1, 2, 2, 4],
    "total": [50.0, 75.0, 30.0, 90.0]
})

union_inner = pd.merge(clientes, pedidos, on="id_cliente", how="inner")
print(union_inner)
```

Con `how="inner"` solo quedan las filas cuya clave existe en ambas tablas. Observa que el cliente Marta (id 3) no aparece porque no tiene pedidos, y el pedido con id_cliente 4 tampoco aparece porque ese cliente no existe en la tabla de clientes.

```python
union_left = pd.merge(clientes, pedidos, on="id_cliente", how="left")
print(union_left)
```

Con `how="left"` se conservan todas las filas de `clientes`, aunque no tengan pedido. Los campos sin correspondencia quedan como `NaN`.

```python
union_outer = pd.merge(clientes, pedidos, on="id_cliente", how="outer")
print(union_outer)
```

`how="outer"` conserva todas las filas de ambas tablas, tengan o no coincidencia. `how="right"` funciona igual que `left`, pero priorizando la segunda tabla en vez de la primera.

### Claves de unión con nombres distintos

Si las columnas clave no se llaman igual en ambas tablas, usa `left_on` y `right_on`.

```python
productos = pd.DataFrame({
    "codigo_producto": ["A1", "A2"],
    "nombre_producto": ["Teclado", "Mouse"]
})

detalle_pedido = pd.DataFrame({
    "id_pedido": [201, 202],
    "producto_id": ["A1", "A2"]
})

union_productos = pd.merge(
    detalle_pedido, productos,
    left_on="producto_id", right_on="codigo_producto",
    how="left"
)
print(union_productos)
```

### Problemas comunes: duplicados y sufijos

Cuando la clave de unión tiene valores repetidos en alguna de las tablas, el resultado puede multiplicar filas sin que sea evidente a simple vista.

```python
inventario_a = pd.DataFrame({
    "producto": ["Teclado", "Teclado", "Mouse"],
    "bodega": ["Central", "Norte", "Central"]
})

precios = pd.DataFrame({
    "producto": ["Teclado", "Mouse"],
    "precio": [25, 10]
})

combinado = pd.merge(inventario_a, precios, on="producto")
print(combinado)
print("Filas resultado:", len(combinado))
```

Aquí "Teclado" aparece dos veces en `inventario_a`, así que el resultado final tiene más filas que `precios` original. Vale la pena revisar el número de filas antes y después de un merge para detectar duplicaciones no deseadas.

Cuando ambas tablas tienen una columna con el mismo nombre que no es la clave, pandas agrega sufijos automáticamente.

```python
tabla_x = pd.DataFrame({"id": [1, 2], "valor": [10, 20]})
tabla_y = pd.DataFrame({"id": [1, 2], "valor": [100, 200]})

resultado = pd.merge(tabla_x, tabla_y, on="id", suffixes=("_x", "_y"))
print(resultado)
```

Definir `suffixes` de forma explícita, con nombres descriptivos, hace que el resultado sea mucho más claro que dejar los sufijos por defecto.

## Errores comunes

- **No revisar el tipo de unión antes de aplicar `merge`**: usar `inner` por defecto cuando en realidad necesitas conservar todas las filas de una tabla (`left`) puede hacer que pierdas registros sin darte cuenta.
- **Ignorar los duplicados en la clave de unión**: si una clave se repite en alguna tabla, el resultado de `merge` puede tener más filas de las esperadas. Siempre compara el número de filas antes y después.
- **Dejar que los sufijos automáticos generen confusión**: nombres como `valor_x` y `valor_y` no dicen nada por sí solos. Definir `suffixes` con nombres claros, como `_enero` y `_febrero`, mejora mucho la legibilidad.

## Resumen

- Usa `concat` para apilar tablas con la misma estructura.
- Usa `merge` para combinar tablas según una clave, con `how` para elegir el tipo de unión.
- `left_on` y `right_on` permiten unir columnas con nombres distintos.
- Revisa siempre el número de filas después de un merge para detectar duplicados.
- Define `suffixes` explícitos cuando ambas tablas comparten nombres de columna.
