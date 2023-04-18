let collection = [];

self.addEventListener('message', async (event) => {
    if (event.data === 'getData') {
        self.postMessage({ success: true, data: collection });
    } else {
        try {
            const response = await fetch(event.data);
            const data = await response.json();
            collection = data;
            console.error('web worker', data.length)
            // self.postMessage({ success: true, data });
        } catch (error) {
            self.postMessage({ success: false, error: error.message });
        }
    }
});