# ¿Qué son los LLMs?

## Introducción

Cuando hablas con un chatbot moderno y sientes que entiende lo que le escribes, casi siempre hay un LLM detrás. LLM significa "modelo de lenguaje grande" (Large Language Model): un programa entrenado con enormes cantidades de texto que aprende a predecir qué palabra sigue después de otra. Suena simple, pero de esa idea básica surgen capacidades que parecen mucho más complejas, como responder preguntas, escribir código o resumir documentos.

Entender qué son los LLMs y cómo funcionan por dentro te da una ventaja enorme como programador. No necesitas ser experto en matemáticas para usarlos bien: necesitas entender sus fortalezas y sus límites para diseñar aplicaciones confiables. Esta lección es la base de todo el capítulo, porque los conceptos que veas aquí (tokens, predicción, alucinaciones) reaparecerán constantemente cuando programes con estos modelos desde Python.

Al final, sabrás explicar con tus propias palabras cómo un LLM "piensa", por qué a veces se equivoca con total seguridad y qué panorama general existe hoy en cuanto a tipos de modelos disponibles.

## Conceptos clave

- **LLM (modelo de lenguaje grande)**: red neuronal entrenada con muchísimo texto para predecir la siguiente palabra o fragmento de una secuencia.
- **Token**: la unidad mínima de texto que procesa un LLM; puede ser una palabra completa, parte de una palabra o un signo de puntuación.
- **Predicción del siguiente token**: el mecanismo central de generación de texto: el modelo calcula qué token es más probable que siga, uno a la vez.
- **Alucinación**: cuando el modelo genera información que suena convincente pero es falsa o inventada.
- **Ventana de contexto**: la cantidad máxima de tokens que un modelo puede "recordar" en una sola conversación o solicitud.

## Desarrollo

### Cómo se divide el texto en tokens

Antes de generar nada, un LLM convierte el texto en tokens. Puedes imaginarlo como trocear una oración en piezas que el modelo entiende como números.

```python
# Simulación simplificada de tokenización
# (los tokenizadores reales usan subpalabras, no solo espacios)

texto = "Los modelos de lenguaje predicen texto"
tokens_aproximados = texto.split()

for i, token in enumerate(tokens_aproximados):
    print(f"Token {i}: {token}")
```

Este ejemplo divide por espacios para ilustrar la idea, pero un tokenizador real de un LLM suele partir palabras largas en fragmentos más pequeños. Por ejemplo, "programación" podría convertirse en dos o tres piezas, no en una sola palabra completa.

### Generación como predicción secuencial

Un LLM no "sabe" la respuesta completa de antemano. Genera un token, lo agrega al texto, y vuelve a predecir el siguiente usando todo lo que lleva escrito hasta ahora.

```python
def generar_paso_a_paso(prompt_inicial, cantidad_tokens=5):
    """Simula, de forma conceptual, cómo un LLM
    va agregando tokens uno por uno."""
    texto_actual = prompt_inicial
    tokens_generados = []

    for _ in range(cantidad_tokens):
        # En un LLM real, aquí el modelo calcula
        # probabilidades sobre miles de tokens posibles
        siguiente_token = " (token predicho)"
        texto_actual += siguiente_token
        tokens_generados.append(siguiente_token)

    return texto_actual

resultado = generar_paso_a_paso("El clima de hoy es")
print(resultado)
```

Esta función es una simplificación total, pero refleja la idea real: cada palabra nueva depende de todo el texto anterior, incluido lo que el propio modelo ya generó.

### Ventana de contexto y sus límites

Cada LLM tiene un límite de tokens que puede procesar a la vez, tanto de entrada como de salida combinadas.

```python
def cabe_en_contexto(texto, limite_tokens=4096):
    """Estimación aproximada: en promedio,
    un token equivale a unos 4 caracteres en español."""
    tokens_estimados = len(texto) // 4
    return tokens_estimados <= limite_tokens

articulo = "Contenido de un artículo largo..." * 500
print("¿Cabe en el contexto?", cabe_en_contexto(articulo))
print("Tokens estimados:", len(articulo) // 4)
```

Si tu texto supera la ventana de contexto, el modelo simplemente no puede "ver" todo a la vez. Esto es clave cuando trabajas con documentos largos: necesitarás dividirlos en fragmentos, un tema que retomaremos con RAG más adelante en este capítulo.

### Capacidades típicas de un LLM

```python
capacidades = {
    "traducir texto": True,
    "resumir documentos": True,
    "generar código": True,
    "responder con hechos verificados en tiempo real": False,
    "recordar conversaciones pasadas sin ayuda externa": False,
}

for tarea, es_capaz in capacidades.items():
    estado = "puede" if es_capaz else "no puede por sí solo"
    print(f"El modelo {estado}: {tarea}")
```

Este diccionario resume una idea importante: un LLM es excelente generando lenguaje coherente, pero no tiene acceso automático a información actualizada ni memoria persistente, a menos que la aplicación se lo proporcione explícitamente.

### Panorama general de modelos actuales

Hoy existen modelos de distintos tamaños y proveedores: algunos se ejecutan en la nube mediante una API, otros pueden correr en tu propia computadora. En términos generales se agrupan así:

```python
tipos_de_modelos = {
    "modelos grandes en la nube": "alta calidad, requieren conexión e internet",
    "modelos medianos locales": "buen balance, corren en laptops potentes",
    "modelos pequeños locales": "rápidos, ideales para tareas simples o pruebas",
}

for tipo, descripcion in tipos_de_modelos.items():
    print(f"{tipo}: {descripcion}")
```

No es necesario elegir un único proveedor: en la práctica, muchos desarrolladores combinan modelos según la tarea, el costo y la necesidad de privacidad.

## Errores comunes

- **Creer que el modelo "entiende" como una persona**: en realidad predice patrones estadísticos de texto. Por eso puede sonar seguro incluso cuando se equivoca. Verifica siempre datos importantes.
- **Ignorar el límite de la ventana de contexto**: enviar un texto demasiado largo puede truncar información clave sin previo aviso. Divide textos largos en partes manejables.
- **Confundir "alucinación" con un simple error de tipeo**: una alucinación es contenido inventado con apariencia de hecho real, no un descuido menor. Trátala como un riesgo de confiabilidad, no como un detalle cosmético.

## Resumen

- Un LLM genera texto prediciendo el siguiente token, uno a la vez, basado en todo el contexto anterior.
- El texto se procesa en tokens, no en palabras completas ni en caracteres sueltos.
- Cada modelo tiene una ventana de contexto limitada que debes respetar.
- Las alucinaciones son un riesgo real: el modelo puede sonar convincente y estar equivocado.
- Existen modelos de distintos tamaños y formas de acceso, y elegir el adecuado depende de la tarea.
