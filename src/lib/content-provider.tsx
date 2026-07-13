import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { CONTENT_BASE_URL } from './config'
import {
  getCatalog, setCatalog, addLoadedCourse, isCourseLoaded, getCourse, getCatalogCourse,
  type Catalog, type Course, type CatalogCourse, type LearningPath,
} from './content'
import {
  readCachedCatalog, writeCachedCatalog, readCachedCourse, writeCachedCourse,
} from './contentCache'

interface ContentContextValue {
  catalog: Catalog
  courses: CatalogCourse[]
  learningPaths: LearningPath[]
  refreshing: boolean
  version: number // se incrementa cuando cambia el contenido cargado
  ensureCourse: (id: string) => Promise<Course | null>
}

const ContentContext = createContext<ContentContextValue | null>(null)

export function useContent() {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent debe usarse dentro de <ContentProvider>')
  return ctx
}

async function fetchJSON<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json() as T
  } catch {
    return null
  }
}

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [catalog, setCatalogState] = useState<Catalog>(getCatalog())
  const [refreshing, setRefreshing] = useState(false)
  const [version, setVersion] = useState(0)
  const inFlight = useRef<Record<string, Promise<Course | null> | undefined>>({})

  const bump = useCallback(() => setVersion(v => v + 1), [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      // 1) Catálogo cacheado (más nuevo que el bundleado → usarlo)
      const cached = await readCachedCatalog()
      if (cached && cached.version >= getCatalog().version) {
        setCatalog(cached)
        if (mounted) setCatalogState(cached)
      }

      // 2) Precargar al store todos los cursos ya cacheados (para que el
      //    progreso en Inicio se vea correcto sin tener que abrirlos)
      for (const c of getCatalog().courses) {
        if (!isCourseLoaded(c.id)) {
          const cc = await readCachedCourse(c.id)
          if (cc) addLoadedCourse(cc)
        }
      }
      if (mounted) bump()

      // 3) Refrescar catálogo desde remoto (si está configurado)
      if (CONTENT_BASE_URL) {
        if (mounted) setRefreshing(true)
        const remote = await fetchJSON<Catalog>(`${CONTENT_BASE_URL}catalog.json`)
        if (remote && remote.version > getCatalog().version) {
          setCatalog(remote)
          await writeCachedCatalog(remote)
          if (mounted) { setCatalogState(remote); bump() }
        }
        if (mounted) setRefreshing(false)
      }
    })()
    return () => { mounted = false }
  }, [bump])

  const ensureCourse = useCallback(async (id: string): Promise<Course | null> => {
    const entry = getCatalogCourse(id)

    // Ya cargado y al día con el catálogo
    if (isCourseLoaded(id)) {
      const loaded = getCourse(id)!
      if (!entry || loaded.version >= entry.version) return loaded
      // si el catálogo tiene una versión más nueva, sigue para re-descargar
    }
    const existing = inFlight.current[id]
    if (existing) return existing

    const promise = (async (): Promise<Course | null> => {
      // 1) Caché local
      const cached = await readCachedCourse(id)
      if (cached && (!entry || cached.version >= entry.version)) {
        addLoadedCourse(cached); bump(); return cached
      }
      // 2) Remoto
      if (CONTENT_BASE_URL && entry) {
        const remote = await fetchJSON<Course>(`${CONTENT_BASE_URL}${entry.file}`)
        if (remote) {
          addLoadedCourse(remote); await writeCachedCourse(id, remote); bump(); return remote
        }
      }
      // 3) Caché vieja como último recurso
      if (cached) { addLoadedCourse(cached); bump(); return cached }
      return null
    })()

    inFlight.current[id] = promise
    try {
      return await promise
    } finally {
      delete inFlight.current[id]
    }
  }, [bump])

  const value: ContentContextValue = {
    catalog,
    courses: catalog.courses,
    learningPaths: catalog.learning_paths,
    refreshing,
    version,
    ensureCourse,
  }

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}
