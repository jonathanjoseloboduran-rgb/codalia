# Cargar y explorar datos

## Introducción

Antes de entrenar cualquier modelo de inteligencia artificial, necesitas conocer a fondo tus datos. Un dataset puede venir con miles de filas, columnas con nombres confusos, tipos mezclados o valores que no tienen sentido. La exploración inicial es el momento en que descubres todo eso, antes de que se convierta en un problema más adelante.

Pandas facilita esta tarea con funciones pensadas justamente para dar una primera mirada rápida: cuántas filas hay, qué tipo de dato tiene cada columna, cuáles son los valores más comunes y si existen datos faltantes. Dominar estas herramientas te ahorra horas de trabajo y te evita construir modelos sobre datos que en realidad estaban mal desde el inicio.

En esta lección aprenderás a cargar datos desde CSV y JSON, y a usar los comandos básicos de exploración que forman parte de la rutina diaria de cualquier persona que trabaja con datos para IA.

## Conceptos clave

- **read_csv / read_json**: funciones para cargar datos desde archivos externos hacia un DataFrame.
- **head()**: muestra las primeras filas para una vista rápida.
- **info()**: resume columnas, tipos de dato y valores no nulos.
- **describe()**: calcula estadísticas básicas de las columnas numéricas.
- **value_counts()**: cuenta cuántas veces aparece cada valor único en una columna.

## Desarrollo

### Simulando la carga de un CSV

En la práctica usarás `pd.read_csv("archivo.csv")`, pero para que el ejemplo sea reproducible sin depender de un archivo externo, primero creamos el DataFrame con datos inline, como si ya lo hubieras cargado.

```python
import pandas as pd
import io

datos_csv = """producto,precio,categoria,stock
laptop,3200,tecnologia,15
mouse,45,tecnologia,120
silla,280,muebles,30
escritorio,410,muebles,12
teclado,90,tecnologia,60
"""

productos = pd.read_csv(io.StringIO(datos_csv))
print(productos)
```

En tu proyecto real, reemplazarías `io.StringIO(datos_csv)` por la ruta del archivo: `pd.read_csv("productos.csv")`.

### Cargando datos en formato JSON

Los datos de encuestas o APIs suelen venir en JSON. Pandas también lo lee directamente.

```python
datos_json = '''
[
    {"usuario": "ana92", "puntaje": 87, "activo": true},
    {"usuario": "luis_dev", "puntaje": 65, "activo": false},
    {"usuario": "marta_ml", "puntaje": 94, "activo": true}
]
'''

encuesta = pd.read_json(io.StringIO(datos_json))
print(encuesta)
```

### Primera mirada con head e info

`head()` te muestra las primeras filas, útil para confirmar que la carga salió bien.

```python
print(productos.head(3))

productos.info()
```

`info()` te dice cuántas filas tiene el DataFrame, el tipo de dato de cada columna (`int64`, `object`, `bool`, etc.) y si hay valores nulos, todo en un solo vistazo.

### Estadísticas con describe

```python
print(productos.describe())
```

`describe()` calcula automáticamente el promedio, el mínimo, el máximo y otros percentiles de las columnas numéricas, como `precio` y `stock`. Es la forma más rápida de detectar valores fuera de rango, por ejemplo un precio negativo o un stock absurdamente alto.

### Valores únicos y conteos

Para columnas de texto o categorías, `value_counts()` es una herramienta clave.

```python
print(productos["categoria"].unique())
print(productos["categoria"].value_counts())
```

`unique()` lista los valores distintos que aparecen en la columna, mientras que `value_counts()` además te dice cuántas veces aparece cada uno. Esto es útil para saber, por ejemplo, si una categoría está sobrerrepresentada antes de usar los datos en un modelo.

## Errores comunes

- **Asumir que todas las columnas numéricas se leyeron como números**: a veces un CSV trae un precio como `"3,200"` con coma, y Pandas lo interpreta como texto. Revisa siempre `info()` para confirmar los tipos.
- **No revisar el tamaño del dataset antes de explorarlo**: usar `head()` en un dataset enorme sin antes ver cuántas filas tiene con `len(df)` o `.shape` puede darte una idea equivocada de qué tan representativa es esa muestra.
- **Ignorar los valores nulos en la salida de info()**: si una columna tiene menos valores "non-null" que el total de filas, hay datos faltantes que deberás tratar más adelante.

## Resumen

- `read_csv` y `read_json` cargan datos externos directamente en un DataFrame.
- `head()` da una vista rápida de las primeras filas.
- `info()` resume tipos de dato y valores no nulos por columna.
- `describe()` calcula estadísticas básicas de las columnas numéricas.
- `unique()` y `value_counts()` ayudan a entender los valores de columnas categóricas.
