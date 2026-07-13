# Arrays de NumPy

## Introducción

Casi todo modelo de inteligencia artificial que existe hoy trabaja internamente con números organizados en forma de tablas o cubos: una foto es una matriz de píxeles, un conjunto de datos de ventas es una tabla de filas y columnas, un modelo de lenguaje procesa vectores de números. NumPy es la librería de Python que permite crear y manipular esas estructuras de forma eficiente, y es el cimiento sobre el que están construidas librerías como pandas, scikit-learn, PyTorch y TensorFlow.

Antes de escribir tu primera red neuronal o tu primer modelo de predicción, necesitas dominar la estructura básica de NumPy: el `ndarray`. En esta lección aprenderás qué es, cómo crearlo de varias formas y por qué es tan superior a las listas de Python cuando trabajas con grandes cantidades de datos numéricos.

Entender bien los arrays te va a ahorrar horas de confusión más adelante, cuando trabajes con datasets reales de miles o millones de valores.

## Conceptos clave

- **ndarray**: la estructura central de NumPy, un arreglo de N dimensiones donde todos los elementos tienen el mismo tipo de dato.
- **dtype**: el tipo de dato que almacena un array, por ejemplo `int64` o `float64`. Todos los elementos comparten el mismo dtype.
- **shape**: una tupla que indica el tamaño del array en cada dimensión, por ejemplo `(3, 4)` para 3 filas y 4 columnas.
- **vectorización**: la capacidad de aplicar una operación a todos los elementos de un array a la vez, sin escribir bucles explícitos.
- **contigüidad en memoria**: los datos de un array se guardan en bloques continuos de memoria, lo que permite cálculos mucho más rápidos.

## Desarrollo

### Por qué NumPy es la base de la IA

Cuando entrenas un modelo de IA, en realidad estás haciendo millones de operaciones matemáticas sobre números: sumas, productos de matrices, promedios. Python puro es lento para esto porque cada número en una lista es un objeto independiente con mucha información extra. NumPy resuelve esto guardando los números en bloques compactos de memoria y usando código optimizado en C por debajo.

Primero, importamos la librería con su alias estándar:

```python
import numpy as np
```

### Creando tu primer array

La forma más directa de crear un array es a partir de una lista de Python, usando `np.array()`. Imagina que tienes las temperaturas registradas por un sensor durante el día:

```python
temperaturas = np.array([21.5, 22.0, 23.8, 24.1, 22.9])
print(temperaturas)
print(type(temperaturas))
```

Esto convierte la lista en un `ndarray`, la estructura central de NumPy.

### Arrays generados automáticamente

Muchas veces no quieres escribir los valores a mano. NumPy ofrece funciones para generar arrays completos:

```python
ceros = np.zeros(5)          # [0. 0. 0. 0. 0.]
unos = np.ones((2, 3))       # matriz de 2 filas y 3 columnas, todo en 1
secuencia = np.arange(0, 10, 2)   # [0 2 4 6 8]
espaciado = np.linspace(0, 1, 5)  # 5 valores entre 0 y 1
```

`np.zeros` y `np.ones` son útiles para inicializar matrices antes de llenarlas con resultados. `np.arange` genera una secuencia con un paso fijo, similar a `range()` pero devolviendo un array. `np.linspace` genera una cantidad exacta de valores distribuidos uniformemente entre dos límites, algo muy común al graficar funciones o preparar datos de entrada para un modelo.

### dtype y shape

Cada array tiene un tipo de dato (`dtype`) y una forma (`shape`). Supón que registras las notas de un grupo de estudiantes:

```python
notas = np.array([85, 90, 78, 92, 88])
print(notas.dtype)   # int64
print(notas.shape)   # (5,)

matriz_notas = np.array([[85, 90], [78, 92], [88, 76]])
print(matriz_notas.shape)  # (3, 2): 3 estudiantes, 2 exámenes
```

El `shape` es fundamental porque casi todos los errores al trabajar con IA vienen de arrays con formas incompatibles entre sí. Aprender a leer el shape rápidamente es una habilidad que usarás constantemente.

### Listas de Python contra arrays de NumPy

Con una lista de Python, sumar un número a cada elemento requiere un bucle:

```python
precios = [100, 200, 300]
precios_con_impuesto = [p * 1.16 for p in precios]
```

Con un array de NumPy, la misma operación es directa y mucho más rápida internamente:

```python
precios = np.array([100, 200, 300])
precios_con_impuesto = precios * 1.16
print(precios_con_impuesto)  # [116. 232. 348.]
```

Esta diferencia parece pequeña con tres elementos, pero con un millón de elementos NumPy puede ser decenas de veces más rápido, porque evita el overhead de Python y aprovecha optimizaciones de bajo nivel.

## Errores comunes

- **Mezclar tipos de datos sin darse cuenta**: si creas un array con enteros y flotantes mezclados, NumPy convierte todo a flotante automáticamente. Revisa siempre el `dtype` si el resultado te sorprende.
- **Confundir shape con longitud**: `len(array)` solo te da el tamaño de la primera dimensión. Para matrices, siempre revisa `.shape` completo antes de operar.
- **Tratar un array como si fuera una lista de Python en rendimiento**: modificar arrays elemento por elemento con bucles de Python anula la ventaja de velocidad. Si te encuentras escribiendo un bucle `for` sobre un array, probablemente existe una forma vectorizada de hacerlo.

## Resumen

- NumPy es la base numérica de casi todo el ecosistema de IA en Python.
- El `ndarray` almacena datos homogéneos de forma compacta y eficiente.
- `np.array`, `np.zeros`, `np.ones`, `np.arange` y `np.linspace` son las formas más comunes de crear arrays.
- `dtype` indica el tipo de dato y `shape` indica la forma del array.
- Los arrays son mucho más rápidos que las listas de Python para cálculos numéricos masivos.
