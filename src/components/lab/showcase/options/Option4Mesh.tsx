'use client'
/**
 * Option 4 — "Mesh". A three.js icosphere drawn as a wireframe + point cloud in a transparent full-stage canvas.
 * p 0→0.4: the sphere spins in and grows 0.6→1. p 0.4→0.7: every vertex explodes outward along its normal (deterministic
 * per-vertex jitter) while the wireframe fades out. p 0.7→1: the points reform into the sphere, the wireframe fades
 * back in and the whole thing settles slightly larger, while BUILD / THINGS scale down behind it (1.4→1, opacity 0→1).
 */
import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'
import { LabOption, seg, lerp, easeOut, easeInOut } from '../LabOption'

const IS_TEST = import.meta.env.MODE === 'test'
const FOV = 45

/** Deterministic 0..1 from a quantised position — shared by the line and point geometries so they explode together. */
function jitterFor(x: number, y: number, z: number) {
  let h = (Math.round(x * 1e4) * 73856093) ^ (Math.round(y * 1e4) * 19349663) ^ (Math.round(z * 1e4) * 83492791)
  h = (Math.imul(h ^ (h >>> 15), 1664525) + 1013904223) >>> 0 // LCG step
  return (h % 10000) / 10000
}

type Scene = {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  group: THREE.Group
  lineMat: THREE.LineBasicMaterial
  pointMat: THREE.PointsMaterial
  bodies: { attr: THREE.BufferAttribute; orig: Float32Array; jitter: Float32Array }[]
  dispose: () => void
}

function buildScene(canvas: HTMLCanvasElement): Scene {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100)
  const group = new THREE.Group()
  scene.add(group)

  const ico = new THREE.IcosahedronGeometry(1, 3)
  const wire = new THREE.WireframeGeometry(ico)
  const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 })
  const pointMat = new THREE.PointsMaterial({ color: 0xc4c4c4, size: 2.5, sizeAttenuation: false })
  group.add(new THREE.LineSegments(wire, lineMat), new THREE.Points(ico, pointMat))

  const bodies = [wire, ico].map((g) => {
    const attr = g.getAttribute('position') as THREE.BufferAttribute
    const orig = new Float32Array(attr.array as Float32Array)
    const jitter = new Float32Array(attr.count)
    for (let i = 0; i < attr.count; i++) jitter[i] = jitterFor(orig[i * 3], orig[i * 3 + 1], orig[i * 3 + 2])
    attr.setUsage(THREE.DynamicDrawUsage)
    return { attr, orig, jitter }
  })

  return {
    renderer,
    scene,
    camera,
    group,
    lineMat,
    pointMat,
    bodies,
    dispose: () => {
      ico.dispose()
      wire.dispose()
      lineMat.dispose()
      pointMat.dispose()
      renderer.dispose()
    },
  }
}

/** Camera distance so the unit sphere fills ~55% of the height (landscape) or ~70% of the width (portrait). */
function cameraZ(aspect: number) {
  const tan = Math.tan((FOV / 2) * (Math.PI / 180))
  const visibleH = aspect >= 1 ? 2 / 0.55 : 2 / 0.7 / aspect
  return visibleH / (2 * tan)
}

export function Option4Mesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wordsRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<Scene | null>(null)
  const progress = useRef(0)

  const apply = (p: number) => {
    progress.current = p
    const words = wordsRef.current
    if (words) {
      const t = easeOut(seg(p, 0.6, 1))
      words.style.opacity = String(t)
      words.style.transform = `scale(${lerp(1.4, 1, t)})`
    }
    const s = sceneRef.current
    if (!s) return

    const intro = easeOut(seg(p, 0, 0.4))
    const burst = easeInOut(seg(p, 0.4, 0.7))
    const reform = easeInOut(seg(p, 0.7, 1))
    const spread = burst * (1 - reform) // 0 → 1 → 0
    // Keep rotating gently through the whole scroll so the reform never reads as static.
    s.group.rotation.y = intro * Math.PI * 2 * 0.6 + p * 0.8
    s.group.rotation.x = intro * 0.35 + p * 0.25
    const scale = lerp(0.6, 1, intro) * lerp(1, 1.08, reform)
    s.group.scale.setScalar(scale)
    s.lineMat.opacity = 0.35 * (1 - burst) + 0.35 * reform
    s.pointMat.opacity = 1

    for (const { attr, orig, jitter } of s.bodies) {
      const arr = attr.array as Float32Array
      for (let i = 0; i < attr.count; i++) {
        // Vertices of a unit sphere: the position is the normal, so pushing along it is a plain multiply.
        const k = 1 + spread * 1.6 * (0.35 + 0.65 * jitter[i])
        arr[i * 3] = orig[i * 3] * k
        arr[i * 3 + 1] = orig[i * 3 + 1] * k
        arr[i * 3 + 2] = orig[i * 3 + 2] * k
      }
      attr.needsUpdate = true
    }
    s.renderer.render(s.scene, s.camera)
  }

  useLayoutEffect(() => {
    apply(progress.current)
    const canvas = canvasRef.current
    if (IS_TEST || !canvas) return
    const stage = canvas.parentElement
    if (!stage) return
    let s: Scene
    try {
      s = buildScene(canvas)
    } catch {
      return // no WebGL: the words still render
    }
    sceneRef.current = s

    const resize = () => {
      const { width, height } = stage.getBoundingClientRect()
      if (!width || !height) return
      const aspect = width / height
      s.camera.aspect = aspect
      s.camera.position.z = cameraZ(aspect)
      s.camera.updateProjectionMatrix()
      s.renderer.setSize(width, height, false)
      apply(progress.current)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(stage)
    resize()

    return () => {
      ro.disconnect()
      s.dispose()
      sceneRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <LabOption id="mesh" heightVh={300} onProgress={apply}>
      <div className="relative flex h-full w-full items-center justify-center bg-black">
        <div
          ref={wordsRef}
          className="text-display absolute inset-0 z-0 flex flex-col items-center justify-center text-center leading-[0.9] text-white will-change-transform"
          style={{ opacity: 0, transform: 'scale(1.4)' }}
        >
          <span>Build</span>
          <span>Things</span>
        </div>
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 z-10 block h-full w-full" />
        <span
          aria-hidden
          className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 font-mono text-[11px] uppercase tracking-[0.05em] text-gray-500"
        >
          icosahedron · 642 vertices
        </span>
      </div>
    </LabOption>
  )
}
