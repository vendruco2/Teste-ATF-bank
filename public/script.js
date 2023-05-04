const KEY_BD = '@usuariosestudo'
const form = document.querySelector('#cadastroRegistro');
const submitBtn = document.getElementById('submit-btn');
var listaRegistros = {
    ultimoIdGerado: 0,
    usuarios: []
}
var FILTRO = ''

function gravarBD() {
    localStorage.setItem(KEY_BD, JSON.stringify(listaRegistros))
}

function lerBD() {
    const data = localStorage.getItem(KEY_BD)
    if (data) {
        listaRegistros = JSON.parse(data)
    }
    desenhar()
}

function pesquisar(value) {
    FILTRO = value;
    desenhar()
}

function desenhar() {
    const tbody = document.getElementById('listaRegistrosBody')
    if (tbody) {
        var data = listaRegistros.usuarios;
        if (FILTRO.trim()) {
            const expReg = eval(`/${FILTRO.trim().replace(/[^\d\w]+/g, '.*')}/i`)
            data = data.filter(usuario => {
                return expReg.test(usuario.email) || expReg.test(usuario.comissao)
            })
        }
        data = data
            .sort((a, b) => {
                return a.email < b.email ? -1 : 1
            })
            .map(usuario => {
                return `<tr>
                        <td>${usuario.id}</td>
                        <td>${usuario.email}</td>
                        <td>${usuario.comissao}</td>
                        <td>
                            <button onclick='vizualizar("cadastro",false,${usuario.id})'>Editar</button>
                            <button class='vermelho' onclick='perguntarSeDeleta(${usuario.id})'>Deletar</button>
                        </td>
                    </tr>`
            })
        tbody.innerHTML = data.join('')
    }
}

function insertUsuario(email, comissao) {
    const id = listaRegistros.ultimoIdGerado + 1;
    // Calcula a soma atual das comissões dos usuários
    const somaComissoes = listaRegistros.usuarios.reduce((total, usuario) => total + parseFloat(usuario.comissao), 0);

    // Verifica se a soma das comissões mais a nova comissão ultrapassa 100
    if (somaComissoes + parseFloat(comissao) > 100) {
        alert('A soma das comissões não pode ultrapassar 100.');
        return;
    }
    listaRegistros.ultimoIdGerado = id;
    listaRegistros.usuarios.push({
        id, email, comissao
    })
    gravarBD()
    desenhar()
    vizualizar('lista')
}

function editUsuario(id, email, comissao) {
    var usuario = listaRegistros.usuarios.find(usuario => usuario.id == id)
    // Calcula a soma atual das comissões dos usuários, excluindo a comissão do usuário sendo editado
    const somaComissoes = listaRegistros.usuarios.filter(u => u.id !== id)
        .reduce((total, usuario) => total + parseFloat(usuario.comissao), 0);

    // Verifica se a soma das comissões mais a nova comissão ultrapassa 100
    if (somaComissoes + parseFloat(comissao) > 100) {
        alert('A soma das comissões não pode ultrapassar 100.');
        return;
    }
    usuario.email = email;
    usuario.comissao = comissao;
    gravarBD()
    desenhar()
    vizualizar('lista')
}

function deleteUsuario(id) {
    listaRegistros.usuarios = listaRegistros.usuarios.filter(usuario => {
        return usuario.id != id
    })
    gravarBD()
    desenhar()
}

function perguntarSeDeleta(id) {
    if (confirm('Quer deletar o registro de id ' + id)) {
        deleteUsuario(id)
    }
}

function limparEdicao() {
    document.getElementById('email').value = ''
    document.getElementById('comissao').value = ''
}

function vizualizar(pagina, novo = false, id = null) {
    document.body.setAttribute('page', pagina)
    if (pagina === 'cadastro') {
        if (novo) limparEdicao()
        if (id) {
            const usuario = listaRegistros.usuarios.find(usuario => usuario.id == id)
            if (usuario) {
                document.getElementById('id').value = usuario.id
                document.getElementById('email').value = usuario.email
                document.getElementById('comissao').value = usuario.comissao
            }
        }
        document.getElementById('email').focus()
    }
}

function submeter(e) {
    e.preventDefault()
    const data = {
        id: document.getElementById('id').value,
        email: document.getElementById('email').value,
        comissao: document.getElementById('comissao').value,

    }
    if (data.id) {
        editUsuario(data.id, data.email, data.comissao)
    } else {
        insertUsuario(data.email, data.comissao)
    }
}

window.addEventListener('load', () => {
    lerBD()
    document.getElementById('cadastroRegistro').addEventListener('submit', submeter)
    document.getElementById('inputPesquisa').addEventListener('keyup', e => {
        pesquisar(e.target.value)
    })
})
function submit(event) {
    event.preventDefault();
}

form.addEventListener('submit', function (event) {
    event.preventDefault(); // evita o comportamento padrão do formulário
    const data = {
        email: document.getElementById('email').value,
        comissao: document.getElementById('comissao').value,
        // colete os dados do formulário aqui
    };
    console.log(JSON.stringify(data))
    fetch('http://localhost:3000/api/registros', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Caso a requisição tenha sido bem-sucedida, limpar os campos e mostrar uma mensagem de sucesso
                form.reset();
                alert('Registro salvo com sucesso!');
            } else {
                // Caso contrário, mostrar uma mensagem de erro com a descrição do erro
                alert('Erro ao salvar o registro: ' + data.error);
            }
        })
        .catch(error => {
            // Mostrar uma mensagem de erro caso ocorra algum erro na requisição
            alert('Erro ao salvar o registro: ' + error.message);
        });
});