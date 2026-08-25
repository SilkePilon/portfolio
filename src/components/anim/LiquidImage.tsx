import { useEffect, useRef, useState } from 'react'
import type { Img } from '@/content/types'
import { cn } from '@/lib/cn'

const vertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

/**
 * `cover()` mirrors CSS `object-fit: cover` with a 50%/50% position, so the shader output lines up
 * pixel for pixel with the plain <img> underneath. The noise is the classic Ashima Arts / Stefan
 * Gustavson 2D simplex noise (webgl-noise, MIT).
 */
const fragmentShader = /* glsl */ `
precision highp float;

varying vec2 vUv;
uniform sampler2D uBase;
uniform sampler2D uHover;
uniform vec2 uRes;
uniform vec2 uBaseSize;
uniform vec2 uHoverSize;
uniform vec2 uMouse;
uniform float uTime;
uniform float uProgress;
uniform float uRadius;

vec2 cover(vec2 uv, vec2 res, vec2 tex) {
  float r = res.x / res.y;
  float t = tex.x / tex.y;
  vec2 s = r < t ? vec2(r / t, 1.0) : vec2(1.0, t / r);
  return (uv - 0.5) * s + 0.5;
}

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 px = vUv * uRes;
  vec2 m = uMouse * uRes;
  float n = snoise(vUv * 6.0 + uTime * 0.6) * 0.5;
  float d = distance(px, m) / uRadius + n * 0.5;
  float mask = smoothstep(1.0, 0.6, d) * uProgress;
  vec2 disp = vec2(snoise(vUv * 4.0 + uTime * 0.4), snoise(vUv * 4.0 - uTime * 0.4)) * 0.02 * mask;
  vec4 b = texture2D(uBase, cover(vUv, uRes, uBaseSize));
  vec4 h = texture2D(uHover, cover(vUv + disp, uRes, uHoverSize));
  gl_FragColor = mix(b, h, mask);
  #include <colorspace_fragment>
}
`

const imgClass = 'absolute inset-0 h-full w-full select-none object-cover'

/**
 * The works card media: the cover image with a noisy liquid mask that reveals the second image
 * around the pointer. WebGL runs on pointer devices only; everywhere else (and whenever the
 * context or the textures fail) the two images cross-fade with CSS instead.
 */
export function LiquidImage({ base, hover, className }: { base: Img; hover: Img; className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [gl, setGl] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    // jsdom has no WebGL and no layout; touch devices have no pointer to follow.
    if (!host || import.meta.env.MODE === 'test') return
    if (!window.matchMedia('(hover: hover)').matches) return

    let disposed = false
    let teardown: (() => void) | undefined

    void import('three')
      .then((THREE) => {
        if (disposed) return

        const canvas = document.createElement('canvas')
        canvas.className = `${imgClass} pointer-events-none opacity-0`
        canvas.setAttribute('aria-hidden', 'true')

        let renderer: InstanceType<typeof THREE.WebGLRenderer>
        try {
          renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false })
        } catch {
          return
        }
        host.append(canvas)

        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        renderer.setPixelRatio(dpr)

        const uniforms = {
          uBase: { value: null as InstanceType<typeof THREE.Texture> | null },
          uHover: { value: null as InstanceType<typeof THREE.Texture> | null },
          uRes: { value: new THREE.Vector2(1, 1) },
          uBaseSize: { value: new THREE.Vector2(base.width, base.height) },
          uHoverSize: { value: new THREE.Vector2(hover.width, hover.height) },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uRadius: { value: 100 * dpr },
        }
        const scene = new THREE.Scene()
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
        const geometry = new THREE.PlaneGeometry(2, 2)
        const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true })
        scene.add(new THREE.Mesh(geometry, material))

        let ready = false
        let hovering = false
        let raf = 0
        let last = 0
        const target = new THREE.Vector2(0.5, 0.5)
        const draw = () => renderer.render(scene, camera)

        const frame = (now: number) => {
          const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60
          last = now
          uniforms.uTime.value += dt
          uniforms.uMouse.value.lerp(target, 0.12)
          uniforms.uProgress.value += ((hovering ? 1 : 0) - uniforms.uProgress.value) * 0.12
          draw()
          if (hovering || uniforms.uProgress.value > 0.01) {
            raf = requestAnimationFrame(frame)
          } else {
            // Settle on a clean base-image frame and idle until the next hover.
            raf = 0
            last = 0
            uniforms.uProgress.value = 0
            draw()
          }
        }
        const play = () => {
          if (ready && !raf) raf = requestAnimationFrame(frame)
        }

        const aim = (e: PointerEvent) => {
          const r = host.getBoundingClientRect()
          if (!r.width || !r.height) return
          target.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height)
        }
        const onEnter = (e: PointerEvent) => {
          aim(e)
          uniforms.uMouse.value.copy(target)
          hovering = true
          play()
        }
        const onLeave = () => {
          hovering = false
          play()
        }
        host.addEventListener('pointerenter', onEnter)
        host.addEventListener('pointermove', aim)
        host.addEventListener('pointerleave', onLeave)

        const resize = () => {
          const { width, height } = host.getBoundingClientRect()
          if (!width || !height) return
          renderer.setSize(width, height, false)
          uniforms.uRes.value.set(width * dpr, height * dpr)
          if (ready) draw()
        }
        const observer = new ResizeObserver(resize)
        observer.observe(host)
        resize()

        const loader = new THREE.TextureLoader()
        loader.setCrossOrigin('anonymous')
        let pending = 2
        const onTexture = (key: 'uBase' | 'uHover') => (texture: InstanceType<typeof THREE.Texture>) => {
          if (disposed) {
            texture.dispose()
            return
          }
          texture.colorSpace = THREE.SRGBColorSpace
          texture.minFilter = THREE.LinearFilter
          texture.generateMipmaps = false
          uniforms[key].value = texture
          if (--pending) return
          ready = true
          canvas.classList.remove('opacity-0')
          setGl(true)
          resize()
          draw()
        }
        loader.load(base.src, onTexture('uBase'))
        loader.load(hover.src, onTexture('uHover'))

        teardown = () => {
          cancelAnimationFrame(raf)
          observer.disconnect()
          host.removeEventListener('pointerenter', onEnter)
          host.removeEventListener('pointermove', aim)
          host.removeEventListener('pointerleave', onLeave)
          uniforms.uBase.value?.dispose()
          uniforms.uHover.value?.dispose()
          geometry.dispose()
          material.dispose()
          renderer.dispose()
          canvas.remove()
        }
      })
      .catch(() => {})

    return () => {
      disposed = true
      teardown?.()
      setGl(false)
    }
  }, [base.src, base.width, base.height, hover.src, hover.width, hover.height])

  return (
    <div ref={hostRef} className={cn('relative h-full w-full', className)}>
      <img src={base.src} alt={base.alt} width={base.width} height={base.height} loading="lazy" draggable={false} className={imgClass} />
      {!gl && (
        <img
          src={hover.src}
          alt=""
          aria-hidden
          width={hover.width}
          height={hover.height}
          loading="lazy"
          draggable={false}
          className={cn(imgClass, 'opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-active:opacity-100')}
        />
      )}
    </div>
  )
}
