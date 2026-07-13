# Un perceptrón desde cero

## Introducción

El perceptrón es la red neuronal más simple que existe: una sola neurona capaz de aprender a separar dos categorías. Aunque hoy en día las redes reales tienen millones de neuronas, todas parten del mismo principio que vas a programar en esta lección.

Construir un perceptrón desde cero, sin librerías de deep learning, es la mejor manera de entender qué significa realmente "entrenar" un modelo. Vas a ver cómo la red ajusta sus propios pesos a partir de sus errores, sin que tú le digas explícitamente qué valores usar.

Además vas a comprobar en la práctica algo importante: el perceptrón tiene límites claros. Entender esos límites te prepara para apreciar por qué las redes con varias capas son necesarias para resolver problemas más realistas.

## Conceptos clave

- **Perceptrón**: la neurona más simple, capaz de clasificar datos en dos grupos.
- **Forward pass**: el proceso de calcular la salida a partir de las entradas, pesos y sesgo.
- **Regla de aprendizaje**: fórmula que ajusta los pesos según el error cometido.
- **Compuerta lógica**: operación como AND u OR, útil como ejemplo de entrenamiento controlado.
- **Separabilidad lineal**: condición necesaria para que un perceptrón pueda resolver un problema.

## Desarrollo

### Preparando los datos con NumPy

Vas a entrenar el perceptrón para que aprenda la compuerta lógica AND, que devuelve 1 solo cuando ambas entradas son 1.

```python
import numpy as np

entradas = np.array([
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
])

salidas_esperadas = np.array([0, 0, 0, 1])
```

Cada fila de `entradas` representa un ejemplo, y `salidas_esperadas` contiene la respuesta correcta para cada uno.

### El forward pass

El forward pass es simplemente calcular la salida de la neurona: multiplicar entradas por pesos, sumar el sesgo y aplicar una función escalón que decide entre 0 y 1.

```python
def funcion_escalon(x):
    return 1 if x >= 0 else 0

def forward_pass(entrada, pesos, sesgo):
    suma = np.dot(entrada, pesos) + sesgo
    return funcion_escalon(suma)

pesos = np.array([0.0, 0.0])
sesgo = 0.0

print(forward_pass(entradas[3], pesos, sesgo))
```

Con pesos en cero, la neurona todavía no sabe nada. Su salida será poco confiable hasta que aprenda.

### La regla de aprendizaje del perceptrón

Cada vez que el perceptrón se equivoca, ajusta sus pesos en la dirección que habría producido la respuesta correcta. La magnitud del ajuste depende de la tasa de aprendizaje, un número pequeño que controla qué tan grandes son los cambios.

```python
tasa_aprendizaje = 0.1

def actualizar_pesos(entrada, esperado, prediccion, pesos, sesgo):
    error = esperado - prediccion
    nuevos_pesos = pesos + tasa_aprendizaje * error * entrada
    nuevo_sesgo = sesgo + tasa_aprendizaje * error
    return nuevos_pesos, nuevo_sesgo
```

Si la predicción fue correcta, el error es 0 y no hay cambios. Si hubo error, los pesos se mueven un poco hacia la dirección correcta.

### Entrenando el perceptrón

Ahora vas a repetir el proceso muchas veces, recorriendo todos los ejemplos en cada vuelta, hasta que el perceptrón aprenda a clasificar correctamente.

```python
pesos = np.array([0.0, 0.0])
sesgo = 0.0
epocas = 20

for epoca in range(epocas):
    errores_en_epoca = 0
    for entrada, esperado in zip(entradas, salidas_esperadas):
        prediccion = forward_pass(entrada, pesos, sesgo)
        if prediccion != esperado:
            errores_en_epoca += 1
        pesos, sesgo = actualizar_pesos(entrada, esperado, prediccion, pesos, sesgo)
    if errores_en_epoca == 0:
        print(f"Aprendió en la época {epoca}")
        break

print("Pesos finales:", pesos)
print("Sesgo final:", sesgo)
```

Cada "época" es una pasada completa por todos los ejemplos de entrenamiento. El perceptrón deja de cometer errores cuando encuentra pesos que separan correctamente las dos clases.

### Probando el perceptrón entrenado

```python
for entrada in entradas:
    resultado = forward_pass(entrada, pesos, sesgo)
    print(f"{entrada} -> {resultado}")
```

Si el entrenamiento funcionó, deberías ver que solo `[1, 1]` produce 1, igual que la compuerta AND real.

### El límite del perceptrón: XOR

Prueba ahora entrenar el mismo perceptrón con la compuerta XOR, que devuelve 1 solo cuando las entradas son diferentes.

```python
salidas_xor = np.array([0, 1, 1, 0])
```

Por más épocas que entrenes, un solo perceptrón nunca logrará separar correctamente estos datos. XOR no es linealmente separable: no existe una sola línea recta que divida las dos clases en un plano.

## Errores comunes

- **Usar una tasa de aprendizaje demasiado alta**: los pesos pueden oscilar sin estabilizarse nunca. Empieza con valores pequeños, como 0.1 o 0.01.
- **Esperar que un perceptrón resuelva cualquier problema**: como viste con XOR, su capacidad está limitada a problemas linealmente separables.
- **Olvidar reiniciar los pesos entre pruebas**: si reutilizas pesos ya entrenados para un problema distinto, el resultado será confuso y difícil de depurar.

## Resumen

- El perceptrón es una neurona simple que aprende ajustando pesos según sus errores.
- El forward pass calcula la salida; la regla de aprendizaje corrige los pesos.
- Entrenar durante varias épocas permite que el perceptrón encuentre una solución.
- Puede resolver problemas linealmente separables, como AND, pero no XOR.
- Esta limitación es la razón principal por la que existen redes con varias capas.
