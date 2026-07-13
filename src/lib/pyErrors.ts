// Traduce/explica los errores comunes de Python al español para que se entiendan.
// Devuelve un mensaje amigable; si no reconoce el error, deja el original.

export function explainPyError(raw: string): string {
  const msg = raw.trim()

  // NameError: name 'x' is not defined
  const name = msg.match(/NameError:\s*name '([^']+)' is not defined/)
  if (name) return `Usaste «${name[1]}» pero no está definido. ¿Lo escribiste bien o te faltó crearlo?`

  if (/IndentationError|unexpected indent|expected an indented block/.test(msg))
    return 'Error de sangría (indentación): revisa los espacios al inicio de las líneas. Usa 4 espacios dentro de funciones, if, for, etc.'

  if (/SyntaxError/.test(msg))
    return 'Error de sintaxis: revisa la escritura. Suele faltar los dos puntos «:», un paréntesis, o una comilla de cierre.'

  const type = msg.match(/TypeError:\s*(.+)/)
  if (type) return `Error de tipos: estás mezclando tipos incompatibles. (${type[1]})`

  if (/ZeroDivisionError/.test(msg)) return 'Estás dividiendo entre cero, y eso no se puede.'
  if (/IndexError/.test(msg)) return 'Te saliste del rango de la lista (accediste a una posición que no existe).'
  if (/KeyError:\s*(.+)/.test(msg)) {
    const k = msg.match(/KeyError:\s*(.+)/)
    return `Esa clave no existe en el diccionario: ${k?.[1]}`
  }
  if (/ValueError:\s*(.+)/.test(msg)) {
    const v = msg.match(/ValueError:\s*(.+)/)
    return `Valor inválido: ${v?.[1]}`
  }
  if (/AttributeError:\s*(.+)/.test(msg)) {
    const a = msg.match(/AttributeError:\s*(.+)/)
    return `Ese objeto no tiene ese método o atributo. (${a?.[1]})`
  }
  if (/recursion/i.test(msg)) return 'Tu función se llama a sí misma sin fin (recursión infinita).'

  return msg
}
