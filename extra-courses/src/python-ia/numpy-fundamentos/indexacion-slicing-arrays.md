# Indexación y slicing de arrays

## Introducción

Una vez que sabes crear arrays y operar con ellos, el siguiente paso natural es aprender a acceder a partes específicas de esos datos: un valor puntual, un rango de filas, o solo los elementos que cumplen una condición. Esto es lo que en NumPy se conoce como indexación y slicing, y es una habilidad que usarás en prácticamente cada línea de código cuando prepares datos para un modelo de IA.

Imagina que tienes un dataset de ventas de una tienda y necesitas quedarte solo con los productos que superaron cierto monto, o que tienes una imagen representada como matriz y necesitas recortar una región específica. Todo esto se resuelve con las técnicas de esta lección.

También aprenderás una distinción que suele generar errores sutiles y difíciles de detectar: la diferencia entre una vista y una copia de un array.

## Conceptos clave

- **Indexación**: acceder a un elemento específico de un array usando su posición, empezando en 0.
- **Slicing**: extraer un subconjunto continuo de un array usando la notación `inicio:fin:paso`.
- **Máscara booleana**: un array de valores `True`/`False` del mismo tamaño que se usa para filtrar elementos que cumplen una condición.
- **Fancy indexing**: seleccionar elementos usando una lista o array de índices específicos, en cualquier orden.
- **Vista vs copia**: una vista comparte memoria con el array original (modificarla modifica el original), mientras que una copia es independiente.

## Desarrollo

### Indexar arrays de una dimensión

Al igual que con las listas de Python, puedes acceder a un elemento por su posición:

```python
import numpy as np

precios = np.array([25.5, 30.0, 12.75, 45.2, 18.9])

print(precios[0])    # 25.5, el primer elemento
print(precios[-1])   # 18.9, el último elemento
```

### Indexar arrays de dos dimensiones

En una matriz, se usa una coma para separar fila y columna:

```python
ventas = np.array([
    [120, 135, 98],
    [200, 180, 210],
    [95, 88, 102]
])

print(ventas[0, 0])   # 120, fila 0, columna 0
print(ventas[1, 2])   # 210, fila 1, columna 2
print(ventas[2])      # [95 88 102], toda la fila 2
```

### Slicing: extrayendo rangos

El slicing usa la sintaxis `inicio:fin`, donde `fin` no se incluye. Con temperaturas registradas cada hora:

```python
temperaturas = np.array([18, 19, 21, 23, 25, 24, 22, 20])

print(temperaturas[2:5])    # [21 23 25]
print(temperaturas[:3])     # [18 19 21], los primeros 3
print(temperaturas[-3:])    # [24 22 20], los últimos 3
print(temperaturas[::2])    # [18 21 25 22], cada 2 elementos
```

En una matriz, puedes combinar slicing en ambas dimensiones:

```python
print(ventas[0:2, 1:3])
# [[135  98]
#  [180 210]]
```

### Máscaras booleanas para filtrar datos

Esta es una de las herramientas más usadas al limpiar datos. Puedes crear una condición y usarla directamente como índice:

```python
temperaturas = np.array([18, 19, 21, 23, 25, 24, 22, 20])

calurosos = temperaturas > 22
print(calurosos)                  # [False False False  True  True  True False False]
print(temperaturas[calurosos])    # [23 25 24]

# También en una sola línea:
print(temperaturas[temperaturas >= 20])
```

Con datos de ventas, esto permite filtrar registros con una sola línea, sin bucles:

```python
ventas_totales = np.array([1200, 800, 1500, 600, 2000])
buenas_ventas = ventas_totales[ventas_totales > 1000]
print(buenas_ventas)  # [1200 1500 2000]
```

### Fancy indexing

A diferencia del slicing, el fancy indexing te permite elegir elementos en cualquier orden usando una lista de índices:

```python
notas = np.array([70, 85, 90, 60, 95, 78])
posiciones = [4, 0, 2]
print(notas[posiciones])  # [95 70 90]
```

Esto es útil, por ejemplo, para reordenar filas de un dataset según un criterio calculado previamente.

### Vistas contra copias

Cuando haces slicing sobre un array, el resultado es una vista: comparte la misma memoria que el original.

```python
original = np.array([10, 20, 30, 40, 50])
vista = original[1:4]
vista[0] = 999

print(original)  # [10 999 30 40 50], el original cambió también
```

Si necesitas un array independiente, debes usar `.copy()` explícitamente:

```python
copia = original[1:4].copy()
copia[0] = -1
print(original)  # no cambia
```

El fancy indexing y las máscaras booleanas, a diferencia del slicing, siempre generan copias, no vistas.

## Errores comunes

- **Asumir que el slicing siempre crea una copia**: modificar una vista sin darte cuenta puede alterar datos originales que necesitabas conservar intactos. Usa `.copy()` cuando quieras independencia real.
- **Olvidar que el índice final del slicing no se incluye**: `array[0:3]` da 3 elementos, no 4. Cuenta siempre con cuidado el rango deseado.
- **Confundir el orden fila/columna en matrices**: `matriz[1, 2]` es fila 1, columna 2, no al revés. Verifica el shape antes de indexar para evitar errores de posición.

## Resumen

- La indexación accede a un elemento puntual; el slicing extrae un rango con `inicio:fin:paso`.
- En matrices, se usa una coma para separar fila y columna.
- Las máscaras booleanas permiten filtrar datos con condiciones, sin bucles.
- El fancy indexing selecciona elementos en cualquier orden usando una lista de índices.
- El slicing produce vistas que comparten memoria; el fancy indexing y las máscaras producen copias independientes.
