let container = document.getElementById('mainContent')
container.addEventListener('click', clickedAccounts)

function clickedAccounts(ev){
    ev.stopPropagation()
    if(!ev.target.name) return
    AccountActions[ev.target.name]()
}

let AccountActions = {
    addAcount: () => {
        alert('addAcount')
    },
    seeAccounts: () => {
        alert('seeAcounts')
    }
}