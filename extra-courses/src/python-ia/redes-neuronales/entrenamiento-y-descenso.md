# Cómo aprende una red

## Introducción

Ya sabes cómo una neurona calcula su salida y cómo un perceptrón ajusta sus pesos tras cada error. Ahora vas a entender el mecanismo general detrás de ese aprendizaje, el que usan también las redes profundas con millones de parámetros: el descenso de gradiente.

Esta lección es conceptual pero fundamental. Al entrenar modelos reales con Keras o PyTorch, vas a encontrarte todo el tiempo con función de pérdida, learning rate, épocas y backpropagation. Entender qué hace cada uno te permitirá diagnosticar problemas de entrenamiento, en lugar de copiar código sin saber por qué falla.

La idea central es intuitiva: se trata de reducir el error poco a poco, dando pasos calculados en la dirección correcta, igual que alguien que baja una montaña sin poder ver el camino completo.

## Conceptos clave

- **Función de pérdida**: mide qué tan equivocadas están las predicciones de la red.
- **Descenso de gradiente**: método para ajustar los pesos y reducir el error paso a paso.
- **Learning rate (tasa de aprendizaje)**: controla el tamaño de cada paso de ajuste.
- **Época y batch**: una época es una pasada completa por los datos; un batch es un subgrupo de ejemplos procesados juntos.
- **Backpropagation**: técnica para calcular cómo cada peso de la red contribuyó al error.

## Desarrollo

### Midiendo el error con una función de pérdida

Antes de corregir algo, necesitas saber qué tan mal está. La función de pérdida convierte la diferencia entre la predicción y el valor real en un número que la red intenta minimizar.

```python
def error_cuadratico(prediccion, valor_real):
    return (prediccion - valor_real) ** 2

prediccion = 0.8
valor_real = 1.0

perdida = error_cuadratico(prediccion, valor_real)
print(perdida)
```

Cuanto más cerca esté la predicción del valor real, menor será la pérdida. El objetivo del entrenamiento es siempre reducir este número.

### Bajar una montaña con niebla

Imagina que estás en la cima de una montaña, envuelto en niebla espesa, y necesitas llegar al punto más bajo del valle. No ves el camino completo, pero sí puedes sentir hacia dónde baja el terreno bajo tus pies. Das un paso en esa dirección, evalúas de nuevo la pendiente y repites.

Eso es exactamente el descenso de gradiente: la red no conoce el mejor conjunto de pesos de antemano, pero puede calcular en qué dirección debe moverse cada peso para reducir el error, y da un pequeño paso en esa dirección.

```python
def ajustar_peso(peso, pendiente, learning_rate):
    return peso - learning_rate * pendiente

peso_actual = 0.5
pendiente_estimada = 0.3
learning_rate = 0.1

nuevo_peso = ajustar_peso(peso_actual, pendiente_estimada, learning_rate)
print(nuevo_peso)
```

La "pendiente" aquí representa el gradiente: indica cuánto y en qué dirección cambiaría el error si movieras ese peso.

### El learning rate: pasos grandes o pequeños

El learning rate decide qué tan grande es cada paso al bajar la montaña. Un valor muy alto puede hacer que te pases del valle y termines rebotando de un lado a otro. Un valor muy bajo hace que el entrenamiento avance con extrema lentitud.

```python
for learning_rate in [0.01, 0.1, 1.0]:
    paso = learning_rate * pendiente_estimada
    print(f"learning_rate={learning_rate} -> tamaño del paso={paso:.3f}")
```

Elegir un buen learning rate suele requerir experimentación: es uno de los ajustes más importantes al entrenar cualquier red.

### Épocas y batches

Entrenar con todos los datos a la vez es costoso en memoria para modelos grandes. Por eso los datos se dividen en batches (lotes) más pequeños, y la red actualiza sus pesos después de procesar cada uno.

```python
datos_entrenamiento = list(range(1, 21))  # 20 ejemplos simulados
tamano_batch = 4

batches = [
    datos_entrenamiento[i:i + tamano_batch]
    for i in range(0, len(datos_entrenamiento), tamano_batch)
]

for numero_batch, batch in enumerate(batches):
    print(f"Batch {numero_batch}: {batch}")
```

Una época termina cuando la red ha visto todos los batches, es decir, todos los datos de entrenamiento una vez completa.

### Backpropagation, a nivel conceptual

En una red con varias capas, el error final se genera en la salida, pero los pesos que hay que corregir están distribuidos en todas las capas anteriores. Backpropagation es el algoritmo que reparte la "culpa" del error hacia atrás, capa por capa, calculando cuánto contribuyó cada peso.

```python
# Simulación conceptual, no una implementación real de backprop
error_salida = 0.2
contribucion_capa_2 = error_salida * 0.6
contribucion_capa_1 = contribucion_capa_2 * 0.4

print(f"Ajuste sugerido capa 2: {contribucion_capa_2:.3f}")
print(f"Ajuste sugerido capa 1: {contribucion_capa_1:.3f}")
```

No necesitas calcular esto a mano: Keras y PyTorch lo hacen automáticamente. Lo importante es entender que el error se propaga desde la salida hacia las capas anteriores, y así la red sabe qué pesos ajustar y en qué dirección.

## Errores comunes

- **Usar un learning rate fijo demasiado alto**: la pérdida puede oscilar sin bajar nunca, o incluso crecer. Si ves esto, reduce el learning rate.
- **Confundir época con batch**: una época es una vuelta completa a todos los datos; un batch es solo un fragmento de esa vuelta. Entrenar "una época" implica procesar todos los batches.
- **Pensar que más épocas siempre mejora el modelo**: entrenar demasiadas épocas puede hacer que la red memorice los datos de entrenamiento en lugar de aprender patrones generales, un problema llamado sobreajuste.

## Resumen

- La función de pérdida mide qué tan lejos están las predicciones del valor real.
- El descenso de gradiente ajusta los pesos dando pasos en la dirección que reduce el error.
- El learning rate controla el tamaño de esos pasos.
- Los datos se procesan en batches, y una época es una pasada completa por todos ellos.
- Backpropagation distribuye el error hacia atrás para saber cómo ajustar cada peso de la red.
