# Broadcasting

## Introducción

Hasta ahora has operado sobre arrays que tienen exactamente el mismo tamaño. Pero en la práctica, muchas veces necesitas combinar arrays de tamaños distintos: sumar un mismo número a toda una matriz, restar el promedio de cada columna a una tabla completa de datos, o ajustar cada canal de color de una imagen con un valor diferente. Para eso existe el broadcasting.

El broadcasting es el mecanismo que usa NumPy para "estirar" arrays más pequeños de forma automática y así poder operar con arrays de mayor tamaño, sin necesidad de copiar datos manualmente ni escribir bucles. Es una de las características que hacen que el código de NumPy sea tan compacto y expresivo.

Entender el broadcasting es esencial en IA porque la normalización de datos, una de las tareas más comunes antes de entrenar un modelo, depende directamente de esta técnica.

## Conceptos clave

- **Broadcasting**: mecanismo que permite operar entre arrays de formas distintas, expandiendo virtualmente el más pequeño para que coincida con el más grande.
- **Compatibilidad de shapes**: dos dimensiones son compatibles si son iguales, o si una de ellas es 1.
- **Escalar**: un solo número, considerado como un array de forma vacía que se expande automáticamente a cualquier tamaño.
- **Normalización**: transformar los datos para que queden en un rango o escala común, una operación típica antes de entrenar un modelo.
- **Eje faltante**: cuando un array tiene menos dimensiones que otro, NumPy le añade dimensiones de tamaño 1 al inicio automáticamente.

## Desarrollo

### Qué es el broadcasting

El ejemplo más simple de broadcasting ya lo usaste sin darte cuenta: multiplicar un array por un solo número.

```python
import numpy as np

precios = np.array([100, 200, 300])
con_descuento = precios * 0.9
print(con_descuento)  # [90. 180. 270.]
```

Aquí, el número `0.9` es un escalar que NumPy "expande" para que se aplique a cada elemento del array, sin que tú tengas que crear un array de tres elementos idénticos.

### Reglas de compatibilidad de formas

NumPy compara las formas (shapes) de dos arrays de derecha a izquierda, dimensión por dimensión. Dos dimensiones son compatibles si:

1. Son exactamente iguales, o
2. Una de ellas es igual a 1.

Si ninguna de las dos condiciones se cumple, NumPy lanza un error.

```python
matriz = np.array([
    [1, 2, 3],
    [4, 5, 6]
])  # shape (2, 3)

vector = np.array([10, 20, 30])  # shape (3,)

resultado = matriz + vector
print(resultado)
# [[11 22 33]
#  [14 25 36]]
```

Aquí, `vector` tiene shape `(3,)` y `matriz` tiene shape `(2, 3)`. NumPy compara la última dimensión: 3 contra 3, coinciden. Como a `vector` le falta una dimensión, NumPy la agrega automáticamente como 1, quedando `(1, 3)`, que es compatible con `(2, 3)` porque el 1 se expande a 2.

### Ejemplo práctico: normalizar una matriz

Un caso muy común al preparar datos para un modelo es restar el promedio de cada columna a toda una tabla de datos, para centrar los valores alrededor de cero:

```python
calificaciones = np.array([
    [80, 90, 70],
    [60, 85, 95],
    [75, 70, 88]
])

promedio_por_columna = calificaciones.mean(axis=0)
print(promedio_por_columna)  # shape (3,)

centradas = calificaciones - promedio_por_columna
print(centradas)
```

`promedio_por_columna` tiene shape `(3,)`, y se resta a cada una de las tres filas de `calificaciones` gracias al broadcasting, sin necesidad de bucles.

Para normalizar completamente entre 0 y 1, puedes combinar broadcasting con el mínimo y el máximo:

```python
minimo = calificaciones.min(axis=0)
maximo = calificaciones.max(axis=0)

normalizadas = (calificaciones - minimo) / (maximo - minimo)
print(normalizadas)
```

### Ejemplo práctico: matriz más vector columna

También puedes operar con un vector columna, que tiene shape `(n, 1)`. Por ejemplo, ajustar cada fila de ventas por un factor distinto:

```python
ventas = np.array([
    [100, 200],
    [150, 250],
    [300, 100]
])  # shape (3, 2)

factor_por_region = np.array([[1.1], [0.9], [1.05]])  # shape (3, 1)

ajustadas = ventas * factor_por_region
print(ajustadas)
```

Aquí, `(3, 2)` y `(3, 1)` son compatibles porque la segunda dimensión de `factor_por_region` es 1, y se expande para cubrir las 2 columnas.

### Errores comunes de shapes

Cuando las formas no son compatibles, NumPy no adivina lo que quisiste hacer, lanza un error claro:

```python
a = np.array([1, 2, 3])       # shape (3,)
b = np.array([1, 2])          # shape (2,)

# a + b  -> ValueError: operands could not be broadcast together
```

Este tipo de error es muy común cuando se combinan datos de fuentes distintas sin verificar sus dimensiones primero.

## Errores comunes

- **Asumir que dos arrays de "casi el mismo tamaño" son compatibles**: el broadcasting exige que cada dimensión coincida o sea 1, no que los tamaños sean similares. Revisa el shape exacto antes de operar.
- **Confundir un vector fila con un vector columna**: `(3,)` y `(3, 1)` se comportan distinto en broadcasting. Si el resultado no es el esperado, revisa con `.reshape()` la forma real del vector.
- **No verificar el shape antes de una operación con datos externos**: al cargar datos de distintas fuentes, es fácil terminar con dimensiones inesperadas. Imprime `.shape` antes de sumar o multiplicar arrays de distinto origen.

## Resumen

- El broadcasting permite operar arrays de formas distintas sin copiar datos manualmente.
- Dos dimensiones son compatibles si son iguales o si una de ellas es 1.
- Es la base de operaciones comunes como normalizar datos o ajustar filas y columnas con factores distintos.
- Cuando las formas no son compatibles, NumPy lanza un error explícito en lugar de adivinar.
- Verificar el `.shape` de los arrays antes de operar evita la mayoría de los errores de broadcasting.
