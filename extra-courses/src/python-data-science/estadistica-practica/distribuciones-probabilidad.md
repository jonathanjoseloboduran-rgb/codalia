# Distribuciones y probabilidad

## Introducción

La probabilidad es simplemente una forma de medir qué tan probable es que algo ocurra, en una escala de 0 a 1. Ya la usas todos los días de forma intuitiva: sabes que es más probable que llueva si el cielo está nublado, o que un vuelo se retrase si hay tormenta en la ciudad de origen. La estadística formaliza esa intuición con números.

En ciencia de datos, entender distribuciones de probabilidad te permite reconocer patrones en los datos, simular escenarios antes de que ocurran y entender por qué ciertos fenómenos (alturas de personas, errores de medición, tiempos de respuesta) se comportan de forma tan parecida entre sí.

En esta lección verás la distribución normal, la más importante de todas, y aprenderás a simular datos con `numpy` para explorar cómo se comportan los promedios cuando repites un experimento muchas veces.

## Conceptos clave

- **Probabilidad**: número entre 0 y 1 que mide qué tan posible es un evento.
- **Distribución**: la forma en que se reparten los valores posibles de una variable.
- **Distribución normal**: distribución en forma de campana, simétrica alrededor de la media.
- **Simulación**: generar datos artificiales que imitan un proceso real para estudiarlo.
- **Ley de los grandes números**: al repetir un experimento muchas veces, el promedio observado se acerca al promedio real.

## Desarrollo

### Probabilidad intuitiva

Si lanzas una moneda, la probabilidad de que salga cara es 0.5. Puedes comprobarlo simulando muchos lanzamientos:

```python
import random

lanzamientos = [random.choice(["cara", "sello"]) for _ in range(1000)]
proporcion_caras = lanzamientos.count("cara") / len(lanzamientos)

print(f"Proporción de caras: {proporcion_caras:.3f}")
```

Cada vez que corras este código obtendrás un número cercano a 0.5, pero no exacto. Esa variación natural es parte de trabajar con datos aleatorios.

### La distribución normal y por qué aparece tanto

La distribución normal (o campana de Gauss) describe muchos fenómenos naturales: estaturas, notas de examen, errores de medición. Su forma está definida por dos números: la media (el centro) y la desviación estándar (qué tan ancha es la campana).

```python
import numpy as np

estaturas = np.random.normal(loc=165, scale=8, size=1000)

print(f"Media simulada: {estaturas.mean():.1f} cm")
print(f"Desviación simulada: {estaturas.std():.1f} cm")
```

Aparece tanto porque cuando muchos factores pequeños e independientes se suman (genética, nutrición, entorno), el resultado tiende a distribuirse en forma de campana. Esto se conoce como el teorema del límite central, y es una de las razones por las que la estadística funciona tan bien en la práctica.

### Simular con numpy.random

`numpy.random` te permite generar datos de distintas distribuciones sin necesidad de recolectar datos reales. Por ejemplo, simular el tiempo de espera en una fila de atención al cliente:

```python
tiempos_espera = np.random.exponential(scale=5, size=500)

print(f"Tiempo promedio de espera: {tiempos_espera.mean():.2f} minutos")
print(f"Tiempo máximo simulado: {tiempos_espera.max():.2f} minutos")
```

La distribución exponencial es común para modelar tiempos entre eventos, como el tiempo entre dos llamadas a un centro de soporte. Simular te permite probar escenarios ("¿qué pasa si el tiempo promedio sube a 8 minutos?") sin necesidad de esperar a que ocurra en la vida real.

### Fijar una semilla para resultados reproducibles

Cuando compartes un análisis, es importante que otra persona pueda obtener los mismos resultados aleatorios:

```python
np.random.seed(42)

muestra = np.random.normal(loc=100, scale=15, size=10)
print(muestra)
```

Con la misma semilla, siempre obtendrás la misma secuencia de números "aleatorios". Esto es clave para que tu trabajo sea reproducible.

### Ley de los grandes números con un ejemplo simulado

Esta ley dice que, mientras más repitas un experimento, más se acerca el promedio observado al promedio teórico. Vamos a comprobarlo lanzando un dado muchas veces:

```python
np.random.seed(0)

for n in [10, 100, 1000, 100000]:
    lanzamientos = np.random.randint(1, 7, size=n)
    print(f"n={n}: promedio = {lanzamientos.mean():.3f}")
```

El promedio teórico de un dado justo es 3.5. Con pocos lanzamientos el promedio puede alejarse bastante, pero al llegar a cien mil lanzamientos, el resultado se acerca mucho a 3.5. Esta es la razón por la que las casas de apuestas y las aseguradoras confían en grandes volúmenes de datos: la incertidumbre individual se diluye cuando el número de casos crece.

## Errores comunes

- **Pensar que la aleatoriedad garantiza resultados exactos**: con pocos datos, es normal ver desviaciones grandes respecto al valor esperado. Eso no significa que el modelo esté mal.
- **No fijar semilla y luego no poder reproducir un resultado**: si necesitas mostrar o depurar un análisis, siempre fija `np.random.seed()`.
- **Asumir que todo se distribuye normal**: muchos fenómenos, como ingresos o tiempos de espera, tienen distribuciones muy distintas a la campana de Gauss. Verifica antes de asumir.

## Resumen

- La probabilidad mide qué tan posible es un evento, entre 0 y 1.
- La distribución normal aparece constantemente por el teorema del límite central.
- `numpy.random` permite simular datos de muchas distribuciones distintas.
- Fijar una semilla hace que tus simulaciones sean reproducibles.
- La ley de los grandes números explica por qué los promedios se estabilizan con más datos.
