# Frameworks de deep learning

## Introducción

Hasta ahora construiste una neurona y un perceptrón usando solo Python y NumPy, entendiendo cada paso del cálculo. En la práctica profesional, sin embargo, nadie programa redes neuronales grandes desde cero: se usan frameworks especializados que automatizan el forward pass, el cálculo de gradientes y la actualización de pesos.

En esta lección vas a conocer el panorama de las dos herramientas más usadas en la industria: PyTorch y TensorFlow con su interfaz Keras. Vas a entender qué problema resuelve cada framework y cómo se estructura conceptualmente un entrenamiento típico.

Cerrarás la lección con un criterio práctico: cuándo tiene sentido usar deep learning y cuándo es mejor optar por técnicas de machine learning más simples.

## Conceptos clave

- **Framework de deep learning**: librería que facilita construir, entrenar y evaluar redes neuronales.
- **PyTorch**: framework flexible, popular en investigación y cada vez más en producción.
- **TensorFlow / Keras**: framework robusto orientado a producción, con Keras como interfaz de alto nivel.
- **Diferenciación automática**: cálculo automático de gradientes, sin que el programador escriba las derivadas.
- **Machine learning clásico**: técnicas como árboles de decisión o regresión, útiles cuando el deep learning es innecesario.

## Desarrollo

### Qué resuelven los frameworks por ti

Cuando programaste el perceptrón, tuviste que escribir manualmente la regla de actualización de pesos. En una red con decenas de capas y millones de parámetros, hacer esto a mano sería impracticable. Los frameworks resuelven tres problemas: calcular gradientes automáticamente, aprovechar el hardware disponible y ofrecer piezas ya construidas, como capas y funciones de pérdida.

```python
# Así se ve conceptualmente crear una capa en un framework de alto nivel
# (pseudocódigo ilustrativo, no ejecutable sin instalar la librería)

modelo = "Secuencial"
capas = [
    "Densa(unidades=16, activacion='relu')",
    "Densa(unidades=8, activacion='relu')",
    "Densa(unidades=1, activacion='sigmoide')",
]
print(modelo, capas)
```

Con una sola línea por capa defines lo que antes te tomó varias funciones manuales.

### PyTorch: flexibilidad para experimentar

PyTorch se hizo popular porque permite construir y modificar redes de forma muy directa, casi como escribir Python normal. Es la opción favorita en investigación porque facilita probar arquitecturas nuevas y depurar el comportamiento capa por capa.

```python
# Pseudocódigo que ilustra la estructura típica de un modelo en PyTorch
class RedSimple:
    def __init__(self):
        self.capa_1 = "Linear(entradas=10, salidas=16)"
        self.capa_2 = "Linear(entradas=16, salidas=1)"

    def forward(self, x):
        x = "relu(self.capa_1(x))"
        x = "sigmoide(self.capa_2(x))"
        return x
```

Aunque este es solo un esquema, refleja cómo PyTorch organiza los modelos: como clases de Python con un método `forward` explícito.

### TensorFlow y Keras: orientado a producción

TensorFlow nació enfocado en escalar entrenamientos a gran tamaño y en desplegar modelos en producción, incluyendo dispositivos móviles. Keras es su interfaz de alto nivel, diseñada para que definir un modelo sea rápido y legible, incluso para quien recién empieza.

```python
# Estructura conceptual de un entrenamiento típico en Keras

pasos_entrenamiento_keras = [
    "1. Definir el modelo con capas Sequential o funcionales",
    "2. Compilar el modelo: elegir optimizador, función de pérdida y métricas",
    "3. Entrenar con model.fit(datos_entrada, etiquetas, epochs, batch_size)",
    "4. Evaluar con model.evaluate(datos_prueba, etiquetas_prueba)",
    "5. Predecir con model.predict(datos_nuevos)",
]

for paso in pasos_entrenamiento_keras:
    print(paso)
```

Este flujo de cinco pasos es prácticamente un estándar que se repite en la mayoría de proyectos de deep learning, sin importar el problema específico.

### Diferenciación automática: el motor detrás de ambos

Tanto PyTorch como TensorFlow implementan diferenciación automática: registran cada operación matemática que ocurre durante el forward pass y luego pueden calcular los gradientes necesarios para el backpropagation sin que tú escribas ni una sola derivada.

```python
# Analogía: el framework "recuerda" cada operación como un mapa de pasos
operaciones_registradas = [
    "multiplicar entrada por peso_1",
    "sumar sesgo_1",
    "aplicar relu",
    "multiplicar por peso_2",
    "aplicar sigmoide",
]

# Al pedir los gradientes, el framework recorre este mapa en reversa
for operacion in reversed(operaciones_registradas):
    print(f"Calculando gradiente para: {operacion}")
```

Esta capacidad es la que hace posible entrenar redes con cientos de capas sin que un humano tenga que calcular las derivadas manualmente.

### Cuándo usar deep learning y cuándo no

El deep learning brilla con datos complejos y abundantes: imágenes, texto, audio o series temporales largas. Pero no siempre es la mejor opción.

```python
criterios_decision = {
    "pocos datos (cientos de filas)": "machine learning clásico",
    "datos tabulares simples": "árboles de decisión o regresión",
    "imágenes o audio": "deep learning",
    "texto largo y complejo": "deep learning",
    "se necesita explicar cada decisión": "machine learning clásico",
}

for escenario, recomendacion in criterios_decision.items():
    print(f"{escenario}: {recomendacion}")
```

Si tus datos son pocos o el problema es simple, un modelo clásico suele entrenar más rápido, ser más fácil de interpretar y dar resultados igual de buenos.

## Errores comunes

- **Elegir deep learning solo porque suena avanzado**: para muchos problemas con datos tabulares pequeños, un modelo clásico es más rápido y preciso.
- **Mezclar código de PyTorch y Keras sin entender sus diferencias**: cada framework tiene su propia forma de definir modelos; conviene dominar uno antes de saltar al otro.
- **Ignorar la fase de compilación en Keras**: olvidar definir correctamente el optimizador o la función de pérdida antes de entrenar produce errores confusos o resultados sin sentido.

## Resumen

- Los frameworks de deep learning automatizan el cálculo de gradientes y la construcción de capas.
- PyTorch prioriza flexibilidad y es popular en investigación.
- TensorFlow con Keras prioriza facilidad de uso y despliegue en producción.
- La diferenciación automática es el mecanismo común que hace posible entrenar redes grandes.
- El deep learning no siempre es la mejor opción: para datos simples o escasos, el machine learning clásico suele ser más práctico.
