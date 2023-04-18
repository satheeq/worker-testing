let collection = [];

self.addEventListener('connect', function(e) {
    console.error('shared worker')
    const port = e.ports[0];

    port.addEventListener('message', function(e) {
        if (e.data === 'getData') {
            port.postMessage(collection);
        } else {
            fetchData(port, e.data);
        }
    });

    // Tell main thread that worker is ready
    port.start();
});

function fetchData(port, url) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            collection = data;
            console.error('shared worker', data.length);
            // port.postMessage(data);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}