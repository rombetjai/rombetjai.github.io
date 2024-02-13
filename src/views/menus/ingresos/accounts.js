let container = document.getElementById('mainContent')
container.addEventListener('click', clickedAccounts)

function clickedAccounts(ev) {
    ev.stopPropagation()
    if (!ev.target.name) return
    AccountActions[ev.target.name]()
}

let AccountActions = {
    addAcount: async () => {
        let modal = {
            title: 'Agregar cuenta', type: 'primary', confirmText: 'Enviar',
            body: 'Complete la información para agregar una nueva cuenta',
            controls: {
                items: [
                    {
                        name: 'name', tag: 'input', type: 'text', legend: 'Nombre de la cuenta',
                        required: 'true', icon: 'user'
                    },
                    {
                        name: 'description', tag: 'input', type: 'text', legend: 'Descripción para la cuenta',
                        required: 'true', icon: 'question-circle'
                    }
                ]
            }
        }
        let info = await Glass.fire(modal)
        if(!info.isConfirmed) Glass.fire({
            title: 'Operación cancelada', type: 'danger',
            body: 'Usted ha cancelado la adición de una nueva cuenta de ingresos'
        })
    },
    seeAccounts: () => {
        Core.loader('Consultando cuentas, aguarde')
        setTimeout(() => {
            Core.loader()
            Glass.fire({
                title: 'Sin información', type: 'danger',
                body: 'No se ha encontrado ninguna cuenta inscrita'
            })
        }, 2000)
    }
}