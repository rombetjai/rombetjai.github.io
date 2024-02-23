var Core = {
    storage: {
        name: 'DastanApp',
        get: function () {
            return localStorage.getItem(this.name)
        },
        set: function (data) {
            let str = JSON.stringify(data)
            return localStorage.setItem(this.name, str)
        }
    },
    routes: {
        logon: ['./src/views/logon/logon', 'html', 'css', 'js'],
        sidebar: ['./src/views/menus/sidebar', 'html', 'css', 'js'],
        menus: {
            ingresos: {
                account: ['./src/views/menus/ingresos/accounts', 'html', 'js']
            }
        }
    },
    api: {
        prod: 'https://script.google.com/macros/s/AKfycbzFW4q1vdF6gx6C_BoHT07s_9tzYUODUKoPZeT7aoz5veAd6wFB_VBFgkEL86MQOMD0ow/exec',
        dev: 'https://script.google.com/macros/s/AKfycbyhYex21VKamoNZGABogjxWampL_beL7FHvM4mIBeTT/dev',
        call: function (payload, forceProd) {
            let isDev = Core.utils.cookies.get('gasdev')
            let token = Core.utils.cookies.get('gas')
            let url = this.prod
            let options = {
                method: 'POST', body: JSON.stringify(payload)
            }

            if (isDev && !forceProd) {
                if (token) {
                    url = `${this.dev}?access_token=${token}`
                }
                else {
                    this.setEnviron({}).then(() => {
                        return this.call(payload, forceProd)
                    })
                }
            }

            if (forceProd) url = this.prod
            return new Promise((resolve, reject) => {
                fetch(url, options)
                    .then(u => u.json())
                    .then(u => {
                        if (u.token) this.setEnviron(u)
                        if (u.cookie) Core.utils.cookies.set(u.cookie.key, u.cookie.value, u.cookie.expires)
                        if (u.glass) Glass.fire(u.glass)
                        if (u.noty) Glass.noty(u.noty)
                        resolve(u)
                    })
                    .catch(async x => {
                        try {
                            if (!payload.retry && url.includes('access_token')) {
                                // Pedir un nuevo token y reintentar
                                await this.setEnviron({})
                                payload.retry = true
                                let result = await this.call(payload)
                                resolve(result)
                            }

                            // Tiene retry o no tuvo headers --> Error normal
                            reject(x)
                        } catch (error) {
                            reject(error)
                        }
                    })
            })

        },
        setEnviron: async function (config) {
            if (!config) return Core.utils.cookies.delete('gas')
            if (!config.token) {
                Core.utils.alert({ title: 'Modo desarrollo', body: 'Se está estableciendo el modo de desarrollo', type: 'info' })
                return await this.call({ action: 'utils', subaction: 'setDev' }, true)
            }
            Core.utils.cookies.set('gas', config.token, 10)
            Core.utils.cookies.set('gasdev', true, 60 * 8)
            Core.utils.alert({ title: 'Modo desarrollo', body: 'Se estableció el modo de desarrollo', type: 'warning', delay: 5000 })
            Core.loader()
        }
    },
    loader: (show) => {
        if (!show) return overlay.classList.add('d-none')
        overlay.classList.remove('d-none')
        overlayText.textContent = show
    },
    views: {
        get: async (routes, root) => {
            let url = routes.shift()
            let result = {}
            for (let part of routes) {
                let resource = `${url}.${part}`
                switch (part) {
                    case 'js':
                        const scriptElement = document.createElement('script');
                        scriptElement.src = resource;
                        scriptElement.type = 'text/javascript';
                        root.appendChild(scriptElement);
                        break
                    case 'css':
                        const linkElement = document.createElement('link');
                        linkElement.href = resource;
                        linkElement.rel = 'stylesheet';
                        root.appendChild(linkElement)
                        break
                    default:
                        let c = await Core.network(resource)
                        root.innerHTML = c
                        break;
                }
            }
            return true
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
    },
    utils: {
        cookies: {
            set: (key, value, minutes) => {
                const d = new Date();
                d.setTime(d.getTime() + (minutes * 60 * 1000));
                const expires = "expires=" + d.toUTCString();
                document.cookie = key + "=" + value + ";" + expires + ";path=/";
            },
            get: (key) => {
                const name = key + "=";
                const decodedCookie = decodeURIComponent(document.cookie);
                const cookieArray = decodedCookie.split(';');
                for (let i = 0; i < cookieArray.length; i++) {
                    let cookie = cookieArray[i];
                    while (cookie.charAt(0) === ' ') {
                        cookie = cookie.substring(1);
                    }
                    if (cookie.indexOf(name) === 0) {
                        return cookie.substring(name.length, cookie.length);
                    }
                }
                return null;
            },
            delete: (key) => {
                document.cookie = key + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            }
        },
        alert: (config) => Glass.noty(config),
        getFormData: (selector) => {
            const form = document.querySelector(selector);
            const formData = {};
            for (const element of form.elements) {
                if (element.name) {
                    formData[element.name] = element.value;
                }
            }
            return formData;
        }
    }
}