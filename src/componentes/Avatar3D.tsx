import { Component, Suspense, useEffect, useRef, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Bounds, Center, useAnimations, useGLTF } from '@react-three/drei'
import type { Group } from 'three'

class LimiteErrorAvatar extends Component<
  { fallback: ReactNode; children: ReactNode },
  { error: boolean }
> {
  state = { error: false }
  static getDerivedStateFromError() {
    return { error: true }
  }
  render() {
    return this.state.error ? this.props.fallback : this.props.children
  }
}

const RUTA_MODELO = '/avatar.glb'

type ModeloProps = {
  hablando: boolean
}

function ModeloAvatar({ hablando }: ModeloProps) {
  const grupoRef = useRef<Group>(null)
  const { scene, animations } = useGLTF(RUTA_MODELO)
  const { actions, names } = useAnimations(animations, grupoRef)

  useEffect(() => {
    const primeraAccion = names.length > 0 ? actions[names[0]] : null
    if (!primeraAccion) return

    if (hablando) {
      primeraAccion.reset().fadeIn(0.2).play()
    } else {
      primeraAccion.fadeOut(0.2)
    }
  }, [hablando, actions, names])

  useFrame((estado) => {
    if (!grupoRef.current) return
    if (!hablando) {
      // Movimiento de respiración suave en reposo
      grupoRef.current.rotation.y = Math.sin(estado.clock.elapsedTime * 0.4) * 0.06
      grupoRef.current.position.y = Math.sin(estado.clock.elapsedTime * 0.8) * 0.005
      return
    }
    if (names.length === 0) {
      // Animación de habla cuando el modelo no trae pistas propias:
      // simula apertura de boca con rotación rápida en X y balanceo en Z.
      const t = estado.clock.elapsedTime
      grupoRef.current.rotation.x = Math.abs(Math.sin(t * 9)) * 0.03
      grupoRef.current.rotation.z = Math.sin(t * 5) * 0.015
      grupoRef.current.position.y = Math.sin(t * 11) * 0.008
    }
  })

  return (
    <group ref={grupoRef}>
      <primitive object={scene} />
    </group>
  )
}

type Avatar3DProps = {
  hablando: boolean
}

function Avatar3D({ hablando }: Avatar3DProps) {
  return (
    <div className="avatar-contenedor">
      <LimiteErrorAvatar
        fallback={
          <div className={`avatar-placeholder ${hablando ? 'avatar-hablando' : ''}`}>
            🤖
          </div>
        }
      >
        {/*
          No asumimos la escala ni la posición del modelo: <Center> lo centra
          en el origen y <Bounds fit clip> ajusta la cámara una vez para que el
          avatar quede encuadrado, sin importar las dimensiones del .glb.
          (Sin "observe" para no provocar bucles de redimensionado.)
        */}
        <Canvas
          camera={{ position: [0, 0, 5], fov: 40 }}
          style={{ position: 'absolute', inset: 0, display: 'block' }}
        >
          <ambientLight intensity={1.0} />
          <directionalLight position={[2, 4, 3]} intensity={1.4} />
          <directionalLight position={[-2, 1, 1]} intensity={0.4} />
          <Suspense fallback={null}>
            <Bounds fit clip margin={1.1}>
              <Center>
                <ModeloAvatar hablando={hablando} />
              </Center>
            </Bounds>
          </Suspense>
        </Canvas>
      </LimiteErrorAvatar>
    </div>
  )
}

useGLTF.preload(RUTA_MODELO)

export default Avatar3D
