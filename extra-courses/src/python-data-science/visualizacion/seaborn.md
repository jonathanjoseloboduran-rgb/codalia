# Seaborn: visualización estadística

## Introducción

Matplotlib te da control total sobre cada elemento de un gráfico, pero ese control tiene un costo: escribir gráficos estadísticos complejos requiere mucho código repetitivo. Seaborn nace como una capa construida sobre matplotlib, pensada específicamente para el análisis exploratorio de datos. Con muchas menos líneas obtienes gráficos más informativos, con mejores estilos por defecto y funciones diseñadas para trabajar directamente con estructuras de datos tabulares como los DataFrames de pandas.

En esta lección vas a ver por qué seaborn se volvió el estándar para exploración estadística, cómo usar `histplot`, `boxplot` y `scatterplot` incorporando la dimensión `hue` para diferenciar grupos por color, cómo construir mapas de calor de correlación para detectar relaciones entre variables numéricas, y cómo usar `pairplot` para tener una vista panorámica de un dataset completo en una sola línea de código.

Estas herramientas son las que usarás constantemente en la fase exploratoria de cualquier proyecto de datos, ese momento donde todavía no sabes qué buscas, pero necesitas que los datos te lo muestren.

## Conceptos clave

- **hue**: parámetro que colorea los puntos o barras según una variable categórica, permitiendo comparar grupos en un mismo gráfico.
- **histplot**: versión de seaborn para histogramas, con mejores valores por defecto que matplotlib.
- **heatmap de correlación**: matriz de colores que muestra qué tan relacionadas están las variables numéricas entre sí.
- **pairplot**: cuadrícula de gráficos que compara todas las variables numéricas de un dataset entre sí, de una sola vez.
- **DataFrame**: estructura tabular de pandas que seaborn puede leer directamente por nombre de columna.

## Desarrollo

### Por qué seaborn sobre matplotlib puro

Seaborn no reemplaza a matplotlib, lo complementa. Trabaja mejor cuando tus datos ya están en un DataFrame de pandas, porque puedes referenciar columnas por nombre en lugar de extraer listas manualmente.

```python
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

datos = pd.DataFrame({
    "region": ["Centro", "Norte", "Sur", "Este", "Centro", "Norte", "Sur", "Este"],
    "ventas": [1900, 1500, 1300, 1750, 2100, 1600, 1250, 1800],
    "trimestre": ["T1", "T1", "T1", "T1", "T2", "T2", "T2", "T2"],
})

sns.set_style("whitegrid")
print(datos.head())
```

`sns.set_style` aplica un tema visual consistente a todos los gráficos siguientes, algo que en matplotlib puro requeriría configurar manualmente cada elemento.

### histplot: distribuciones con mejor estilo

```python
import random

random.seed(3)
propinas = [round(random.gauss(15, 5), 2) for _ in range(150)]
propinas_df = pd.DataFrame({"propina": propinas})

sns.histplot(data=propinas_df, x="propina", bins=15, color="cornflowerblue")
plt.title("Distribución de propinas en un restaurante")
plt.show()
```

Con una sola línea obtienes bordes suaves y una cuadrícula de fondo que facilita la lectura, algo que en matplotlib requeriría varios parámetros adicionales.

### boxplot y scatterplot con hue

El parámetro `hue` es donde seaborn realmente brilla: te permite comparar subgrupos sin escribir un bucle.

```python
encuesta = pd.DataFrame({
    "horas_estudio": [2, 3, 5, 7, 8, 9, 10, 3, 4, 6, 8, 9],
    "nota_final": [55, 60, 68, 75, 80, 88, 92, 58, 63, 72, 85, 90],
    "grupo": ["A", "A", "A", "A", "A", "A", "A", "B", "B", "B", "B", "B"],
})

sns.scatterplot(data=encuesta, x="horas_estudio", y="nota_final", hue="grupo")
plt.title("Horas de estudio vs. nota final, por grupo")
plt.show()
```

```python
sns.boxplot(data=encuesta, x="grupo", y="nota_final")
plt.title("Distribución de notas por grupo")
plt.show()
```

En el `scatterplot`, cada grupo aparece con un color distinto automáticamente, junto con su leyenda. En el `boxplot`, comparar la dispersión entre grupos toma una sola línea de código.

### Heatmap de correlación

Cuando tienes varias variables numéricas, quieres saber rápidamente cuáles se mueven juntas.

```python
finanzas = pd.DataFrame({
    "ingresos": [3000, 3200, 2800, 4100, 3900, 3300],
    "gastos": [2200, 2400, 2100, 2900, 2700, 2500],
    "ahorro": [800, 800, 700, 1200, 1200, 800],
    "edad": [25, 27, 24, 35, 33, 29],
})

correlaciones = finanzas.corr(numeric_only=True)
sns.heatmap(correlaciones, annot=True, cmap="coolwarm", fmt=".2f")
plt.title("Correlación entre variables financieras")
plt.show()
```

`annot=True` escribe el valor numérico dentro de cada celda, y `cmap="coolwarm"` usa colores fríos para correlaciones negativas y cálidos para positivas, facilitando la lectura visual inmediata.

### pairplot: explorar un dataset completo

Cuando estás empezando a explorar un dataset nuevo, `pairplot` te da una vista general de todas las relaciones posibles entre variables numéricas en una sola instrucción.

```python
sns.pairplot(finanzas)
plt.show()
```

Esto genera una cuadrícula donde cada celda cruza dos variables: dispersión entre pares distintos e histograma en la diagonal para cada variable consigo misma. Es una de las formas más rápidas de tener una primera impresión de un dataset desconocido.

## Errores comunes

- **Olvidar pasar `data=` con nombres de columna**: a diferencia de matplotlib, seaborn está pensado para recibir un DataFrame junto con los nombres de las columnas en `x`, `y` y `hue`. Pasar listas sueltas funciona en algunos casos, pero pierdes las ventajas de la integración con pandas.
- **Usar pairplot en datasets con muchas columnas**: con más de ocho o diez variables numéricas, la cuadrícula se vuelve enorme y lenta de generar. Filtra primero las columnas relevantes.
- **Confundir correlación con causalidad en el heatmap**: un valor alto en el mapa de calor indica que dos variables se mueven juntas, no que una cause a la otra. Interpreta los resultados con cautela antes de sacar conclusiones.

## Resumen

- Seaborn se construye sobre matplotlib y está optimizado para trabajar con DataFrames de pandas.
- `histplot`, `boxplot` y `scatterplot` con `hue` permiten comparar grupos con muy poco código.
- El heatmap de correlación resume relaciones entre muchas variables numéricas de un vistazo.
- `pairplot` genera una vista panorámica de un dataset completo, ideal para el primer contacto exploratorio.
