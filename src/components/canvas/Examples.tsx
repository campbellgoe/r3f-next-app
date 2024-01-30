'use client'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'


// const wallGeometry = new THREE.BoxGeometry(1, 1, 1);
// const wallMaterial = new THREE.MeshStandardMaterial({
//   color: 0xffccdd,
// })
export function Block({ index, count, position, scale, rotation, color, onSelect, ...props }) {
  const uniforms = useMemo(() => ({
    u_color: {
      value: new THREE.Color(color),
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
  const meshRef = useRef<THREE.InstancedMesh>();
  useFrame((state) => {
    const { clock } = state;
    if (meshRef?.current) {
      meshRef.current.material.uniforms.u_time.value = clock.getElapsedTime();
    }
  });

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

  uniform vec3 u_color;
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
    vec3 col = u_color;
    gl_FragColor = vec4(col*phong(), 1.0);
}
`
  useEffect(() => {
    if (meshRef.current) {
      const matrix = new THREE.Matrix4()
      matrix.setPosition(...position)
      meshRef.current.setMatrixAt(index, matrix)
      meshRef.current.instanceMatrix.needsUpdate = true
      console.log('mesh updated')
    } else {
      console.log('no mesh')
    }
  }, [position, index])
  return (
    <instancedMesh
      ref={meshRef}
      args={[null, null, count]}
      // Event example
      onClick={(e) => {
        e.stopPropagation()
        onSelect(meshRef.current)
      }}
      {...props}
    >
      <boxGeometry args={scale} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
      />
    </instancedMesh>
  );
}