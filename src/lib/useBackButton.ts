import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { App } from '@capacitor/app'
import { Dialog } from '@capacitor/dialog'

// Conecta el botón/gesto "atrás" de Android al router:
//  - si NO estás en Inicio → vuelve a la pantalla anterior
//  - si estás en Inicio → pregunta "¿Salir?" y, si confirma, cierra la app
export function useBackButton() {
  const navigate = useNavigate()
  const location = useLocation()
  const pathRef = useRef(location.pathname)
  pathRef.current = location.pathname

  useEffect(() => {
    let active = true
    let handle: { remove: () => void } | undefined

    App.addListener('backButton', async () => {
      if (pathRef.current !== '/') {
        navigate(-1)
      } else {
        const { value } = await Dialog.confirm({
          title: 'Salir de Codalia',
          message: '¿Quieres cerrar la aplicación?',
          okButtonTitle: 'Salir',
          cancelButtonTitle: 'Cancelar',
        })
        if (value) App.exitApp()
      }
    }).then(h => {
      // Si el hook se desmontó antes de resolver la promesa, remover ya mismo
      if (!active) h.remove()
      else handle = h
    })

    return () => { active = false; handle?.remove() }
  }, [navigate])
}
