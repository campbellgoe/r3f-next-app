'use client';
// context/MyProvider.js
import React, { useState } from 'react';
import MyContext from './Context';
import { initialState } from './initialState';

const MyProvider = ({ children }) => {
  const [state, setState] = useState(initialState);

  return (
    <MyContext.Provider value={{ selected: state.selected, setState }}>
      {children}
    </MyContext.Provider>
  );
};

export default MyProvider;