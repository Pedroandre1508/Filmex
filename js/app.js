const express = require('express');
const axios = require('axios');
const cors = require('cors');
const translate = require('google-translate-api-x');
const app = express();
const port = 3001;

const chaveOMDB = 'ff556849'; 
const chaveTMDB= '25e1069c726071ee8ec665f60a94e64e';

app.use(cors());
app.use(express.json());

app.get('/movie', async (req, res) => {
    let { title, year } = req.query;

    title = title?.trim();
    year = year?.trim();

    if (!title) {
        return res.status(400).json({ error: 'O título do filme é obrigatório.' });
    }

    if (year && (!/^\d{4}$/.test(year) || isNaN(year))) {
        return res.status(400).json({ error: 'O ano deve ser um número de 4 dígitos.' });
    }

    try {
        console.log(`Consultando OMDB para o filme: ${title}, ano: ${year}`);
        const omdbPromise = axios.get(`http://www.omdbapi.com/?t=${title}&y=${year}&apikey=${chaveOMDB}`);
        console.log(`Consultando TMDB para o filme: ${title}, ano: ${year}`);
        const tmdbPromise = axios.get(`https://api.themoviedb.org/3/search/movie?query=${title}&year=${year}&api_key=${chaveTMDB}`);

        const [omdbResponse, tmdbResponse] = await Promise.all([omdbPromise, tmdbPromise]);

        console.log('Resposta OMDB:', omdbResponse.data);
        console.log('Resposta TMDB:', tmdbResponse.data);

        let sinopse = omdbResponse.data.Plot || 'Sinopse não disponível.';
        let reviews = tmdbResponse.data.results.slice(0, 3).map(movie => movie.overview || 'Review não disponível.');
        const posterPath = tmdbResponse.data.results[0]?.poster_path;

        if (!posterPath) {
            console.error('Poster não encontrado.');
            return res.status(404).json({ error: 'Poster não encontrado.' });
        }

        const posterUrl = `https://image.tmdb.org/t/p/w500${posterPath}`;
        console.log('Poster URL:', posterUrl);

        const translatedSinopse = await translate(sinopse, { to: 'pt' });
        const translatedReviews = await Promise.all(reviews.map(review => translate(review, { to: 'pt' })));

        sinopse = translatedSinopse.text;
        reviews = translatedReviews.map(review => review.text);

        const response = {
            titulo: title,
            ano: parseInt(year),
            sinopse,
            reviews,
            posterUrl
        };

        res.json(response);
    } catch (error) {
        console.error('Erro ao buscar dados do filme:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do filme.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});