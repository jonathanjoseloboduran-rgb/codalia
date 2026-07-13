# ¿Qué es Machine Learning?

## Introducción

Machine learning es la rama de la inteligencia artificial que le enseña a una computadora a reconocer patrones en datos, en lugar de programarle reglas explícitas para cada situación. En vez de escribir manualmente todas las condiciones para detectar spam o predecir el precio de una casa, le muestras al modelo miles de ejemplos y él aprende la relación por su cuenta.

Esto importa en la práctica porque muchos problemas del mundo real son demasiado complejos para reglas fijas. El comportamiento de un cliente, el precio de una vivienda o el contenido de un correo dependen de tantas variables que escribir un "si esto entonces aquello" para cada caso sería imposible de mantener. El machine learning resuelve esto dejando que el patrón emerja de los datos.

En este curso usarás **scikit-learn**, una librería de Python que ofrece implementaciones listas para usar de los algoritmos más comunes de machine learning. No necesitas programar las matemáticas desde cero: scikit-learn te da una interfaz simple y consistente para entrenar modelos, evaluarlos y usarlos en predicciones nuevas.

## Conceptos clave

- **Modelo**: programa que aprende una relación entre datos de entrada y salida a partir de ejemplos.
- **Aprendizaje supervisado**: el modelo aprende con ejemplos que ya tienen la respuesta correcta (label) incluida.
- **Aprendizaje no supervisado**: el modelo busca patrones o agrupaciones en datos que no tienen respuesta correcta conocida.
- **Feature**: cada característica o variable de entrada que describe un ejemplo, como el tamaño de una casa o la edad de un cliente.
- **Label**: la respuesta o valor que el modelo intenta predecir, como el precio de la casa o si el cliente cancelará.

## Desarrollo

### Supervisado vs no supervisado

En el aprendizaje supervisado le das al modelo pares de entrada y salida. Por ejemplo, historiales de casas con su tamaño, ubicación y precio de venta real. El modelo aprende a mapear características a un resultado conocido.

```python
# Ejemplo conceptual de datos supervisados
casas = [
    {"metros": 50, "habitaciones": 2, "precio": 80000},
    {"metros": 90, "habitaciones": 3, "precio": 140000},
    {"metros": 120, "habitaciones": 4, "precio": 190000},
]
# "precio" es el label que queremos predecir
```

En el aprendizaje no supervisado no hay respuesta correcta. El modelo solo recibe las características y busca estructura, como agrupar clientes con comportamientos parecidos.

```python
clientes = [
    {"compras_mes": 1, "gasto_promedio": 15},
    {"compras_mes": 8, "gasto_promedio": 200},
    {"compras_mes": 2, "gasto_promedio": 18},
]
# No hay "categoria" dada; el algoritmo debe descubrir grupos
```

### Features y labels en código

Con scikit-learn, las features suelen ser una lista de listas (o un array), y el label una lista aparte.

```python
# Features: [metros, habitaciones]
X = [
    [50, 2],
    [90, 3],
    [120, 4],
]

# Labels: precio de cada casa
y = [80000, 140000, 190000]
```

Esta separación entre `X` (mayúscula, por convención, porque son varias columnas) y `y` (minúscula, porque es una sola respuesta) se repite en casi todo el código de scikit-learn.

### El flujo típico de un proyecto de ML

Un proyecto de machine learning supervisado sigue casi siempre los mismos pasos:

```python
# 1. Preparar los datos (features X, labels y)
X = [[50, 2], [90, 3], [120, 4]]
y = [80000, 140000, 190000]

# 2. Elegir un modelo
from sklearn.linear_model import LinearRegression
modelo = LinearRegression()

# 3. Entrenar el modelo con los datos
modelo.fit(X, y)

# 4. Usar el modelo para predecir casos nuevos
casa_nueva = [[75, 3]]
prediccion = modelo.predict(casa_nueva)
print(prediccion)
```

Este patrón — preparar datos, elegir modelo, entrenar con `fit`, predecir con `predict` — es el esqueleto que verás en casi todos los algoritmos de scikit-learn, sin importar qué tan complejo sea el modelo por dentro.

### Dónde encaja scikit-learn

Scikit-learn no reemplaza tu criterio: tú decides qué features usar, qué algoritmo probar y cómo interpretar los resultados. La librería se encarga de la parte matemática pesada, para que puedas enfocarte en entender el problema y los datos.

```python
from sklearn.linear_model import LogisticRegression

# Ejemplo: predecir si un estudiante aprueba (1) o reprueba (0)
X = [[2], [5], [8], [9]]   # horas de estudio
y = [0, 0, 1, 1]           # 0 = reprueba, 1 = aprueba

modelo = LogisticRegression()
modelo.fit(X, y)
print(modelo.predict([[6]]))
```

## Errores comunes

- **Confundir features con labels**: si mezclas la respuesta dentro de las variables de entrada, el modelo "hace trampa" aprendiendo algo que no debería usar. Verifica siempre que `y` esté separado de `X`.
- **Esperar magia sin datos suficientes**: con dos o tres ejemplos el modelo no puede aprender un patrón confiable. Machine learning necesita cantidad y variedad de ejemplos representativos.
- **Pensar que todo problema es de machine learning**: si una regla simple ya resuelve el problema (como "si el monto es mayor a mil, pedir aprobación"), no hace falta entrenar un modelo.

## Resumen

- Machine learning aprende patrones a partir de datos en vez de reglas escritas a mano.
- El aprendizaje supervisado usa ejemplos con respuesta conocida (label); el no supervisado busca estructura sin respuestas dadas.
- Las features son las variables de entrada (`X`) y el label es lo que se predice (`y`).
- El flujo típico es: preparar datos, elegir modelo, entrenar con `fit`, predecir con `predict`.
- Scikit-learn ofrece esa interfaz simple para aplicar algoritmos de ML sin programar las matemáticas desde cero.
