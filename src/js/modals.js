var Modals = {
    customize: (config) => {
        if (!config) {
            throw new Error('No ha establecido un elemento de configuración')
            return
        }
        if (config.layout) {
            Modals.template = config.layout
        }
    },
    getData: (target, selector) => {
        let inputs = null;
        if (typeof target == 'string') {
            inputs = $(target).find(':input');
        } else {
            if (!selector) inputs = $(target.currentTarget).find(':input');
            if (selector) inputs = $(target.currentTarget).closest(selector).find(':input');
        }

        let data = {};
        for (let input of inputs) {
            if (input.name != '') {
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
                if (input.required && input.value == '') {
                    data = null;
                    break;
                }
            }
        }
        return data;
    },
    wait: (ms) => {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        })
    },
    init: () => {
        Modals.config = {
            confirmButton: true,
            confirmText: 'OK',
            confirmClass: 'btn-primary',
            closeButton: true,
            closeText: 'Cerrar',
            closeClass: 'btn-danger',
            centered: true,
            size: 'md',
            iconLight: 'https://i.ibb.co/wKPTzmW/tullave-logo.png',
            icon: 'https://i.ibb.co/wKPTzmW/tullave-logo.png'
        }
        Modals.config.template = `
			<div class="modal fade" id="modalContainer" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-md" id="modalDialog">
          <div class="modal-content">
            <div class="modal-header py-2" id="modalHeader">
              <span class="modal-title fs-6 fw-semibold" id="modalTitle"></span>
              <img class="ms-auto my-auto" src="" width="24px" height="24px" id="modalIcon" />
            </div>
            <div class="modal-body overflow-visible" id="modalBody">
            </div>
            <div class="modal-footer" id="modalFooter">
              <div class="alert alert-danger w-100 d-none"></div>
              <div class="d-inline-block">
                <button type="button" class="btn btn-primary" modal-action="confirm">OK</button>
                <button type="button" class="btn btn-danger bg-opacity-25" modal-action="close">Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    },
    destroy: async () => {
        Modals.runner.dispose()
        $('#modalContainer').remove()
        await Modals.wait(500)
    },
    fire: (config) => {
        return new Promise(async resolve => {
            let element = $(config.template || Modals.config.template)
            if (config.noHeader) {
                element.find('#modals-header').remove();
            } else {
                if (!config.title) {
                    throw new Error('Debe establecer un título o establecer la propiedad "noHeader" en true')
                    return
                }
                element.find('#modalTitle').text(config.title)
            }

            let darkColors = ['primary', 'dark', 'danger', 'success']
            if (darkColors.indexOf(config.type) != -1) Modals.config.icon = Modals.config.iconLight

            element.find('#modalIcon').attr('src', config.icon || Modals.config.icon)

            if (!config.body) {
                throw new Error('Debe establecer cuerpo para el modal')
                return
            }

            if (config.centered == false) element.find('#modalDialog').removeClass('modal-dialog-centered')
            if (config.size && config.size !== 'md') {
                element.find('#modalDialog').toggleClass('modal-md', false).toggleClass(`modal-${config.size}`, true);
            }

            if (config.type) element.find('#modalHeader').addClass(`bg-${config.type} bg-opacity-25`)
            if (config.height) element.find('.modal-content').css('height', config.height + 'px');
            if (typeof config.overflow != 'undefined' && config.overflow == false) {
                element.find('.modal-body').addClass('overflow-visible')
                element.find('.modal-content').addClass('overflow-visible')
            }

            element.find('#modalBody').html(config.body)
            if (config.controls) {
                if (!config.controls.selector) {
                    throw new Error('Ha solicitado crear controles dinámicos pero falta el selector de destino.')
                }
                let controls = Modals.createControls(config.controls.items)
                element.find(config.controls.selector).html(controls)
            }

            if (config.confirmText) element.find('[modal-action="confirm"]').text(config.confirmText)
            if (config.closeText) element.find('[modal-action="close"]').text(config.closeText)

            $('body').append(element)

            if (config.onRender && typeof config.onRender == 'function') config.onRender(element)

            $('#modalContainer [modal-action="confirm"]').off('click').on('click', e => {
                let container = $('#modalContainer')
                container.find('.modal-footer .alert-danger').addClass('d-none')
                let flag = false
                let data = null
                if (config.pong) {
                    data = Modals.getData('#modalContainer .modal-body')
                    if (!data) {
                        e.preventDefault()
                        container.find('.modal-footer .alert-danger')
                            .html('<i class="fa-solid fa-times-circle"></i>&nbsp; Falta diligenciar algunos campos.')
                            .removeClass('d-none')
                    }
                    else {
                        resolve({ isConfirmed: true, values: data })
                        Modals.destroy()
                    }
                }
                else {
                    if (config.preConfirm && typeof config.preConfirm == 'function') {
                        data = config.preConfirm()
                        resolve({ isConfirmed: true, values: data })
                    }
                    Modals.runner.dispose()
                    $('#modalContainer').remove()
                    resolve({ isConfirmed: true, values: data })
                }
            })

            $('#modalContainer [modal-action="close"]').off('click').on('click', e => {
                Modals.runner.dispose()
                $('#modalContainer').remove()
                resolve({ isConfirmed: false, values: null })
            })

            Modals.runner = new bootstrap.Modal('#modalContainer', { backdrop: 'static', focus: true, keyboard: false })
            Modals.runner.show()

            // Aplicar los controles de Tomselect cuando se muestre el control
            // Crear los campos dinámicos de Tomselect
            if (config.controls) {
                let tomselected = config.controls.items.filter(u => u.tomselect)
                for (let item of tomselected) {
                    let c = item.tomselect
                    let options = []
                    if (item.tomselect.route) {
                        let route = item.tomselect.route.split('.')
                        let key = route.shift()
                        let data = await Core.database.query(key)
                        options = data
                        if (route.length != 0) {
                            route = route.join('.')
                            options = Core.search(route, '.', data)
                        }
                    }
                    else {
                        options = item.tomselect.options
                    }
                    Core.tomselect(`#modalBody [name="${item.name}"]`, {
                        options: options, valueField: c.value, labelField: c.display,
                        searchField: c.display, sortField: c.display, items: [c.selected],
                        create: c.create ? c.create : false
                    })
                }
            }

            if (config.didShow && typeof config.didShow == 'function') config.didShow()
        })
    },
    createControls: (controls) => {
        let container = '<div class="row">'
        let elements = controls.map(u => {
            if (!u.name || !u.tag) {
                throw new Error(`No se encontró el atributo 'name' o 'tag' en la solicitud de creación dinámica de controles`)
                return
            }
            return `<div class="col ${u.col ? u.col : 'col-12'} mb-3">
                  <label for="${u.name}" class="col-form-label">${u.legend || ''}</label>
                  <div class="input-group">
                    <div class="input-group-text">
                      <span class="fa-solid fa-${u.icon || 'question-circle'}"></span>
                    </div>
                    <${u.tag} value="" ${u.type ? `type="${u.type}"` : ''} name="${u.name}" class="form-${u.tag == 'select' ? 'select' : 'control'}" ${u.required ? 'required' : ''}>${u.options ? u.options.map(x => {
                return `<option value="${x.value}">${x.text}</option>`
            }).join('') : ''}${u.tag != 'input' ? `</${u.tag}>` : ''}
                  </div>
                </div>`
        })
        container += elements.join('').trim()
        container += '</div>'
        return container
    }
}

Modals.init()
