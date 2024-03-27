//banner
const slideWrapper = document.querySelector('[data-slide="wrapper"]') 
const slideList = document.querySelector('[data-slide="list"]') 
const navPreviousButton = document.querySelector('[data-slide="nav-previous-button"]')
const navNextButton = document.querySelector('[data-slide="nav-next-button"]')
const controlsWrapper = document.querySelector('[data-slide="controls-wrapper"]')
let slideItems = document.querySelectorAll('[data-slide="item"]')
let controlButtons
let slideInterval

const state = {
    startingPoint: 0,
    savedPosition: 0,
    currentPoint: 0,
    movement: 0,
    currentSlideIndex: 0,
    autoPlay: false,
    timeInterval: 0
}

function translateSlide({ position }) {
    state.savedPosition = position
    slideList.style.transform = `translateX(${position}px)`
}

function getCenterPosition({ index }) {
    const slideItem = slideItems[index]
    const slideWidth = slideItem.clientWidth
    const windowWidth = document.body.clientWidth
    const margin = (windowWidth - slideWidth) / 2
    const position = margin - (index * slideWidth)
    return position
}

function setVisibleSlide({ index, animate }) {
    if(index === 0 || index === slideItems.length - 1) {
        index = state.currentSlideIndex
    }
    const position = getCenterPosition({ index })
    state.currentSlideIndex = index
    slideList.style.transition = animate === true ? 'transform .5s' : 'none'
    activeControlButton({ index })
    translateSlide({position: position})
}

function nextSlide() {
    setVisibleSlide({ index: state.currentSlideIndex + 1, animate: true})
}

function previousSlide() {
    setVisibleSlide({ index: state.currentSlideIndex - 1, animate: true})
}

function createControlButtons() {
    slideItems.forEach(function(){
        const controlButton = document.createElement('button')
        controlButton.classList.add('slide-control-button')
        controlButton.classList.add('fas')
        controlButton.classList.add('fa-circle')
        controlButton.dataset.slide = 'control-button'
        controlsWrapper.append(controlButton)
    })
}

function activeControlButton({ index }) {
    const slideItem = slideItems[index]
    const dataIndex = Number(slideItem.dataset.index)
    const controlButton = controlButtons[dataIndex]
    controlButtons.forEach(function(controlButtonItem) {
        controlButtonItem.classList.remove('active')
    })
    if(controlButton) controlButton.classList.add('active')
}

function createSlideClones() {
    const firstSlide = slideItems[0].cloneNode(true)
    firstSlide.classList.add('slide-cloned')
    firstSlide.dataset.index = slideItems.length

    const secondSlide = slideItems[1].cloneNode(true)
    secondSlide.classList.add('slide-cloned')
    secondSlide.dataset.index = slideItems.length + 1

    const lastSlide = slideItems[slideItems.length - 1].cloneNode(true)
    lastSlide.classList.add('slide-cloned')
    lastSlide.dataset.index = -1

    const penultimateSlide = slideItems[slideItems.length - 2].cloneNode(true)
    penultimateSlide.classList.add('slide-cloned')
    penultimateSlide.dataset.index = -2

    slideList.append(firstSlide)
    slideList.append(secondSlide)
    slideList.prepend(lastSlide)
    slideList.prepend(penultimateSlide)

    slideItems = document.querySelectorAll('[data-slide="item"]')
}

function onMouseDown(event, index) {
    const slideItem = event.currentTarget
    state.startingPoint = event.clientX
    state.currentPoint = event.clientX - state.savedPosition
    state.currentSlideIndex = index
    slideList.style.transition = 'none'
    slideItem.addEventListener('mousemove', onMouseMove)
}

function onMouseMove(event) {
    state.movement = event.clientX - state.startingPoint
    const position = event.clientX - state.currentPoint
    translateSlide({ position })
}

function onMouseUp(event) {
    const pointsToMove = event.type.includes('touch') ? 50 : 150
    if(state.movement < -pointsToMove) {
        nextSlide()
    } else if (state.movement > pointsToMove) {
        previousSlide()
    } else {
        setVisibleSlide({ index: state.currentSlideIndex, animate: true})
    }
    state.movement = 0
    const slideItem = event.currentTarget
    slideItem.removeEventListener('mousemove', onMouseMove)
}

function onTouchStart(event, index) {
    event.clientX = event.touches[0].clientX
    onMouseDown(event, index)
    const slideItem = event.currentTarget
    slideItem.addEventListener('touchmove', onTouchMove)
}

function onTouchMove (event) {
    event.clientX = event.touches[0].clientX
    onMouseMove(event)
}

function onTouchEnd(event) {
    onMouseUp(event)
    const slideItem = event.currentTarget
    slideItem.removeEventListener('touchmove', onTouchMove)
}

function onControlButtonClick(index) {
    setVisibleSlide({ index: index + 2, animate: true })
}

function onSlideListTransitionEnd() {
    const slideItem = slideItems[state.currentSlideIndex]

    if(slideItem.classList.contains('slide-cloned') && Number(slideItem.dataset.index) > 0) {
        setVisibleSlide({ index: 2, animate: false })
    }
    if(slideItem.classList.contains('slide-cloned') && Number(slideItem.dataset.index) < 0) {
        setVisibleSlide({ index: slideItems.length - 3, animate: false })
    }
}

function setAutoPlay() {
    if(state.autoPlay) {
        slideInterval = setInterval(function() {
            setVisibleSlide({index: state.currentSlideIndex + 1 , animate: true})
        }, state.timeInterval)
    }
}

