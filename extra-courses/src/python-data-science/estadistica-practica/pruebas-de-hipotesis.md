# Pruebas de hipótesis

## Introducción

Imagina que pruebas dos versiones de un botón en una app y quieres saber si una realmente genera más clics que la otra, o si la diferencia que ves es solo azar. Las pruebas de hipótesis son el método estadístico diseñado exactamente para responder ese tipo de pregunta: ¿la diferencia que observo es real, o pudo haber ocurrido por casualidad?

Esta herramienta se usa en experimentos de todo tipo: comparar tratamientos médicos, evaluar cambios en un producto, o verificar si dos grupos de estudiantes con métodos de enseñanza distintos obtienen resultados diferentes. Sin ella, es fácil confundir ruido aleatorio con un efecto real.

En esta lección aprenderás la lógica detrás de una prueba de hipótesis, qué es el p-valor sin caer en explicaciones confusas, y cómo aplicar un test t con `scipy` para comparar dos grupos.

## Conceptos clave

- **Hipótesis nula**: la afirmación de que no hay diferencia real entre los grupos, que la diferencia observada es solo azar.
- **Hipótesis alternativa**: la afirmación de que sí existe una diferencia real.
- **P-valor**: la probabilidad de observar una diferencia tan grande (o más) que la observada, si la hipótesis nula fuera cierta.
- **Nivel de significancia**: el umbral (normalmente 0.05) que usas para decidir si rechazas la hipótesis nula.
- **Test t**: prueba estadística para comparar las medias de dos grupos.

## Desarrollo

### La lógica de una prueba de hipótesis, explicada simple

El proceso siempre sigue el mismo patrón:

1. Planteas la hipótesis nula: "no hay diferencia real entre los grupos".
2. Recolectas datos y calculas la diferencia observada.
3. Preguntas: si la hipótesis nula fuera cierta, ¿qué tan raro sería ver una diferencia como esta?
4. Si es muy raro (poco probable por azar), rechazas la hipótesis nula y concluyes que probablemente sí hay una diferencia real.

Es un razonamiento por contradicción: asumes que no hay efecto, y ves si los datos hacen que esa suposición sea difícil de sostener.

### Hipótesis nula en un ejemplo concreto

Supón que comparas el tiempo de entrega de dos repartidores:

```python
import numpy as np

repartidor_a = [28, 30, 25, 32, 29, 27, 31]
repartidor_b = [35, 33, 38, 34, 36, 37, 32]

media_a = np.mean(repartidor_a)
media_b = np.mean(repartidor_b)

print(f"Media A: {media_a:.1f} min, Media B: {media_b:.1f} min")
```

La hipótesis nula dice: "en realidad ambos repartidores tienen el mismo tiempo promedio, y la diferencia que vemos en esta muestra es solo azar". La prueba de hipótesis nos ayuda a decidir si esa afirmación es sostenible.

### El p-valor sin misticismo

El p-valor no es "la probabilidad de que la hipótesis nula sea verdadera". Es más específico: es la probabilidad de obtener una diferencia igual o más extrema que la observada, asumiendo que la hipótesis nula es cierta.

Un p-valor bajo (por ejemplo, menor a 0.05) significa: "si realmente no hubiera diferencia, sería muy poco probable ver un resultado como este". Eso te da confianza para rechazar la hipótesis nula.

### Test t para comparar dos grupos con scipy

```python
from scipy import stats

t_estadistico, p_valor = stats.ttest_ind(repartidor_a, repartidor_b)

print(f"Estadístico t: {t_estadistico:.3f}")
print(f"P-valor: {p_valor:.4f}")

if p_valor < 0.05:
    print("Rechazamos la hipótesis nula: hay diferencia significativa")
else:
    print("No hay evidencia suficiente para decir que son diferentes")
```

En este ejemplo, si el p-valor resulta menor a 0.05, tienes evidencia de que el repartidor B es consistentemente más lento que el A, no solo por casualidad en esta muestra particular.

### Otro ejemplo: dos versiones de una app

```python
tiempo_version_1 = [12, 15, 14, 13, 16, 12, 15]
tiempo_version_2 = [10, 11, 9, 12, 10, 11, 10]

t_estadistico, p_valor = stats.ttest_ind(tiempo_version_1, tiempo_version_2)

print(f"P-valor: {p_valor:.4f}")
```

Aquí estarías probando si una nueva versión de la app realmente reduce el tiempo que tarda un usuario en completar una tarea, algo muy común al evaluar cambios de diseño.

## Errores comunes

- **Confundir "no significativo" con "no hay diferencia"**: un p-valor alto solo significa que no encontraste evidencia suficiente, no que la diferencia no exista. Podría deberse a una muestra pequeña.
- **Pensar que un p-valor bajo prueba que el efecto es grande o importante**: el p-valor habla de si el efecto es probablemente real, no de qué tan grande es. Un efecto minúsculo puede tener p-valor bajo si la muestra es enorme.
- **Probar muchas hipótesis y quedarte solo con la que dio p-valor bajo**: si pruebas veinte comparaciones al azar, es esperable que una salga "significativa" solo por azar. Ten cuidado con esta trampa, conocida como "p-hacking".

## Resumen

- Una prueba de hipótesis compara si una diferencia observada es real o producto del azar.
- La hipótesis nula asume que no hay diferencia real entre los grupos.
- El p-valor mide qué tan raro sería el resultado observado si la hipótesis nula fuera cierta.
- `scipy.stats.ttest_ind()` calcula un test t para comparar las medias de dos grupos.
- Un p-valor bajo indica evidencia de diferencia, no necesariamente que el efecto sea grande.
