# Evaluación de modelos

## Introducción

Entrenar un modelo es solo la mitad del trabajo. La otra mitad, igual de importante, es saber si realmente aprendió algo útil o si simplemente memorizó los ejemplos que le mostraste. Un modelo que predice perfecto los datos con los que fue entrenado, pero falla con datos nuevos, no sirve en la práctica: en producción siempre vas a recibir casos que el modelo nunca vio.

Por eso, en todo proyecto serio de machine learning se separan los datos en un conjunto de entrenamiento y otro de prueba. El modelo aprende solo del primero, y se evalúa con el segundo, simulando cómo se comportaría con información nueva. A partir de esa evaluación se usan métricas concretas para decidir si el modelo es útil.

En esta lección aprenderás a dividir tus datos correctamente, a calcular métricas más allá del simple "porcentaje de aciertos", y a reconocer cuándo un modelo está sobreajustado o subajustado.

## Conceptos clave

- **train_test_split**: función que divide los datos en un grupo para entrenar y otro para evaluar.
- **Accuracy**: porcentaje de predicciones correctas; útil pero engañosa cuando las categorías están desbalanceadas.
- **Precisión y recall**: miden errores específicos, como falsos positivos y falsos negativos.
- **Matriz de confusión**: tabla que muestra aciertos y tipos de error de un clasificador.
- **Sobreajuste (overfitting)**: el modelo memoriza los datos de entrenamiento y falla con datos nuevos.

## Desarrollo

### Por qué separar train y test

Si evalúas el modelo con los mismos datos que usaste para entrenarlo, obtienes una imagen demasiado optimista. Es como corregir un examen usando las mismas preguntas que el estudiante ya vio con las respuestas incluidas.

```python
# Datos: horas de estudio y si aprobó (1) o no (0)
horas = [[1], [2], [3], [4], [5], [6], [7], [8], [9], [10]]
aprobo = [0, 0, 0, 0, 1, 1, 1, 1, 1, 1]
```

### Usar train_test_split

Scikit-learn incluye una función lista para dividir los datos de forma aleatoria pero reproducible.

```python
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    horas, aprobo, test_size=0.3, random_state=42
)

print("Entrenamiento:", len(X_train))
print("Prueba:", len(X_test))
```

`test_size=0.3` reserva el 30% de los datos para prueba. `random_state=42` asegura que la división sea siempre la misma cada vez que ejecutas el código, lo cual facilita comparar resultados.

### Accuracy y sus límites

La accuracy es la métrica más simple: cuántas predicciones fueron correctas sobre el total.

```python
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

modelo = LogisticRegression()
modelo.fit(X_train, y_train)

predicciones = modelo.predict(X_test)
exactitud = accuracy_score(y_test, predicciones)
print(f"Accuracy: {exactitud:.2f}")
```

El problema aparece con categorías desbalanceadas. Si el 95% de los correos no son spam, un modelo que siempre predice "no spam" tendrá 95% de accuracy sin haber aprendido nada útil.

### Precisión, recall y F1

Estas métricas separan los tipos de error. La precisión responde: de lo marcado como positivo, ¿cuánto era realmente positivo? El recall responde: de los positivos reales, ¿cuántos detectó el modelo?

```python
from sklearn.metrics import precision_score, recall_score, f1_score

precision = precision_score(y_test, predicciones)
recall = recall_score(y_test, predicciones)
f1 = f1_score(y_test, predicciones)

print(f"Precisión: {precision:.2f}")
print(f"Recall: {recall:.2f}")
print(f"F1: {f1:.2f}")
```

En detección de spam, un recall bajo significa que se te escapan correos spam. Una precisión baja significa que marcas correos normales como spam por error. El F1 combina ambas en un solo número, útil para buscar un balance entre las dos.

### Matriz de confusión

La matriz de confusión muestra en detalle los aciertos y los distintos tipos de error.

```python
from sklearn.metrics import confusion_matrix

matriz = confusion_matrix(y_test, predicciones)
print(matriz)
# [[verdaderos_negativos, falsos_positivos],
#  [falsos_negativos, verdaderos_positivos]]
```

Leer esta tabla te dice dónde falla el modelo: si comete más falsos positivos (predice cancelación cuando el cliente se queda) o más falsos negativos (predice que se queda cuando en realidad cancela).

### Sobreajuste, subajuste y validación cruzada

Un modelo sobreajustado tiene excelente desempeño en entrenamiento pero malo en prueba: memorizó en vez de generalizar. Un modelo subajustado rinde mal en ambos: es demasiado simple para el patrón real.

```python
from sklearn.tree import DecisionTreeClassifier

# Árbol muy profundo: riesgo de sobreajuste
arbol_complejo = DecisionTreeClassifier(max_depth=None)
arbol_complejo.fit(X_train, y_train)

print("Entrenamiento:", arbol_complejo.score(X_train, y_train))
print("Prueba:", arbol_complejo.score(X_test, y_test))
```

Si el puntaje de entrenamiento es mucho más alto que el de prueba, hay sobreajuste. La validación cruzada da una evaluación más confiable, dividiendo los datos en varias partes y rotando cuál se usa para prueba.

```python
from sklearn.model_selection import cross_val_score

modelo = LogisticRegression()
puntajes = cross_val_score(modelo, horas, aprobo, cv=3)

print("Puntajes por división:", puntajes)
print("Promedio:", puntajes.mean())
```

`cv=3` entrena y evalúa el modelo tres veces, usando cada vez una porción distinta como prueba, dando una estimación más estable que una sola división.

## Errores comunes

- **Evaluar con los mismos datos de entrenamiento**: siempre reserva un conjunto de prueba independiente; de lo contrario la evaluación es artificialmente optimista.
- **Confiar solo en accuracy con categorías desbalanceadas**: revisa también precisión, recall y la matriz de confusión antes de concluir que un modelo es bueno.
- **No notar el sobreajuste**: si el desempeño en entrenamiento es mucho mejor que en prueba, el modelo probablemente memorizó en vez de generalizar; considera simplificarlo.

## Resumen

- Separa siempre los datos en entrenamiento y prueba con `train_test_split`.
- La accuracy es útil pero puede engañar con categorías desbalanceadas.
- Precisión, recall y F1 detallan distintos tipos de error del modelo.
- La matriz de confusión muestra exactamente dónde se equivoca el clasificador.
- El sobreajuste ocurre cuando el modelo memoriza; la validación cruzada da una evaluación más confiable.