function setListeners() {
    controlButtons = document.querySelectorAll('[data-slide="control-button"]')
    controlButtons.forEach(function(controlButton, index) {
        controlButton.addEventListener('click', function(event) {
            onControlButtonClick(index)
        })
    })

    slideItems.forEach(function(slideItem, index) {
        slideItem.addEventListener('dragstart', function(event) {
            event.preventDefault()
        })
        slideItem.addEventListener('mousedown', function(event) {
            onMouseDown(event, index)
        })
        slideItem.addEventListener('mouseup', onMouseUp)
        slideItem.addEventListener('touchstart', function(event) {
            onTouchStart(event, index)
        })
        slideItem.addEventListener('touchend', onTouchEnd)
    })
    navNextButton.addEventListener('click', nextSlide)
    navPreviousButton.addEventListener('click', previousSlide)
    slideList.addEventListener('transitionend', onSlideListTransitionEnd)
    slideWrapper.addEventListener('mouseenter', function() {
        clearInterval(slideInterval)
    })
    slideWrapper.addEventListener('mouseleave', function() {
        setAutoPlay()
    })
    let resizeTimeout
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout)
        resizeTimeout = setTimeout(function() {
            setVisibleSlide({index: state.currentSlideIndex, animate: true})
        }, 1000)
    })
}

function initSlider({startAtIndex = 0, autoPlay = false, timeInterval = 0}) {
    state.autoPlay = false
    state.timeInterval = timeInterval
    createControlButtons()
    createSlideClones()
    setListeners()
    setVisibleSlide({ index: startAtIndex + 2, animate: true })
    setAutoPlay()
}

//fimbanner

//senhas

document.addEventListener('DOMContentLoaded', function () {
    var formentre = document.querySelector('#entre');
    var formcadastro = document.querySelector('#Cadastro');
    var entrecad = document.querySelector('.entre-cad');
    document.querySelector('#view').addEventListener('click', viewsenha);
    document.querySelector('#view1').addEventListener('click', viewsenha1);
    document.querySelector('#view2').addEventListener('click', viewsenha2);
    


//login
    function viewsenha() {
        var inputpass = document.getElementById('senha1');
        var bntview = document.getElementById('view');
    
        if (inputpass.type === 'password') {
            inputpass.setAttribute('type', 'text');
            bntview.classList.replace('bi-eye-fill', 'bi-eye-slash-fill');
        } else {
            inputpass.setAttribute('type', 'password');
            bntview.classList.replace('bi-eye-slash-fill', 'bi-eye-fill');
        }
    }
    //cadastro
    function viewsenha1() {
        var inputpass1 = document.getElementById('senha');
        var bntview1 = document.getElementById('view1');
    
        if (inputpass1.type === 'password') {
            inputpass1.setAttribute('type', 'text');
            bntview1.classList.replace('bi-eye-fill', 'bi-eye-slash-fill');
        } else {
            inputpass1.setAttribute('type', 'password');
            bntview1.classList.replace('bi-eye-slash-fill', 'bi-eye-fill');
        }
    }

//confirme seu cadastro
function viewsenha2() {
    var inputpass2 = document.getElementById('confirmarSenha');
    var bntview2 = document.getElementById('view2');

    if (inputpass2.type === 'password') {
        inputpass2.setAttribute('type', 'text');
        bntview2.classList.replace('bi-eye-fill', 'bi-eye-slash-fill');
    } else {
        inputpass2.setAttribute('type', 'password');
        bntview2.classList.replace('bi-eye-slash-fill', 'bi-eye-fill');
    }
}




    document.querySelector('#b-entre').addEventListener('click', () => {
        formentre.style.left = "25px";
        formcadastro.style.left = "450px";
        entrecad.style.left = "0px";
    });

    document.querySelector('#b-cadastro').addEventListener('click', () => {
        formentre.style.left = "-440px";
        formcadastro.style.left = "25px";
        entrecad.style.left = "103px";
    });



    function exibirTextoNaTela(tag, texto) {

        let campo = document.querySelector(tag);
        campo.innerHTML = texto;
    
    }
    
    var senhaInput = document.querySelector('#senha');
    var confirmarSenhaInput = document.querySelector('#confirmarSenha');

    function verificarSenhas() {
        var senha = senhaInput.value;
        var confirmarSenha = confirmarSenhaInput.value;

        if (senha === "" || confirmarSenha === "") {
            exibirTextoNaTela('#alerta', 'Preencha ambos os campos de senha');
            senhaInput.style.boxShadow = "0 0 5px red";
            confirmarSenhaInput.style.boxShadow = "0 0 5px red";
        } else if (senha !== confirmarSenha) {
            exibirTextoNaTela('#alerta', 'As senhas não coincidem');
            senhaInput.style.boxShadow = "0 0 5px red";
            confirmarSenhaInput.style.boxShadow = "0 0 5px red";
        } else {
            exibirTextoNaTela('#alerta', ' ');
            senhaInput.style.boxShadow = "0 0 5px #1ec396";
            confirmarSenhaInput.style.boxShadow = "0 0 5px  #1ec396";
        }
    }

    confirmarSenhaInput.addEventListener('input', verificarSenhas);
    senhaInput.addEventListener('input', verificarSenhas);
});


/*compas*/


let procurar = document.querySelector(`.procurar-box`);

document.querySelector(`#pesquisa`).onclick = () => {


procurar.classList.toggle(`active`);

}


let navbar = document.querySelector(`.navbar`);

document.querySelector(`#menu-icone`).onclick = () => {


navbar.classList.toggle(`active`);

}


