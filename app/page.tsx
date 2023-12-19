'use client'
import { TransformControls } from '@react-three/drei'
import dynamic from 'next/dynamic'
import { Suspense, useContext, useEffect, useRef, useState } from 'react'
import MyContext from '@/context/Context';
import { GUI } from 'dat.gui'
const Logo = dynamic(() => import('@/components/canvas/Examples').then((mod) => mod.Logo), { ssr: false })
const Wall = dynamic(() => import('@/components/canvas/Examples').then((mod) => mod.Wall), { ssr: false })
const Duck = dynamic(() => import('@/components/canvas/Examples').then((mod) => mod.Duck), { ssr: false })
const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), {
  ssr: false,
  loading: () => (
    <div className='flex h-96 w-full flex-col items-center justify-center'>
      <svg className='-ml-1 mr-3 h-5 w-5 animate-spin text-black' fill='none' viewBox='0 0 24 24'>
        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
        <path
          className='opacity-75'
          fill='currentColor'
          d='M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
        />
      </svg>
    </div>
  ),
})
const Common = dynamic(() => import('@/components/canvas/View').then((mod) => mod.Common), { ssr: false })
const useDatGui = (controls) => {
  const [updates, setUpdates] = useState(0)
  const loaded = useRef(false)
  const settings = useRef({
    mode: 'scale'
  })
  useEffect(() => {
    if (typeof window != 'undefined' && !loaded.current) {
      const gui = new GUI()
      const settingsFolder = gui.addFolder('settings')
      controls.forEach(([setting, { type, options }]) => {
        settingsFolder.add(settings.current, setting, options).onChange(() => {
          console.log('changed', setting)
          setUpdates(upd => (upd + 1) % 2)
        })
      })
      loaded.current = (true)
    }
  }, [controls, loaded])
  return [updates, settings]
}
export default function Page() {
  const { selected, setState } = useContext(MyContext);
  const [updates, settings] = useDatGui([["mode", { type: "select", options: ["scale", "rotate", "translate"] }]])
  return (
    <>
      <div className='mx-auto flex w-full flex-col flex-wrap items-center md:flex-row  lg:w-4/5'>
        {/* jumbo */}
        <div className='flex w-full flex-col items-start justify-center p-12 text-center md:w-2/5 md:text-left'>
          <p className='w-full uppercase'>Next + React Three Fiber</p>
          <h1 className='my-4 text-5xl font-bold leading-tight'>Three Dimensionality</h1>
          <p className='mb-8 text-2xl leading-normal'>Exploring 3D with Three.js</p>
        </div>

        <div className='w-full text-center md:w-3/5'>
          <View className='flex h-96 w-full flex-col items-center justify-center'>
            <Suspense fallback={null}>
              <Logo route='/blob' scale={0.6} position={[0, 0, 0]} />
              <Common />
            </Suspense>
          </View>
        </div>
      </div>

      <div className="mx-auto flex w-full p-12 md:flex-row  lg:w-4/5">
        <div className='relative my-12 w-full h-full py-6 sm:w-full md:mb-40'>
          <View orbit={{ makeDefault: true }} className='relative h-full  sm:h-[90vh] sm:w-full'>
            <Suspense fallback={null}>
              <Wall scale={[1, 1, 0.1]} position={[0, 0, 0]} rotation={[0.0, 0, 0]} color={'#883333'} onSelect={mesh => setState(state => ({ ...state, selected: mesh }))} />
              {selected && (
                <TransformControls object={selected} mode={settings.current.mode} />
              )}
              <Common color={'#66ffdd'} />
            </Suspense>
          </View>
        </div>
      </div>
    </>
  )
}
