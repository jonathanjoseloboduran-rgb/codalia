# Estadística descriptiva

## Introducción

Cuando tienes cien números en frente, tu cerebro no puede procesarlos uno por uno y sacar una conclusión útil. La estadística descriptiva existe justamente para eso: reducir un montón de datos a unos pocos números que cuentan la historia principal. Es el primer paso de cualquier análisis, antes de construir modelos o hacer predicciones.

En esta lección aprenderás a resumir un conjunto de datos con medidas de tendencia central y de dispersión, y a detectar valores raros que podrían distorsionar tus conclusiones. Usarás ejemplos con sueldos y tiempos de entrega, casos muy comunes en el trabajo real con datos.

Dominar estas herramientas te permite responder preguntas como "¿es normal este dato?" o "¿qué tan parejo es este grupo?" sin necesidad de mirar cada fila una por una.

## Conceptos clave

- **Media**: el promedio aritmético; suma todos los valores y divide entre la cantidad de valores.
- **Mediana**: el valor que queda justo en el medio cuando ordenas los datos de menor a mayor.
- **Moda**: el valor que aparece con más frecuencia.
- **Desviación estándar**: qué tan lejos, en promedio, están los datos respecto a la media.
- **Percentil**: el valor por debajo del cual cae un porcentaje determinado de los datos.

## Desarrollo

### Media, mediana y moda: cuándo usar cada una

Imagina los sueldos mensuales (en dólares) de un equipo pequeño:

```python
sueldos = [800, 850, 900, 950, 1000, 12000]

media = sum(sueldos) / len(sueldos)
print(media)  # 2750.0
```

La media da 2750, pero ese número no representa a nadie del equipo: cinco personas ganan entre 800 y 1000, y una gana 12000. La media es sensible a valores extremos. Aquí la mediana es más honesta:

```python
sueldos_ordenados = sorted(sueldos)
n = len(sueldos_ordenados)
mediana = (sueldos_ordenados[n//2 - 1] + sueldos_ordenados[n//2]) / 2
print(mediana)  # 925.0
```

Usa la media cuando los datos son parejos. Usa la mediana cuando hay valores extremos (como ese sueldo de 12000) que podrían engañarte. La moda es útil para datos que no son números, como el color de auto más vendido o el método de pago más usado.

### Varianza y desviación estándar

Estas medidas te dicen qué tan dispersos están los datos alrededor de la media. Con la librería `statistics` es directo:

```python
import statistics

tiempos_entrega = [25, 30, 28, 45, 22, 31, 29]

promedio = statistics.mean(tiempos_entrega)
desviacion = statistics.stdev(tiempos_entrega)

print(f"Promedio: {promedio:.1f} minutos")
print(f"Desviación estándar: {desviacion:.1f} minutos")
```

Una desviación estándar pequeña significa que los tiempos de entrega son consistentes. Una desviación grande indica que a veces la entrega es rápida y otras veces muy lenta, algo que un cliente notará aunque el promedio se vea bien.

### Percentiles y cuartiles

Los percentiles dividen tus datos en partes. El percentil 90 de un examen te dice el puntaje que superó el 90% de los estudiantes:

```python
import numpy as np

notas = [55, 60, 62, 68, 70, 72, 75, 80, 85, 95]

p25 = np.percentile(notas, 25)
p50 = np.percentile(notas, 50)
p90 = np.percentile(notas, 90)

print(f"P25: {p25}, P50 (mediana): {p50}, P90: {p90}")
```

Los cuartiles son los percentiles 25, 50 y 75. Se usan mucho para comparar el rendimiento de un valor contra el resto del grupo, por ejemplo "este estudiante está en el cuartil superior".

### Resumir un dataset con pocos números

Pandas te da un resumen completo con un solo método:

```python
import pandas as pd

datos = pd.Series([800, 850, 900, 950, 1000, 12000])
print(datos.describe())
```

Ese resumen incluye conteo, media, desviación estándar, mínimo, cuartiles y máximo. Es el primer comando que deberías correr al recibir un dataset nuevo.

### Detectar outliers con el rango intercuartílico (IQR)

El IQR es la distancia entre el percentil 75 y el percentil 25. Cualquier valor muy alejado de ese rango es sospechoso de ser un outlier:

```python
q1 = np.percentile(sueldos, 25)
q3 = np.percentile(sueldos, 75)
iqr = q3 - q1

limite_superior = q3 + 1.5 * iqr
limite_inferior = q1 - 1.5 * iqr

outliers = [s for s in sueldos if s > limite_superior or s < limite_inferior]
print(outliers)  # [12000]
```

Este método es estándar en análisis exploratorio y también es la base de los diagramas de caja (boxplots).

## Errores comunes

- **Usar solo la media sin revisar la distribución**: si hay valores extremos, la media miente. Siempre compara media y mediana.
- **Confundir desviación estándar con varianza**: la varianza está en unidades al cuadrado (por ejemplo, dólares al cuadrado), lo que no tiene interpretación intuitiva. La desviación estándar sí, porque vuelve a las unidades originales.
- **Ignorar el tamaño de la muestra**: calcular estadísticas sobre 3 o 4 datos puede dar resultados que parecen sólidos pero son puro ruido. Ten cautela con muestras pequeñas.

## Resumen

- La media es sensible a outliers; la mediana no.
- La desviación estándar mide qué tan dispersos están los datos.
- Los percentiles y cuartiles ubican un valor dentro del conjunto completo.
- `describe()` de pandas resume un dataset en segundos.
- El método IQR es una forma simple y efectiva de detectar outliers.
