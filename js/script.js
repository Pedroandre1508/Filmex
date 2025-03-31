document.querySelector('.botao').addEventListener('click', async () => {
    const title = document.getElementById('title').value;
    const year = document.getElementById('year').value;

    if (!title || !year) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:3001/movie?title=${title}&year=${year}`);
        
        if (!response.ok) {
            throw new Error('Erro na resposta da requisição');
        }

        const data = await response.json();

        const capitalizeFirstLetter = (string) => {
            return string.charAt(0).toUpperCase() + string.slice(1);
        };

        const tituloFormatado = capitalizeFirstLetter(data.titulo);

        document.body.classList.add('solid-background');
         document.querySelector('.cabecalho').classList.add('topo');
         document.querySelector('.cabecalhoTitulo').classList.add('tamanhoTitulo');
        document.querySelector('.cabecalhoPesquisa').style.display = 'none';
        

        document.querySelector('.resultadoPesquisa').innerHTML = `
            <div class="card">
                <img src="${data.posterUrl}" alt="Poster do filme" class="card-img">
                <div class="card-content">
                    <h2>${tituloFormatado} (${data.ano})</h2>
                    <p><strong class="sinopse">Sinopse:</strong> ${data.sinopse}</p>
                    <p><strong class="reviews">Reviews:</strong></p>
                    <ul>
                        ${data.reviews.map(review => `<li>${review}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Erro ao buscar filme:', error);
        alert('Erro ao buscar dados do filme, verifique novamente se foi preenchido corretamente todos os campos');
    }
});

document.getElementById('tituloLink').addEventListener('click', (event) => {
    event.preventDefault(); 
    location.reload();
});

document.getElementById('year').addEventListener('input', (event) => {
    event.target.value = event.target.value.replace(/[^0-9]/g, '').slice(0, 4);
});