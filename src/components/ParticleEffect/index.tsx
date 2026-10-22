import { useRef, useMemo, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Points, OrbitControls } from '@react-three/drei'
import { useControls } from 'leva'
import * as THREE from 'three'

interface ParticleSystemProps {
  count?: number
}
function ParticleSystem({ count = 1000 }: ParticleSystemProps) {
  const ref = useRef<THREE.Points>(null!)
  const { viewport, size } = useThree()

  // Leva controls for all particle properties
  const {
    particleCount,
    particleSize,
    speed,
    movementPattern,
    colorMode,
    primaryColor,
    secondaryColor,
    opacity,
    rotationSpeed,
    waveAmplitude,
    waveFrequency,
    mouseInfluence,
    disperseRadius,
    particleShape
  } = useControls('Particle System', {
    particleCount: { value: count, min: 100, max: 10000, step: 100 },
    particleSize: { value: 0.2, min: 0.1, max: 10, step: 0.1 },
    speed: { value: 1, min: 0, max: 5, step: 0.1 },
    movementPattern: {
      value: 'wave',
      options: ['float', 'spiral', 'wave', 'orbit', 'random', 'flow']
    },
    colorMode: {
      value: 'gradient',
      options: ['single', 'gradient', 'rainbow', 'distance']
    },
    primaryColor: '#ffffff',
    secondaryColor: '#e2af30',
    opacity: { value: 0.5, min: 0, max: 1, step: 0.01 },
    rotationSpeed: { value: 0.2, min: 0, max: 3, step: 0.1 },
    waveAmplitude: { value: 1.5, min: 0, max: 10, step: 0.1 },
    waveFrequency: { value: 0.1, min: 0.1, max: 5, step: 0.1 },
    mouseInfluence: { value: 0.5, min: 0, max: 5, step: 0.1 },
    disperseRadius: { value: 16, min: 5, max: 50, step: 1 },
    particleShape: {
      value: 'diamond',
      options: ['circle', 'square', 'triangle', 'star', 'heart', 'diamond', 'cross', 'ring']
    }
  })

  // Function to create textures for different particle shapes
  const createShapeTexture = useCallback((shape: string, size = 64) => {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!

    const center = size / 2
    const radius = size * 0.4

    ctx.clearRect(0, 0, size, size)
    ctx.fillStyle = 'white'
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2

    switch (shape) {
      case 'circle':
        ctx.beginPath()
        ctx.arc(center, center, radius, 0, Math.PI * 2)
        ctx.fill()
        break

      case 'square': {
        const squareSize = radius * 1.4
        ctx.fillRect(center - squareSize / 2, center - squareSize / 2, squareSize, squareSize)
        break
      }

      case 'triangle':
        ctx.beginPath()
        ctx.moveTo(center, center - radius)
        ctx.lineTo(center - radius * 0.866, center + radius * 0.5)
        ctx.lineTo(center + radius * 0.866, center + radius * 0.5)
        ctx.closePath()
        ctx.fill()
        break

      case 'star': {
        const spikes = 5
        const outerRadius = radius
        const innerRadius = radius * 0.4
        ctx.beginPath()
        for (let i = 0; i < spikes * 2; i++) {
          const angle = (i * Math.PI) / spikes
          const r = i % 2 === 0 ? outerRadius : innerRadius
          const x = center + Math.cos(angle) * r
          const y = center + Math.sin(angle) * r
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.fill()
        break
      }

      case 'heart': {
        ctx.beginPath()
        const heartSize = radius * 0.8
        ctx.moveTo(center, center + heartSize * 0.3)
        ctx.bezierCurveTo(
          center,
          center - heartSize * 0.3,
          center - heartSize * 1.5,
          center - heartSize * 0.3,
          center - heartSize * 0.75,
          center
        )
        ctx.bezierCurveTo(
          center - heartSize * 0.75,
          center + heartSize * 0.3,
          center,
          center + heartSize * 0.6,
          center,
          center + heartSize
        )
        ctx.bezierCurveTo(
          center,
          center + heartSize * 0.6,
          center + heartSize * 0.75,
          center + heartSize * 0.3,
          center + heartSize * 0.75,
          center
        )
        ctx.bezierCurveTo(
          center + heartSize * 1.5,
          center - heartSize * 0.3,
          center,
          center - heartSize * 0.3,
          center,
          center + heartSize * 0.3
        )
        ctx.fill()
        break
      }

      case 'diamond':
        ctx.beginPath()
        ctx.moveTo(center, center - radius)
        ctx.lineTo(center + radius, center)
        ctx.lineTo(center, center + radius)
        ctx.lineTo(center - radius, center)
        ctx.closePath()
        ctx.fill()
        break

      case 'cross': {
        const crossWidth = radius * 0.3
        ctx.fillRect(center - crossWidth / 2, center - radius, crossWidth, radius * 2)
        ctx.fillRect(center - radius, center - crossWidth / 2, radius * 2, crossWidth)
        break
      }

      case 'ring':
        ctx.beginPath()
        ctx.arc(center, center, radius, 0, Math.PI * 2)
        ctx.arc(center, center, radius * 0.6, 0, Math.PI * 2, true)
        ctx.fill()
        break

      default:
        // Default to circle
        ctx.beginPath()
        ctx.arc(center, center, radius, 0, Math.PI * 2)
        ctx.fill()
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }, [])

  // Generate texture based on current shape
  const particleTexture = useMemo(() => {
    return createShapeTexture(particleShape)
  }, [particleShape, createShapeTexture])

  // Generate particle positions and colors
  const [positions, colors, originalPositions] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const originalPositions = new Float32Array(particleCount * 3)

    const color1 = new THREE.Color(primaryColor)
    const color2 = new THREE.Color(secondaryColor)

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3

      // Random positions within viewport bounds (responsive)
      const x = (Math.random() - 0.5) * disperseRadius * (viewport.width / 10)
      const y = (Math.random() - 0.5) * disperseRadius * (viewport.height / 10)
      const z = (Math.random() - 0.5) * disperseRadius

      positions[i3] = x
      positions[i3 + 1] = y
      positions[i3 + 2] = z

      originalPositions[i3] = x
      originalPositions[i3 + 1] = y
      originalPositions[i3 + 2] = z

      // Color assignment based on color mode
      let color = color1
      switch (colorMode) {
        case 'gradient':
          color = color1.clone().lerp(color2, Math.random())
          break
        case 'rainbow':
          color = new THREE.Color().setHSL(Math.random(), 1, 0.5)
          break
        case 'distance': {
          const distance = Math.sqrt(x * x + y * y + z * z) / disperseRadius
          color = color1.clone().lerp(color2, distance)
          break
        }
      }

      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b
    }

    return [positions, colors, originalPositions]
  }, [particleCount, primaryColor, secondaryColor, colorMode, disperseRadius, viewport])

  // Mouse position tracking
  const mouse = useRef({ x: 0, y: 0 })

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      mouse.current.x = (event.clientX / size.width) * 2 - 1
      mouse.current.y = -(event.clientY / size.height) * 2 + 1
    },
    [size]
  )

  // Animation loop
  useFrame((state) => {
    if (!ref.current?.geometry.attributes.position) return

    const time = state.clock.elapsedTime
    const positions = ref.current.geometry.attributes.position.array as Float32Array
    const colors = ref.current.geometry.attributes.color?.array as Float32Array

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      const originalX = originalPositions[i3]
      const originalY = originalPositions[i3 + 1]
      const originalZ = originalPositions[i3 + 2]

      let x = originalX
      let y = originalY
      let z = originalZ

      // Apply movement pattern
      switch (movementPattern) {
        case 'float':
          x += Math.sin(time * speed + i * 0.01) * waveAmplitude * 0.5
          y += Math.cos(time * speed + i * 0.01) * waveAmplitude * 0.3
          z += Math.sin(time * speed * 0.5 + i * 0.02) * waveAmplitude * 0.2
          break

        case 'spiral': {
          const spiralRadius = Math.sqrt(originalX * originalX + originalY * originalY)
          const angle = Math.atan2(originalY, originalX) + time * speed * rotationSpeed * 0.1
          x = Math.cos(angle) * spiralRadius
          y = Math.sin(angle) * spiralRadius
          z += Math.sin(time * speed * waveFrequency + i * 0.1) * waveAmplitude
          break
        }

        case 'wave':
          x += Math.sin(time * speed * waveFrequency + originalY * 0.1) * waveAmplitude
          y += Math.cos(time * speed * waveFrequency + originalX * 0.1) * waveAmplitude * 0.5
          z += Math.sin(time * speed * waveFrequency * 0.5 + i * 0.05) * waveAmplitude * 0.3
          break

        case 'orbit': {
          const orbitRadius = Math.sqrt(originalX * originalX + originalZ * originalZ)
          const orbitAngle = Math.atan2(originalZ, originalX) + time * speed * rotationSpeed * 0.2
          x = Math.cos(orbitAngle) * orbitRadius
          z = Math.sin(orbitAngle) * orbitRadius
          y += Math.sin(time * speed * 2 + i * 0.1) * waveAmplitude * 0.5
          break
        }

        case 'random':
          x += (Math.random() - 0.5) * speed * 0.1
          y += (Math.random() - 0.5) * speed * 0.1
          z += (Math.random() - 0.5) * speed * 0.1
          break

        case 'flow':
          x += Math.sin(time * speed + originalY * 0.1) * waveAmplitude * 0.5
          y += Math.sin(time * speed * 1.1 + originalX * 0.1) * waveAmplitude * 0.3
          z += Math.sin(time * speed * 0.8 + (originalX + originalY) * 0.05) * waveAmplitude * 0.2
          break
      }

      // Apply mouse influence
      if (mouseInfluence > 0) {
        const mouseWorldPos = new THREE.Vector3(
          (mouse.current.x * viewport.height) / 2,
          (mouse.current.y * viewport.width) / 2,
          0
        )

        const particlePos = new THREE.Vector3(x, y, z)
        const distance = particlePos.distanceTo(mouseWorldPos)
        const influence = Math.max(0, 1 - distance / (disperseRadius * 0.5))

        if (influence > 0) {
          const direction = particlePos.clone().sub(mouseWorldPos).normalize()
          const force = direction.multiplyScalar(influence * mouseInfluence * 0.5)
          x += force.x
          y += force.y
          z += force.z
        }
      }

      positions[i3] = x
      positions[i3 + 1] = y
      positions[i3 + 2] = z

      // Update colors based on distance or time for dynamic effects
      if (colorMode === 'distance' && colors) {
        const distance = Math.sqrt(x * x + y * y + z * z) / disperseRadius
        const color1 = new THREE.Color(primaryColor)
        const color2 = new THREE.Color(secondaryColor)
        const color = color1.clone().lerp(color2, distance)

        colors[i3] = color.r
        colors[i3 + 1] = color.g
        colors[i3 + 2] = color.b
      }
    }

    ref.current.geometry.attributes.position.needsUpdate = true
    if (ref.current.geometry.attributes.color) {
      ref.current.geometry.attributes.color.needsUpdate = true
    }

    // Rotate entire system if rotation speed is set
    if (rotationSpeed > 0) {
      ref.current.rotation.y = time * rotationSpeed * 0.1
      ref.current.rotation.x = time * rotationSpeed * 0.05
    }
  })

  // Set up mouse event listener
  if (typeof window !== 'undefined') {
    window.removeEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousemove', handleMouseMove)
  }

  return (
    <group>
      <Points ref={ref} positions={positions} colors={colors}>
        <pointsMaterial
          size={particleSize}
          transparent
          opacity={opacity}
          vertexColors
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          map={particleTexture}
        />
      </Points>
    </group>
  )
}

interface ParticleEffectProps {
  enableControls?: boolean
  particleCount?: number
  className?: string
}

export default function ParticleEffect({
  enableControls = true,
  particleCount = 2000,
  className = 'fixed inset-0 z-10'
}: ParticleEffectProps) {
  console.log('ParticleEffect rendering with', particleCount, 'particles')

  return (
    <div className={className}>
      <Canvas
        camera={{
          position: [0, 0, 10],
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => {
          console.log('Canvas created successfully')
          gl.setClearColor('#000000', 0) // Transparent background
        }}
      >
        <ParticleSystem count={particleCount} />

        {/* Optional orbit controls */}
        {enableControls && (
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            enableRotate={true}
            autoRotate={false}
            makeDefault
          />
        )}

        {/* Ambient lighting for better visual effects */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
      </Canvas>

      {/* Fallback indicator */}
      <div className='pointer-events-none absolute top-4 right-4 text-sm text-white opacity-50'>
        Particles: {particleCount}
      </div>
    </div>
  )
}
