const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

// Configurações
const rodadas = [1000, 2000, 3000, 4000, 5000];
const perguntas = [
    { pergunta: "Qual é a capital do Brasil?", alternativas: ["Rio de Janeiro", "São Paulo", "Brasília"], resposta: 2 },
    { pergunta: "Quantos dias tem um ano bissexto?", alternativas: ["365", "366", "364"], resposta: 1 },
    { pergunta: "Qual é o maior planeta do sistema solar?", alternativas: ["Terra", "Marte", "Júpiter"], resposta: 2 },
    { pergunta: "Quem pintou a obra 'Mona Lisa'?", alternativas: ["Van Gogh", "Leonardo da Vinci", "Picasso"], resposta: 1 },
    { pergunta: "Qual é o menor país do mundo?", alternativas: ["Mônaco", "Nauru", "Vaticano"], resposta: 2 },
    { pergunta: "Em que ano o Brasil foi descoberto?", alternativas: ["1500", "1499", "1501"], resposta: 0 },
    { pergunta: "Qual é a moeda oficial do Japão?", alternativas: ["Won", "Yuan", "Yen"], resposta: 2 },
    { pergunta: "Quantos continentes existem?", alternativas: ["5", "6", "7"], resposta: 2 },
    { pergunta: "Qual é o rio mais longo do mundo?", alternativas: ["Amazonas", "Nilo", "Mississippi"], resposta: 1 },
    { pergunta: "Quem escreveu 'Dom Casmurro'?", alternativas: ["José de Alencar", "Machado de Assis", "Clarice Lispector"], resposta: 1 },
    { pergunta: "Qual é a fórmula química da água?", alternativas: ["H2O", "CO2", "NaCl"], resposta: 0 },
    { pergunta: "Em que ano terminou a Segunda Guerra Mundial?", alternativas: ["1944", "1945", "1946"], resposta: 1 },
    { pergunta: "Qual é o maior oceano do mundo?", alternativas: ["Atlântico", "Índico", "Pacífico"], resposta: 2 },
    { pergunta: "Quantos estados tem o Brasil?", alternativas: ["25", "26", "27"], resposta: 1 },
    { pergunta: "Quem foi o primeiro presidente do Brasil?", alternativas: ["Getúlio Vargas", "Juscelino Kubitschek", "Deodoro da Fonseca"], resposta: 2 },
    { pergunta: "Qual elemento químico tem símbolo 'Au'?", alternativas: ["Prata", "Ouro", "Alumínio"], resposta: 1 },
    { pergunta: "Em que cidade está a Torre Eiffel?", alternativas: ["Londres", "Roma", "Paris"], resposta: 2 },
    { pergunta: "Qual é o maior mamífero do mundo?", alternativas: ["Elefante", "Baleia Azul", "Girafa"], resposta: 1 },
    { pergunta: "Quantos minutos tem uma hora?", alternativas: ["50", "60", "70"], resposta: 1 },
    { pergunta: "Qual é a capital da França?", alternativas: ["Londres", "Paris", "Roma"], resposta: 1 }
];

// Variáveis globais
let nome, rodada, usadas, ajudas;

// Utilitários
const ask = (q) => new Promise(resolve => rl.question(q, resolve));
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// Sistema de Ranking
const carregarRanking = () => {
    try { 
        const data = fs.readFileSync('ranking.json', 'utf8');
        return JSON.parse(data);
    } catch { 
        console.log("Criando novo arquivo de ranking...");
        return []; 
    }
};

const salvarRanking = (nome, premio, rodada) => {
    const ranking = carregarRanking();
    const novoJogador = { 
        nome, 
        premio, 
        rodada, 
        data: new Date().toLocaleString('pt-BR').split(',')[0],
        hora: new Date().toLocaleTimeString('pt-BR')
    };
    
    ranking.push(novoJogador);
    ranking.sort((a, b) => b.premio - a.premio || b.rodada - a.rodada);
    
    try {
        fs.writeFileSync('ranking.json', JSON.stringify(ranking.slice(0, 15), null, 2));
        console.log(`\nResultado salvo no ranking!`);
    } catch (err) {
        console.log(`Erro ao salvar ranking: ${err.message}`);
    }
};

const mostrarRanking = () => {
    const ranking = carregarRanking();
    console.log("\n" + "=".repeat(60));
    console.log("             RANKING DOS MELHORES JOGADORES             ");
    console.log("=".repeat(60));
    
    if (ranking.length === 0) {
        console.log("           Nenhum jogador registrado ainda!");
        console.log("              Seja o primeiro a jogar!");
    } else {
        console.log("POS | NOME              | PRÊMIO    | RODADA | DATA");
        console.log("-".repeat(60));
        
        ranking.forEach((jogador, i) => {
            const pos = `${i + 1}º`.padEnd(3);
            const nome = jogador.nome.padEnd(17);
            const premio = `R$ ${jogador.premio}`.padEnd(9);
            const rodada = `${jogador.rodada}/5`.padEnd(6);
            const data = jogador.data;
            
            console.log(`${pos} | ${nome} | ${premio} | ${rodada} | ${data}`);
        });
        
        console.log("-".repeat(60));
        console.log(`Total de jogadores: ${ranking.length}`);
        if (ranking.length > 0) {
            console.log(`Melhor jogador: ${ranking[0].nome} - R$ ${ranking[0].premio}`);
        }
    }
    console.log("=".repeat(60) + "\n");
};

