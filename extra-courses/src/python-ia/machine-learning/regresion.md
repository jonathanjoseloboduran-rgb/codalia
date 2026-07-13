# Regresión: predecir números

## Introducción

La regresión es la técnica de machine learning que usas cuando quieres predecir un número, no una categoría. Precio de una casa, temperatura de mañana, ventas del próximo mes: todos son problemas de regresión, porque la respuesta es un valor continuo que puede tomar cualquier magnitud dentro de un rango.

La forma más simple e intuitiva es la **regresión lineal**: asume que existe una relación aproximadamente recta entre las features y el label. Si el tamaño de una casa aumenta, el precio tiende a aumentar de forma proporcional. Aunque el mundo real casi nunca es perfectamente lineal, este modelo es un excelente punto de partida porque es rápido, fácil de interpretar y funciona sorprendentemente bien en muchos casos prácticos.

En esta lección entrenarás tu primer modelo de regresión con scikit-learn, aprenderás a leer sus coeficientes para entender qué aprendió, y usarás una métrica de error para saber qué tan buenas son sus predicciones.

## Conceptos clave

- **Regresión lineal**: modelo que ajusta una línea (o hiperplano) que mejor se aproxima a los datos.
- **Coeficiente**: número que indica cuánto cambia la predicción por cada unidad que cambia una feature.
- **Intercepto**: valor base de la predicción cuando todas las features son cero.
- **Error cuadrático medio (MSE)**: promedio de los errores al cuadrado entre lo predicho y lo real; mide qué tan lejos está el modelo de la respuesta correcta.
- **fit / predict**: métodos estándar de scikit-learn para entrenar y predecir con cualquier modelo.

## Desarrollo

### Preparar datos sintéticos

Antes de nada, creamos datos de ejemplo: metros cuadrados y precio de venta de casas.

```python
# Datos sintéticos: metros cuadrados y precio en dólares
metros = [[40], [55], [70], [85], [100], [120], [150]]
precios = [45000, 62000, 78000, 95000, 115000, 138000, 170000]
```

Aquí `metros` es la única feature (por eso cada elemento es una lista de un solo número) y `precios` es el label que queremos predecir.

### Entrenar con fit

Scikit-learn separa claramente la creación del modelo del entrenamiento. Primero se crea el objeto, luego se llama a `fit` con los datos.

```python
from sklearn.linear_model import LinearRegression

modelo = LinearRegression()
modelo.fit(metros, precios)

print("Entrenamiento completo")
```

Durante `fit`, el modelo calcula la línea recta que mejor se ajusta a los puntos, minimizando el error entre sus predicciones y los precios reales.

### Predecir con predict

Una vez entrenado, puedes pedirle predicciones para casas nuevas que nunca vio.

```python
casas_nuevas = [[60], [110], [200]]
predicciones = modelo.predict(casas_nuevas)

for metros_casa, precio_estimado in zip(casas_nuevas, predicciones):
    print(f"{metros_casa[0]} m2 -> ${precio_estimado:,.0f}")
```

Nota que `casas_nuevas` sigue el mismo formato que `metros`: una lista de listas, porque scikit-learn siempre espera una tabla de features, aunque tenga una sola columna.

### Interpretar los coeficientes

El modelo aprendió dos números clave: el coeficiente y el intercepto.

```python
print("Coeficiente:", modelo.coef_[0])
print("Intercepto:", modelo.intercept_)
```

El coeficiente indica cuánto sube el precio por cada metro cuadrado adicional. Si el coeficiente es 950, significa que cada metro extra suma aproximadamente 950 dólares al precio estimado. El intercepto es el precio base cuando los metros son cero, un valor que rara vez tiene sentido literal, pero que ajusta matemáticamente la recta.

### Medir el error con MSE

Para saber qué tan bien predice el modelo, comparamos sus predicciones contra los valores reales usando el error cuadrático medio.

```python
from sklearn.metrics import mean_squared_error

predicciones_entrenamiento = modelo.predict(metros)
error = mean_squared_error(precios, predicciones_entrenamiento)

print(f"Error cuadrático medio: {error:,.0f}")
```

El MSE eleva cada error al cuadrado antes de promediarlo, lo que penaliza más fuerte los errores grandes. Un valor de MSE es difícil de interpretar solo, pero es muy útil para comparar dos modelos entre sí: el que tenga menor MSE predice mejor.

### Ejemplo completo

```python
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

# Datos: años de experiencia y salario mensual
experiencia = [[1], [2], [3], [5], [7], [10]]
salario = [500, 650, 800, 1100, 1450, 1900]

modelo = LinearRegression()
modelo.fit(experiencia, salario)

nueva_prediccion = modelo.predict([[4]])
print(f"Salario estimado con 4 años: ${nueva_prediccion[0]:,.0f}")

error = mean_squared_error(salario, modelo.predict(experiencia))
print(f"Error del modelo: {error:,.2f}")
```

## Errores comunes

- **Pasar una lista plana en vez de lista de listas**: `modelo.fit([40, 55, 70], precios)` falla porque scikit-learn espera una tabla de features, aunque sea de una sola columna. Usa `[[40], [55], [70]]`.
- **Confiar en un modelo entrenado con muy pocos datos**: con cinco o seis puntos la línea puede ajustarse bien a esos ejemplos, pero fallar mucho en casos nuevos. Cuantos más datos representativos, más confiable el modelo.
- **Ignorar el error y confiar ciegamente en las predicciones**: siempre calcula una métrica como el MSE antes de usar el modelo en decisiones reales.

## Resumen

- La regresión predice números continuos, como precios o salarios.
- La regresión lineal busca la recta que mejor se ajusta a los datos.
- Se entrena con `fit(X, y)` y se predice con `predict(X_nuevo)`.
- El coeficiente indica el impacto de cada feature; el intercepto es el valor base.
- El error cuadrático medio (MSE) mide qué tan lejos están las predicciones de los valores reales.
