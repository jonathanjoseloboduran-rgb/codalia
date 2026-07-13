# De notebook a producción

## Introducción

Un notebook es perfecto para explorar, pero es frágil para sostener un proceso que se repite cada semana o cada mes. Si tu análisis de ventas necesita ejecutarse cada lunes, depender de que alguien abra el notebook, ejecute las celdas en orden correcto y no se salte ninguna es una receta para errores. Llevar código de análisis a un formato más sólido —funciones, módulos, reproducibilidad— es lo que separa un ejercicio puntual de una herramienta confiable.

Esto no significa que todo análisis deba convertirse en una aplicación compleja. Significa aplicar buenas prácticas básicas: organizar el código en piezas reutilizables, asegurarte de que el mismo código produzca los mismos resultados y, cuando haga falta, automatizar la generación de reportes para no repetir el trabajo manualmente.

En esta última lección vas a aprender a estructurar tu código en funciones y módulos, a garantizar reproducibilidad, a automatizar un reporte simple y a trazar una ruta para seguir creciendo como analista.

## Conceptos clave

- **Función**: bloque de código reutilizable que recibe entradas y devuelve un resultado, evitando repetir lógica.
- **Módulo**: archivo de Python que agrupa funciones relacionadas para poder importarlas en otros scripts.
- **Reproducibilidad**: capacidad de obtener el mismo resultado al ejecutar el mismo código con los mismos datos.
- **Semilla aleatoria (seed)**: valor fijo que controla la aleatoriedad, para que los resultados no cambien entre ejecuciones.
- **Automatización**: hacer que un proceso se repita sin intervención manual, como generar un reporte cada cierto tiempo.

## Desarrollo

### De celdas sueltas a funciones

El primer paso para salir del notebook es identificar bloques de código que se repiten o que tienen un propósito claro, y convertirlos en funciones con nombre.

```python
import pandas as pd

def calcular_ingreso(datos: pd.DataFrame) -> pd.DataFrame:
    """Agrega una columna de ingreso a partir de precio y cantidad."""
    datos = datos.copy()
    datos["ingreso"] = datos["precio"] * datos["cantidad"]
    return datos

def resumen_por_region(datos: pd.DataFrame) -> pd.Series:
    """Devuelve el ingreso total agrupado por región."""
    return datos.groupby("region")["ingreso"].sum().sort_values(ascending=False)

ventas = pd.DataFrame({
    "region": ["Norte", "Sur", "Norte", "Sur"],
    "precio": [3.5, 4.0, 3.5, 4.0],
    "cantidad": [120, 60, 110, 55],
})

ventas = calcular_ingreso(ventas)
print(resumen_por_region(ventas))
```

Cada función hace una sola cosa y tiene un nombre que explica qué hace. Esto facilita probar, reutilizar y leer el código meses después, cuando ya no recuerdes los detalles.

### Organizar funciones en módulos

Cuando acumulas varias funciones relacionadas, conviene agruparlas en un archivo separado, por ejemplo `analisis_ventas.py`, y luego importarlas donde se necesiten.

```python
# Esto simula el contenido de un archivo analisis_ventas.py
# y cómo se importaría desde otro script:
#
# from analisis_ventas import calcular_ingreso, resumen_por_region
#
# ventas = calcular_ingreso(ventas)
# resumen = resumen_por_region(ventas)

print("Un módulo agrupa funciones relacionadas en un archivo reutilizable")
```

Esta organización evita copiar y pegar código entre notebooks y hace que una corrección se aplique en un solo lugar.

### Reproducibilidad: semillas y versiones

Cuando el análisis incluye algún componente aleatorio, como una muestra de datos, es clave fijar una semilla para que el resultado no cambie entre ejecuciones.

```python
import numpy as np

np.random.seed(42)
muestra = np.random.choice(ventas.index, size=2, replace=False)
print(ventas.loc[muestra])
```

También es buena práctica registrar las versiones de las librerías usadas, por ejemplo con `pip freeze > requirements.txt`, para que el análisis se pueda reproducir exactamente en otro equipo.

### Automatizar un reporte simple

Una función que genera un archivo de resumen puede ahorrar horas de trabajo manual repetido.

```python
def generar_reporte(datos: pd.DataFrame, ruta_salida: str) -> None:
    """Genera un reporte de texto simple con el resumen por región."""
    resumen = resumen_por_region(datos)
    with open(ruta_salida, "w", encoding="utf-8") as archivo:
        archivo.write("Reporte de ingresos por región\n")
        archivo.write("=" * 30 + "\n")
        for region, ingreso in resumen.items():
            archivo.write(f"{region}: {ingreso:.2f}\n")

# generar_reporte(ventas, "reporte_ventas.txt")
print("La función queda lista para ejecutarse cada vez que haya datos nuevos")
```

Con esta función, generar el reporte de cada semana se reduce a ejecutar una sola línea, en vez de repetir manualmente el análisis.

### Ruta para seguir creciendo

Dominar EDA, feature engineering y comunicación de resultados es una base sólida. Desde aquí, los siguientes pasos naturales son profundizar en visualización avanzada, aprender los fundamentos de modelos predictivos y practicar con datasets cada vez más grandes y desordenados, que es donde realmente se pone a prueba lo aprendido.

## Errores comunes

Un error común es dejar todo el análisis en un solo notebook gigante sin dividirlo en funciones, lo que hace casi imposible reutilizar o depurar el código más adelante. Divide el trabajo en piezas pequeñas desde el principio.

Otro error es no fijar semillas aleatorias, lo que hace que un mismo análisis arroje resultados ligeramente distintos cada vez que se ejecuta, generando confusión sobre cuál es el resultado correcto.

También es frecuente automatizar un reporte sin antes validarlo manualmente varias veces, lo que puede propagar un error silencioso cada vez que se ejecuta el proceso automático.

## Resumen

- Convertir código de notebook en funciones facilita reutilizar y mantener el análisis.
- Agrupar funciones relacionadas en módulos evita duplicar código entre scripts.
- La reproducibilidad depende de fijar semillas aleatorias y registrar versiones de librerías.
- Automatizar reportes ahorra tiempo en tareas que se repiten periódicamente.
- El siguiente paso natural es profundizar en visualización, modelos predictivos y datasets más complejos.
