import { Canvas, useFrame, type RootState } from '@react-three/fiber'

import * as THREE from 'three'
import gsap from 'gsap'

import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'
import { useEffect, useMemo, useRef } from 'react'
import { BufferGeometry, Mesh, ShaderMaterial, type NormalBufferAttributes } from 'three'
import { useControls } from 'leva'
import useScrollControl from './hooks/useScrollControl'
import { useMouse } from '@mantine/hooks'

// Helper function to convert hex to RGB
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255]
    : [1, 1, 1]
}

interface GeometrySphereProps {
  isDebug?: boolean
}
function GeometrySphere(props: GeometrySphereProps) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: 0 },
      uNoiseDensity: { value: 0 },
      uNoiseStrength: { value: 0 },
      uFrequency: { value: 0 },
      uAmplitude: { value: 0 },
      uAlpha: { value: 1 },
      uColor: { value: new THREE.Vector3(1.0, 1.0, 1.0) } // Default white color
    }),
    []
  )

  const shaderRef = useRef<ShaderMaterial>(null)
  const meshRef = useRef<Mesh<BufferGeometry<NormalBufferAttributes>>>(null)

  useScrollControl(meshRef.current)

  const geometryControls = useControls('Geometry', {
    uTime: {
      value: 0,
      min: 0,
      max: 10
    },
    uSpeed: {
      value: 0,
      min: 0,
      max: 10
    },
    uNoiseDensity: {
      value: 0,
      min: 0,
      max: 10
    },
    uNoiseStrength: {
      value: 0,
      min: 0,
      max: 10
    },
    uFrequency: {
      value: 0,
      min: 0,
      max: 10
    },
    uAmplitude: {
      value: 0,
      min: 0,
      max: 10
    },
    uAlpha: {
      value: 1,
      min: 0,
      max: 1
    },
    color: {
      value: '#ffffff'
    },
    rotationX: {
      value: 0,
      min: -10,
      max: 10
    },
    rotationY: {
      value: 0,
      min: -10,
      max: 10
    },
    rotationZ: {
      value: 0,
      min: -10,
      max: 10
    }
  })

  const cameraControls = useControls('Camera', {
    positionX: {
      value: 0,
      min: -10,
      max: 10
    },
    positionY: {
      value: 0,
      min: -10,
      max: 10
    },
    positionZ: {
      value: 4,
      min: -10,
      max: 10
    }
  })

  const { x, y } = useMouse()

  function debug(state: RootState) {
    if (meshRef.current && shaderRef.current) {
      gsap.to(meshRef.current.rotation, {
        x: geometryControls.rotationX,
        y: geometryControls.rotationY,
        z: geometryControls.rotationZ
      })

      // Update color from hex
      const [r, g, b] = hexToRgb(geometryControls.color)
      gsap.to(shaderRef.current.uniforms.uColor.value, {
        x: r,
        y: g,
        z: b
      })

      // const mouseX = state.pointer.x * 4
      // const mouseY = state.pointer.y * 2

      gsap.to(shaderRef.current.uniforms.uTime, { value: geometryControls.uTime })
      gsap.to(shaderRef.current.uniforms.uSpeed, { value: geometryControls.uSpeed })
      gsap.to(shaderRef.current.uniforms.uNoiseDensity, { value: geometryControls.uNoiseDensity })
      gsap.to(shaderRef.current.uniforms.uNoiseStrength, { value: geometryControls.uNoiseStrength })
      gsap.to(shaderRef.current.uniforms.uFrequency, { value: geometryControls.uFrequency })
      gsap.to(shaderRef.current.uniforms.uAmplitude, { value: geometryControls.uAmplitude })
      gsap.to(shaderRef.current.uniforms.uAlpha, { value: geometryControls.uAlpha })

      // meshRef.current?.scale.set(
      //   state.viewport.width < state.viewport.height ? 0.75 : 1,
      //   state.viewport.width < state.viewport.height ? 0.75 : 1,
      //   state.viewport.width < state.viewport.height ? 0.75 : 1
      // )

      gsap.to(state.camera.position, {
        x: cameraControls.positionX,
        y: cameraControls.positionY,
        z: cameraControls.positionZ
      })
    }
  }

  function updateShader() {
    if (shaderRef.current) {
      gsap.to(shaderRef.current.uniforms.uAmplitude, {
        value: (y / window.innerHeight) * 1,
        duration: 5,
        ease: 'expo'
      })
      gsap.to(shaderRef.current.uniforms.uFrequency, {
        value: (y / window.innerHeight) * 10,
        duration: 5,
        ease: 'expo'
      })
      gsap.to(shaderRef.current.uniforms.uNoiseDensity, {
        value: (x / window.innerWidth) * 1.8,
        duration: 5,
        ease: 'expo'
      })
      gsap.to(shaderRef.current.uniforms.uNoiseStrength, {
        value: (x / window.innerWidth) * 1,
        duration: 5,
        ease: 'expo'
      })
    }
  }

  useEffect(() => {
    updateShader()
  }, [x, y])

  useFrame((state) => {
    if (props.isDebug) {
      debug(state)
    }
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 64]} />
      <shaderMaterial
        ref={shaderRef}
        wireframe
        blending={THREE.AdditiveBlending}
        transparent
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}

export default function GeometryCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 50, zoom: 1, near: 1, far: 2e3 }}
      gl={{ antialias: true, alpha: true }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: '100%',
        height: '100vh'
      }}
    >
      <ambientLight intensity={0.5} />
      <GeometrySphere isDebug={false} />
    </Canvas>
  )
}
