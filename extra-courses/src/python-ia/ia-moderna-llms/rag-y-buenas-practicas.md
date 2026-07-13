# RAG y buenas prácticas

## Introducción

Ya sabes que los LLMs pueden alucinar y que su ventana de contexto es limitada. RAG (Retrieval-Augmented Generation, o "generación aumentada por recuperación") es la técnica más usada para reducir ese problema: en vez de confiar únicamente en lo que el modelo "recuerda" de su entrenamiento, le entregas primero la información relevante y le pides que responda basándose en ella.

Piensa en un asistente de soporte técnico de una empresa real. Ese modelo no fue entrenado con los manuales internos de la empresa, así que si le preguntas algo específico sobre un producto, inventará una respuesta plausible pero probablemente incorrecta. Con RAG, primero buscas en tus propios documentos (usando embeddings, como en la lección anterior) los fragmentos más relevantes, y luego se los das al modelo como contexto antes de que responda.

Esta lección conecta todo lo que aprendiste en el capítulo: tokens, llamadas a la API y búsqueda semántica se combinan en una arquitectura práctica. También hablaremos de ética, privacidad y buenas prácticas, temas indispensables antes de llevar cualquier proyecto de IA a producción.

## Conceptos clave

- **RAG (generación aumentada por recuperación)**: técnica que combina búsqueda de información relevante con generación de texto por un LLM.
- **Indexar**: preparar tus documentos de antemano, dividiéndolos en fragmentos y calculando sus embeddings.
- **Recuperar**: buscar, en el momento de la consulta, los fragmentos más relevantes según similitud semántica.
- **Generar**: enviar al LLM la pregunta junto con los fragmentos recuperados, para que construya la respuesta final.
- **Privacidad de datos**: cuidado necesario al enviar información sensible a un servicio externo de IA.

## Desarrollo

### Arquitectura típica de un sistema RAG

Un sistema RAG se organiza en tres etapas claras, que puedes representar como funciones separadas.

```python
def indexar_documentos(documentos, funcion_embedding):
    """Convierte cada documento en un embedding y guarda ambos."""
    indice = []
    for documento in documentos:
        vector = funcion_embedding(documento)
        indice.append({"texto": documento, "vector": vector})
    return indice

def recuperar_relevantes(pregunta, indice, funcion_embedding, funcion_similitud, top_n=2):
    """Busca los fragmentos más parecidos a la pregunta."""
    vector_pregunta = funcion_embedding(pregunta)
    puntuados = [
        (item["texto"], funcion_similitud(vector_pregunta, item["vector"]))
        for item in indice
    ]
    puntuados.sort(key=lambda par: par[1], reverse=True)
    return [texto for texto, _ in puntuados[:top_n]]
```

Separar estas responsabilidades facilita probar cada parte de forma independiente: puedes cambiar cómo generas embeddings sin tocar la lógica de recuperación, por ejemplo.

### Construir el contexto para el LLM

Una vez recuperados los fragmentos relevantes, se combinan en un mensaje de sistema que "ancla" la respuesta del modelo a esa información.

```python
def construir_prompt_con_contexto(pregunta, fragmentos_relevantes):
    contexto = "\n\n".join(fragmentos_relevantes)

    mensajes = [
        {
            "role": "system",
            "content": (
                "Responde únicamente usando la información del contexto. "
                "Si el contexto no contiene la respuesta, di que no lo sabes.\n\n"
                f"Contexto:\n{contexto}"
            ),
        },
        {"role": "user", "content": pregunta},
    ]
    return mensajes

fragmentos_ejemplo = [
    "Para restablecer tu contraseña, ve a Ajustes > Seguridad > Restablecer.",
    "El restablecimiento envía un enlace válido por 30 minutos al correo registrado.",
]

prompt_final = construir_prompt_con_contexto(
    "¿Cómo restablezco mi contraseña?", fragmentos_ejemplo
)
for mensaje in prompt_final:
    print(mensaje["role"], "->", mensaje["content"][:60], "...")
```

La instrucción "si el contexto no contiene la respuesta, di que no lo sabes" es clave: reduce alucinaciones al darle al modelo permiso explícito para admitir que no tiene la información.

### Flujo completo de un sistema RAG simple

Uniendo indexar, recuperar y generar, obtienes el flujo completo de un asistente basado en documentos propios.

```python
def responder_con_rag(pregunta, indice, funcion_embedding, funcion_similitud, funcion_llm):
    fragmentos = recuperar_relevantes(pregunta, indice, funcion_embedding, funcion_similitud)
    mensajes = construir_prompt_con_contexto(pregunta, fragmentos)
    respuesta = funcion_llm(mensajes)
    return respuesta, fragmentos

# funcion_embedding, funcion_similitud y funcion_llm vendrían
# de las lecciones anteriores de este capítulo
```

Este patrón es el mismo que usan asistentes de soporte técnico, buscadores de manuales internos o tutores de estudio que responden solo con base en el material de un curso específico.

### Ética y privacidad al usar IA

Antes de enviar datos a un LLM externo, conviene decidir con criterio qué información es segura de compartir.

```python
def contiene_datos_sensibles(texto):
    palabras_clave_sensibles = [
        "contraseña", "tarjeta de crédito", "número de cuenta", "cédula",
    ]
    texto_normalizado = texto.lower()
    return any(palabra in texto_normalizado for palabra in palabras_clave_sensibles)

mensaje_usuario = "Mi tarjeta de crédito no procesa el pago"
if contiene_datos_sensibles(mensaje_usuario):
    print("Advertencia: revisar antes de enviar a un servicio externo")
else:
    print("El mensaje puede procesarse normalmente")
```

Esta verificación es solo un ejemplo simple; en un sistema real conviene anonimizar o filtrar datos sensibles antes de que lleguen a cualquier API externa, y ser transparente con las personas usuarias sobre qué información procesa la IA.

## Errores comunes

- **Recuperar fragmentos irrelevantes por un índice mal construido**: si divides los documentos en trozos demasiado grandes o demasiado pequeños, la búsqueda semántica pierde precisión. Ajusta el tamaño de fragmento según el tipo de contenido.
- **No decirle al modelo que puede admitir que no sabe**: sin esa instrucción explícita, el modelo tiende a inventar una respuesta antes que reconocer la falta de información. Inclúyela siempre en el mensaje de sistema.
- **Enviar datos sensibles sin filtrarlos primero**: asumir que cualquier texto es seguro de enviar a una API externa puede exponer información privada. Revisa y filtra antes de enviar.

## Ideas de proyectos para practicar

- Un buscador de preguntas frecuentes para un curso, usando los apuntes como base de conocimiento.
- Un asistente de soporte técnico que solo responda con base en un manual de usuario en texto plano.
- Un resumidor de artículos largos que primero indexe secciones y luego responda preguntas puntuales sobre el texto.

## Resumen

- RAG combina recuperación de información relevante con generación de texto por un LLM.
- La arquitectura típica tiene tres etapas: indexar, recuperar y generar.
- Instruir al modelo para admitir cuando no sabe algo reduce las alucinaciones de forma significativa.
- Filtrar datos sensibles antes de enviarlos a un servicio externo es una práctica ética y de seguridad indispensable.
- Practicar con proyectos concretos, como un buscador de FAQs o un asistente de estudio, consolida todo lo visto en este capítulo.
