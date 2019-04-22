const DATA = load_data('https://cors-anywhere.herokuapp.com/https://api.deezer.com/chart/0/tracks');

function load_data(url){

    return fetch(url)
        .then(response => response.json())
        .then(function (response) {

            const DATA = [];

            response.data.forEach((track, index) => {

                DATA[index] = {
                    'title': track.title,
                    'artist': track.artist.name,
                    'preview': track.preview,
                    'cover_medium': track.album.cover_medium,
                    'cover_small': track.album.cover_small
                }

            });

            return DATA;
        })

}

async function embed_tracks(data_promise) {

    const data = await data_promise;

    data.forEach((track, index) => {

        let song = document.createElement('div');
        song.classList.add('chart__track');
        song.innerHTML = `

            <div class="chart__thumbnail">
                <div class="chart__overlay">
                    <button class="chart__button chart--play" data-track_id="${index}"><i class="fas fa-play"></i></button>
                    <button 
                    class="chart__button chart--pause" data-track_id="${index}">
                        <i class="fas fa-pause"></i>
                    </button>
                </div>
                <img src="${track.cover_medium}" class="chart__cover">
            </div>
            <div class="chart__details">
                <p class="chart__artist">${track.artist}</p>
                <p class="chart__song">${track.title}</p>
            </div>

        `

        document.querySelector('#chart').appendChild(song);
    });
}

document.getElementById('chart').addEventListener('click', async function(e) {

    const data = await DATA;

    if (e.target && e.target.classList.contains('chart--play')) {

        let id = e.target.getAttribute('data-track_id');
        let source = data[id].preview;
        let audio = document.getElementById('current__track');
        let pause = document.querySelector(`.chart--pause[data-track_id = \'${id}\']`);
        
        if (audio.dataset.track_id != id) {
            change_track(audio, id);         
        } else {
            audio.play();
        }

    } else if (e.target && e.target.classList.contains('chart--pause')) {

        let id = e.target.getAttribute('data-track_id');
        let audio = document.getElementById('current__track');
        let play = document.querySelector(`.chart--play[data-track_id = \'${id}\']`);
        
        audio.pause(); 
        e.target.style.display = 'none';
        play.style.display = 'inline-block';
        
    }

});

async function change_track(audio, index_changed, play = true) {

    const data = await DATA;
    audio.dataset.track_id = index_changed;
    audio.src = data[index_changed].preview;
    if (play) audio.play();

}

async function queue_state(audio) {

    const data = await DATA;
    const back = document.querySelector('.player--back');
    const forward = document.querySelector('.player--forward');
    const track_id = audio.dataset.track_id;
    const fade_color = getComputedStyle(document.documentElement)
    .getPropertyValue('--hover-color');
    const default_color = getComputedStyle(document.documentElement)
    .getPropertyValue('--main-font-color');

    if (track_id == 0) {

        back.classList.add('disabled--button');
        forward.classList.remove('disabled--button');


    } else if (track_id == (data.length - 1)) {
        
        back.classList.remove('disabled--button');
        forward.classList.add('disabled--button');

    } else {

        back.classList.remove('disabled--button');
        forward.classList.remove('disabled--button');

    }

}

document.getElementById('current__track').addEventListener('canplay', async function(e) {

    let data = await DATA;

    queue_state(e.target);
    let id = e.target.getAttribute('data-track_id');
    document.getElementById('player__cover').src = data[id].cover_small;
    document.getElementById('player__artist').innerHTML = data[id].artist;
    document.getElementById('player__title').innerHTML = data[id].title;
    document.getElementById('player').style.display = 'flex';
    document.getElementsByTagName('footer').display = 'block';

});

document.getElementById('current__track').addEventListener('play', e => {

    
    let id = e.target.getAttribute('data-track_id');
    let pause_buttons = document.querySelectorAll(`.chart--pause`);
    let play_buttons = document.querySelectorAll(`.chart--play`);
    let player_play = document.getElementById('player--play');
    let player_pause = document.getElementById('player--pause');

    player_play.style.display = 'none';
    player_pause.style.display = 'inline-block';
    
    play_buttons.forEach(button => {

        if (button.getAttribute('data-track_id') != id) {
            button.style.display = 'inline-block';
        } else {
            button.style.display = 'none';
        }

    });

    pause_buttons.forEach(button => {

        if (button.getAttribute('data-track_id') != id) {
            button.style.display = 'none';
        } else {
            button.style.display = 'inline-block';
        }

    });

});

document.getElementById('current__track').addEventListener('pause', e => {

    let id = e.target.getAttribute('data-track_id');
    let pause_buttons = document.querySelectorAll(`.chart--pause`);
    let play_buttons = document.querySelectorAll(`.chart--play`);
    let player_play = document.getElementById('player--play');
    let player_pause = document.getElementById('player--pause');

    player_play.style.display = 'inline-block';
    player_pause.style.display = 'none';
    
    play_buttons.forEach(button => {

        button.style.display = 'inline-block';

    });

    pause_buttons.forEach(button => {

        button.style.display = 'none';

    });

});

document.getElementById('current__track').addEventListener('timeupdate', e => {

    let current_time = e.target.currentTime;
    let duration = e.target.duration;
    let thumb = document.querySelector('.timeline--thumb');
    let played = document.getElementById('player__played');
    let left = document.getElementById('player__left');

    thumb.style.left = `${(current_time/duration) * 100}%`;
    played.innerHTML = `${Math.floor(current_time/60)}:${Math.floor(current_time%60)}`;
    left.innerHTML  = `${Math.floor((duration - current_time)/60)}:${Math.floor((duration - current_time)%60)}`;

});

document.getElementById('current__track').addEventListener('ended', async function(e) {

    let data = await DATA;
    let id = Number(e.target.getAttribute('data-track_id'));
    let audio = e.target;

    if (id >= 0 && id < data.length - 1) {
        change_track(audio, (id + 1));
    } else {
        change_track(audio, 0, false);
    }

});

document.getElementById('player__buttons').addEventListener('click', async function(e) {

    let data = await DATA;
    let audio = document.getElementById('current__track');
    let playing = !audio.paused;
    let id = Number(audio.getAttribute('data-track_id'));

    if (e.target && e.target.id == 'player--back') {

        if (Number(audio.getAttribute('data-track_id')) != 0) {
            change_track(audio, (id - 1), playing);
        }

    } else if (e.target && e.target.id == 'player--forward') {

        if (Number(audio.getAttribute('data-track_id')) != (data.length - 1)) {
            change_track(audio, (id + 1), playing);
        }

    } else if (e.target && e.target.id == 'player--play') {

        audio.play();

    } else if (e.target && e.target.id == 'player--pause') {

        audio.pause();

    }
});

embed_tracks(DATA);