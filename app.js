async function init() {
    let keySS = Core.utils.cookies.get('dS')
    Core.loader('')
    if (!keySS) {
        await Core.views.get(Core.routes.logon, Dastan)
        return Core.loader()
    }
    else {
        Core.loader('Comprobando sesión encontrada')
        let p = { route: 'login/set', key: keySS }
        //let res = await Core.api.call(p)
        /* if (!res.authorized) {
            await Core.views.get(Core.routes.logon, Dastan)
            return Core.loader()
        } */
        await Core.views.get(Core.routes.sidebar, Dastan)
        Core.loader()
    }
}

init()