if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then((reg) => console.log('SW registered', reg))
        .catch((error) => console.log('SW not registered', error))
}