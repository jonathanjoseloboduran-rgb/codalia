# DataFrames en profundidad

## Introducción

Hasta ahora has trabajado con DataFrames de forma básica: crearlos, ver sus columnas, filtrar filas simples. En análisis de datos real necesitas más control. Necesitas seleccionar filas con varias condiciones a la vez, entender qué es un índice y cómo aprovecharlo, y escribir código que se pueda leer sin esfuerzo cuando lo repases dentro de tres meses.

Esta lección profundiza en el manejo del índice, las condiciones complejas de filtrado, el método `query` como alternativa más legible, y las asignaciones seguras con `loc`. También verás cómo encadenar operaciones para que el código cuente una historia clara en vez de ser un bloque de líneas sueltas.

Dominar esto marca la diferencia entre alguien que "usa pandas" y alguien que analiza datos con confianza. Un DataFrame mal indexado o un filtro mal escrito puede generar errores silenciosos: datos que parecen correctos pero no lo son.

## Conceptos clave

- **Índice**: la etiqueta que identifica cada fila de un DataFrame. Por defecto es un número entero, pero puede ser cualquier columna con valores únicos.
- **Multiíndice**: un índice compuesto por más de un nivel, útil cuando los datos tienen jerarquías (por ejemplo, país y ciudad).
- **`loc`**: selector de pandas que trabaja con etiquetas de fila y columna, y que también permite asignar valores de forma segura.
- **`query`**: método que permite filtrar un DataFrame escribiendo la condición como una cadena de texto, similar a una consulta SQL.
- **Encadenamiento de métodos**: escribir varias operaciones seguidas, cada una en su propia línea, para que el flujo de transformación se lea de arriba hacia abajo.

## Desarrollo

### Establecer y usar un índice

Por defecto, un DataFrame tiene un índice numérico. Puedes cambiarlo por una columna con datos significativos usando `set_index`.

```python
import pandas as pd

pedidos = pd.DataFrame({
    "id_pedido": ["P001", "P002", "P003", "P004"],
    "cliente": ["Ana", "Luis", "Marta", "Ana"],
    "total": [120.50, 89.00, 340.75, 55.20]
})

pedidos = pedidos.set_index("id_pedido")
print(pedidos.loc["P003"])
```

Ahora cada fila se identifica por su `id_pedido`, lo cual hace que buscar un pedido específico sea directo y legible.

### Multiíndice básico

Cuando los datos tienen dos niveles de agrupación natural, un multiíndice ayuda a organizarlos sin duplicar columnas.

```python
ventas = pd.DataFrame({
    "region": ["Norte", "Norte", "Sur", "Sur"],
    "producto": ["Teclado", "Mouse", "Teclado", "Mouse"],
    "unidades": [30, 45, 20, 60]
})

ventas_indexadas = ventas.set_index(["region", "producto"])
print(ventas_indexadas.loc["Norte"])
```

Con esto puedes acceder a todas las ventas de una región, y si lo necesitas, bajar un nivel más para llegar a un producto específico.

### Seleccionar con condiciones complejas

Filtrar por una sola condición ya lo conoces. Para combinar varias, usa `&` (y), `|` (o), y encierra cada condición entre paréntesis.

```python
clientes = pd.DataFrame({
    "nombre": ["Ana", "Luis", "Marta", "Pedro"],
    "edad": [34, 22, 45, 29],
    "ciudad": ["Bogotá", "Lima", "Bogotá", "Santiago"]
})

filtro = (clientes["edad"] > 25) & (clientes["ciudad"] == "Bogotá")
print(clientes[filtro])
```

Este patrón es el más usado en la práctica: definir el filtro en una variable con nombre claro y luego aplicarlo, en vez de escribir todo en una sola línea difícil de leer.

### Filtrar con `query`

El método `query` permite escribir la misma condición como texto, lo que a menudo resulta más natural de leer.

```python
resultado = clientes.query("edad > 25 and ciudad == 'Bogotá'")
print(resultado)
```

`query` es especialmente útil cuando tienes muchas condiciones, porque evita la acumulación de corchetes y símbolos `&`.

### Asignaciones seguras con `loc`

Para modificar valores según una condición, usa `loc` en vez de asignar directamente sobre un resultado filtrado, así evitas advertencias y comportamientos inesperados.

```python
pedidos = pedidos.reset_index()
pedidos.loc[pedidos["total"] > 100, "categoria"] = "alto valor"
pedidos.loc[pedidos["total"] <= 100, "categoria"] = "regular"
print(pedidos)
```

### Encadenar operaciones de forma legible

Cuando necesitas varios pasos seguidos, encadenarlos con paréntesis y una operación por línea hace que el código sea fácil de seguir.

```python
resumen = (
    pedidos
    .query("total > 50")
    .sort_values("total", ascending=False)
    .reset_index(drop=True)
)
print(resumen)
```

Cada línea representa un paso del análisis: filtrar, ordenar, reindexar. Leer el código se vuelve casi como leer una receta.

## Errores comunes

- **Encadenar asignaciones sobre una copia filtrada**: escribir `clientes[clientes["edad"] > 25]["ciudad"] = "Nueva"` genera una advertencia porque pandas no sabe si estás modificando una copia o el original. Usa siempre `loc` para asignar según condición.
- **Confundir `loc` con `iloc`**: `loc` trabaja con etiquetas, `iloc` con posiciones numéricas. Mezclar ambos criterios sin darse cuenta produce selecciones incorrectas.
- **Olvidar los paréntesis en condiciones combinadas**: escribir `clientes["edad"] > 25 & clientes["ciudad"] == "Bogotá"` sin paréntesis alrededor de cada condición produce un error, porque `&` tiene mayor prioridad que `>` en Python.

## Resumen

- El índice identifica cada fila y puede basarse en una o varias columnas.
- Combina condiciones con `&` y `|`, siempre entre paréntesis.
- `query` ofrece una sintaxis más legible para filtros complejos.
- Usa `loc` para seleccionar y para asignar valores de forma segura.
- Encadenar operaciones, una por línea, mejora la claridad del código.
