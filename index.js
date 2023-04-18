// let fetchURL = 'https://uat.itrade.cgs-cimb.co.id/mix2?UID=118037&SID=5BB5D5C3-0D23-797B-E053-EEF011AC577C&L=EN&UNC=1&UE=IJSX&H=1&M=1&RT=37&E=IJSX&S=AALI%60NG&AE=1&CM=2&CT=4&SD=20230317000000&ED=20230417174823'
let fetchURL = 'http://localhost:3000/data';
let collection;
let webWorkerInstant;
let sharedWorkerInstant;

function webWorker() {
    _createWebWorkerInstant();

    webWorkerInstant.postMessage(fetchURL);
}

function getDataFromWebWorker() {
    _createWebWorkerInstant();

    webWorkerInstant.postMessage('getData');
}

function sharedWorker() {
    _createSharedWorkerInstant();

    sharedWorkerInstant.port.postMessage(fetchURL);
}

function getDataFromSharedWorker() {
    _createWebWorkerInstant();

    sharedWorkerInstant.port.postMessage('getData');
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('serviceWorker.js')
            .then(function(registration) {
                console.error('ServiceWorker registration successful with scope: ', registration.scope);
            }, function(err) {
                console.error('ServiceWorker registration failed: ', err);
            });
    }
}

function serviceWorker() {
    navigator.serviceWorker.addEventListener('message', function(event) {
        collection = event.data.data;
        console.error(event.data.data.length);
    });

    navigator.serviceWorker.controller.postMessage(fetchURL);
}

function getDataFromServiceWorker() {
    navigator.serviceWorker.controller.postMessage('getData');
}

function killServiceWorker() {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        console.error('unregister', registrations)
        for(let registration of registrations) {
            registration.unregister();
        }
    });
}

function mainTread(isRender) {
    return new Promise(async () => {
        try {
            const response = await fetch(fetchURL);
            const data = await response.json();
            collection = data;
            console.error('main tread', data.length)

            if (isRender) {
                renderTable();
            }
        } catch (error) {
            console.error(error);
        }
    });
}

let renderTable = () => {
    $('#commentTable').children().remove()
    collection.forEach(data => {
        $('#commentTable').append(`<tr>
            <th>${data[0]}</th>
            <th>${data[1]}</th>
        </tr>`);
    })
}

function _createWebWorkerInstant() {
    if (!webWorkerInstant) {
        webWorkerInstant = new Worker('worker.js');

        webWorkerInstant.addEventListener('message', (event) => {
            if (event.data.success) {
                collection = event.data.data;
                console.error(event.data.data.length);
                // renderTable();
            } else {
                console.error('Error:', event.data.error);
            }
        });
    }
}

function _createSharedWorkerInstant() {
    if (!sharedWorkerInstant) {
        sharedWorkerInstant = new SharedWorker('sharedWorker.js');

        sharedWorkerInstant.port.onmessage = function(e) {
            collection = e.data;
            console.error(e.data.length);
            // renderTable();
        };
    }
}