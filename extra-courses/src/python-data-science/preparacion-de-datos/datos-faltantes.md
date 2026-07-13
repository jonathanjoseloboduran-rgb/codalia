# Datos faltantes

## Introducción

Casi ningún conjunto de datos del mundo real llega completo. En una encuesta, algunas personas no responden todas las preguntas. En un sistema de ventas, un campo puede quedar vacío por un error de captura o porque el dato simplemente no aplica. A estos huecos se les llama datos faltantes, y saber tratarlos es una de las habilidades más importantes en la preparación de datos.

Ignorar los datos faltantes puede arruinar un análisis sin que te des cuenta. Muchas funciones de pandas y de bibliotecas de machine learning simplemente fallan o producen resultados incorrectos cuando encuentran valores vacíos. Por eso, antes de calcular promedios, entrenar modelos o generar gráficos, necesitas decidir de forma consciente qué hacer con cada hueco en tus datos.

En esta lección aprenderás a identificar los distintos tipos de datos faltantes, a detectar si siguen algún patrón y a aplicar estrategias como la eliminación o la imputación. También verás cuándo cada estrategia puede introducir sesgos y distorsionar tus conclusiones.

## Conceptos clave

- **Dato faltante**: ausencia de un valor donde debería existir uno, representado en pandas como `NaN` (Not a Number).
- **MCAR (falta completamente al azar)**: la ausencia no tiene relación con ningún otro dato; ocurre por casualidad.
- **MAR (falta al azar condicionado)**: la probabilidad de que falte un valor depende de otra variable observada.
- **Imputación**: técnica de rellenar los valores faltantes con un valor estimado, como la media o la mediana.
- **Eliminación**: quitar filas o columnas que contienen valores faltantes.

## Desarrollo

### Detectando valores faltantes

Antes de decidir qué hacer, necesitas saber cuántos valores faltan y dónde están.

```python
import pandas as pd
import numpy as np

encuesta = pd.DataFrame({
    "edad": [25, np.nan, 34, 29, np.nan, 41],
    "ciudad": ["Bogotá", "Lima", np.nan, "Quito", "Lima", "Bogotá"],
    "ingreso_mensual": [1200, 1500, np.nan, 900, 1100, np.nan]
})

print(encuesta.isna().sum())
```

El método `isna()` marca cada celda como `True` si está vacía. Sumando por columna obtienes un conteo rápido de cuántos datos faltan en cada una.

### Detectando patrones de ausencia

No todos los datos faltantes son iguales. A veces la ausencia está relacionada con otra columna, y eso es información valiosa.

```python
# ¿Falta el ingreso más seguido en ciertas ciudades?
patron = encuesta.groupby("ciudad")["ingreso_mensual"].apply(
    lambda columna: columna.isna().sum()
)
print(patron)
```

Si notas que el ingreso falta casi siempre para una ciudad en particular, probablemente no sea al azar (MAR): tal vez esa sucursal no registra bien el dato. Detectar este tipo de patrón te ayuda a elegir mejor la estrategia de tratamiento.

### Estrategia 1: eliminar filas o columnas

Cuando muy pocos registros tienen huecos, eliminarlos puede ser razonable.

```python
encuesta_sin_nulos = encuesta.dropna()
print(encuesta_sin_nulos)

# Eliminar solo si falta en columnas específicas
encuesta_sin_ingreso_nulo = encuesta.dropna(subset=["ingreso_mensual"])
```

`dropna()` elimina cualquier fila que tenga al menos un valor vacío. Puedes limitar la eliminación a columnas concretas con el parámetro `subset`.

### Estrategia 2: imputar con media, mediana o moda

Cuando eliminar filas te haría perder demasiada información, puedes rellenar los huecos con un valor representativo.

```python
encuesta_imputada = encuesta.copy()

# Media para variables numéricas sin valores extremos
encuesta_imputada["edad"] = encuesta_imputada["edad"].fillna(
    encuesta_imputada["edad"].mean()
)

# Mediana cuando hay valores atípicos que distorsionan la media
encuesta_imputada["ingreso_mensual"] = encuesta_imputada["ingreso_mensual"].fillna(
    encuesta_imputada["ingreso_mensual"].median()
)

# Moda para variables categóricas
encuesta_imputada["ciudad"] = encuesta_imputada["ciudad"].fillna(
    encuesta_imputada["ciudad"].mode()[0]
)

print(encuesta_imputada)
```

La mediana es preferible sobre la media cuando la columna tiene valores extremos, porque la media se ve arrastrada por ellos y ya no representa bien al conjunto.

### Cuándo cada estrategia distorsiona el análisis

Imputar con la media reduce artificialmente la variabilidad de tus datos: todos los valores rellenados son idénticos, así que la dispersión real se esconde. Si el porcentaje de datos faltantes es alto, esto puede hacer que un modelo subestime la variación real del fenómeno.

Eliminar filas, por su parte, es peligroso si los datos no faltan al azar. Si eliminas todas las filas donde falta el ingreso y resulta que ese hueco está concentrado en una ciudad, terminas eliminando esa ciudad casi por completo del análisis, introduciendo un sesgo silencioso.

## Errores comunes

- **Imputar sin revisar el porcentaje de faltantes**: si una columna tiene más del 40 o 50 % de valores vacíos, imputarla puede inventar más información de la que realmente tienes. En esos casos, evalúa si conviene descartar la columna completa.
- **Usar la media en columnas con outliers**: la media es sensible a valores extremos. Revisa siempre la distribución antes de elegir entre media y mediana.
- **Confundir "0" o cadena vacía con dato faltante real**: a veces el cero es un valor válido (por ejemplo, cero ventas) y no debe tratarse como si faltara el dato.

## Resumen

- Los datos faltantes se detectan con `isna()` y se cuentan por columna.
- Antes de tratarlos, conviene buscar patrones de ausencia relacionados con otras variables.
- `dropna()` elimina filas o columnas con huecos; útil cuando son pocos registros.
- `fillna()` con media, mediana o moda imputa valores; la mediana es más robusta ante outliers.
- Toda estrategia puede introducir sesgo si no se aplica con criterio y conocimiento del contexto.
