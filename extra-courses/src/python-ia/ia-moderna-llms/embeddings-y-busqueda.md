# Embeddings y búsqueda semántica

## Introducción

Imagina un buscador de preguntas frecuentes que entienda que "no puedo entrar a mi cuenta" y "olvidé mi contraseña" están relacionadas, aunque no compartan ni una sola palabra igual. Eso es exactamente lo que permiten los embeddings: representar el significado de un texto como una lista de números, de forma que textos con significados parecidos queden "cerca" unos de otros en ese espacio numérico.

Esta idea es una de las piezas más poderosas de la IA moderna, porque separa la búsqueda por significado de la búsqueda por coincidencia exacta de palabras. En vez de depender de que el usuario escriba la palabra exacta que existe en tu base de datos, puedes encontrar contenido relacionado aunque esté redactado de forma completamente distinta.

En esta lección construirás, con NumPy y vectores pequeños inventados para fines didácticos, un buscador semántico simple. No usaremos un modelo de embeddings real todavía, pero el mecanismo de comparación que aprenderás aquí es exactamente el mismo que usarías con embeddings generados por un LLM.

## Conceptos clave

- **Embedding**: representación numérica (un vector) del significado de un texto, generada por un modelo entrenado para ese propósito.
- **Vector**: lista ordenada de números; en este contexto, cada número captura algún aspecto del significado del texto.
- **Similitud coseno**: medida que indica qué tan parecidos son dos vectores, sin importar su longitud, basada en el ángulo entre ellos.
- **Búsqueda semántica**: encontrar textos relacionados por significado, no solo por coincidencia literal de palabras.
- **Espacio vectorial**: el conjunto de todos los posibles vectores de embeddings, donde la cercanía representa similitud de significado.

## Desarrollo

### Qué es un embedding, en la práctica

Un modelo de embeddings convierte un texto en un vector de números. Aquí simulamos ese resultado con vectores pequeños e inventados, solo para entender la mecánica.

```python
import numpy as np

# Vectores inventados de solo 4 dimensiones (los reales suelen tener cientos)
# Cada número representaría, de forma abstracta, algún rasgo del significado
embeddings_faq = {
    "olvide mi contrasena": np.array([0.9, 0.1, 0.0, 0.2]),
    "no puedo entrar a mi cuenta": np.array([0.8, 0.2, 0.1, 0.1]),
    "como cancelo mi suscripcion": np.array([0.1, 0.9, 0.3, 0.0]),
    "quiero un reembolso": np.array([0.0, 0.8, 0.4, 0.1]),
    "la aplicacion se cierra sola": np.array([0.1, 0.0, 0.9, 0.8]),
}

for texto, vector in embeddings_faq.items():
    print(f"{texto}: {vector}")
```

Observa que "olvidé mi contraseña" y "no puedo entrar a mi cuenta" tienen vectores parecidos (números altos en las mismas posiciones), mientras que "la aplicación se cierra sola" es muy distinto. En un embedding real, esa cercanía numérica surge del entrenamiento del modelo, no la definimos a mano.

### Calcular la similitud coseno

La similitud coseno mide el ángulo entre dos vectores. Cuanto más cercano a 1, más parecidos son los textos en significado.

```python
import numpy as np

def similitud_coseno(vector_a, vector_b):
    producto_punto = np.dot(vector_a, vector_b)
    norma_a = np.linalg.norm(vector_a)
    norma_b = np.linalg.norm(vector_b)
    return producto_punto / (norma_a * norma_b)

vector_1 = np.array([0.9, 0.1, 0.0, 0.2])
vector_2 = np.array([0.8, 0.2, 0.1, 0.1])

print("Similitud:", similitud_coseno(vector_1, vector_2))
```

El resultado será cercano a 1 porque ambos vectores apuntan en direcciones parecidas. Si comparas vectores muy distintos, el resultado se acerca a 0 o incluso a valores negativos.

### Buscar el texto más parecido a una consulta

