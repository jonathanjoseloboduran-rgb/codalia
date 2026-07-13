# Feature engineering

## Introducción

Los datos crudos rara vez le dicen todo a un modelo o a un análisis. Muchas veces la información predictiva está escondida y hay que construirla: la diferencia entre dos fechas, el ratio entre dos columnas o el mes en que ocurrió una compra pueden explicar un patrón que las columnas originales no muestran por sí solas. A esto se le llama feature engineering: crear nuevas variables a partir de las que ya tienes.

Esta habilidad marca una diferencia real en la calidad de un análisis. Dos personas con el mismo dataset pueden llegar a conclusiones muy distintas según qué variables construyan. Una buena feature puede revelar un patrón de negocio importante, como qué clientes están a punto de dejar de comprar, mientras que columnas mal aprovechadas dejan esa señal invisible.

En esta lección aprenderás a crear variables con valor predictivo: ratios, diferencias, extracción desde fechas y texto, agrupación en categorías (binning) y cómo evaluar si una nueva variable realmente aporta algo.

## Conceptos clave

- **Feature**: una variable (columna) que se usa como entrada para un análisis o modelo.
- **Feature engineering**: proceso de crear nuevas variables a partir de las existentes para capturar mejor la información relevante.
- **Binning**: convertir una variable numérica continua en categorías o rangos (por ejemplo, edad en "joven", "adulto", "mayor").
- **Ratio**: una variable creada al dividir dos columnas, útil para comparar magnitudes de forma relativa.
- **Poder predictivo**: qué tanto ayuda una variable a explicar o anticipar el resultado que te interesa.

## Desarrollo

### Ratios y diferencias

Un ratio compara dos cantidades de forma relativa, lo que suele ser más informativo que mirar los valores por separado.

```python
import pandas as pd

clientes = pd.DataFrame({
    "cliente_id": [1, 2, 3, 4],
    "gasto_mes_actual": [150, 80, 300, 40],
    "gasto_mes_anterior": [100, 90, 280, 60],
})

clientes["ratio_gasto"] = clientes["gasto_mes_actual"] / clientes["gasto_mes_anterior"]
clientes["diferencia_gasto"] = clientes["gasto_mes_actual"] - clientes["gasto_mes_anterior"]

print(clientes)
```

El ratio te dice si el cliente 2 gastó menos proporcionalmente (0.89), algo que la diferencia sola (-10) no comunica con la misma claridad.

### Extraer información de fechas

Una fecha completa suele ser poco útil directamente, pero contiene mucha información si la descompones.

```python
compras = pd.DataFrame({
    "cliente_id": [1, 2, 3, 4],
    "fecha_compra": pd.to_datetime(["2026-01-15", "2026-06-02", "2026-12-24", "2026-03-10"]),
})

compras["mes"] = compras["fecha_compra"].dt.month
compras["dia_semana"] = compras["fecha_compra"].dt.day_name()
compras["es_fin_de_semana"] = compras["fecha_compra"].dt.dayofweek >= 5

print(compras)
```

Con estas columnas puedes responder preguntas como si las compras de fin de semana tienen un comportamiento distinto, algo imposible de ver en la fecha cruda.

### Extraer información de texto

El texto libre también puede convertirse en variables útiles, como su longitud o si contiene ciertas palabras clave.

```python
resenas = pd.DataFrame({
    "comentario": [
        "El producto llegó tarde y dañado",
        "Excelente calidad, volveré a comprar",
        "Precio muy alto para lo que ofrece",
    ]
})

resenas["longitud"] = resenas["comentario"].str.len()
resenas["menciona_precio"] = resenas["comentario"].str.contains("precio", case=False)

print(resenas)
```

### Binning: convertir números en categorías

Agrupar valores numéricos en rangos ayuda a simplificar patrones y facilita la comunicación de resultados.

```python
clientes["categoria_gasto"] = pd.cut(
    clientes["gasto_mes_actual"],
    bins=[0, 50, 150, 1000],
    labels=["bajo", "medio", "alto"],
)

print(clientes[["cliente_id", "gasto_mes_actual", "categoria_gasto"]])
```

### Evaluar si una feature aporta

No toda variable nueva es útil. Una forma simple de evaluarla es comparar cómo se comporta frente a la variable que te interesa explicar.

```python
clientes["dejo_de_comprar"] = [0, 1, 0, 1]

comparacion = clientes.groupby("categoria_gasto")["dejo_de_comprar"].mean()
print(comparacion)
```

Si la proporción de clientes que dejaron de comprar cambia claramente entre categorías, la variable aporta información. Si el resultado es prácticamente igual en todas las categorías, probablemente no vale la pena mantenerla.

## Errores comunes

Un error común es crear decenas de variables sin verificar si aportan algo, lo que complica el análisis sin mejorar los resultados. Es mejor crear pocas features bien pensadas y evaluarlas.

Otro error es hacer binning con rangos arbitrarios que no reflejan la realidad del negocio, por ejemplo dividir edades en grupos que no tienen sentido comercial. Los rangos deben responder a una lógica, no solo dividir el rango en partes iguales.

También es frecuente olvidar que una feature basada en el futuro (como el resultado que quieres predecir) puede filtrarse por error en el análisis, generando conclusiones falsamente optimistas. Verifica siempre que tus variables usen solo información disponible al momento del análisis.

## Resumen

- El feature engineering crea variables nuevas a partir de las existentes para capturar mejor la información.
- Ratios y diferencias comparan magnitudes de forma relativa o absoluta.
- Las fechas y el texto se pueden descomponer en columnas útiles como mes, día de la semana o longitud.
- El binning simplifica variables numéricas en categorías con sentido de negocio.
- Toda feature nueva debe evaluarse comparándola con lo que quieres explicar, no darse por útil automáticamente.
