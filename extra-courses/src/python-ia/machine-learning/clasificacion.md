# Clasificación: predecir categorías

## Introducción

La clasificación es la otra gran familia de machine learning supervisado, y la usas cuando la respuesta que quieres predecir es una categoría, no un número. ¿Este correo es spam o no es spam? ¿Este cliente va a cancelar su suscripción o se va a quedar? ¿Esta imagen es un gato, un perro o un pájaro? Todos estos son problemas de clasificación.

Cuando solo hay dos categorías posibles, como spam o no spam, se llama **clasificación binaria**. Cuando hay tres o más, como clasificar un correo en "urgente", "normal" o "promocional", se llama **clasificación multiclase**. La buena noticia es que en scikit-learn el código para entrenar ambos tipos es prácticamente idéntico.

En esta lección conocerás dos algoritmos muy usados para clasificación: la **regresión logística**, que a pesar del nombre se usa para clasificar, y los **árboles de decisión**, que aprenden reglas de tipo "si esto, entonces aquello" a partir de los datos. También verás cómo pedirle al modelo no solo una categoría, sino qué tan seguro está de su respuesta.

## Conceptos clave

- **Clasificación binaria**: predicción entre exactamente dos categorías (por ejemplo, 0 y 1).
- **Clasificación multiclase**: predicción entre tres o más categorías posibles.
- **Regresión logística**: modelo que estima la probabilidad de pertenecer a una categoría.
- **Árbol de decisión**: modelo que aprende una secuencia de preguntas para llegar a una categoría.
- **predict_proba**: método que devuelve la probabilidad de cada categoría, en lugar de solo la categoría más probable.

## Desarrollo

### Clasificación binaria con regresión logística

Imagina que quieres predecir si un cliente cancelará su suscripción (1) o no (0), según sus meses de antigüedad.

```python
from sklearn.linear_model import LogisticRegression

# Feature: meses de antigüedad. Label: 1 = cancela, 0 = se queda
antiguedad = [[1], [2], [3], [6], [9], [12], [18], [24]]
cancela = [1, 1, 1, 0, 0, 0, 0, 0]

modelo = LogisticRegression()
modelo.fit(antiguedad, cancela)

nuevo_cliente = [[4]]
prediccion = modelo.predict(nuevo_cliente)
print(prediccion)  # 0 o 1
```

A diferencia de la regresión lineal, aquí el modelo no predice un número cualquiera: internamente calcula una probabilidad y la convierte en 0 o 1 según un umbral.

### Ver las probabilidades con predict_proba

A veces conocer solo la categoría no es suficiente; quieres saber qué tan segura está la predicción.

```python
probabilidades = modelo.predict_proba(nuevo_cliente)
print(probabilidades)
# Ejemplo de salida: [[0.35, 0.65]]
# Primera columna: probabilidad de clase 0 (se queda)
# Segunda columna: probabilidad de clase 1 (cancela)
```

Esto es muy útil en la práctica: un cliente con 51% de probabilidad de cancelar es un caso mucho más incierto que uno con 95%, aunque ambos se clasifiquen como "cancela".

### Árboles de decisión

Un árbol de decisión aprende reglas explícitas, como "si estudió menos de 3 horas, reprueba; si estudió más, revisa otra condición". Son fáciles de interpretar porque puedes seguir el camino de decisiones paso a paso.

```python
from sklearn.tree import DecisionTreeClassifier

# Features: horas de estudio, horas de sueño la noche anterior
X = [
    [1, 4], [2, 5], [3, 6], [5, 7],
    [6, 8], [8, 7], [9, 8], [10, 6],
]
# Label: 0 = reprueba, 1 = aprueba
y = [0, 0, 0, 1, 1, 1, 1, 1]

arbol = DecisionTreeClassifier(max_depth=3)
arbol.fit(X, y)

estudiante_nuevo = [[4, 6]]
print(arbol.predict(estudiante_nuevo))
```

El parámetro `max_depth` limita cuántas preguntas puede hacer el árbol antes de decidir. Un árbol muy profundo puede memorizar los datos de entrenamiento en vez de aprender un patrón general.

### Clasificación multiclase

El mismo código funciona sin cambios cuando hay más de dos categorías; solo cambia el contenido de `y`.

```python
from sklearn.tree import DecisionTreeClassifier

# Feature: monto de la compra en dólares
X = [[5], [15], [30], [60], [90], [150], [300]]

# Label: categoría del cliente según su compra
categoria = [
    "bajo", "bajo", "medio",
    "medio", "alto", "alto", "alto",
]

modelo = DecisionTreeClassifier()
modelo.fit(X, categoria)

print(modelo.predict([[45]]))
print(modelo.predict([[250]]))
```

Scikit-learn detecta automáticamente que hay tres categorías y ajusta el modelo para elegir entre ellas.

### Ejemplo completo: detección de spam simplificada

```python
from sklearn.linear_model import LogisticRegression

# Features: cantidad de links, cantidad de palabras en mayúsculas
correos = [
    [0, 1], [1, 2], [5, 10], [6, 15],
    [0, 0], [1, 1], [7, 20], [8, 18],
]
# Label: 1 = spam, 0 = no spam
es_spam = [0, 0, 1, 1, 0, 0, 1, 1]

modelo = LogisticRegression()
modelo.fit(correos, es_spam)

correo_nuevo = [[4, 9]]
print("Predicción:", modelo.predict(correo_nuevo))
print("Probabilidades:", modelo.predict_proba(correo_nuevo))
```

## Errores comunes

- **Confundir predict con predict_proba**: `predict` da la clase final; `predict_proba` da probabilidades. Si necesitas medir confianza o definir tus propios umbrales, usa `predict_proba`.
- **Dejar el árbol de decisión sin límite de profundidad**: sin `max_depth`, el árbol puede volverse extremadamente específico a los datos de entrenamiento y fallar con datos nuevos.
- **Usar clasificación cuando el problema es de regresión**: si la respuesta es un número continuo, como el precio exacto de algo, clasificación no es la herramienta correcta; usa regresión.

## Resumen

- La clasificación predice categorías: binarias (dos opciones) o multiclase (tres o más).
- La regresión logística estima probabilidades y las convierte en una categoría.
- Los árboles de decisión aprenden reglas de tipo pregunta-respuesta, fáciles de interpretar.
- `predict_proba` muestra qué tan segura está la predicción, no solo el resultado final.
- El mismo patrón `fit` / `predict` de scikit-learn aplica igual en clasificación que en regresión.
