var Core = {
    storage: {
        name: 'DastanApp',
        maxAge: 1000 * 60 * 60 * 8,
        get: function () {
            return localStorage.getItem(this.name)
        },
        set: function (data) {

        }
    },
    routes: {
        logon: ['./src/views/logon/logon', 'html', 'js']
    },
    api: {
        prod: '',
        dev: '',
        call: function (payload, forceProd) {
            let storage = Core.storage.get()
            let url = this.prod
            if (storage && !storage.dev) url = this.dev
            if (forceProd) url = this.prod

            return new Promise((resolve, reject) => {
                fetch(url, {
                    method: 'POST',
                    body: payload
                })
                    .then(u => u.json())
                    .then(u => resolve(u))
                    .catch(x => reject(x))
            })
        }
    },
    loader: (show) => {
        if (!show) return overlay.classList.add('d-none')
        overlay.classList.remove('d-none')
    },
    views: {
        get: async (routes) => {
            let url = routes.shift()
            let result = {}
            for (let part of routes) {
                result[part] = await Core.network(`${url}.${part}`)
            }
            return result
        },
        set: async (parts, root) => {
            // Reset container
            root.innerHTML = ''
            for (let part in parts) {
                if (part == 'js') {
                    let script = document.createElement('script')
                    script.innerHTML = parts[part]
                    root.appendChild(script)
                }
                else{
                    root.innerHTML = parts[part]
                }
            }
        }
    },
    network: function (route, type, payload) {
        return new Promise((resolve, reject) => {
            fetch(route, {
                method: type || 'GET',
                body: payload
            })
                .then(u => resolve(u.text()))
                .catch(x => reject(x))
        })
    }
}