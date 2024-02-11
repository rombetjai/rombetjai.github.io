setLogin.addEventListener('submit', logonHandler)
async function logonHandler(ev) {
    ev.preventDefault()
    let data = Core.utils.getFormData('#setLogin')
    data.pw = CryptoJS.SHA256(data.pw).toString()
    let res = await Core.api.call(data)
    if(!res.authorized) return Core.utils.alert(res.alert)
}