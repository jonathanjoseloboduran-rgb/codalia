# Series y DataFrames

## Introducción

Cuando trabajas con inteligencia artificial, casi todo empieza con datos organizados en tablas: ventas por mes, respuestas de una encuesta, lecturas de un sensor. **Pandas** es la librería de Python que te permite manejar esas tablas de forma cómoda y eficiente, muy por encima de lo que lograrías con listas y diccionarios sueltos.

Pandas ofrece dos estructuras centrales: la **Serie**, que representa una sola columna de datos, y el **DataFrame**, que representa una tabla completa con varias columnas. Entender bien estas dos piezas es el primer paso para preparar datos que luego alimentarán modelos de IA, ya sea para entrenarlos o para hacerles predicciones.

En esta lección construirás Series y DataFrames desde cero, explorarás cómo funciona el índice y aprenderás a seleccionar columnas y filas de manera precisa. Son habilidades que usarás en prácticamente cada proyecto de datos que hagas de aquí en adelante.

## Conceptos clave

- **Serie**: una columna de datos con un índice asociado a cada valor.
- **DataFrame**: una tabla formada por varias Series que comparten el mismo índice.
- **Índice (index)**: las etiquetas que identifican cada fila; por defecto son números, pero puedes personalizarlas.
- **loc**: selección por etiqueta (nombre de fila o columna).
- **iloc**: selección por posición numérica, igual que en una lista.

## Desarrollo

### Creando una Serie

Una Serie es como una lista con memoria: cada valor tiene una etiqueta.

```python
import pandas as pd

temperaturas = pd.Series([21.5, 23.0, 19.8, 22.3], index=["lun", "mar", "mie", "jue"])
print(temperaturas)
```

Aquí `temperaturas` guarda cuatro lecturas de un sensor, una por día. El índice (`lun`, `mar`, etc.) te permite acceder a cada valor por su nombre en lugar de recordar su posición.

### Creando un DataFrame desde un diccionario

La forma más común de construir un DataFrame es a partir de un diccionario, donde cada clave se vuelve una columna.

```python
clientes = pd.DataFrame({
    "nombre": ["Ana", "Luis", "Marta", "Pedro"],
    "edad": [29, 34, 41, 26],
    "ciudad": ["Bogotá", "Lima", "Quito", "Bogotá"]
})
print(clientes)
```

Cada fila representa un cliente y cada columna un atributo suyo. Este patrón lo verás una y otra vez al preparar datos para IA.

### Creando un DataFrame desde una lista de listas

También puedes construirlo a partir de filas, indicando los nombres de columna aparte.

```python
ventas = pd.DataFrame(
    [
        ["enero", 1200, "norte"],
        ["febrero", 950, "sur"],
        ["marzo", 1430, "norte"],
    ],
    columns=["mes", "monto", "region"]
)
print(ventas)
```

Esto es útil cuando los datos ya vienen organizados fila por fila, como al leerlos de una fuente externa.

### Seleccionar columnas

Puedes obtener una columna completa como Serie usando su nombre.

```python
nombres = clientes["nombre"]
print(nombres)

# Varias columnas a la vez: se pasa una lista y el resultado es un DataFrame
resumen = clientes[["nombre", "ciudad"]]
print(resumen)
```

### Seleccionar filas con loc e iloc

`loc` selecciona por etiqueta de índice, mientras que `iloc` selecciona por posición, sin importar cómo se llame el índice.

```python
# loc: por etiqueta de índice (aquí coincide con la posición porque es el default)
print(clientes.loc[1])

# iloc: por posición, siempre funciona igual aunque cambie el índice
print(clientes.iloc[1])

# Filtrar filas y columnas específicas con loc
print(clientes.loc[0:2, ["nombre", "edad"]])
```

Nota que `loc` con rangos incluye el último elemento, a diferencia de las listas normales de Python, donde el límite superior queda fuera.

## Errores comunes

- **Confundir loc con iloc**: usar números en `loc` funciona solo si el índice es numérico consecutivo; si el índice tiene texto o fue reordenado, `loc` buscará esa etiqueta exacta, no una posición. Cuando tengas dudas, usa `iloc` para posiciones.
- **Olvidar que una columna es una Serie**: al escribir `clientes["nombre"]` obtienes una Serie, no una lista de Python. Operaciones como `len()` funcionan igual, pero métodos como `.append()` de listas no existen ahí.
- **Pasar listas de distinto largo al crear un DataFrame**: si las columnas de un diccionario no tienen el mismo número de elementos, Pandas lanzará un error. Verifica siempre que todas las listas coincidan en longitud.

## Resumen

- Pandas se basa en dos estructuras: la Serie (una columna) y el DataFrame (una tabla).
- Puedes crear DataFrames desde diccionarios o desde listas de listas con `columns`.
- El índice identifica cada fila y puede ser numérico o personalizado.
- `loc` selecciona por etiqueta; `iloc` selecciona por posición numérica.
- Seleccionar columnas es tan simple como usar corchetes con el nombre o una lista de nombres.
