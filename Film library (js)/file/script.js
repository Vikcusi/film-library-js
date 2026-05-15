const validator = new JustValidate('#film-form');
validator.addField('#title', [
    {
        rule: 'required',
        errorMessage: 'Введите название фильма',
    },
]);

validator.addField('#genre', [
    {
        rule: 'required',
        errorMessage: 'Введите жанр фильма',
    },
]);

validator.addField('#releaseYear', [
    {
        rule: 'required',
        errorMessage: 'Введите год',
    },
    {
        rule: 'minLength',
        value: 3,
    },
    {
        rule: 'maxLength',
        value: 4,
    },
])

let currentEditIndex = null;
const filmForm = document.querySelector('#film-form');
const btnSubmit = document.querySelector('.submit');

let btnRepeal = null;

function handelFormSubmit(e) {

    const title = document.getElementById('title').value;
    const genre = document.getElementById('genre').value;
    const releaseYear = document.getElementById('releaseYear').value;
    const isWatched = document.getElementById('isWatched').checked;

    let films = JSON.parse(localStorage.getItem('films')) || [];

    const film = {
        title,
        genre,
        releaseYear,
        isWatched,
    };

    if (currentEditIndex !== null) {
        films[currentEditIndex] = film;
        currentEditIndex = null;
        btnSubmit.textContent = "Добавить";
        if (btnRepeal) {
            btnRepeal.remove();
            btnRepeal = null;
        }
    } else {
        if (!title.trim() || !genre.trim() || !releaseYear.trim()) {
            return;
        }
        films.push(film);
    }

    localStorage.setItem('films', JSON.stringify(films));

    tableRender();
    e.target.reset();
}

validator.onSuccess((event) => {
    event.preventDefault();
    handelFormSubmit(event);
});

function tableRender() {
    const films = JSON.parse(localStorage.getItem('films')) || [];

    const filmTableBody = document.getElementById('film-tbody');
    filmTableBody.innerHTML = '';

    films.forEach((film, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${film.title}</td>
            <td>${film.genre}</td>
            <td>${film.releaseYear}</td>
            <td>${film.isWatched ? "Да" : "Нет"}</td>
            <td>
                <button class="btn-edit" data-index="${index}">Редактировать</button>
                <button class="btn-remove" data-index="${index}">Удалить</button>
            </td>
            
        `;

        filmTableBody.appendChild(row);
    })

    const btnEdit = document.querySelectorAll('.btn-edit');

    btnEdit.forEach(button => {
        button.onclick = function () {
            const index = +this.dataset.index;
            const films = JSON.parse(localStorage.getItem('films')) || [];
            const film = films[index];
            if (!film) return;

            currentEditIndex = index;
            filmForm['title'].value = film.title;
            filmForm['genre'].value = film.genre;
            filmForm['releaseYear'].value = film.releaseYear;
            filmForm['isWatched'].checked = film.isWatched;

            btnSubmit.textContent = "Редактировать";

            if (!btnRepeal) {
                btnRepeal = document.createElement('button');
                btnRepeal.type = 'button';
                btnRepeal.textContent = "Отменить редактирование";
                filmForm.appendChild(btnRepeal);

                btnRepeal.onclick = () => {
                    currentEditIndex = null;
                    filmForm.reset();
                    btnSubmit.textContent = "Добавить";
                    btnRepeal.remove();
                    btnRepeal = null;
                }
            }
        }
    });

    const btnRemove = document.querySelectorAll('.btn-remove');

    btnRemove.forEach(button => {
        button.addEventListener('click', function () {
            const indexToRemove = this.getAttribute('data-index');
            removeFilm(indexToRemove);
        })
    })
}

function removeFilm(index) {
    const films = JSON.parse(localStorage.getItem('films')) || [];
    films.splice(index, 1);
    localStorage.setItem('films', JSON.stringify(films));
    tableRender();
}

filmForm.addEventListener('submit', handelFormSubmit());

tableRender();

const btnSort = document.querySelector('.btn-sort');
const selectSort = document.getElementById('sorting-condition');;

btnSort.addEventListener('click', () => {
    let films = JSON.parse(localStorage.getItem('films')) || [];
    const field = selectSort.value;

    films.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];

        if (field === 'releaseYear') {
            valA = Number(valA);
            valB = Number(valB);
            return valA - valB;
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
            if (valA < valB) return -1;
            if (valA > valB) return 1;
            return 0;
        }

        return 0;
    });

    localStorage.setItem('films', JSON.stringify(films));
    tableRender();
});
