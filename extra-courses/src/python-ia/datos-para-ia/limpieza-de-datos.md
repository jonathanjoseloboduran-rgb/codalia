# Limpieza de datos

## Introducción

Los datos del mundo real casi nunca llegan perfectos. Faltan valores, hay filas duplicadas, los tipos de dato están mal interpretados o los nombres de columna son inconsistentes. Si entrenas un modelo de IA con datos sucios, el resultado será un modelo poco confiable, sin importar qué tan sofisticado sea el algoritmo.

La limpieza de datos es, en muchos proyectos, la etapa que más tiempo consume, pero también la que más impacto tiene en la calidad final. Pandas ofrece un conjunto de herramientas pensado justamente para detectar y corregir estos problemas de forma sistemática, en lugar de revisar fila por fila a mano.

En esta lección aprenderás a identificar valores faltantes, decidir cómo tratarlos, eliminar duplicados, corregir tipos de dato y dejar tus columnas con nombres claros y consistentes. Son pasos que aplicarás en prácticamente cualquier dataset antes de usarlo en un modelo.

## Conceptos clave

- **isna()**: detecta qué valores son nulos o faltantes en el DataFrame.
- **fillna()**: rellena valores faltantes con un valor definido.
- **dropna()**: elimina filas o columnas que contienen valores faltantes.
- **duplicated() / drop_duplicates()**: detectan y eliminan filas repetidas.
- **astype()**: convierte una columna a otro tipo de dato.

## Desarrollo

### Detectando valores faltantes

```python
import pandas as pd
import numpy as np

pedidos = pd.DataFrame({
    "cliente": ["Ana", "Luis", "Marta", "Pedro", "Sofía"],
    "monto": [120.5, np.nan, 89.0, 340.2, np.nan],
    "metodo_pago": ["tarjeta", "efectivo", None, "tarjeta", "tarjeta"]
})

print(pedidos.isna())
print(pedidos.isna().sum())
```

`isna()` devuelve un DataFrame de valores booleanos (`True` donde falta el dato). Sumarlo con `.sum()` te da un conteo rápido de cuántos valores faltan por columna, algo que deberías revisar siempre al inicio.

### Rellenando valores con fillna

```python
pedidos["monto"] = pedidos["monto"].fillna(pedidos["monto"].mean())
pedidos["metodo_pago"] = pedidos["metodo_pago"].fillna("desconocido")

print(pedidos)
```

Para la columna numérica `monto`, rellenamos con el promedio de los valores existentes, una estrategia común cuando no quieres perder filas. Para `metodo_pago`, que es categórica, rellenamos con una etiqueta explícita como `"desconocido"`.

### Eliminando filas con dropna

A veces es mejor descartar filas incompletas en lugar de inventar valores, sobre todo si son pocas.

```python
encuestas = pd.DataFrame({
    "usuario": ["u1", "u2", "u3", "u4"],
    "respuesta": ["si", None, "no", "si"]
})

encuestas_limpias = encuestas.dropna(subset=["respuesta"])
print(encuestas_limpias)
```

Usar `subset` te permite eliminar filas solo cuando falta el dato en una columna específica, en lugar de descartar una fila por cualquier valor nulo en cualquier columna.

### Duplicados

```python
clientes = pd.DataFrame({
    "nombre": ["Ana", "Luis", "Ana", "Marta"],
    "correo": ["ana@mail.com", "luis@mail.com", "ana@mail.com", "marta@mail.com"]
})

print(clientes.duplicated())
clientes_sin_duplicados = clientes.drop_duplicates()
print(clientes_sin_duplicados)
```

`duplicated()` marca como `True` las filas que son copia exacta de una anterior. `drop_duplicates()` las elimina, quedándose por defecto con la primera aparición.

### Corrigiendo tipos y renombrando columnas

```python
ventas = pd.DataFrame({
    "Fecha ": ["2025-01-10", "2025-01-11"],
    "Monto Total": ["150", "230"]
})

ventas = ventas.rename(columns={"Fecha ": "fecha", "Monto Total": "monto_total"})
ventas["fecha"] = pd.to_datetime(ventas["fecha"])
ventas["monto_total"] = ventas["monto_total"].astype(float)

ventas.info()
```

Aquí corregimos dos problemas típicos: nombres de columna con espacios o mayúsculas inconsistentes, y una columna numérica que llegó como texto. `astype(float)` la convierte a número, y `pd.to_datetime()` convierte texto a fechas reales.

### Filtrando filas inválidas

```python
sensores = pd.DataFrame({
    "sensor_id": ["s1", "s2", "s3", "s4"],
    "temperatura": [22.5, -999, 21.0, 150.0]
})

sensores_validos = sensores[(sensores["temperatura"] > -50) & (sensores["temperatura"] < 60)]
print(sensores_validos)
```

Valores como `-999` o `150` son claramente errores de sensor, no temperaturas reales. Filtrar por un rango razonable evita que esos valores dañen un análisis o un modelo posterior.

## Errores comunes

- **Rellenar valores faltantes sin pensar en el contexto**: usar siempre el promedio o siempre cero puede introducir sesgos. Considera qué estrategia tiene sentido para cada columna.
- **Olvidar que fillna y dropna no modifican el DataFrame original por defecto**: si no reasignas el resultado (`df = df.fillna(...)`) o usas `inplace=True`, los cambios se pierden.
- **Confundir duplicated() con drop_duplicates()**: el primero solo marca, no elimina nada por sí solo. Muchos principiantes esperan que `duplicated()` limpie el DataFrame.

## Resumen

- `isna()` detecta valores faltantes; `fillna()` y `dropna()` los tratan de forma distinta.
- `duplicated()` marca filas repetidas y `drop_duplicates()` las elimina.
- `astype()` corrige el tipo de una columna; `pd.to_datetime()` convierte texto a fechas.
- `rename(columns={...})` deja los nombres de columna claros y consistentes.
- Filtrar filas con condiciones lógicas ayuda a descartar datos claramente inválidos.
