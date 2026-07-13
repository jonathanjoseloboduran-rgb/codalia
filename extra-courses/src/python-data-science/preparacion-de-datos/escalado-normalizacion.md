# Escalado y normalización

## Introducción

Imagina un conjunto de datos con la edad de una persona (entre 18 y 80) y su ingreso mensual (entre 500 y 20000). Aunque ambas variables son relevantes, el ingreso tiene una escala mucho más grande. Muchos algoritmos, especialmente los que calculan distancias entre puntos, terminarán dándole casi todo el peso al ingreso simplemente porque sus números son más grandes, sin que eso refleje su verdadera importancia.

Este problema se resuelve escalando las variables numéricas para que todas queden en rangos comparables. No es un paso cosmético: algoritmos como KNN, K-means, regresión logística con regularización o redes neuronales son sensibles a la escala, mientras que otros, como los árboles de decisión, no lo son. Saber cuándo escalar y cómo hacerlo correctamente es parte esencial de la preparación de datos.

En esta lección verás dos técnicas de escalado, cómo implementarlas con pandas y scikit-learn, y un error crítico que muchos principiantes cometen: dejar que información del conjunto de prueba se filtre al conjunto de entrenamiento durante el escalado.

## Conceptos clave

- **Escalado**: proceso de transformar variables numéricas para que tengan rangos o distribuciones comparables.
- **Min-max scaling**: transforma los valores a un rango fijo, normalmente entre 0 y 1.
- **Estandarización (z-score)**: transforma los valores para que tengan media 0 y desviación estándar 1.
- **Algoritmo sensible a la escala**: modelo cuyo resultado cambia según la magnitud de las variables, como KNN o K-means.
- **Fuga de datos (data leakage)**: cuando información del conjunto de prueba influye indebidamente en el entrenamiento.

## Desarrollo

### Por qué importa la escala

```python
import pandas as pd

clientes = pd.DataFrame({
    "edad": [22, 35, 48, 60, 29],
    "ingreso_mensual": [900, 3200, 15000, 20000, 1100]
})

print(clientes.describe())
```

Si calculas la distancia entre dos clientes usando estas columnas tal cual, la diferencia de ingreso (miles de unidades) dominará completamente sobre la diferencia de edad (decenas de unidades), aunque ambas variables puedan ser igual de relevantes para el análisis.

### Min-max scaling con pandas

Esta técnica lleva cada valor a un rango entre 0 y 1, conservando la forma de la distribución original.

```python
clientes_minmax = clientes.copy()

for columna in ["edad", "ingreso_mensual"]:
    minimo = clientes_minmax[columna].min()
    maximo = clientes_minmax[columna].max()
    clientes_minmax[columna] = (clientes_minmax[columna] - minimo) / (maximo - minimo)

print(clientes_minmax)
```

Después de esta transformación, tanto la edad como el ingreso quedan entre 0 y 1, así que ninguna columna domina por su magnitud original.

### Estandarización (z-score) con pandas

La estandarización centra los datos en una media de 0 con una desviación estándar de 1, útil cuando la variable tiene una distribución aproximadamente normal.

```python
clientes_estandarizado = clientes.copy()

for columna in ["edad", "ingreso_mensual"]:
    media = clientes_estandarizado[columna].mean()
    desviacion = clientes_estandarizado[columna].std()
    clientes_estandarizado[columna] = (clientes_estandarizado[columna] - media) / desviacion

print(clientes_estandarizado)
```

A diferencia del min-max, la estandarización no tiene un rango fijo; permite valores negativos y es menos sensible a un único outlier extremo.

### Escalado con scikit-learn

En la práctica, scikit-learn ofrece clases listas para esto, que además facilitan aplicar la misma transformación a datos nuevos.

```python
from sklearn.preprocessing import MinMaxScaler, StandardScaler

escalador_minmax = MinMaxScaler()
clientes[["edad_mm", "ingreso_mm"]] = escalador_minmax.fit_transform(
    clientes[["edad", "ingreso_mensual"]]
)

escalador_estandar = StandardScaler()
clientes[["edad_z", "ingreso_z"]] = escalador_estandar.fit_transform(
    clientes[["edad", "ingreso_mensual"]]
)

print(clientes)
```

### No filtrar información del test al train

Este es el error más delicado del escalado. El escalador debe "aprender" sus parámetros (mínimo, máximo, media, desviación) únicamente del conjunto de entrenamiento.

```python
from sklearn.model_selection import train_test_split

entrenamiento, prueba = train_test_split(clientes, test_size=0.4, random_state=42)

escalador = StandardScaler()

# Correcto: fit solo con entrenamiento, transform en ambos conjuntos
escalador.fit(entrenamiento[["edad", "ingreso_mensual"]])

entrenamiento_escalado = escalador.transform(entrenamiento[["edad", "ingreso_mensual"]])
prueba_escalada = escalador.transform(prueba[["edad", "ingreso_mensual"]])
```

Si en cambio usas `fit_transform` sobre todo el conjunto de datos antes de dividirlo, el escalador ya "vio" la media y la desviación del conjunto de prueba, lo que infla artificialmente el rendimiento del modelo al evaluarlo.

## Errores comunes

- **Aplicar `fit_transform` antes de dividir en train y test**: provoca fuga de datos y resultados de evaluación poco confiables.
- **Escalar variables categóricas o binarias sin necesidad**: el escalado es para variables numéricas continuas; escalar una columna de 0 y 1 rara vez aporta algo.
- **Olvidar aplicar el mismo escalador a datos nuevos en producción**: si entrenaste con datos escalados, cualquier dato nuevo debe pasar por el mismo escalador ya ajustado, no por uno nuevo.

## Resumen

- El escalado iguala los rangos de las variables numéricas para que ningún algoritmo las pondere de forma injusta por su magnitud.
- Min-max lleva los valores a un rango fijo (0 a 1); estandarización centra en media 0 y desviación 1.
- scikit-learn ofrece `MinMaxScaler` y `StandardScaler` para aplicar estas técnicas de forma reproducible.
- El escalador debe ajustarse (`fit`) solo con datos de entrenamiento y luego aplicarse (`transform`) a entrenamiento y prueba.
- No respetar esta separación provoca fuga de datos y métricas de evaluación poco realistas.
