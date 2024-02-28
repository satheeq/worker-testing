let collection = [];

self.addEventListener('connect', function(e) {
    console.error('starting shared worker')
    const port = e.ports[0];
    let webSocket;

    port.addEventListener('message', function(e) {
        let msg = e.data;

        switch (msg) {
            case 'getData':
                port.postMessage(collection);
                break;

            case 'connectWS':
                connectWebsocket()
                    .then((ws) => {
                        if (ws) {
                            port.postMessage('Connection success');
                            webSocket = ws;
                        }})
                    .catch(() => {
                        port.postMessage('Connection NOT success');
                    });
                break;

            case 'sendMessage':
                webSocket.send(JSON.stringify({message: "some message from sharedWorker"}));
                break;

            case 'fetchData':
                webSocket.send(JSON.stringify({action: 'fetchData', message: 'give data to me'}));
                break;

            default:
                fetchData(port, e.data);
                break;
        }
    });

    // Tell main thread that worker is ready
    port.start();
});

function connectWebsocket() {
    console.log('connecting to websocket');

    const ws = new WebSocket('ws://localhost:12345');

    return new Promise((resolve, reject) => {
        const timer = setInterval(() => {
            if(ws.readyState === 1) {
                console.log('websocket connection successful');

                clearInterval(timer);

                ws.onmessage = (message) => {
                    console.log('SW: ws data:', message.data);
                };

                resolve(ws);
            }
        }, 10);
    });
}

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