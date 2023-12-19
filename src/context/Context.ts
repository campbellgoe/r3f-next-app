// context/MyContext.js
import { createContext } from 'react';
import { initialState } from './initialState';

const MyContext = createContext(initialState);
export default MyContext;