// Ajudas
const eliminar = (pergunta) => {
    if (ajudas.eliminar) return console.log("Ajuda já usada!"), pergunta;
    ajudas.eliminar = true;
    const incorretas = pergunta.alternativas.map((_, i) => i).filter(i => i !== pergunta.resposta);
    const remover = shuffle(incorretas).slice(0, 2);
    console.log("\n=== ELIMINAR DUAS ===\nDuas alternativas removidas!");
    return {
        ...pergunta,
        alternativas: pergunta.alternativas.filter((_, i) => !remover.includes(i)),
        resposta: pergunta.alternativas.map((_, i) => i).filter(i => !remover.includes(i)).indexOf(pergunta.resposta)
    };
};

const plateia = (pergunta) => {
    if (ajudas.plateia) return console.log("Ajuda já usada!");
    ajudas.plateia = true;
    const votos = [0, 0, 0];
    for (let i = 0; i < 100; i++) {
        votos[Math.random() < 0.6 ? pergunta.resposta : Math.floor(Math.random() * 3)]++;
    }
    console.log("\n=== PLATEIA ===");
    votos.forEach((v, i) => console.log(`${String.fromCharCode(65 + i)}: ${v}%`));
    console.log("===============\n");
};

const telefone = (pergunta) => {
    if (ajudas.telefone) return console.log("Ajuda já usada!");
    ajudas.telefone = true;
    const amigos = ["João", "Maria", "Pedro", "Ana"];
    const amigo = random(amigos);
    console.log(`\n=== TELEFONE ===\nLigando para ${amigo}...`);
    const resposta = Math.random() < 0.7 ? pergunta.resposta : Math.floor(Math.random() * 3);
    console.log(`${amigo}: Acho que é ${String.fromCharCode(65 + resposta)}!`);
    console.log("================\n");
};

// Jogo principal
const jogarRodada = async () => {
    console.log(`\n=== RODADA ${rodada + 1} ===`);
    console.log(`Jogador: ${nome} | Prêmio: R$ ${rodadas[rodada]}`);
    console.log(`Ajudas: ${ajudas.eliminar ? 'USADA' : 'DISPONÍVEL'} Eliminar | ${ajudas.plateia ? 'USADA' : 'DISPONÍVEL'} Plateia | ${ajudas.telefone ? 'USADA' : 'DISPONÍVEL'} Telefone`);
    
    let pergunta = random(perguntas.filter((_, i) => !usadas.includes(i)));
    usadas.push(perguntas.indexOf(pergunta));
    
    while (true) {
        console.log(`\n${pergunta.pergunta}`);
        pergunta.alternativas.forEach((alt, i) => console.log(`${String.fromCharCode(65 + i)}) ${alt}`));
        
        const resp = (await ask("\nResposta (A/B/C/PARAR/ELIMINAR/PLATEIA/TELEFONE): ")).toUpperCase();
        
        if (resp === 'PARAR') return 'parou';
        if (resp === 'ELIMINAR') { pergunta = eliminar(pergunta); continue; }
        if (resp === 'PLATEIA') { plateia(pergunta); continue; }
        if (resp === 'TELEFONE') { telefone(pergunta); continue; }
        
        if (['A', 'B', 'C'].includes(resp)) {
            const escolha = resp.charCodeAt(0) - 65;
            if (escolha === pergunta.resposta) {
                console.log("ACERTOU!");
                return 'acertou';
            } else {
                console.log(`ERROU! Resposta: ${String.fromCharCode(65 + pergunta.resposta)}`);
                return 'errou';
            }
        }
        console.log("Opção inválida!");
    }
};

const jogar = async () => {
    console.log("=== SHOW DO MILHÃO ===");
    nome = await ask("Nome: ");
    rodada = 0;
    usadas = [];
    ajudas = { eliminar: false, plateia: false, telefone: false };
    
    while (rodada < 5) {
        const resultado = await jogarRodada();
        
        if (resultado === 'acertou') {
            rodada++;
            if (rodada === 5) {
                console.log("\nPARABÉNS! VOCÊ GANHOU!");
                salvarRanking(nome, rodadas[4], 5);
                break;
            }
            await ask("\nPressione Enter...");
        } else {
            const premio = resultado === 'parou' && rodada > 0 ? rodadas[rodada - 1] : 
                          resultado === 'errou' && rodada > 0 ? rodadas[rodada - 1] : 0;
            console.log(`\nPrêmio final: R$ ${premio}`);
            salvarRanking(nome, premio, rodada + 1);
            break;
        }
    }
    
    const opcao = await ask("\n1-Jogar Novamente  2-Ver Ranking  3-Sair\nEscolha: ");
    if (opcao === '1') await jogar();
    else if (opcao === '2') { mostrarRanking(); await ask("Pressione Enter para continuar..."); await jogar(); }
    else { console.log("\nObrigado por jogar o Show do Milhão!"); rl.close(); }
};

jogar();