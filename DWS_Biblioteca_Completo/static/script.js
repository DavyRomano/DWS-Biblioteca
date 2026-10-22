const formulario = document.querySelector("#form-livro");
const lista = document.querySelector("#lista-livros");
const mensagem = document.querySelector("#mensagem");
const contador = document.querySelector("#contador");
const estadoVazio = document.querySelector("#estado-vazio");
const botaoCadastrar = document.querySelector("#botao-cadastrar");
const botaoAtualizar = document.querySelector("#botao-atualizar");

// A API usa a mesma origem da página Flask.
const urlLivros = "/livros";

function mostrarMensagem(texto, erro = false) {
    mensagem.textContent = texto;
    mensagem.classList.toggle("erro", erro);
}

async function listarLivros() {
    try {
        const resposta = await fetch(urlLivros);

        if (!resposta.ok) {
            throw new Error("Falha ao buscar os livros.");
        }

        const livros = await resposta.json();
        lista.textContent = "";
        contador.textContent = livros.length;
        estadoVazio.classList.toggle("escondido", livros.length > 0);

        livros.forEach(function(livro) {
            const card = document.createElement("article");
            card.className = "livro-card";

            const icone = document.createElement("div");
            icone.className = "livro-icone";
            icone.textContent = "▤";
            icone.setAttribute("aria-hidden", "true");

            const informacoes = document.createElement("div");
            informacoes.className = "livro-info";

            const titulo = document.createElement("h3");
            titulo.textContent = livro.titulo;

            const detalhes = document.createElement("p");
            detalhes.textContent = livro.autor + " · " + (livro.ano_publicacao || "Ano não informado");

            const status = document.createElement("span");
            status.className = livro.disponivel == 1 ? "status" : "status emprestado";
            status.textContent = livro.disponivel == 1 ? "Disponível" : "Emprestado";

            informacoes.appendChild(titulo);
            informacoes.appendChild(detalhes);
            card.appendChild(icone);
            card.appendChild(informacoes);
            card.appendChild(status);
            lista.appendChild(card);
        });
    } catch (erro) {
        mostrarMensagem("Não consegui carregar a lista. Confira se a API está ligada.", true);
    }
}

formulario.addEventListener("submit", async function(evento) {
    evento.preventDefault();

    const dados = {
        titulo: document.querySelector("#titulo").value.trim(),
        autor: document.querySelector("#autor").value.trim(),
        ano_publicacao: Number(document.querySelector("#ano").value)
    };

    botaoCadastrar.disabled = true;
    mostrarMensagem("Cadastrando...");

    try {
        const resposta = await fetch(urlLivros, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || "Não foi possível cadastrar.");
        }

        formulario.reset();
        mostrarMensagem("Livro cadastrado com sucesso!");
        await listarLivros();
    } catch (erro) {
        mostrarMensagem(erro.message || "Erro ao cadastrar. Confira se a API está ligada.", true);
    } finally {
        botaoCadastrar.disabled = false;
    }
});

botaoAtualizar.addEventListener("click", listarLivros);

listarLivros();
