# Correlación y relaciones

## Introducción

Una de las preguntas más frecuentes al analizar datos es si dos variables están relacionadas. ¿Los estudiantes que estudian más horas obtienen mejores notas? ¿Las tiendas con más empleados venden más? La correlación es la herramienta que mide qué tan fuerte y en qué dirección se mueven dos variables juntas.

Sin embargo, la correlación es una de las herramientas estadísticas más mal interpretadas. Ver que dos cosas se mueven juntas no significa que una cause la otra, y confundir esto lleva a conclusiones erróneas en reportes, noticias y hasta en decisiones de negocio.

En esta lección aprenderás a calcular correlaciones con pandas, a interpretarlas correctamente y a identificar cuándo una relación puede ser pura coincidencia.

## Conceptos clave

- **Correlación de Pearson**: número entre -1 y 1 que mide la fuerza y dirección de una relación lineal entre dos variables.
- **Correlación positiva**: cuando una variable sube, la otra también tiende a subir.
- **Correlación negativa**: cuando una variable sube, la otra tiende a bajar.
- **Causalidad**: cuando un cambio en una variable realmente provoca un cambio en otra.
- **Correlación espuria**: relación estadística fuerte entre dos variables que no tienen ninguna conexión real.

## Desarrollo

### Correlación de Pearson

El coeficiente de Pearson va de -1 (relación negativa perfecta) a 1 (relación positiva perfecta), pasando por 0 (sin relación lineal):

```python
import numpy as np

horas_estudio = [1, 2, 3, 4, 5, 6, 7, 8]
notas = [50, 55, 60, 65, 70, 78, 85, 90]

correlacion = np.corrcoef(horas_estudio, notas)[0, 1]
print(f"Correlación: {correlacion:.3f}")
```

Un valor cercano a 1 indica que, en este grupo, más horas de estudio están asociadas con notas más altas de forma bastante consistente.

### corr() en pandas

Cuando trabajas con varias variables a la vez, pandas facilita ver todas las correlaciones juntas:

```python
import pandas as pd

datos = pd.DataFrame({
    "horas_estudio": [1, 2, 3, 4, 5, 6, 7, 8],
    "notas": [50, 55, 60, 65, 70, 78, 85, 90],
    "horas_sueño": [8, 7, 8, 6, 7, 5, 6, 6],
})

print(datos.corr())
```

Esta tabla te muestra la correlación entre cada par de columnas. Aquí podrías notar que las horas de sueño tienen correlación negativa con las horas de estudio, algo esperable si los estudiantes sacrifican sueño por estudiar más.

### Correlación no implica causalidad

Este es el punto más importante de la lección. Imagina que encuentras una correlación fuerte entre el número de heladerías abiertas en una ciudad y el número de personas que se ahogan en piscinas:

```python
heladerias = [10, 15, 20, 25, 30, 35]
ahogamientos = [2, 4, 6, 8, 10, 12]

correlacion = np.corrcoef(heladerias, ahogamientos)[0, 1]
print(f"Correlación: {correlacion:.3f}")  # cercana a 1
```

¿Las heladerías causan ahogamientos? No. Ambas variables suben en verano, cuando hace calor. El calor es la verdadera causa detrás de las dos, una **variable oculta** que las conecta sin que exista relación directa entre ellas.

### Correlaciones espurias

Existen relaciones estadísticas fuertes entre variables completamente sin conexión, simplemente por coincidencia numérica:

```python
anio = [2015, 2016, 2017, 2018, 2019, 2020]
consumo_queso = [11.2, 11.5, 11.8, 12.0, 12.3, 12.5]
graduados_ingenieria = [1200, 1250, 1310, 1360, 1420, 1480]

correlacion = np.corrcoef(consumo_queso, graduados_ingenieria)[0, 1]
print(f"Correlación: {correlacion:.3f}")  # muy alta
```

Ambas series simplemente crecen con el tiempo, así que su correlación es alta aunque no tengan ninguna relación lógica. Cuando dos variables solo comparten una tendencia temporal, es fácil obtener correlaciones altas sin ningún significado real.

### Visualizar relaciones

Antes de confiar en un número, siempre es buena idea graficar los datos:

```python
import matplotlib.pyplot as plt

plt.scatter(datos["horas_estudio"], datos["notas"])
plt.xlabel("Horas de estudio")
plt.ylabel("Nota")
plt.title("Relación entre estudio y notas")
plt.show()
```

Un gráfico de dispersión te permite ver si la relación es realmente lineal, si hay un patrón curvo que Pearson no detecta bien, o si un solo punto extremo está inflando la correlación.

## Errores comunes

- **Afirmar causalidad a partir de una correlación**: siempre pregúntate si existe una variable oculta o si la relación es pura coincidencia temporal.
- **No graficar antes de calcular**: Pearson solo detecta relaciones lineales; una relación en forma de curva puede dar una correlación baja aunque exista un patrón claro.
- **Ignorar el tamaño de la muestra**: con pocos datos, es fácil obtener correlaciones altas por azar. Cuantos más datos tengas, más confiable es el resultado.

## Resumen

- La correlación de Pearson mide relaciones lineales entre -1 y 1.
- `DataFrame.corr()` calcula correlaciones entre todas las columnas numéricas a la vez.
- Correlación no es causalidad: siempre busca posibles variables ocultas.
- Las correlaciones espurias son comunes en series que solo comparten una tendencia temporal.
- Graficar los datos ayuda a confirmar o descartar lo que sugiere el número.
