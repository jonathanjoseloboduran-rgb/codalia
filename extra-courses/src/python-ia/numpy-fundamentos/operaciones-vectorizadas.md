# Operaciones vectorizadas

## Introducción

Una de las razones por las que NumPy es tan usado en inteligencia artificial es la vectorización: la capacidad de aplicar una operación a todos los elementos de un array de una sola vez, sin escribir bucles explícitos en Python. Cuando entrenas un modelo con miles de ejemplos, cada operación vectorizada que uses en lugar de un bucle puede significar la diferencia entre segundos y minutos de espera.

En esta lección vas a aprender a pensar "en arrays" en lugar de pensar "en elementos individuales". Este cambio de mentalidad es uno de los saltos más importantes que da cualquier persona que aprende NumPy, porque cambia por completo la forma en que escribes código numérico.

También verás cómo resumir datos con funciones como suma, promedio y desviación estándar, y por qué elegir el eje correcto importa tanto cuando trabajas con matrices.

## Conceptos clave

- **Vectorización**: aplicar una operación a todo un array de una vez, sin bucles explícitos, delegando el trabajo repetitivo a código optimizado.
- **Operación elemento a elemento**: una operación que se aplica de forma independiente a cada posición del array, como sumar dos arrays del mismo tamaño.
- **ufunc (función universal)**: funciones de NumPy diseñadas para operar elemento a elemento de forma muy eficiente, como `np.sqrt` o `np.exp`.
- **Eje (axis)**: la dimensión sobre la que se aplica una operación de resumen en una matriz; `axis=0` recorre filas hacia abajo (por columna), `axis=1` recorre columnas hacia la derecha (por fila).
- **Reducción**: una operación que toma un array y devuelve un resultado con menos dimensiones, como la suma total o el promedio.

## Desarrollo

### Operaciones elemento a elemento sin bucles

Cuando sumas, restas o multiplicas dos arrays del mismo tamaño, NumPy aplica la operación posición por posición automáticamente:

```python
import numpy as np

ventas_enero = np.array([1200, 1500, 980, 1750])
ventas_febrero = np.array([1300, 1420, 1100, 1600])

diferencia = ventas_febrero - ventas_enero
print(diferencia)  # [100 -80 120 -150]
```

No hace falta recorrer las listas con un `for`. NumPy compara ambos arrays elemento por elemento y devuelve un nuevo array con los resultados.

### Funciones universales (ufuncs)

Las ufuncs son funciones matemáticas que NumPy aplica a cada elemento de un array de forma optimizada. Por ejemplo, si tienes distancias registradas por un sensor de un dron y quieres convertirlas a otra unidad:

```python
distancias_metros = np.array([12.5, 8.0, 20.3, 5.7])
distancias_pies = distancias_metros * 3.281

raices = np.sqrt(np.array([4, 9, 16, 25]))
print(raices)  # [2. 3. 4. 5.]

exponenciales = np.exp(np.array([0, 1, 2]))
print(exponenciales)
```

`np.sqrt`, `np.exp`, `np.log`, `np.abs` son ejemplos comunes de ufuncs que verás constantemente al preparar datos para modelos de IA, por ejemplo al normalizar valores o calcular funciones de activación.

### Suma, promedio y desviación estándar

Supón que tienes las calificaciones de tres estudiantes en cuatro exámenes, organizadas en una matriz:

```python
notas = np.array([
    [85, 90, 78, 92],
    [70, 75, 80, 65],
    [95, 88, 91, 89]
])

promedio_general = notas.mean()
print(promedio_general)  # promedio de todos los valores

suma_total = notas.sum()
desviacion = notas.std()
```

Estas funciones, sin especificar eje, colapsan todo el array en un solo número.

### Operando sobre ejes específicos

La parte que más confunde al inicio es elegir el eje correcto. Si quieres el promedio de cada estudiante (una fila por estudiante), necesitas recorrer las columnas dentro de cada fila, es decir `axis=1`:

```python
promedio_por_estudiante = notas.mean(axis=1)
print(promedio_por_estudiante)  # un valor por cada fila

promedio_por_examen = notas.mean(axis=0)
print(promedio_por_examen)  # un valor por cada columna
```

`axis=1` recorre horizontalmente y produce un resultado por fila. `axis=0` recorre verticalmente y produce un resultado por columna. Recuerda esta regla: el eje que mencionas es el que "desaparece" en el resultado.

### Por qué la vectorización es más rápida

Cuando usas un bucle de Python, cada iteración pasa por el intérprete, que es lento comparado con código compilado. NumPy, en cambio, delega la operación completa a rutinas escritas en C que procesan los datos en bloques de memoria contiguos:

```python
import time

numeros = np.arange(1_000_000)

inicio = time.time()
resultado_bucle = [n * 2 for n in numeros]
print("Bucle:", time.time() - inicio)

inicio = time.time()
resultado_vectorizado = numeros * 2
print("Vectorizado:", time.time() - inicio)
```

Al ejecutar este código verás que la versión vectorizada es notablemente más rápida, incluso con un millón de elementos.

## Errores comunes

- **Sumar arrays de tamaños distintos sin entender el broadcasting**: si las formas no son compatibles, NumPy lanza un error. Verifica siempre el `shape` de ambos arrays antes de operar.
- **Confundir axis=0 con axis=1**: es el error más frecuente al calcular promedios en matrices. Antes de ejecutar, pregúntate qué dimensión quieres "colapsar".
- **Seguir usando bucles `for` por costumbre**: si escribes un bucle para sumar, multiplicar o transformar un array completo, casi siempre existe una ufunc o una operación vectorizada que hace lo mismo más rápido y con menos código.

## Resumen

- Las operaciones entre arrays del mismo tamaño se aplican elemento a elemento automáticamente.
- Las ufuncs como `np.sqrt` o `np.exp` procesan cada elemento de forma optimizada.
- `sum()`, `mean()` y `std()` resumen datos, y el parámetro `axis` controla sobre qué dimensión se calculan.
- `axis=0` opera por columna, `axis=1` opera por fila.
- La vectorización evita el overhead de los bucles de Python y es mucho más rápida en datasets grandes.
