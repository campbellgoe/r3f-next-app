'use client'

import { useRef, useContext } from 'react'
import dynamic from 'next/dynamic'
const Scene = dynamic(() => import('@/components/canvas/Scene'), { ssr: false })
import MyContext from '@/context/Context';

const Layout = ({ children }) => {
  const ref = useRef()

  const { setState } = useContext(MyContext);
  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        width: ' 100%',
        height: '100%',
        overflow: 'auto',
        touchAction: 'auto',
      }}
    >
      {children}
      <Scene
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
        }}
        eventSource={ref}
        eventPrefix='client'
        onPointerMissed={() => {
          setState(state => ({ ...state, selected: null }))
        }}
      />
    </div>
  )
}

export { Layout }