Con la función de similitud, puedes construir un buscador simple: comparar la consulta contra cada texto guardado y quedarte con el más cercano.

```python
def buscar_mas_similar(vector_consulta, base_de_embeddings):
    mejor_texto = None
    mejor_similitud = -1.0

    for texto, vector in base_de_embeddings.items():
        similitud = similitud_coseno(vector_consulta, vector)
        if similitud > mejor_similitud:
            mejor_similitud = similitud
            mejor_texto = texto

    return mejor_texto, mejor_similitud

# Simulamos el embedding de una nueva pregunta del usuario
consulta_usuario = np.array([0.85, 0.15, 0.05, 0.15])

resultado, puntaje = buscar_mas_similar(consulta_usuario, embeddings_faq)
print(f"Pregunta más relacionada: '{resultado}' (similitud: {puntaje:.3f})")
```

Este es el corazón de un buscador de FAQs semántico: en vez de comparar palabras exactas, comparas significados representados como vectores.

### Ranking de varios resultados, no solo el mejor

En una aplicación real casi siempre quieres mostrar varias opciones ordenadas por relevancia, no solo la primera.

```python
def buscar_top_n(vector_consulta, base_de_embeddings, n=3):
    resultados = []
    for texto, vector in base_de_embeddings.items():
        similitud = similitud_coseno(vector_consulta, vector)
        resultados.append((texto, similitud))

    resultados.ordenados = sorted(resultados, key=lambda par: par[1], reverse=True)
    return resultados.ordenados[:n]

top_resultados = buscar_top_n(consulta_usuario, embeddings_faq, n=3)
for texto, similitud in top_resultados:
    print(f"{similitud:.3f} -> {texto}")
```

Ordenar por similitud descendente y quedarte con los primeros `n` resultados es exactamente lo que hacen los buscadores semánticos reales, solo que a mayor escala y con vectores de cientos de dimensiones.

### Asistente de estudio con búsqueda semántica

Aplicando la misma idea, puedes imaginar un asistente de estudio que encuentra el apunte más relacionado con la duda de un estudiante.

```python
apuntes_embeddings = {
    "bucles for en python": np.array([0.7, 0.6, 0.1, 0.0]),
    "listas y diccionarios": np.array([0.6, 0.7, 0.2, 0.0]),
    "manejo de excepciones": np.array([0.1, 0.2, 0.8, 0.6]),
}

pregunta_estudiante = np.array([0.65, 0.65, 0.15, 0.0])

apunte_sugerido, similitud = buscar_mas_similar(pregunta_estudiante, apuntes_embeddings)
print(f"Apunte sugerido: '{apunte_sugerido}' (similitud: {similitud:.3f})")
```

En una aplicación real, esos vectores vendrían de un modelo de embeddings entrenado, pero la lógica de comparación y ranking sería idéntica a la que acabas de escribir.

## Errores comunes

- **Comparar vectores de distinta longitud**: la similitud coseno requiere que ambos vectores tengan la misma cantidad de dimensiones. Verifica siempre que provengan del mismo modelo de embeddings.
- **Olvidar normalizar o dividir entre las normas**: calcular solo el producto punto sin dividir entre las normas no es similitud coseno real, y da resultados engañosos al comparar vectores de distinta magnitud.
- **Pensar que la similitud alta garantiza una respuesta correcta**: la búsqueda semántica encuentra contenido relacionado, no verifica que sea la respuesta perfecta. Sigue siendo necesario revisar el resultado antes de mostrarlo como definitivo.

## Resumen

- Un embedding convierte texto en un vector numérico que representa su significado.
- La similitud coseno mide qué tan parecidos son dos vectores, sin importar su magnitud.
- Buscar el texto más similar a una consulta es la base de cualquier búsqueda semántica.
- NumPy facilita estos cálculos con `np.dot` y `np.linalg.norm`.
- Esta técnica es el primer paso hacia sistemas más avanzados como RAG, que verás en la siguiente lección.
