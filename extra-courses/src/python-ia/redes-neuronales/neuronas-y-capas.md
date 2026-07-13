# Neuronas y capas

## Introducción

Cuando escuchas hablar de inteligencia artificial, casi siempre hay una red neuronal detrás. Desde el reconocimiento de imágenes hasta los modelos de lenguaje, todo empieza con una idea sorprendentemente simple: conectar unidades pequeñas de cálculo, llamadas neuronas, para que juntas resuelvan problemas complejos.

En esta lección conocerás la pieza fundamental de cualquier red neuronal: la neurona artificial. Verás cómo recibe información, cómo la procesa y cómo decide qué "señal" enviar hacia adelante. También aprenderás por qué las neuronas se organizan en capas y cómo esa organización le da a la red su poder para aprender patrones.

No necesitas matemática avanzada para entender esto. Con analogías cotidianas y un poco de Python vas a construir una intuición sólida que te acompañará en el resto del capítulo, cuando empieces a programar redes reales.

## Conceptos clave

- **Neurona artificial**: unidad de cálculo que recibe valores de entrada, los combina y produce una salida.
- **Pesos**: números que indican cuánta importancia le da la neurona a cada entrada.
- **Sesgo (bias)**: un valor adicional que ajusta la salida de la neurona, independiente de las entradas.
- **Función de activación**: regla matemática que decide si la neurona "se activa" o no, y con qué intensidad.
- **Capa**: conjunto de neuronas que procesan información en el mismo nivel de la red.

## Desarrollo

### La neurona como una votación ponderada

Imagina que quieres decidir si sales a caminar. Consideras el clima, tu energía y si tienes tiempo libre. No todos los factores pesan igual: el clima te importa mucho, tu energía un poco menos y el tiempo libre es decisivo. Una neurona artificial hace algo parecido: multiplica cada entrada por un peso que refleja su importancia.

```python
clima = 0.9      # qué tan bueno está el clima (0 a 1)
energia = 0.4     # qué tanta energía tienes (0 a 1)
tiempo_libre = 1.0  # si tienes tiempo (0 o 1)

peso_clima = 0.3
peso_energia = 0.2
peso_tiempo = 0.5

suma_ponderada = (clima * peso_clima) + (energia * peso_energia) + (tiempo_libre * peso_tiempo)
print(suma_ponderada)
```

Este cálculo, entrada por peso y luego sumado, es el corazón de cada neurona.

### El sesgo: un empujón extra

El sesgo permite que la neurona se active más fácil o más difícil, sin depender de las entradas. Es como si tuvieras una tendencia natural a salir a caminar, incluso en un día mediocre.

```python
sesgo = 0.1
resultado = suma_ponderada + sesgo
print(resultado)
```

Con esta pequeña suma, la neurona ya tiene un valor listo para pasar al siguiente paso: la activación.

### Funciones de activación comunes

La suma ponderada por sí sola solo produce un número. La función de activación transforma ese número en una señal útil, muchas veces limitándolo a un rango específico.

```python
import math

def sigmoide(x):
    return 1 / (1 + math.exp(-x))

def relu(x):
    return max(0, x)

print(sigmoide(resultado))
print(relu(resultado))
```

La sigmoide comprime cualquier valor entre 0 y 1, ideal para representar probabilidades. ReLU es más simple: si el valor es negativo lo convierte en cero, y si es positivo lo deja igual. Es la función de activación más usada en redes modernas por su eficiencia.

### De una neurona a una capa

Una sola neurona tiene una visión muy limitada del problema. Por eso se agrupan varias neuronas en una capa, cada una mirando las mismas entradas pero con pesos distintos, como si fueran expertos diferentes opinando sobre el mismo caso.

```python
entradas = [clima, energia, tiempo_libre]

pesos_neurona_1 = [0.3, 0.2, 0.5]
pesos_neurona_2 = [0.1, 0.6, 0.3]

def salida_neurona(entradas, pesos, sesgo):
    suma = sum(e * p for e, p in zip(entradas, pesos))
    return relu(suma + sesgo)

capa_oculta = [
    salida_neurona(entradas, pesos_neurona_1, 0.1),
    salida_neurona(entradas, pesos_neurona_2, -0.2),
]
print(capa_oculta)
```

### Arquitectura completa: capas de entrada, ocultas y salida

Una red neuronal típica tiene una capa de entrada (recibe los datos), una o más capas ocultas (procesan y combinan patrones) y una capa de salida (entrega el resultado final, como una clasificación).

```python
pesos_salida = [0.7, 0.4]
sesgo_salida = 0.05

salida_final = salida_neurona(capa_oculta, pesos_salida, sesgo_salida)
print(f"Probabilidad de salir a caminar: {salida_final:.2f}")
```

Cada capa transforma la información recibida y la pasa a la siguiente, construyendo representaciones cada vez más abstractas del problema original.

## Errores comunes

- **Confundir pesos con datos**: los pesos no son parte de la entrada, son parámetros que la red ajusta mientras aprende. Al iniciar un modelo, recuerda que sus pesos suelen ser aleatorios.
- **Olvidar la función de activación**: sin ella, una red de muchas capas se comporta igual que una sola operación lineal, sin importar cuántas capas tenga. La activación es lo que le da poder real.
- **Pensar que más capas siempre es mejor**: agregar capas sin necesidad puede hacer que el modelo sea lento de entrenar y propenso a memorizar en lugar de aprender patrones generales.

## Resumen

- Una neurona combina entradas con pesos, suma un sesgo y aplica una función de activación.
- Los pesos indican importancia; el sesgo ajusta el punto de activación.
- Sigmoide y ReLU son funciones de activación comunes, cada una con un propósito distinto.
- Las neuronas se agrupan en capas: entrada, ocultas y salida.
- Sin funciones de activación, una red neuronal pierde su capacidad de modelar patrones complejos.
