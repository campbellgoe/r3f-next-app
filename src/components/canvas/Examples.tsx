'use client'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useMemo, useRef, useState } from 'react'
import { Line, useCursor, MeshDistortMaterial } from '@react-three/drei'
import { useRouter } from 'next/navigation'

export const Blob = ({ route = '/', ...props }) => {
  const router = useRouter()
  const [hovered, hover] = useState(false)
  useCursor(hovered)
  return (
    <mesh
      onClick={() => router.push(route)}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
      {...props}>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial roughness={0} color={hovered ? 'hotpink' : '#1fb2f5'} />
    </mesh>
  )
}

export const Logo = ({ route = '/blob', ...props }) => {
  const mesh = useRef(null)
  const router = useRouter()

  const [hovered, hover] = useState(false)
  const points = useMemo(() => new THREE.EllipseCurve(0, 0, 3, 1.15, 0, 2 * Math.PI, false, 0).getPoints(100), [])

  useCursor(hovered)
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    mesh.current.rotation.y = Math.sin(t) * (Math.PI / 8)
    mesh.current.rotation.x = Math.cos(t) * (Math.PI / 8)
    mesh.current.rotation.z -= delta / 4
  })

  return (
    <group ref={mesh} {...props}>
      {/* @ts-ignore */}
      <Line worldUnits points={points} color='#1fb2f5' lineWidth={0.15} />
      {/* @ts-ignore */}
      <Line worldUnits points={points} color='#1fb2f5' lineWidth={0.15} rotation={[0, 0, 1]} />
      {/* @ts-ignore */}
      <Line worldUnits points={points} color='#1fb2f5' lineWidth={0.15} rotation={[0, 0, -1]} />
      <mesh onClick={() => router.push(route)} onPointerOver={() => hover(true)} onPointerOut={() => hover(false)}>
        <sphereGeometry args={[0.55, 64, 64]} />
        <meshPhysicalMaterial roughness={0} color={hovered ? 'hotpink' : '#1fb2f5'} />
      </mesh>
    </group>
  )
}


// const wallGeometry = new THREE.BoxGeometry(1, 1, 1);
// const wallMaterial = new THREE.MeshStandardMaterial({
//   color: 0xffccdd,
// })
export function Block({ position, scale, rotation, color, onSelect }) {
  const uniforms = useMemo(() => ({
    u_color: {
      value: color,
    },
    u_time: {
      value: 0.0,
    },
    Ka: { value: new THREE.Vector3(1, 1, 1) },
    Kd: { value: new THREE.Vector3(1, 1, 1) },
    Ks: { value: new THREE.Vector3(1, 1, 1) },
    LightIntensity: { value: new THREE.Vector4(0.5, 0.5, 0.5, 1.0) },
    LightPosition: { value: new THREE.Vector4(0.0, 2000.0, 0.0, 1.0) },
    Shininess: { value: 200.0 }
  }), [])
  // This reference will give us direct access to the mesh
  const meshRef = useRef<THREE.Mesh>();
  useFrame((state) => {
    const { clock } = state;
    if (meshRef?.current) {
      meshRef.current.material.uniforms.u_time.value = clock.getElapsedTime();
    }
  });
  // You can optionally add interactivity, like animations
  // useFrame(() => {
  //   // Example animation (rotating the wall)
  //   if (meshRef.current) {
  //     meshRef.current.rotation.y += 0.01;
  //   }
  // });

  const vertexShader = `
  varying vec3 Normal;
  varying vec3 Position;

  void main() {
    Normal = normalize(normalMatrix * normal);
    Position = vec3(modelViewMatrix * vec4(position, 1.0));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }

`

  const fragmentShader = `

  varying vec3 Normal;
  varying vec3 Position;

  uniform vec3 Ka;
  uniform vec3 Kd;
  uniform vec3 Ks;
  uniform vec4 LightPosition;
  uniform vec3 LightIntensity;
  uniform float Shininess;

  vec3 phong() {
    vec3 n = normalize(Normal);
    vec3 s = normalize(vec3(LightPosition) - Position);
    vec3 v = normalize(vec3(-Position));
    vec3 r = reflect(-s, n);

    vec3 ambient = Ka;
    vec3 diffuse = Kd * max(dot(s, n), 0.0);
    vec3 specular = Ks * pow(max(dot(r, v), 0.0), Shininess);

    return LightIntensity * (ambient + diffuse + specular);
  }

  void main() {
    vec3 col = vec3(1.0, 1.0, 0.6);
    gl_FragColor = vec4(col*phong(), 1.0);
}
`
  return (
    <mesh
      position={position}
      rotation={rotation}
      ref={meshRef}
      // Event example
      onClick={(e) => {
        e.stopPropagation()
        onSelect(meshRef.current)
      }}
    >
      <boxGeometry args={scale} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}