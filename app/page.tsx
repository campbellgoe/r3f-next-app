// @ts-nocheck
'use client'
import { TransformControls } from '@react-three/drei'
import dynamic from 'next/dynamic'
import { Suspense, useContext, useEffect, useRef, useState } from 'react'
import MyContext from '@/context/Context';

let gui;

const Block = dynamic(() => import('@/components/canvas/Examples').then((mod) => mod.Block), { ssr: false })
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
const gridSnap = 0.1
const defaultRoom = {
  height: 10,
  thickness: gridSnap,
  width: 15,
  depth: 15
}
const useDatGui = (controls) => {
  const [updates, setUpdates] = useState(0)
  const loaded = useRef(false)
  const settings = useRef({
    mode: 'scale',
    roomWidth: defaultRoom.width,
    roomDepth: defaultRoom.depth,
    roomHeight: defaultRoom.height,
    boxWidth: 0.4,
    boxDepth: 0.3,
    boxHeight: 0.2,

  })
  useEffect(() => {
    if (typeof window != 'undefined' && !loaded.current) {
      loaded.current = (true)
      const init = async () => {
        if (!gui) {
          const dat = await import('dat.gui')
          gui = new dat.GUI()
          return gui
        }
        return gui
      }
      init().then(gui => {
        controls.forEach(([setting, { type, options }]) => {
          gui.add(settings.current, setting, options).onChange(() => {
            console.log('changed', setting)
            setUpdates(upd => (upd + 1) % 2)
          })
        })
      })
      return () => {
        if (gui) {
          try {
            gui.destroy()
            gui = null
          } catch (err) {
            console.warn('no gui to destroy')
          } finally {
            loaded.current = false
          }
        }
      }
    }
  }, [])
  return [updates, settings]
}
export default function Page() {

  const { selected, setState } = useContext(MyContext);
  const [updates, settings] = useDatGui([["mode", { type: "select", options: ["scale", "rotate", "translate"] }],
  [
    "roomHeight", { type: "range", options: 1 }
  ],
  [
    "roomWidth", { type: "range", options: 1 }
  ],
  [
    "roomDepth", { type: "range", options: 1 }
  ],
  [
    "boxDepth", { type: "range", options: 0.1 }
  ], [
    "boxWidth", { type: "range", options: 0.1 }
  ], [
    "boxHeight", { type: "range", options: 0.1 }
  ]])
  const wall = {
    ...defaultRoom,
    height: settings.current.roomHeight,
    width: settings.current.roomWidth,
    depth: settings.current.roomDepth,
  }
  const box = {
    width: settings.current.boxWidth,
    depth: settings.current.boxDepth,
    height: settings.current.boxHeight
  }
  const onSelect = mesh => setState(state => ({ ...state, selected: mesh }))
  const y = wall.thickness * (wall.height / 2)
  const numBoxes = Math.floor(((wall.width * wall.thickness) / box.width) * ((wall.depth * wall.thickness) / box.depth) * ((wall.height * wall.thickness) / box.height))
  const numWalls = 4;
  const numFloor = 1
  const count = numBoxes + numWalls + numFloor;
  return (
    <>

      <div className="mx-auto flex w-full p-12 md:flex-row  lg:w-4/5">
        <div className='relative my-12 w-full h-full py-6 sm:w-full md:mb-40'>
          <p>Number of boxes: {numBoxes}</p>
          <View orbit={{ makeDefault: true }} className='relative h-full  sm:h-[90vh] sm:w-full'>
            <Suspense fallback={null}>
              {/* 4 walls and 1 floor */}
              <Block
                index={0}
                count={count}
                scale={[
                  wall.thickness * wall.width,
                  wall.thickness * wall.height,
                  wall.thickness
                ]}
                position={[
                  0,
                  y,
                  -wall.thickness * (wall.depth / 2 + .5)
                ]}
                rotation={[0, 0, 0]}
                color={0xffffdd}
                onSelect={onSelect} />
              <Block
                index={1}
                count={count}
                scale={[
                  wall.thickness * wall.width,
                  wall.thickness * wall.height,
                  wall.thickness
                ]}
                position={[
                  0,
                  y,
                  wall.thickness * (wall.depth / 2 + .5)
                ]}
                rotation={[0, 0, 0]}
                color={0xffffdd}
                onSelect={onSelect} />

              <Block
                index={2}
                count={count}
                scale={[
                  wall.thickness,
                  wall.thickness * wall.height,
                  wall.thickness * wall.depth
                ]}
                position={[
                  wall.thickness * (wall.width / 2 + .5),
                  y,
                  0
                ]}
                rotation={[0.0, 0, 0]}
                color={0xffffdd}
                onSelect={onSelect}
              />
              <Block
                index={3}
                count={count}
                scale={[
                  wall.thickness,
                  wall.thickness * wall.height,
                  wall.thickness * wall.depth
                ]}
                position={[
                  -wall.thickness * (wall.width / 2 + .5),
                  y,
                  0
                ]}
                rotation={[0.0, 0, 0]}
                color={0xffffdd}
                onSelect={onSelect} />
              {/* floor */}
              <Block
                index={4}
                count={count}
                scale={[
                  wall.thickness * wall.width,
                  wall.thickness,
                  wall.thickness * wall.depth
                ]}
                position={[
                  0,
                  y - wall.thickness * (wall.height * 0.5 + 0.5),
                  0]}
                rotation={[0.0, 0, 0]} color={0xbbbbff} onSelect={mesh => setState(state => ({ ...state, selected: mesh }))} />
              {Array.from({ length: numBoxes }).map((item, index) => {
                const numberOfCols = Math.floor((wall.depth * wall.thickness) / box.depth);
                const numberOfRows = Math.floor((wall.width * wall.thickness) / box.width);
                const numberOfLayers = Math.floor((wall.height * wall.thickness) / box.height);

                const z = (index % numberOfCols) * box.depth - (wall.depth * wall.thickness / 2 - box.depth / 2);
                const x = Math.floor((index / numberOfCols) % numberOfRows) * box.width - (wall.width * wall.thickness / 2 - box.width / 2);
                const y = Math.floor(index / (numberOfCols * numberOfRows)) * box.height + box.height / 2;
                return <Block
                  index={5 + index}
                  count={count}
                  key={index}
                  scale={[box.width, box.height, box.depth]}
                  position={[
                    x,
                    y,
                    z
                  ]}
                  rotation={[0, 0, 0]}
                  color={0xffffff * Math.random()}
                  onSelect={onSelect}
                />
              })}
              {/* {selected && (
                <TransformControls object={selected} mode={settings.current.mode} translationSnap={gridSnap / 2} scaleSnap={gridSnap / 2} />
              )} */}
              <gridHelper />
              <Common color={'#66ffdd'} />
            </Suspense>
          </View>
        </div>
      </div>
    </>
  )
}
