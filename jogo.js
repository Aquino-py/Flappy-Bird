const sprites = new Image()
sprites.src = './sprites.png'
const som_HIT = new Audio()
som_HIT.src = './efeitos/efeitos_hit.wav'
const som_PONTO = new Audio()
som_PONTO.src = './efeitos/efeitos_ponto.wav'
const som_PULO = new Audio()
som_PULO.src = './efeitos/efeitos_pulo.wav'
const som_CAIU = new Audio()
som_CAIU.src = './efeitos/efeitos_caiu.wav'

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
                som_CAIU.play()
                
                mudaParaTela(Telas.GAME_OVER)
                
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

function criaCanos() {
    const canos = {
        largura: 52,
        altura: 400,
        chao: {
            spriteX: 0,
            spriteY: 169,
        },
        ceu: {
            spriteX: 52,
            spriteY: 169,
        },
        espaco: 80,
        desenha() {
            canos.pares.forEach(function(par) {
                const yRandom = par.y
                const espacamentoEntreCanos = 90
                // Canos do Ceu
                const canoCeuX = par.x
                const canoCeuY = yRandom
                contexto.drawImage(
                    sprites,
                    canos.ceu.spriteX, canos.ceu.spriteY,
                    canos.largura, canos.altura,
                    canoCeuX, canoCeuY,
                    canos.largura, canos.altura,
                )
    
                // Canos do Chão
                const canoChaoX = par.x
                const canoChaoY = canos.altura + espacamentoEntreCanos + yRandom
                contexto.drawImage(
                    sprites,
                    canos.chao.spriteX, canos.chao.spriteY,
                    canos.largura, canos.altura,
                    canoChaoX, canoChaoY,
                    canos.largura, canos.altura,
                )

                par.canoCeu = {
                    x: canoCeuX,
                    y: canos.altura + canoCeuY,
                }
                par.canoChao = {
                    x: canoChaoX,
                    y: canoChaoY,
                }
            });

        },
        temColisaoComOFlappyBird(par) {
            const cabecaDoFlappy = globais.flappyBird.y
            const peDoFlappy = globais.flappyBird.y + globais.flappyBird.altura

            if(globais.flappyBird.x + globais.flappyBird.largura >= par.x) {
                
                globais.placar.atualiza()
                
                if(cabecaDoFlappy <= par.canoCeu.y) {
                    return true
                }

                if(peDoFlappy >= par.canoChao.y) {
                    return true
                }

            }
                
            return false
        },
        pares: [],
        atualiza() {
            const passou100Frames = frames % 100 === 0
            
            if(passou100Frames) {
                canos.pares.push({
                    x: canvas.width,
                    y: -150 * (Math.random() + 1),
                })
            }


            canos.pares.forEach(function(par) {
                par.x = par.x - 2

                if(canos.temColisaoComOFlappyBird(par)) {
                    som_HIT.play()
                    mudaParaTela(Telas.GAME_OVER)
                }

                if(par.x + canos.largura <= 0) {
                    canos.pares.shift()
                }
            })
        },
    }
    return canos
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

const mensagemGameOver = {
    spriteX: 134,
    spriteY: 153,
    largura: 226,
    altura: 200,
    x: (canvas.width / 2) - 226 / 2,
    y: 50,
    desenha() {
        contexto.drawImage(
            sprites,
            mensagemGameOver.spriteX, mensagemGameOver.spriteY,
            mensagemGameOver.largura, mensagemGameOver.altura,
            mensagemGameOver.x, mensagemGameOver.y,
            mensagemGameOver.largura, mensagemGameOver.altura
        ),
        contexto.font = '30px "VT323"'
        contexto.fillStyle = '#FFF'
        contexto.fillText(`${globais.placar.pontuacao}`, canvas.width - 85, 145)

        if (globais.placar.pontuacao > globais.placar.record) {
            record = globais.placar.pontuacao
            localStorage.setItem('flappyBirdRecord', record)
            globais.placar.record = record
        }

        contexto.font = '30px "VT323"'
        contexto.fillStyle = '#FFF'
        contexto.fillText(`${globais.placar.record}`, canvas.width - 75, 185)

        if (globais.placar.pontuacao < 5) {
            contexto.beginPath()
            contexto.arc(canvas.width - 226, canvas.height - 320, 24, 0, 2 * Math.PI)
            contexto.fillStyle = '#A77044'
            contexto.fill()
        }

        if (globais.placar.pontuacao > 5) {
            contexto.beginPath()
            contexto.arc(canvas.width - 226, canvas.height - 320, 24, 0, 2 * Math.PI)
            contexto.fillStyle = '#A7A7AD'
            contexto.fill()
        }

        if (globais.placar.pontuacao > 15) {
            contexto.beginPath()
            contexto.arc(canvas.width - 226, canvas.height - 320, 24, 0, 2 * Math.PI)
            contexto.fillStyle = '#FEE101'
            contexto.fill()
        }
    }
}

function criaPlacar() {
    const placar = {
        pontuacao: 0,
        record: localStorage.getItem('flappyBirdRecord') || 0,

        desenha() {
            contexto.font = '35px "VT323"'
            contexto.textAlign = 'right'
            contexto.fillStyle = '#FFF'
            contexto.fillText(`${placar.pontuacao}`, canvas.width - 14, 35)
            placar.pontuacao
        },
        atualiza() {
            const intervaloDeFrames = 45
            const passouIntervalo = frames % intervaloDeFrames === 0
            
            if(passouIntervalo) {
                som_PONTO.play()
                placar.pontuacao++
            }
        }
    }

    return placar
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
            globais.canos = criaCanos()
            globais.chao = criaChao()
        },
        desenha() {
            planoDeFundo.desenha()
            globais.flappyBird.desenha()
            globais.chao.desenha()
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
    inicializa() {
        globais.placar = criaPlacar()
    },
    desenha() {
        planoDeFundo.desenha()
        globais.canos.desenha()
        globais.chao.desenha()
        globais.flappyBird.desenha()
        globais.placar.desenha()
    },
    click() {
        globais.flappyBird.pula()
        som_PULO.play()
    },
    atualiza() {
        globais.canos.atualiza()
        globais.chao.atualiza()
        globais.flappyBird.atualiza()
    }
}

Telas.GAME_OVER = {
    desenha() {
        mensagemGameOver.desenha()
    },
    atualiza() {

    },
    click() {
        mudaParaTela(Telas.INICIO)
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