var Glass = {
    counter: 0,
    history: {},
    customize: (config) => {
        if (!config) {
            // Cambiar por un modal propio de error con su propia configuración
            throw new Error('No ha establecido un elemento de configuración')
        }
        if (config.layout) {
            Glass.template = config.layout
        }
    },
    sleep: (ms) => {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        })
    },
    getData: (target, selector) => {
        let inputs = null;
        let allSelect = `${target} input, ${target} select, ${target} textarea`
        if (typeof target === 'string') {
            inputs = document.querySelectorAll(allSelect);
        } else {
            if (!selector) inputs = target.currentTarget.querySelectorAll(allSelect);
            if (selector) inputs = target.currentTarget.closest(selector).querySelectorAll(allSelect);
        }

        let data = {};
        for (let input of inputs) {
            if (input.name !== '') {
                if (input.type === 'checkbox') {
                    data[input.name] = input.checked;
                } else if (input.tagName === 'SELECT' && input.multiple && input.classList.contains('tomselected')) {
                    let selectedValues = [];
                    let selectedItems = input.parentElement.getElementsByClassName('item');
                    for (let item of selectedItems) {
                        selectedValues.push(item.dataset.value);
                    }
                    data[input.name] = selectedValues;
                } else {
                    data[input.name] = input.value;
                }
                if (input.required && input.value === '') {
                    data = null;
                    break;
                }
            }
        }
        return data;
    },
    init: () => {
        Glass.config = {
            confirmButton: true,
            confirmText: 'Confirmar',
            confirmClass: 'btn-primary',
            closeButton: true,
            closeText: 'Cerrar',
            closeClass: 'btn-danger',
            centered: true,
            size: 'md',
            iconLight: 'https://i.ibb.co/wKPTzmW/tullave-logo.png',
            icon: 'https://i.ibb.co/wKPTzmW/tullave-logo.png'
        }
        Glass.config.template = `        
            <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered" id="gSize">
                <div class="modal-content is-glass">
                    <div class="modal-header" id="gHeader">
                        <span class="modal-title fw-semibold" id="gTitle"></span>
                    </div>
                    <div class="modal-body" id="gBody">
                        <div id="gContent"></div>
                        <form id="gForm"></form>
                    </div>
                    <div class="modal-footer d-block" id="gFooter">
                        <div class="alert alert-danger mb-3 d-none" id="gAlert"></div>
                        <div class="d-flex align-items-end justify-content-end">
                            <button class="btn btn-outline-primary btn-sm me-2" id="gConfirm">
                                <i class="fa-solid fa-check-circle me-2"></i>Confirmar
                            </button>
                            <button class="btn btn-outline-danger btn-sm me-2" id="gClose">
                                <i class="fa-solid fa-check-circle me-2"></i>Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        Glass.config.backdrop = `<div class="glass-back"></div>`
        document.addEventListener('click', function (e) {
            if (!e.target.closest('#gCard')) {
                let el = document.getElementById('gCard')
                if (el) {
                    el.classList.add('shake');
                    el.addEventListener('animationend', function () {
                        this.classList.remove('shake');
                    });
                }
            }
        });
    },
    destroy: async (e, key) => {
        let el = e.modal
        el.classList.add('gModalHide');

        e.modal.parentElement.removeChild(e.modal)
        e.backdrop.parentElement.removeChild(e.backdrop)
        delete Glass.history[key]

    },
    fire: function (config) {

        let counter = Glass.counter
        Glass.counter++
        const element = document.createElement('div')
        element.id = 'gCard';
        element.classList.add('modal', 'show')
        element.setAttribute('tabindex', '-1')
        element.setAttribute('aria-modal', 'true')
        element.setAttribute('role', 'dialog')
        element.style.display = 'flow'

        element.tabIndex = -1;
        element.setAttribute('aria-hidden', 'true');
        element.innerHTML = config.template || Glass.config.template;

        let card = element.querySelector('#gSize')
        !config.size ? card.classList.add('modal-sm') : card.classList.add(`modal-${config.size}`)

        if (!config.title) {
            const header = element.querySelector('#gTitle');
            if (header) header.parentElement.removeChild(header)
        } else {
            const modalTitle = element.querySelector('#gTitle');
            if (modalTitle) modalTitle.textContent = config.title;
        }

        const darkColors = ['primary', 'dark', 'danger', 'success'];
        if (darkColors.includes(config.type)) Glass.config.icon = Glass.config.iconLight;

        const modalIcon = element.querySelector('#gIcon');
        if (modalIcon) modalIcon.src = config.icon || Glass.config.icon;

        if (!config.body) {
            // Lanzar un error con config propia
            return Glass.fire({
                type: 'danger', title: 'Parámetros incompletos', size: 'md',
                body: `<p>Debe establecer un cuerpo para el modal. A continuación se muestra el elemento entregado.</p>
                <p><code>${JSON.stringify(config)}</code><p>`
            })
        }

        const modalHeader = element.querySelector('#gHeader');
        if (config.type && modalHeader) modalHeader.classList.add(`bg-${config.type}`, 'bg-opacity-50');

        const modalContent = element.querySelector('#gBody');
        if (config.height && modalContent) modalContent.style.height = config.height + 'px'

        if (typeof config.overflow !== 'undefined' && config.overflow === false) {
            const modalBody = element.querySelector('#gBody');
            const modalContent = element.querySelector('#gBody');
            if (modalBody) modalBody.classList.add('overflow-visible');
            if (modalContent) modalContent.classList.add('overflow-visible');
        }

        const modalBody = element.querySelector('#gContent');
        if (modalBody) modalBody.innerHTML = config.body;

        if (config.controls) {
            if (!config.controls.selector) config.controls.selector = '#gForm'
            let controls = Glass.createControls(config.controls.items)
            element.querySelector(config.controls.selector).innerHTML = controls
        }

        let confirmNode = element.querySelector('#gConfirm')
        config.confirmText ? confirmNode.textContent = config.confirmText : confirmNode.parentElement.removeChild(confirmNode)

        if (config.closeText) element.querySelector('#gClose').textContent = config.closeText

        const backdrop = document.createElement('div')
        backdrop.id = 'gBackdrop'
        let bodyNode = document.querySelector('body')
        bodyNode.append(backdrop)
        bodyNode.appendChild(element)

        Glass.history[counter] = { modal: element, backdrop }

        // Establecer eventos
        if (config.onRender && typeof config.onRender == 'function') config.onRender(element)

        return new Promise(resolve => {
            if (config.confirmText) {
                element.querySelector('#gCard #gConfirm').addEventListener('click', e => {
                    const alertDanger = element.querySelector('#gFooter #gAlert');
                    alertDanger.classList.add('d-none');

                    let data = null;
                    if (config.controls) {
                        data = Glass.getData('#gCard #gBody');
                        if (!data) {
                            alertDanger.innerHTML = '<i class="fa-solid fa-times-circle me-2"></i>Falta diligenciar algunos campos.';
                            alertDanger.classList.remove('d-none');
                            return
                        }
                    }

                    if (typeof config.preConfirm === 'function') {
                        if (config.preConfirm.constructor.name === 'AsyncFunction') {
                            config.preConfirm(data).then(result => {
                                Glass.destroy(Glass.history[counter], counter);
                                return resolve({ isConfirmed: true, values: data, confirm: result });
                            });
                        }
                        let result = config.preConfirm(data);
                        Glass.destroy(Glass.history[counter], counter);
                        return resolve({ isConfirmed: true, values: data, confirm: result });
                    }
                    Glass.destroy(Glass.history[counter], counter);
                    return resolve({ isConfirmed: true, values: data });
                });
            }

            element.querySelector('#gCard #gClose').addEventListener('click', e => {
                Glass.destroy(Glass.history[counter], counter);
                resolve({ isConfirmed: false, values: null })
            });

            Glass.runner = element
            Glass.backdrop = backdrop
        });
    },
    createControls: (controls) => {
        let container = '<div class="row">'
        let elements = controls.map(u => {
            if (!u.name || !u.tag) {
                Glass.fire({
                    title: 'Faltan datos', type: 'danger',
                    body: `No se encontró el atributo 'name' o 'tag' en la solicitud de creación dinámica de controles`
                })
                throw new Error(`No se encontró el atributo 'name' o 'tag' en la solicitud de creación dinámica de controles`)
            }
            return `<div class="col ${u.col ? u.col : 'col-12'} mb-3">
                        <label for="${u.name}" class="col-form-label">${u.legend || ''}</label>
                        <div class="input-group">
                            <div class="input-group-text">
                                <span class="fa-solid fa-${u.icon || 'question-circle'}"></span>
                            </div>
                            <${u.tag} value="" type="${u.type || ""}" name="${u.name}" 
                            class="form-${u.tag == 'select' ? 'select' : 'control'}" 
                            ${u.required ? 'required' : ''} placeholder="${u.placeholder || ""}">
                                ${u.options ? u.options.map(x => {
                return `<option value="${x.value}">${x.text}</option>`
            }).join('').trim() : ''}
                            ${u.tag != 'input' ? `</${u.tag}>` : ''}
                        </div>
                    </div>`
        })
        container += elements.join('').trim()
        container += '</div>'
        return container
    }

}

Glass.init()