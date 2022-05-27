const sprites = new Image()
sprites.src = './sprites.png'
const som_HIT = new Audio()
som_HIT.src = './efeitos/efeitos_hit.wav'

const canvas = document.querySelector('canvas')
const contexto = canvas.getContext('2d')
let frames = 0

const planoDeFundo = {
    spriteX: 390,
    spriteY: 0,
    largura: 275,
    altura: 204,
    x: 0,
    y: canvas.height - 204,
    desenha() {
        contexto.fillStyle = "#70c5ce"
        contexto.fillRect(0, 0, canvas.width, canvas.height)
        
        contexto.drawImage(
            sprites,
            planoDeFundo.spriteX, planoDeFundo.spriteY,
            planoDeFundo.largura, planoDeFundo.altura,
            planoDeFundo.x, planoDeFundo.y,
            planoDeFundo.largura, planoDeFundo.altura
        )

        contexto.drawImage(
            sprites,
            planoDeFundo.spriteX, planoDeFundo.spriteY,
            planoDeFundo.largura, planoDeFundo.altura,
            (planoDeFundo.x + planoDeFundo.largura), planoDeFundo.y,
            planoDeFundo.largura, planoDeFundo.altura
        )
    }
}

function criaChao() {
    const chao = {
        spriteX: 0,
        spriteY: 610,
        largura: 224,
        altura: 112,
        x: 0,
        y: canvas.height - 112,
        atualiza() {
            const movimentoDoChao = 1
            const repeteEm = chao.largura / 2
            const movimentacao = chao.x = chao.x - movimentoDoChao

            chao.x = movimentacao % repeteEm
        },
        desenha() {
            contexto.drawImage(
                sprites, 
                chao.spriteX, chao.spriteY, 
                chao.largura, chao.altura, 
                chao.x, chao.y, 
                chao.largura, chao.altura
            )
        }
    }
    return chao
}

function criaFlappyBird() {
    const flappyBird = {
        spriteX: 0,
        spriteY: 0,
        largura: 33,
        altura: 24,
        x: 10,
        y: 50,
        pulo: 4.6,
        pula() {
            flappyBird.velocidade = -flappyBird.pulo
        },
        gravidade: 0.25,
        velocidade: 0,
        atualiza() {
            if (fazColisao(flappyBird, globais.chao)) {
                som_HIT.play()

                setTimeout(() => {
                    mudaParaTela(Telas.INICIO)
                }, 500)
                return
            }
            flappyBird.velocidade = flappyBird.velocidade + flappyBird.gravidade
            flappyBird.y = flappyBird.y + flappyBird.velocidade
        },
        movimentos: [
            { spriteX: 0, spriteY: 0, }, //parado
            { spriteX: 0, spriteY: 26, }, //pulando
            { spriteX: 0, spriteY: 52, }, //caindo
        ],
        frameAtual: 0,
        atualizaFrameAtual() {
            const intervaloDeFrames = 10
            const passouIntervalo = frames % intervaloDeFrames === 0
            if (passouIntervalo) {
                const baseDoIncremento = 1
                const incremento = baseDoIncremento + flappyBird.frameAtual
                flappyBird.frameAtual = incremento % flappyBird.movimentos.length
            }
        },
        desenha() {
            flappyBird.atualizaFrameAtual()
            const { spriteX, spriteY } = flappyBird.movimentos[flappyBird.frameAtual]
            contexto.drawImage(
                sprites,
                spriteX, spriteY, // Sprite X, Sprite Y
                flappyBird.largura, flappyBird.altura, // Tamanho do Sprite
                flappyBird.x, flappyBird.y, // Posição do Sprite no Canvas
                flappyBird.largura, flappyBird.altura, // Tamanho do Sprite no Canvas
            )
    
            contexto.drawImage(
                sprites, 
                globais.chao.spriteX, globais.chao.spriteY, 
                globais.chao.largura, globais.chao.altura, 
                (globais.chao.x + globais.chao.largura), globais.chao.y, 
                globais.chao.largura, globais.chao.altura
            )
        }
    }
    return flappyBird
}

const mensagemGetReady = {
    spriteX: 134,
    spriteY: 0,
    largura: 174,
    altura: 152,
    x: (canvas.width / 2) - 174 / 2,
    y: 50,
    desenha() {
        contexto.drawImage(
            sprites,
            mensagemGetReady.spriteX, mensagemGetReady.spriteY,
            mensagemGetReady.largura, mensagemGetReady.altura,
            mensagemGetReady.x, mensagemGetReady.y,
            mensagemGetReady.largura, mensagemGetReady.altura
        )
    }
}

// [telas]
const globais = {}
let telaAtiva = {}

function fazColisao(flappyBird, chao) {
    const flappyBirdY = flappyBird.y + flappyBird.altura
    const chaoY = chao.y
    if (flappyBirdY >= chaoY) {
        return true
    }
    return false
}

function mudaParaTela(novaTela) {
    telaAtiva = novaTela

    if (telaAtiva.inicializa) {
        telaAtiva.inicializa()
    }
}

const Telas = {
    INICIO: {
        inicializa() {
            globais.flappyBird = criaFlappyBird()
            globais.chao = criaChao()
        },
        desenha() {
            planoDeFundo.desenha()
            globais.chao.desenha()
            globais.flappyBird.desenha()
            mensagemGetReady.desenha();
        },
        click() {
            mudaParaTela(Telas.JOGO)
        },
        atualiza() {
            globais.chao.atualiza()
        }
    }
}

Telas.JOGO = {
    desenha() {
        planoDeFundo.desenha()
        globais.chao.desenha()
        globais.flappyBird.desenha()
    },
    click() {
        globais.flappyBird.pula()
    },
    atualiza() {
        globais.flappyBird.atualiza()
        globais.chao.atualiza()
    }
}

function loop() {
    telaAtiva.desenha()
    telaAtiva.atualiza()
    frames += 1
    
    requestAnimationFrame(loop)
}

window.addEventListener("touchstart", function() {
    if(telaAtiva.click) {
        telaAtiva.click()
    }
})

window.addEventListener("mousedown", function() {
    if(telaAtiva.click) {
        telaAtiva.click()
    }
})

mudaParaTela(Telas.INICIO)
loop()