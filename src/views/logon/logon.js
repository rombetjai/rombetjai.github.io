setLogin.addEventListener('submit', logonHandler)
async function logonHandler(ev) {
    ev.preventDefault()
    Core.loader('Verificando credenciales')
    let data = Core.utils.getFormData('#setLogin')
    data.pw = CryptoJS.SHA256(data.pw).toString()
    let res = await Core.api.call(data)
    Core.loader()
    if(!res.authorized) return
    await Core.views.get(Core.routes.sidebar, Dastan)
}

setDev.addEventListener('click', () => {
    Core.loader('Estableciendo modo dev')
    Core.api.setEnviron({}).then(() => {
        Core.loader()
    })
})