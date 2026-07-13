# Usar LLMs desde Python

## Introducción

Saber qué es un LLM no sirve de mucho si no puedes conectarte a uno desde tu código. La buena noticia es que la mayoría de los proveedores de LLMs, y también las herramientas para ejecutarlos localmente, exponen una API con un formato muy parecido entre sí. Si aprendes ese formato genérico una vez, podrás usarlo con distintos modelos sin reescribir tu aplicación desde cero.

En esta lección aprenderás a construir solicitudes HTTP hacia una API de chat, entender el papel de los roles "system" y "user", ajustar parámetros como la temperatura, y manejar respuestas y errores como lo haría un programa en producción. También veremos algo fundamental para cualquier aplicación real: cómo proteger tus claves de API para que nunca terminen expuestas en tu código fuente.

Este conocimiento es la base práctica de todo el capítulo: cualquier chatbot de soporte, buscador de preguntas frecuentes o asistente de estudio que quieras construir empieza exactamente aquí, con una llamada bien estructurada a un LLM.

## Conceptos clave

- **API compatible con OpenAI**: formato de solicitud y respuesta estandarizado que usan muchos proveedores de LLMs, facilitando cambiar de modelo sin cambiar tu código.
- **Rol "system"**: mensaje que define el comportamiento general del modelo antes de la conversación (por ejemplo, su tono o sus reglas).
- **Rol "user"**: mensaje que representa lo que escribe la persona usuaria.
- **Temperatura**: parámetro que controla qué tan creativas o predecibles son las respuestas del modelo.
- **max_tokens**: límite de tokens que el modelo puede generar en su respuesta.

## Desarrollo

### Variables de entorno para la API key

Nunca escribas una clave de API directamente en tu código. Usa variables de entorno para mantenerla fuera del archivo fuente.

```python
import os

# La clave se lee del entorno, nunca se escribe aquí
clave_api = os.environ.get("LLM_API_KEY")

if not clave_api:
    raise ValueError(
        "Define la variable de entorno LLM_API_KEY antes de ejecutar este script"
    )
```

En tu sistema, la variable se define fuera del código (por ejemplo, en la terminal o en un archivo `.env` que nunca subes a un repositorio). Así, si compartes tu código, la clave real permanece privada.

### Estructura básica de una solicitud con roles

Las APIs compatibles con el formato de chat esperan una lista de mensajes, cada uno con un rol.

```python
mensajes = [
    {
        "role": "system",
        "content": "Eres un asistente de soporte técnico, breve y claro."
    },
    {
        "role": "user",
        "content": "Mi aplicación no guarda los cambios, ¿qué reviso primero?"
    },
]

for mensaje in mensajes:
    print(f"[{mensaje['role']}] {mensaje['content']}")
```

El mensaje "system" fija el comportamiento general del asistente antes de que la persona escriba nada. El mensaje "user" es la pregunta real que llega desde tu aplicación.

### Enviar la solicitud con requests

Con la lista de mensajes lista, puedes enviarla a cualquier API compatible con el formato de chat.

```python
import os
import requests

def preguntar_al_modelo(pregunta, url_base, modelo):
    clave_api = os.environ.get("LLM_API_KEY", "")

    cuerpo = {
        "model": modelo,
        "messages": [
            {"role": "system", "content": "Responde de forma breve y clara."},
            {"role": "user", "content": pregunta},
        ],
        "temperature": 0.7,
        "max_tokens": 300,
    }

    encabezados = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {clave_api}",
    }

    respuesta = requests.post(
        f"{url_base}/chat/completions",
        json=cuerpo,
        headers=encabezados,
        timeout=30,
    )
    respuesta.raise_for_status()
    return respuesta.json()

# Ejemplo de uso con un servidor compatible local
# resultado = preguntar_al_modelo(
#     "¿Cómo reinicio mi contraseña?",
#     url_base="http://localhost:11434/v1",
#     modelo="llama3.1:8b",
# )
```

Fíjate en `timeout=30` y en `raise_for_status()`: ambos son hábitos de buena práctica. El primero evita que tu programa quede colgado esperando indefinidamente; el segundo lanza una excepción clara si el servidor responde con un error.

### Ajustar temperatura y max_tokens según la tarea

La temperatura y el límite de tokens cambian mucho el comportamiento del modelo, así que conviene ajustarlos según el caso de uso.

```python
configuraciones = {
    "respuesta_soporte_tecnico": {"temperature": 0.2, "max_tokens": 200},
    "generar_ideas_para_blog": {"temperature": 0.9, "max_tokens": 400},
    "resumen_de_articulo": {"temperature": 0.3, "max_tokens": 250},
}

for tarea, parametros in configuraciones.items():
    print(f"{tarea}: temperatura={parametros['temperature']}, "
          f"max_tokens={parametros['max_tokens']}")
```

Una temperatura baja (cercana a 0) produce respuestas más consistentes y predecibles, ideal para soporte técnico o tareas donde la precisión importa más que la creatividad. Una temperatura alta genera más variedad, útil para lluvia de ideas.

### Manejar la respuesta y los errores

Una aplicación real debe anticipar fallos de red, tiempos de espera agotados o respuestas inesperadas.

```python
import requests

def extraer_texto_respuesta(respuesta_json):
    try:
        return respuesta_json["choices"][0]["message"]["content"]
    except (KeyError, IndexError):
        return "No se pudo interpretar la respuesta del modelo."

def preguntar_con_manejo_de_errores(pregunta, url_base, modelo):
    try:
        datos = preguntar_al_modelo(pregunta, url_base, modelo)
        return extraer_texto_respuesta(datos)
    except requests.exceptions.Timeout:
        return "El modelo tardó demasiado en responder."
    except requests.exceptions.ConnectionError:
        return "No se pudo conectar con el servidor del modelo."
    except requests.exceptions.HTTPError as error:
        return f"El servidor respondió con un error: {error}"
```

Cada tipo de excepción representa una falla distinta, y separar los `except` te permite dar un mensaje útil según lo que ocurrió, en vez de un error genérico que confunde a quien usa tu aplicación.

## Errores comunes

- **Escribir la clave de API directamente en el código**: si compartes o subes ese archivo, cualquiera puede usar tu clave. Usa siempre variables de entorno.
- **Olvidar el `timeout` en las solicitudes HTTP**: sin él, tu programa puede quedarse esperando indefinidamente si el servidor no responde. Define siempre un límite razonable.
- **No revisar el código de estado de la respuesta**: asumir que la solicitud funcionó sin comprobarlo puede hacer que tu programa procese un error como si fuera una respuesta válida. Usa `raise_for_status()` o revisa el código manualmente.

## Resumen

- Las APIs de chat compatibles con el formato OpenAI usan una lista de mensajes con roles "system" y "user".
- La temperatura controla la creatividad de las respuestas; `max_tokens` limita su extensión.
- Las claves de API deben vivir en variables de entorno, nunca en el código fuente.
- Un buen manejo de errores distingue entre problemas de conexión, tiempo de espera y errores del servidor.
- Este patrón de solicitud es la base para construir chatbots, buscadores de FAQs y asistentes de estudio.
