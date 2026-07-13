# Matplotlib esencial

## Introducción

Cuando analizas datos, los números en una tabla rara vez cuentan la historia completa. Una tendencia de ventas, un salto inusual en las notas de un curso o una correlación entre dos variables se detectan mucho más rápido con los ojos que con una hoja de cálculo. Matplotlib es la librería de visualización más antigua y extendida en Python, y aunque existen alternativas más modernas, entender sus fundamentos es la base sobre la que se construyen todas las demás.

Esta lección te enseña la anatomía de una figura en matplotlib, cómo crear gráficos de línea y dispersión, cómo agregar títulos y etiquetas para que un gráfico se explique por sí mismo, y cómo guardar tu trabajo en un archivo. Estas son las herramientas que usarás todos los días como analista de datos, sin importar qué tan avanzadas se vuelvan tus técnicas después.

Dominar matplotlib también te prepara para seaborn, pandas plotting y otras librerías, porque casi todas se apoyan en matplotlib por debajo. Invertir tiempo aquí rinde frutos en todo tu recorrido de ciencia de datos.

## Conceptos clave

- **Figure**: el lienzo completo donde se dibuja todo; puede contener uno o varios gráficos.
- **Axes**: el área específica de un gráfico individual, con sus propios ejes X e Y.
- **Gráfico de línea**: representa la evolución de una variable, ideal para series de tiempo.
- **Gráfico de dispersión**: muestra la relación entre dos variables numéricas mediante puntos.
- **Leyenda**: recuadro que identifica qué representa cada color o símbolo en el gráfico.

## Desarrollo

### Anatomía de una figura

Antes de dibujar cualquier cosa, conviene entender que matplotlib separa el "lienzo" (figure) del "gráfico" (axes). Esto permite tener varios gráficos dentro de una misma figura.

```python
import matplotlib.pyplot as plt

figura, ejes = plt.subplots()
print(type(figura))
print(type(ejes))
```

`figura` es el contenedor general; `ejes` es donde realmente se dibujan las líneas, puntos o barras. Casi todo lo que hagas después trabajará sobre el objeto `ejes`.

### Tu primer gráfico de línea

Imagina que tienes las ventas mensuales de una tienda pequeña durante el primer semestre del año.

```python
meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"]
ventas = [1200, 1350, 1100, 1600, 1750, 1900]

figura, ejes = plt.subplots()
ejes.plot(meses, ventas)
plt.show()
```

Este código dibuja una línea que conecta cada mes con su valor de ventas. Es la forma más directa de ver una tendencia a lo largo del tiempo.

### Gráfico de dispersión

Ahora supón que quieres explorar si existe relación entre las horas de estudio y la nota final de un grupo de estudiantes.

```python
horas_estudio = [2, 3, 5, 7, 8, 9, 10]
nota_final = [55, 60, 68, 75, 80, 88, 92]

figura, ejes = plt.subplots()
ejes.scatter(horas_estudio, nota_final, color="teal")
plt.show()
```

El método `scatter` dibuja un punto por cada par de valores, útil cuando quieres ver patrones o correlaciones en lugar de una secuencia continua.

### Títulos, etiquetas y leyendas

Un gráfico sin contexto es difícil de interpretar. Siempre agrega título y nombres de ejes.

```python
figura, ejes = plt.subplots()
ejes.plot(meses, ventas, label="Tienda Centro")
ejes.set_title("Ventas mensuales - primer semestre")
ejes.set_xlabel("Mes")
ejes.set_ylabel("Ventas (USD)")
ejes.legend()
plt.show()
```

El parámetro `label` define el texto que aparecerá en la leyenda cuando llames a `ejes.legend()`. Esto es especialmente útil cuando dibujas varias series en el mismo gráfico.

### Comparar dos series en un mismo gráfico

```python
ventas_centro = [1200, 1350, 1100, 1600, 1750, 1900]
ventas_norte = [900, 1000, 1050, 1300, 1400, 1500]

figura, ejes = plt.subplots()
ejes.plot(meses, ventas_centro, label="Tienda Centro", marker="o")
ejes.plot(meses, ventas_norte, label="Tienda Norte", marker="s")
ejes.set_title("Comparación de ventas por tienda")
ejes.legend()
plt.show()
```

El parámetro `marker` agrega un símbolo en cada punto de datos, lo que facilita distinguir las líneas cuando se imprimen en blanco y negro o se ven en pantallas pequeñas.

### Guardar la figura

Cuando termines tu análisis, probablemente quieras exportar el gráfico para un reporte o presentación.

```python
figura, ejes = plt.subplots()
ejes.plot(meses, ventas)
ejes.set_title("Ventas mensuales")
figura.savefig("ventas_mensuales.png", dpi=150, bbox_inches="tight")
```

El parámetro `dpi` controla la resolución de la imagen y `bbox_inches="tight"` evita que se corten las etiquetas al guardar.

## Errores comunes

- **Olvidar `plt.show()` en scripts locales**: en un archivo `.py` normal, si no llamas a `plt.show()`, el gráfico nunca aparece. En notebooks suele mostrarse automáticamente, pero es buena práctica incluirlo siempre.
- **Confundir `plt.plot()` con `ejes.plot()`**: usar la interfaz de `pyplot` directamente funciona para gráficos simples, pero mezquinar entre ambos estilos genera confusión. Acostúmbrate a trabajar siempre con el objeto `ejes` desde el principio.
- **No etiquetar los ejes**: un gráfico sin `set_xlabel` ni `set_ylabel` obliga a quien lo lee a adivinar qué representan los números. Tómate los diez segundos extra para agregarlos.

## Resumen

- Una `figure` es el lienzo completo; los `axes` son el área donde se dibuja el gráfico.
- `plot()` sirve para tendencias y series de tiempo; `scatter()` para relaciones entre dos variables.
- Siempre agrega título, etiquetas de ejes y leyenda cuando haya varias series.
- Usa `savefig()` con `dpi` y `bbox_inches="tight"` para exportar gráficos listos para reportes.
