import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import { Game } from './components/Game';

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(<Provider store={store}><Game /></Provider>);