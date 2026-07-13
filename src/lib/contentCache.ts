// Caché de contenido descargado, en el sistema de archivos del dispositivo.
// En web (dev) el plugin usa IndexedDB; en Android, almacenamiento de la app.

import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import type { Catalog, Course } from './content'

const DIR = Directory.Data
const FOLDER = 'content'

async function ensureFolder() {
  try {
    await Filesystem.mkdir({ path: FOLDER, directory: DIR, recursive: true })
  } catch {
    // ya existe — ok
  }
}

async function readJSON<T>(path: string): Promise<T | null> {
  try {
    const { data } = await Filesystem.readFile({ path, directory: DIR, encoding: Encoding.UTF8 })
    return JSON.parse(data as string) as T
  } catch {
    return null
  }
}

async function writeJSON(path: string, value: unknown): Promise<void> {
  await ensureFolder()
  await Filesystem.writeFile({
    path, directory: DIR, encoding: Encoding.UTF8,
    data: JSON.stringify(value),
  })
}

export const readCachedCatalog = () => readJSON<Catalog>(`${FOLDER}/catalog.json`)
export const writeCachedCatalog = (c: Catalog) => writeJSON(`${FOLDER}/catalog.json`, c)

export const readCachedCourse = (id: string) => readJSON<Course>(`${FOLDER}/course-${id}.json`)
export const writeCachedCourse = (id: string, c: Course) => writeJSON(`${FOLDER}/course-${id}.json`, c)
