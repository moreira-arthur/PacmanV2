// definindo a area de jogo
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('scoreEl');
const resultado = document.getElementById('Result');


// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;

// classe limite: define as bordas do mapa;

class Limite{
    static width = 40;
    static height = 40;
    constructor({position, image}){
        this.position = position;
        this.width = 40;
        this.height = 40;
        this.image = image;
    }

    draw() {
        // ctx.fillStyle = 'blue';
        // ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        ctx.drawImage(this.image,this.position.x, this.position.y)
    }
}
// classe que define o pacman
class Jogador {
    constructor({position,velocity}){
        this.position = position;
        this.velocity = velocity;
        this.radius = 15;
        this.radians = 0.75; 
        this.openRate = 0.12;
        this.rotate = 0;
    }
    
    drawp(){
        ctx.save();
        ctx.translate(this.position.x, this.position.y)
        ctx.rotate(this.rotate);
        ctx.translate(-this.position.x, -this.position.y)
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, this.radians , Math.PI*2 - this.radians);
        ctx.lineTo(this.position.x, this.position.y);
        ctx.fillStyle = 'yellow';
        ctx.fill();
        ctx.closePath()
        ctx.restore();
    }
    update(){
        this.drawp();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if( this.radians < 0 || this.radians > .75) this.openRate = -this.openRate;
        this.radians += this.openRate;
}
}

class Bolinha {
    constructor({position}){
        this.position = position;
        this.radius = 3;
    }

    draw(){
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI*2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();
    }
}

class Fantasma {
    static speed = 2;
    constructor({position,velocity, color = 'red' }){
        this.position = position;
        this.velocity = velocity;
        this.radius = 15;
        this.color = color;
        this.colisoesprevias = [];
        this.speed = 2;
        this.assutado = false;
    }
    
