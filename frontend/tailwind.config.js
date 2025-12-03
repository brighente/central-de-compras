/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: 'var(--cor-sidebar)',       
        primary: {
          DEFAULT: 'var(--cor-primary)',    
          hover: 'var(--cor-primary-hover)',
        },
        fundo: 'var(--cor-fundo)',
        branco: 'var(--cor-branco)',
        texto: {
          DEFAULT: 'var(--cor-texto)',
          suave: 'var(--cor-texto-suave)',
        },
        info: 'var(--cor-info)',
        danger: 'var(--cor-danger)',
      }
    },
  },
  plugins: [],
}