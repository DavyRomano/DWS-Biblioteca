const formulario = document.querySelector("#form-livro");
const lista = document.querySelector("#lista-livros");
const mensagem = document.querySelector("#mensagem");
const contador = document.querySelector("#contador");
const estadoVazio = document.querySelector("#estado-vazio");

async function listarLivros() {
    try {
        const resposta = await fetch("/livros");
        if (!resposta.ok) {
            throw new Error("Erro ao carregar os livros.");
        }

        const livros = await resposta.json();
        lista.textContent = "";
        contador.textContent = livros.length;
        estadoVazio.style.display = livros.length === 0 ? "block" : "none";

        livros.forEach(function(livro) {
            const item = document.createElement("div");
            item.className = "livro";

            const titulo = document.createElement("h3");
            titulo.textContent = livro.titulo;

            const dados = document.createElement("p");
            dados.textContent = livro.autor + " - " + livro.ano_publicacao;

            item.appendChild(titulo);
            item.appendChild(dados);
            lista.appendChild(item);
        });
    } catch (erro) {
        mensagem.textContent = "Não foi possível carregar os livros.";
    }
}

formulario.addEventListener("submit", async function(evento) {
    evento.preventDefault();

    const dados = {
        titulo: document.querySelector("#titulo").value.trim(),
        autor: document.querySelector("#autor").value.trim(),
        ano_publicacao: document.querySelector("#ano").value
    };

    try {
        const resposta = await fetch("/livros", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();
        if (!resposta.ok) {
            throw new Error(resultado.erro);
        }

        formulario.reset();
        mensagem.textContent = "Livro cadastrado com sucesso!";
        await listarLivros();
    } catch (erro) {
        mensagem.textContent = erro.message || "Erro ao cadastrar o livro.";
    }
});

document.querySelector("#botao-atualizar").addEventListener("click", listarLivros);
listarLivros();
