const characterContainer = document.getElementById('character-container');
const searchCharByName = document.getElementById('searchCharacter');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');

let response;
let Timeout;
let currentPage = 1;
let isLoading = false;
let currentCharacterList = [];


async function getLocationInfo(locationUrl) {
    try {
        const response = await api.get(locationUrl);
        return response.data.name;
    } catch (error) {
        console.error('Erro ao buscar informações de localização', error);
        return 'Desconhecida';
    }
}

async function getLatestEpisode(episodeUrls) {
    try {
        if (episodeUrls.length === 0) {
            return 'Nenhum episódio conhecido';
        }

        const latestEpisodeUrl = episodeUrls[episodeUrls.length - 1];
        const parts = latestEpisodeUrl.split('/');
        const episodeNumber = parts[parts.length - 1];

        return `Episódio: ${episodeNumber}`;
    } catch (error) {
        console.error('Erro ao buscar informações de episódio', error);
        return 'Desconhecido';
    }
}

async function loadCharacter(page = 1, name = '') {
    try {

        isLoading = true;
        const params = {
            name: name,
            page: page
        };

        response = await api.get('/character', { params });

        prevPageBtn.disabled = true;
        nextPageBtn.disabled = true;

        currentCharacterList = response.data.results;

        characterContainer.innerHTML = '';

        currentCharacterList.forEach(async character => {
            const characterCard = document.createElement('div');
            characterCard.className = 'character-card';

            const characterImage = document.createElement('img');
            characterImage.classList = 'character-image';
            characterImage.src = character.image;

            const characterInfo = document.createElement('div');
            characterInfo.className = 'character-info';

            const characterName = document.createElement('h2');
            characterName.textContent = character.name;

            if (character.status === 'Alive') {
                characterName.classList.add('status-alive');
            } else if (character.status === 'Dead') {
                characterName.classList.add('status-dead');
            } else {
                characterName.classList.add('status-unknown');
            }

            const statusSpan = document.createElement('span');

            statusSpan.innerHTML = `<strong>  Status:</strong> ${character.status} <br>`;

            const locationSpan = document.createElement('span');
            locationSpan.innerHTML = `<strong>  Localização:</strong> ${await getLocationInfo(character.location.url)} <br>`;

            const episodeSpan = document.createElement('span');
            episodeSpan.innerHTML = `<strong>   Último Episódio:</strong> ${await getLatestEpisode(character.episode)}`;

            characterInfo.appendChild(characterName);
            characterInfo.appendChild(statusSpan);
            characterInfo.appendChild(locationSpan);
            characterInfo.appendChild(episodeSpan);

            characterCard.appendChild(characterImage);
            characterCard.appendChild(characterInfo);

            characterContainer.appendChild(characterCard) 
        });

            prevPageBtn.disabled = !response.data.info.prev;
            nextPageBtn.disabled = currentPage === response.data.info.pages;
    } catch (error) {
        console.log('Personagem não encontrado', error);
    } finally {
        isLoading = false;

    }
}

loadCharacter();

searchCharByName.addEventListener('input', () => {
    currentPage = 1;
    loadCharacter(currentPage, searchCharByName.value);

    clearTimeout(searchTimeout);
    Timeout = setTimeout(() => {
        currentPage = 1;
        loadCharacter(currentPage, searchCharByName.value);
    }, 10000);
});


prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1 && !isLoading) {
        setTimeout(() => {
            currentPage--;
        loadCharacter(currentPage); 
    })}
});

nextPageBtn.addEventListener('click', () => {
    if (currentPage < response.data.info.pages && !isLoading) {
        setTimeout(() => {
            currentPage++;
        loadCharacter(currentPage);
    })};
});

