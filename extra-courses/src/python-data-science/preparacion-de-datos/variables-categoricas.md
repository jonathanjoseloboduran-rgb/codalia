# Variables categóricas

## Introducción

Muchas variables de un conjunto de datos no son números, sino categorías: la ciudad de un cliente, el tipo de producto, el nivel educativo o el método de pago. A estas se les llama variables categóricas, y representan una gran parte de los datos que encontrarás trabajando con encuestas, ventas o sistemas de usuarios.

El problema es que la mayoría de los algoritmos de machine learning solo entienden números. Por eso necesitas convertir estas categorías en una representación numérica antes de usarlas en un modelo, un proceso conocido como encoding. Elegir mal el tipo de encoding puede hacer que un algoritmo interprete relaciones que no existen, como suponer que "rojo" es mayor que "azul" simplemente porque le asignaste un número más alto.

En esta lección aprenderás las dos técnicas más comunes de encoding, cuándo usar cada una, cómo manejar variables con muchas categorías distintas y qué errores evitar al transformarlas.

## Conceptos clave

- **Variable categórica**: columna cuyos valores representan categorías o etiquetas, no cantidades.
- **Variable nominal**: categórica sin ningún orden natural, como el color o la ciudad.
- **Variable ordinal**: categórica con un orden natural, como el nivel educativo o la talla de ropa.
- **One-hot encoding**: técnica que crea una columna binaria por cada categoría posible.
- **Label encoding**: técnica que asigna un número entero distinto a cada categoría.
- **Cardinalidad**: cantidad de valores distintos que puede tomar una variable categórica.

## Desarrollo

### Datos de ejemplo

```python
import pandas as pd

clientes = pd.DataFrame({
    "cliente_id": [1, 2, 3, 4, 5],
    "ciudad": ["Bogotá", "Lima", "Quito", "Bogotá", "Ciudad de México"],
    "nivel_educativo": ["secundaria", "universitario", "posgrado", "secundaria", "universitario"],
    "metodo_pago": ["tarjeta", "efectivo", "tarjeta", "transferencia", "tarjeta"]
})

print(clientes)
```

Aquí "ciudad" y "método de pago" son nominales, sin orden natural. "Nivel educativo" es ordinal, porque hay una progresión lógica entre sus valores.

### One-hot encoding con get_dummies

Para variables nominales, la técnica recomendada es one-hot encoding, que crea una columna binaria (0 o 1) por cada categoría.

```python
clientes_codificados = pd.get_dummies(clientes, columns=["ciudad", "metodo_pago"])
print(clientes_codificados.columns.tolist())
```

Cada nueva columna indica con `True`/`False` (o 1/0) si esa fila pertenece a esa categoría. Así evitas que el modelo asuma un orden inexistente entre ciudades.

### Label encoding para variables ordinales

Cuando sí existe un orden, tiene sentido asignar números que respeten esa secuencia.

```python
orden_educacion = {"secundaria": 0, "universitario": 1, "posgrado": 2}
clientes["nivel_educativo_codificado"] = clientes["nivel_educativo"].map(orden_educacion)

print(clientes[["nivel_educativo", "nivel_educativo_codificado"]])
```

Usar un diccionario manual como este te da control total sobre el orden, en vez de dejar que una función asigne números arbitrarios.

### El problema de la alta cardinalidad

Si una variable tiene muchísimas categorías distintas, el one-hot encoding puede generar demasiadas columnas nuevas.

```python
productos = pd.DataFrame({
    "sku": [f"SKU-{i}" for i in range(1, 501)],
    "categoria": ["electronica"] * 200 + ["hogar"] * 150 + ["ropa"] * 100 + ["otros"] * 50
})

print(productos["sku"].nunique())  # alta cardinalidad: 500 valores distintos
```

Aplicar `get_dummies` directamente sobre "sku" crearía 500 columnas nuevas, la mayoría casi siempre en cero. En estos casos conviene agrupar categorías poco frecuentes o usar técnicas más avanzadas, como quedarte solo con las categorías más comunes.

```python
top_categorias = productos["categoria"].value_counts().nlargest(3).index
productos["categoria_reducida"] = productos["categoria"].where(
    productos["categoria"].isin(top_categorias), "otro"
)

print(productos["categoria_reducida"].value_counts())
```

### Ordinales vs nominales en la práctica

```python
# Nominal: no importa el orden de las columnas generadas
pd.get_dummies(clientes["ciudad"])

# Ordinal: el orden numérico debe respetar la jerarquía real
clientes["nivel_educativo"].map({"secundaria": 0, "universitario": 1, "posgrado": 2})
```

La diferencia clave está en si el número asignado tiene un significado de magnitud. Si lo tiene, usa un mapeo ordinal; si no, usa one-hot.

## Errores comunes

- **Usar label encoding en variables nominales**: asignar 0, 1, 2 a "Bogotá", "Lima" y "Quito" hace que un modelo interprete que Quito es "más" que Bogotá, lo cual no tiene sentido.
- **Aplicar one-hot a columnas de alta cardinalidad sin filtrar**: genera cientos de columnas dispersas que aumentan el tiempo de cómputo y pueden empeorar el modelo.
- **Olvidar aplicar el mismo encoding a datos nuevos**: si transformas los datos de entrenamiento, debes aplicar exactamente la misma transformación a cualquier dato nuevo que llegue después.

## Resumen

- Las variables categóricas deben convertirse a números antes de usarse en la mayoría de los modelos.
- One-hot encoding (`get_dummies`) es ideal para variables nominales sin orden.
- Label encoding manual con un diccionario es adecuado para variables ordinales con jerarquía clara.
- La alta cardinalidad requiere agrupar categorías poco frecuentes antes de codificar.
- Elegir mal el encoding puede introducir relaciones falsas que confunden al modelo.
