# Elegir el gráfico correcto

## Introducción

Saber crear un gráfico en Python es solo la mitad del trabajo; la otra mitad es saber cuál gráfico usar según la pregunta que quieres responder. Un histograma no sirve para comparar categorías, y un gráfico de barras no sirve para mostrar la forma de una distribución. Elegir mal el tipo de gráfico puede ocultar información importante o, peor aún, comunicar algo engañoso sin que te des cuenta.

En esta lección vas a conectar cuatro tipos de preguntas con cuatro tipos de gráficos: comparar categorías con barras, ver la forma de una distribución con histogramas, detectar dispersión y valores atípicos con boxplots, y observar tendencias en el tiempo con líneas. También vas a revisar errores clásicos que hacen que un gráfico, aunque técnicamente correcto, termine confundiendo a quien lo lee.

Esta habilidad de "traducir una pregunta de análisis a un tipo de gráfico" es una de las que más distingue a un analista de datos experimentado de alguien que apenas comienza. Con el tiempo se vuelve casi automática.

## Conceptos clave

- **Gráfico de barras**: compara valores entre categorías distintas (por ejemplo, ventas por región).
- **Histograma**: muestra cómo se distribuyen los valores de una variable numérica en rangos.
- **Boxplot**: resume la dispersión de los datos y resalta valores atípicos usando cuartiles.
- **Gráfico de línea**: conecta puntos en orden, ideal para mostrar cambios a lo largo del tiempo.
- **Eje engañoso**: un eje que no comienza en cero o que usa una escala inconsistente, distorsionando la percepción visual.

## Desarrollo

### Barras: comparar categorías

Si quieres comparar las ventas de distintas sucursales en un mes específico, un gráfico de barras es la opción natural.

```python
import matplotlib.pyplot as plt

sucursales = ["Centro", "Norte", "Sur", "Este"]
ventas_junio = [1900, 1500, 1300, 1750]

figura, ejes = plt.subplots()
ejes.bar(sucursales, ventas_junio, color="steelblue")
ejes.set_title("Ventas por sucursal - junio")
ejes.set_ylabel("Ventas (USD)")
plt.show()
```

Las barras funcionan porque cada categoría es independiente entre sí; no existe un orden natural que conecte "Centro" con "Norte". Conectarlas con una línea sería engañoso, ya que sugeriría una progresión que no existe.

### Histogramas: ver la forma de una distribución

Supón que tienes las notas finales de 200 estudiantes y quieres entender cómo se distribuyen.

```python
import random

random.seed(7)
notas = [round(random.gauss(70, 12)) for _ in range(200)]

figura, ejes = plt.subplots()
ejes.hist(notas, bins=10, color="darkorange", edgecolor="white")
ejes.set_title("Distribución de notas finales")
ejes.set_xlabel("Nota")
ejes.set_ylabel("Cantidad de estudiantes")
plt.show()
```

El parámetro `bins` define en cuántos rangos se agrupan los datos. Muy pocos bins ocultan detalles; demasiados bins muestran ruido en lugar de patrón. Suele valer la pena probar varios valores.

### Boxplots: dispersión y valores atípicos

El boxplot resume una variable numérica en cinco números clave: mínimo, primer cuartil, mediana, tercer cuartil y máximo, además de marcar los valores atípicos.

```python
salarios_equipo_a = [2200, 2300, 2250, 2400, 2280, 5200]
salarios_equipo_b = [2100, 2150, 2180, 2220, 2190, 2230]

figura, ejes = plt.subplots()
ejes.boxplot([salarios_equipo_a, salarios_equipo_b], tick_labels=["Equipo A", "Equipo B"])
ejes.set_title("Comparación de salarios por equipo")
ejes.set_ylabel("Salario (USD)")
plt.show()
```

En este ejemplo, el valor 5200 del Equipo A aparecerá como un punto separado fuera de la "caja", señalando que es un valor atípico respecto al resto del grupo.

### Líneas: tendencias en el tiempo

Cuando el eje horizontal representa tiempo, la línea es casi siempre la mejor opción porque conecta visualmente el orden natural de los datos.

```python
trimestres = ["T1", "T2", "T3", "T4"]
usuarios_activos = [15000, 18000, 17500, 21000]

figura, ejes = plt.subplots()
ejes.plot(trimestres, usuarios_activos, marker="o", color="seagreen")
ejes.set_title("Usuarios activos por trimestre")
ejes.set_ylabel("Usuarios")
plt.show()
```

Aquí la línea ayuda a percibir de inmediato si la tendencia es creciente, decreciente o estable, algo que un gráfico de barras también podría mostrar, pero con menos claridad sobre la trayectoria continua.

### Errores comunes al elegir el gráfico

Un caso frecuente es usar un gráfico de pastel para demasiadas categorías, o un eje Y que no comienza en cero para exagerar diferencias pequeñas.

```python
# Ejemplo de eje engañoso (evitar esto)
figura, ejes = plt.subplots()
ejes.bar(sucursales, ventas_junio)
ejes.set_ylim(1200, 2000)  # oculta que las diferencias reales son pequeñas
plt.show()
```

Cortar el eje Y así hace que una diferencia de 400 dólares parezca enorme, cuando en proporción al total de ventas es modesta. Siempre revisa si el rango del eje representa fielmente la magnitud real de los datos.

## Errores comunes

- **Usar gráficos de pastel con muchas categorías**: cuando hay más de cuatro o cinco porciones, se vuelve casi imposible comparar tamaños a simple vista. Un gráfico de barras suele comunicar lo mismo con mayor claridad.
- **Ejes que no comienzan en cero**: en gráficos de barras, esto exagera visualmente las diferencias entre categorías. Resérvalo solo para casos donde el rango de cero distorsionaría datos ya de por sí muy juntos, y adviértelo explícitamente.
- **Conectar categorías no ordenadas con una línea**: usar `plot()` en lugar de `bar()` para categorías como nombres de tiendas sugiere una continuidad o tendencia que no existe entre ellas.

## Resumen

- Barras para comparar categorías independientes; líneas para tendencias en el tiempo.
- Histogramas para ver la forma de una distribución; boxplots para dispersión y outliers.
- El boxplot resume mínimo, cuartiles, mediana, máximo y valores atípicos en un solo vistazo.
- Evita pasteles con muchas categorías y ejes que no comienzan en cero, ya que distorsionan la lectura real de los datos.
