const store = Immutable.Map({
    user: { name: "Student" },
    currentRoverData: "",
    rovers: ['Curiosity', 'Opportunity', 'Spirit']
});

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, rover) => {
    store = store.set('currentRoverData', Immutable.fromJS(rover));
    
    // whenever store has new rover, update photos
    const roverName = store.get('currentRoverData').get('name')
    const roverDate = store.get('currentRoverData').get('max_date')
    fetchAndRenderPhotos(roverName, roverDate);
};

// ------------------------------------------------------  API CALLS
const fetchManifest= (name, store) => {
    fetch(`/rover/${name}`)
        .then(res => res.json())
        .then(rover => {       
            renderStats(Immutable.Map(rover));
            updateStore(store, rover);
        });
};

const renderStats = rover => {
    document.getElementById('stats').innerHTML = `
        <div><span class="key">Status: </span> <span class="val">${rover.get('status')}</span></div>
        <div><span class="key">Launch Date: </span><span class="val">${new Date(rover.get('launch_date')).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})}</span></div>
        <div><span class="key">Landing Date: </span><span class="val">${new Date(rover.get('landing_date')).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})}</span></div>
        `;
};

const fetchAndRenderPhotos = (name, date) => {
    fetch(`/rover/${name}/${date}`)
        .then(res => res.json())
        .then(photos => {
            const photosDiv = document.getElementById('photos')
            renderElement(photosDiv, createPhotos, photos);
        });
}

// HIGHER ORDER FUNCTION 1
// render HTML elements (rendered from an array) onto a parent HTML element
const renderElement = (element, renderFunc, arr) => {
    element.innerHTML = '';
    element.append(...renderFunc(arr));
};

const createPhotos = (photos) => {
    const photoGroups = photos.map(photo => {
        const photoGroup = document.createElement('div');
        const htmlPhoto = document.createElement('img');
        htmlPhoto.src = photo.img_src;
        photoGroup.appendChild(htmlPhoto);
        const photoDate = document.createElement('p');
        const date = new Date(photo.earth_date);
        photoDate.innerText = `Date Taken: ${date.toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})}`
        photoGroup.appendChild(photoDate);
        return photoGroup;
    });
    return photoGroups;
};

async function render(root, store) {
    root.innerHTML = App();
    const navElement = document.getElementsByTagName('nav')[0]
    
    // renderElement is high order function because its second argument is 
    // renderButtons function.
    renderElement(navElement, createButtons, store.get('rovers'));
    
    function buttonClickHandler(button) {
        document.querySelector('.selected').classList.remove('selected');
        button.classList.add('selected');
        fetchManifest(button.innerText, store);
    }

    addRoverListeners(buttonClickHandler);
};

function createButtons(roverNames) {
    const buttons = roverNames.map((name, idx) => {
        const button = document.createElement('button');
        if (idx === 2) {
            button.classList.add('selected');
            fetchManifest(name, store);
        }
        button.innerText = name;
        return button;
    });
    return buttons;
};

// add button listeners to the rovers 
// HIGHER ORDER FUNCTION 2
function addRoverListeners(clickEventHandler) {
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
            clickEventHandler(button);
        });
    });
};

// create content
const App = () => {
    return `<header>
                <h1>Mars Rover Dashboard</h1>
                <p>Click on a Mars Rover name to view its information and photos.</p>
            </header>
            <nav>
            </nav>
            <div id="stats">
            </div>
            <div id="photos">
            </div>
            <footer>Rover Information Taken From <a href="https://www.nasa.gov">NASA</a></footer>`;
};

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store);
});
