module.exports = {
    content: [
      "./src/**/*.{js,jsx}",
      "./public/index.html"
    ],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          brand: {
            blue: '#184494',
            teal: '#107e7d',
            gold: '#e3b505',
            red: '#e80414',
          },
          surface: {
            light: '#f8f9fb',
            dark: '#0f1729',
          },
          card: {
            light: '#ffffff',
            dark: '#1a2540',
          },
          muted: {
            light: '#f1f3f7',
            dark: '#1e2d4a',
          },
        },
      },
    },
    plugins: [],
  }
