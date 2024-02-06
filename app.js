async function init(){
    let storage = Core.storage.get()
    if(!storage) {
        let response = await Core.views.get(Core.routes.logon)
        await Core.views.set(response, Dastan)
        return Core.loader()
    }

    // Traer vista por defecto.
}

init()