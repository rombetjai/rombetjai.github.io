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
            <div id="gCard" class="card is-glass">
                <div class="d-flex card-header" id="gHeader">
                    <div class="fw-semibold" id="gTitle"></div>
                    <img id="gIcon" class="ms-auto" src="" alt="logo" width="24px"
                        height="24px">
                </div>
                <div class="card-body" id="gBody">                  
                </div>
                <div class="p-0 py-2 card-footer card-footer d-flex flex-row justify-content-end" id="gFooter">
                    <div class="alert alert-danger d-none" id="gAlert"></div>
                    <button class="btn btn-outline-primary btn-sm me-2" id="gConfirm">
                        <i class="fa-solid fa-check-circle me-2"></i>Confirmar
                    </button>
                    <button class="btn btn-outline-danger btn-sm me-2" id="gClose">
                        <i class="fa-solid fa-check-circle me-2"></i>Cerrar
                    </button>
                </div>
            </div>`;
        Glass.config.backdrop = `<div class="glass-back"
            style="background: rgba(255, 255, 255, .1);height: 100vh;z-index: 9999;position: fixed;top: 0;left: 0;
            width: 100%;height: 100%;box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);border-radius: 10px;">
        </div>`
        let node = document.createElement('style');
        node.innerHTML = `@keyframes shake {
            0% { transform: translateX(0); }
            10% { transform: translateX(-5px); }
            20% { transform: translateX(5px); }
            30% { transform: translateX(-5px); }
            40% { transform: translateX(5px); }
            50% { transform: translateX(0); }
          }        
          
          #gModal {
            display: grid;
            place-items: center;
            position: fixed;
            height: 100vh;
            z-index: 9999;
            -webkit-animation: rotateCube 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                    animation: rotateCube 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
          }
          
          @-webkit-keyframes rotateCube {
                0% {
                    -webkit-transform: rotate3d(-1, 1, 0, -360deg);
                            transform: rotate3d(-1, 1, 0, -360deg);
                    opacity: 0;
                }
                100% {
                    -webkit-transform: rotate3d(-1, 1, 0, 0deg);
                            transform: rotate3d(-1, 1, 0, 0deg);
                    opacity: 1;
                }
                }
                @keyframes rotateCube {
                0% {
                    -webkit-transform: rotate3d(-1, 1, 0, -360deg);
                            transform: rotate3d(-1, 1, 0, -360deg);
                    opacity: 0;
                }
                100% {
                    -webkit-transform: rotate3d(-1, 1, 0, 0deg);
                            transform: rotate3d(-1, 1, 0, 0deg);
                    opacity: 1;
                }
            }

            .gModalHide {
                -webkit-animation: rotate-out-ver 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
	            animation: rotate-out-ver 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
            }            

            @-webkit-keyframes rotate-out-ver {
            0% {
                -webkit-transform: rotateY(360deg);
                        transform: rotateY(360deg);
                opacity: 1;
            }
            100% {
                -webkit-transform: rotateY(0deg);
                        transform: rotateY(0deg);
                opacity: 0;
            }
            }
            @keyframes rotate-out-ver {
            0% {
                -webkit-transform: rotateY(360deg);
                        transform: rotateY(360deg);
                opacity: 1;
            }
            100% {
                -webkit-transform: rotateY(0deg);
                        transform: rotateY(0deg);
                opacity: 0;
            }
            }
          
          #gBody {
            background: rgb(255 255 255 / 60%)
          }
        }`
        document.head.appendChild(node)

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
        let el = e.modal.querySelector('#gCard')
        el.classList.add('gModalHide');
        el.addEventListener('animationend', function () {
            e.modal.parentElement.removeChild(e.modal)
            e.backdrop.parentElement.removeChild(e.backdrop)
            delete Glass.history[key]
        });
    },
    fire: function (config) {
        return new Promise(resolve => {
            let counter = Glass.counter
            Glass.counter++
            const element = document.createElement('div')
            element.classList.add('container-fluid');
            element.id = 'gModal';
            element.tabIndex = -1;
            element.setAttribute('aria-hidden', 'true');
            element.innerHTML = config.template || Glass.config.template;

            // Tamaño del modal
            /* let card = element.querySelector('#gCard')
            !config.size ? card.classList.add('modal-sm') : card.classList.add(`modal-${config.size}`) */

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
                throw new Error('Debe establecer cuerpo para el modal');
            }

            const modalHeader = element.querySelector('#gHeader');
            if (config.type && modalHeader) modalHeader.classList.add(`bg-${config.type}`, 'bg-opacity-50');

            const modalContent = element.querySelector('#gBody');
            if (config.height && modalContent) modalContent.style.height = config.height + 'px'

            if (typeof config.overflow !== 'undefined' && config.overflow === false) {
                const modalBody = element.querySelector('#gBody');
                const modalContent = element.querySelector('#Body');
                if (modalBody) modalBody.classList.add('overflow-visible');
                if (modalContent) modalContent.classList.add('overflow-visible');
            }

            const modalBody = element.querySelector('#gBody');
            if (modalBody) modalBody.innerHTML = config.body;

            if (config.controls) {
                if (!config.controls.selector) {
                    // Crear excepción propia
                    throw new Error('Ha solicitado crear controles dinámicos pero falta el selector de destino.');
                }
                let controls = Glass.createControls(config.controls.items)
                element.querySelector(config.controls.selector).innerHTML(controls)
            }

            let confirmNode = element.querySelector('#gConfirm')
            config.confirmText ? confirmNode.textContent(config.confirmText) : confirmNode.parentElement.removeChild(confirmNode)

            if (config.closeText) element.querySelector('#gClose').textContent(config.closeText)

            const backdrop = document.createElement('div')
            backdrop.id = 'gBackdrop'
            backdrop.style.background = 'rgba(120, 120, 120, 0.1)';
            backdrop.style.height = '100vh'
            backdrop.style.zIndex = 9999;
            backdrop.style.position = 'fixed';
            backdrop.style.top = 0;
            backdrop.style.left = 0;
            backdrop.style.width = '100%';
            backdrop.style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.37)';
            backdrop.style.backdropFilter = 'blur(4px)';
            backdrop.style.borderRadius = '10px'

            let bodyNode = document.querySelector('body')
            bodyNode.append(backdrop)
            bodyNode.appendChild(element)

            Glass.history[counter] = { modal: element, backdrop }

            // Establecer eventos
            if (config.onRender && typeof config.onRender == 'function') config.onRender(element)

            if (config.confirmText) {
                element.querySelector('#gModal #gConfirm').addEventListener('click', e => {
                    const container = element.querySelector('#gModal');
                    const alertDanger = element.querySelector('#gFooter #gAlert');
                    alertDanger.classList.add('d-none');

                    let data = null;
                    if (config.pong) {
                        data = Glass.getData('#gModal #gBody');
                        if (!data) {
                            e.preventDefault();
                            alertDanger.innerHTML = '<i class="fa-solid fa-times-circle me-2"></i>Falta diligenciar algunos campos.';
                            alertDanger.classList.remove('d-none');
                        } else {
                            resolve({ isConfirmed: true, values: data });
                            return Glass.destroy(Glass.history[counter], counter);
                        }
                    } else {
                        if (config.preConfirm && typeof config.preConfirm === 'function') {
                            data = config.preConfirm();
                            Glass.destroy(Glass.history[counter], counter);
                            return resolve({ isConfirmed: true, values: data });
                        }
                        Glass.destroy(Glass.history[counter], counter);
                        resolve({ isConfirmed: true, values: data });
                    }
                });
            }


            element.querySelector('#gModal #gClose').addEventListener('click', e => {
                Glass.destroy(Glass.history[counter], counter);
                resolve({ isConfirmed: false, values: null })
            });

            Glass.runner = element
            Glass.backdrop = backdrop
            resolve(element);
        });
    }

}

Glass.init()