    drawg(){
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI*2);
        ctx.fillStyle = this.assutado ? 'blue' : this.color;
        ctx.fill();
        ctx.closePath();
    }
    update(){
        this.drawg();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class PowerUp {
    constructor({position}){
        this.position = position;
        this.radius = 10;
    }

    draw(){
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI*2);
        ctx.fillStyle = 'green';
        ctx.fill();
        ctx.closePath();
    }
}
const bolinhas = [];
const limites = [];
const powerUps = [];
//fazer função criar fantasma
const fantasmas = [
    new Fantasma({
        position:{
            x:Limite.width*6 + Limite.width/2,
            y:Limite.height + Limite.height/2
        },
        velocity: {
            x: Fantasma.speed,
            y:0
        }
    }),
    new Fantasma({
        position:{
            x:Limite.width*6 + Limite.width/2,
            y:Limite.height*3 + Limite.height/2
        },
        velocity: {
            x: Fantasma.speed,
            y:0
        },
        color:'purple'
    }),
    new Fantasma({
        position:{
            x:Limite.width*6 + Limite.width/2,
            y:Limite.height*9 + Limite.height/2
        },
        velocity: {
            x: Fantasma.speed,
            y:0
        },
        color:'white'
    })
];
const player = new Jogador ({
    position: { 
        x:Limite.width + Limite.width/2,
        y:Limite.height + Limite.height/2
    },
    velocity:{
        x:0,
        y:0
    }
})
const keys = {
    w: { 
        pressed: false
    },
    a: { 
        pressed: false
    },
    s: { 
        pressed: false
    },
    d: { 
        pressed: false
    }
}
let lastkey = '';
let score = 0;
// desenhando o mapa por meio de uma matriz
const mapa = [
    ['c1', '-', '-', '-', '-', '-', '-', '-', '-', '-', 'c2'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['|', '.', 'blk', '.', '[', '7', ']', '.', 'blk', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'blk', '.', '[', '+', ']', '.', 'blk', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'blk', '.', '[', '5', ']', '.', 'blk', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '|'],
    ['c4', '-', '-', '-', '-', '-', '-', '-', '-', '-', 'c3']
];

function criarImagem(src){
    const image = new Image();
    image.src = src;
    return image;
}

// Criando o mapa através de um loop
mapa.forEach((row,i) =>{
    row.forEach((simbolo,j) =>{
        switch(simbolo){
            case '-':
                limites.push(new Limite({
                    position:{x:Limite.width * j, y: Limite.height * i},
                    image:criarImagem('./img/pipeHorizontal.png')
                }))
                break;
            case '|':
                limites.push(new Limite({
                    position:{x:Limite.width * j, y: Limite.height * i},
                    image: criarImagem('./img/pipeVertical.png')
                }))
                break;
            case 'c1':
                limites.push(new Limite({
                    position:{x:Limite.width * j, y: Limite.height * i},
                    image: criarImagem('./img/pipeCorner1.png')
                }))
                break;
            case 'c2':
                limites.push(new Limite({
                    position:{x:Limite.width * j, y: Limite.height * i},
                    image: criarImagem('./img/pipeCorner2.png')
                }))
                break;
            case 'c3':
                limites.push(new Limite({
                    position:{x:Limite.width * j, y: Limite.height * i},
                    image: criarImagem('./img/pipeCorner3.png')
                }))
                break;
            case 'c4':
                limites.push(new Limite({
                    position:{x:Limite.width * j, y: Limite.height * i},
                    image: criarImagem('./img/pipeCorner4.png')
                }))
                break;
            case 'blk':
                limites.push(new Limite({
                    position:{x:Limite.width * j, y: Limite.height * i},
                    image: criarImagem('./img/block.png')
                }))
                break;
            case '[':
                limites.push(new Limite({
                    position: {x: j * Limite.width, y: i * Limite.height},
                    image: criarImagem('./img/capLeft.png')
                }))
                break;
            case ']':
                limites.push(new Limite({
                    position:{x: j * Limite.width, y: i * Limite.height},
                    image: criarImagem('./img/capRight.png')
                }))
                break;
            case '_':
                limites.push(new Limite({
                    position: {x: j * Limite.width,y: i * Limite.height},
                    image: criarImagem('./img/capBottom.png')
                }))
                break;
            case '^':
                limites.push(new Limite({
                    position: {x: j * Limite.width,y: i * Limite.height},
                    image: criarImagem('./img/capTop.png')
                }))
                break;
            case '+':
                limites.push(new Limite({
                    position: {x: j * Limite.width,y: i * Limite.height},
                    image: criarImagem('./img/pipeCross.png')
                }))
                break;
            case '5':
                limites.push(new Limite({
                    position: {x: j * Limite.width,y: i * Limite.height},
                    color: 'blue',
                    image: criarImagem('./img/pipeConnectorTop.png')
                }))
                break;
            case '6':
                limites.push(new Limite({
                    position: {x: j * Limite.width,y: i * Limite.height},
                    color: 'blue',
                    image: criarImagem('./img/pipeConnectorRight.png')
                    }))
                break;
            case '7':
                limites.push(new Limite({
                    position: {x: j * Limite.width,y: i * Limite.height},
                    color: 'blue',
                    image: criarImagem('./img/pipeConnectorBottom.png')
                }))
                break;
            case '8':
                limites.push(new Limite({
                    position: {x: j * Limite.width,y: i * Limite.height},
                    image: criarImagem('./img/pipeConnectorLeft.png')
                }))
                break;
            case '.':
                bolinhas.push(new Bolinha({
                    position: {
                        x: j * Limite.width + Limite.width / 2,
                        y: i * Limite.height + Limite.height / 2
                        }
                    }))
                break;
            case 'p':
                powerUps.push(new PowerUp({
                    position: {
                        x: j * Limite.width + Limite.width / 2,
                        y: i * Limite.height + Limite.height / 2
                        }
                    }))
                break;
        }
    })
})
function circleCollidesWithRectangle({circle,rectangle}){
    const padding = Limite.width/ 2 - circle.radius - 1 ;

    return(
        circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height + padding && circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y - padding && circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x - padding && circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width + padding
        )
}
let animacaoId;
// funcao que fica em looping infito fazendo com que o player se mova
function animacao(){
    animacaoId = requestAnimationFrame(animacao);
    // console.log(animacaoId);
    ctx.clearRect(0,0,canvas.width, canvas.height)
 // fazendo com que o player se movimente suavemente, e com colisão aos limites
    if (keys.w.pressed && lastkey === 'w'){
        for(let i = 0; i <limites.length; i++){
            const limite = limites[i];
            if(circleCollidesWithRectangle({
                circle: {...player,velocity:{
                    x: 0,
                    y: -5
                }},
                rectangle: limite
            })){
                player.velocity.y = 0;
                break;
            }else{
                player.velocity.y = -5;
            }
        }
    } else if (keys.a.pressed && lastkey === 'a'){
        for(let i = 0; i <limites.length; i++){
            const limite = limites[i];
            if(circleCollidesWithRectangle({
                circle: {...player,velocity:{
                    x: -5,
                    y: 0
                }},
                rectangle: limite
            })){
                player.velocity.x = 0;
                break;
            }else{
                player.velocity.x = -5;
            }
        }
    } else if (keys.s.pressed && lastkey === 's'){
        for(let i = 0; i <limites.length; i++){
            const limite = limites[i];
            if(circleCollidesWithRectangle({
                circle: {...player,velocity:{
                    x: 0,
                    y: 5
                }},
                rectangle: limite
            })){
                player.velocity.y = 0;
                break;
            }else{
                player.velocity.y = 5;
            }
        }
    } else if (keys.d.pressed && lastkey === 'd'){
        for(let i = 0; i <limites.length; i++){
            const limite = limites[i];
            if(circleCollidesWithRectangle({
                circle: {...player,velocity:{
                    x: 5,
                    y: 0
                }},
                rectangle: limite
            })){
                player.velocity.x = 0;
                break;
            }else{
                player.velocity.x = 5;
            }
        }
    }
    //detecta colisao entre fantasmas e o player
    for(let i = fantasmas.length - 1; i >= 0; i--){
        const fantasma = fantasmas[i];
            // faz com que o jogo se encerre ao perder
            if(Math.hypot(fantasma.position.x - player.position.x, fantasma.position.y - player.position.y) < fantasma.radius + player.radius){
                if(fantasma.assutado){
                    fantasmas.splice(i, 1);
                }else{
                    cancelAnimationFrame(animacaoId);
                    console.log("You Lose")
                    resultado.innerHTML = "Você PERDEU, mais sorte na próxima vez =D !";
                    resultado.style.color = 'red';
                }

            }
        }

    // condicao de ganhar fica aqui
    if(bolinhas.length ===  1){
        resultado.innerHTML = "Você Ganhou, PARABÉNS !!";
        resultado.style.color = 'green'; 
        console.log('You win');
        cancelAnimationFrame(animacaoId);
        
    }
    // Criação dos PowerUps
    for(let i = powerUps.length - 1; i >= 0; i--){
        const powerUp = powerUps[i];
        powerUp.draw();
        // player coleta o powerup
        if(Math.hypot(powerUp.position.x - player.position.x, powerUp.position.y - player.position.y) < powerUp.radius + player.radius){
             powerUps.splice(i, 1); // retira a powerUp ao passar em cima
            
             //fazer os fantasmas ficarem assustados
            fantasmas.forEach(fantasma => {
                fantasma.assutado = true;
                console.log(fantasma.assutado);

                setTimeout(()=>{
                    fantasma.assutado = false;
                    console.log(fantasma.assutado);
                },5000)
            })
        }
    }
    //toca as bolinhas aqui
    for(let i = bolinhas.length - 1; i > 0; i--){
        const bolinha = bolinhas[i];
        bolinha.draw();

        if(Math.hypot(bolinha.position.x - player.position.x, bolinha.position.y - player.position.y) < bolinha.radius + player.radius){
            // console.log("Tocando");
            bolinhas.splice(i, 1); // retira a bolinha ao passar em cima
            console.log(bolinhas.length)
            score = score + 10;
            scoreEl.innerHTML = score;
        }
    }

    limites.forEach((limite) => {
        limite.draw()
        // detecta a colisão do player com o limite
        if(circleCollidesWithRectangle({
            circle: player,
            rectangle: limite
        })
        ){
            // console.log('oi')
            player.velocity.y=0;
            player.velocity.x=0;

        }

    })
    player.update();
    // player.velocity.y=0;
    // player.velocity.x=0;

    fantasmas.forEach(fantasma => {
        fantasma.update()

        const colisoes = [];
        limites.forEach(limite =>{
            if( !colisoes.includes('right') && circleCollidesWithRectangle({
                circle: {...fantasma,velocity:{
                    x: fantasma.speed,
                    y: 0
                    }
                },
                rectangle: limite
            })
            ){
                colisoes.push('right')
            }
            if( !colisoes.includes('left') && circleCollidesWithRectangle({
                circle: {...fantasma,
                    velocity:{
                    x: -fantasma.speed,
                    y: 0
                    }
                },
                rectangle: limite
            })
            ){
                colisoes.push('left')
            }
            if( !colisoes.includes('up') && circleCollidesWithRectangle({
                circle: {...fantasma,
                    velocity:{
                    x: 0,
                    y: -fantasma.speed
                    }
                },
                rectangle: limite
            })
            ){
                colisoes.push('up')
            }
            if( !colisoes.includes('down') && circleCollidesWithRectangle({
                circle: {...fantasma,
                    velocity:{
                    x: 0,
                    y: fantasma.speed
                    }
                },
                rectangle: limite
            })
            ){
                colisoes.push('down')
            }
        })
        if(colisoes.length > fantasma.colisoesprevias.length){
            fantasma.colisoesprevias = colisoes 
        }
        if(JSON.stringify(colisoes) !== JSON.stringify(fantasma.colisoesprevias)){
            // console.log('gogo');

                if (fantasma.velocity.x > 0 ){
                    fantasma.colisoesprevias.push('right')
                }else if (fantasma.velocity.x < 0 ){
                    fantasma.colisoesprevias.push('left')
                }else if (fantasma.velocity.y < 0 ){
                    fantasma.colisoesprevias.push('up')
                }else if (fantasma.velocity.y > 0 ){
                    fantasma.colisoesprevias.push('down')
                }

                const caminhos = fantasma.colisoesprevias.filter((colisao) => {
                    return !colisoes.includes(colisao);
            })
            // console.log({caminhos})
    
            
            const direcao = caminhos[Math.floor(Math.random() *  caminhos.length)];
            // com base no registro de colisoes direciona o fantasma para se movimentar
            // console.log({direcao});

            switch(direcao){
                case 'down':
                    fantasma.velocity.y = fantasma.speed;
                    fantasma.velocity.x = 0;
                    break;

                case 'up':
                    fantasma.velocity.y = -fantasma.speed;
                    fantasma.velocity.x = 0;
                    break;

                case 'right':
                    fantasma.velocity.y = 0;
                    fantasma.velocity.x = fantasma.speed;
                    break;

                case 'left':
                    fantasma.velocity.y = 0;
                    fantasma.velocity.x = -fantasma.speed;
                    break;
            }
            // reseta o registro de colisoes
            fantasma.colisoesprevias = [];
        }
        // console.log(colisoes)
    })
    if(player.velocity.x > 0) player.rotate = 0;
    else if(player.velocity.x < 0) player.rotate = Math.PI;
    else if(player.velocity.y > 0) player.rotate = Math.PI/2;
    else if(player.velocity.y < 0) player.rotate = Math.PI*1.5;

} // final da animação


animacao()

window.addEventListener('keydown', ({ key }) => {
    switch(key){
        case 'w':
            keys.w.pressed = true;
            lastkey = 'w';
            break;
        case 'a':
            keys.a.pressed = true;
            lastkey = 'a';
            break;
        case 's':
            keys.s.pressed = true;
            lastkey = 's';
            break; 
        case 'd':
            keys.d.pressed = true;
            lastkey = 'd';
            break;                     
    }
})
window.addEventListener('keyup', ({ key }) => {
    switch(key){
        case 'w':
            keys.w.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;
        case 's':
            keys.s.pressed = false;
            break; 
        case 'd':
            keys.d.pressed = false;
            break;                     
    }

})