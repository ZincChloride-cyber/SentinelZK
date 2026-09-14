'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

const DEFAULT_FRAGMENT = `#version 300 es
precision highp float;
out vec4 O;
uniform float time;
uniform vec2 resolution;
#define FC gl_FragCoord.xy
#define R resolution
#define T time
#define MN min(R.x,R.y)
float pattern(vec2 uv) {
  float d = 0.0;
  for (float i = 0.0; i < 3.0; i++) {
    uv.x += sin(T * (1.0 + i) + uv.y * 1.5) * 0.2;
    d += 0.005 / abs(uv.x);
  }
  return d;
}
vec3 scene(vec2 uv) {
  vec3 col = vec3(0.0);
  uv = vec2(atan(uv.x, uv.y) * 2.0 / 6.28318, -log(length(uv)) + T);
  for (float i = 0.0; i < 3.0; i++) {
    int k = int(mod(i, 3.0));
    col[k] += pattern(uv + i * 6.0 / MN);
  }
  return col;
}
void main() {
  vec2 uv = (FC - 0.5 * R) / MN;
  vec3 col = vec3(0.0);
  float s = 12.0;
  float e = 9e-4;
  col += e / (sin(uv.x * s) * cos(uv.y * s));
  uv.y += R.x > R.y ? 0.5 : 0.5 * (R.y / R.x);
  col += scene(uv);
  O = vec4(col * vec3(0.55, 0.75, 1.0), 1.0);
}`

const VERTEX_SHADER = `#version 300 es
precision highp float;
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`

export type SentinelHeroProps = {
  title?: string
  subtitle?: string
  ctaLabel?: string
  ctaHref?: string
  secondaryCtaLabel?: string
  secondaryCtaHref?: string
  fragmentSource?: string
  height?: string | number
  className?: string
}

export default function SentinelHero({
  title = "Know What's Safe to Sign.",
  subtitle = 'Check a contract before you interact. SentinelZK scores risk off-chain, then posts a zero-knowledge safety attestation on Midnight, without exposing the model that produced it.',
  ctaLabel = 'Inspect Contract',
  ctaHref = '/inspector',
  secondaryCtaLabel = 'How ZK Works',
  secondaryCtaHref = '/how-it-works',
  fragmentSource = DEFAULT_FRAGMENT,
  height = '85vh',
  className = '',
}: SentinelHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas?.getContext('webgl2', { alpha: true, antialias: true })
    if (!canvas || !gl) return

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)
      if (!shader) throw new Error('Unable to create shader')
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(shader) || 'Shader compilation failed'
        gl.deleteShader(shader)
        throw new Error(message)
      }
      return shader
    }

    let program: WebGLProgram
    try {
      const vertex = compile(gl.VERTEX_SHADER, VERTEX_SHADER)
      const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource)
      program = gl.createProgram() as WebGLProgram
      gl.attachShader(program, vertex)
      gl.attachShader(program, fragment)
      gl.linkProgram(program)
      gl.deleteShader(vertex)
      gl.deleteShader(fragment)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Program linking failed')
    } catch {
      return
    }

    const buffer = gl.createBuffer()
    if (!buffer) return
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]), gl.STATIC_DRAW)
    gl.useProgram(program)
    const position = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    const time = gl.getUniformLocation(program, 'time')
    const resolution = gl.getUniformLocation(program, 'resolution')
    gl.clearColor(0, 0, 0, 1)

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    window.addEventListener('resize', resize)

    let frame = 0
    const render = (now: number) => {
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.useProgram(program)
      if (time) gl.uniform1f(time, now / 1000)
      if (resolution) gl.uniform2f(resolution, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      frame = requestAnimationFrame(render)
    }
    frame = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', resize)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
    }
  }, [fragmentSource])

  return (
    <section className={`relative overflow-hidden bg-slate-950 ${className}`} style={{ minHeight: height }} aria-label="SentinelZK hero">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block bg-[#030712] pointer-events-none" aria-label="Animated aurora background" role="img" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/70 to-slate-950 pointer-events-none" aria-hidden="true" />
      
      <div className="relative z-10 flex min-h-full items-center justify-center px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="mb-5 text-sm font-medium tracking-wide text-cyan-300/90">
            SentinelZK on Midnight
          </p>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05]">
            Know What&apos;s <span className="text-cyan-400">Safe to Sign</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-bold text-slate-950 hover:bg-cyan-400 transition"
            >
              {ctaLabel}
            </Link>
            {secondaryCtaLabel && secondaryCtaHref && (
              <Link
                href={secondaryCtaHref}
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-slate-900/60 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md hover:bg-slate-800/80 transition"
              >
                {secondaryCtaLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export { SentinelHero }
