

let currLimit = 10;
let currPage = 1;
let query = '1';


const userName = "johnpapa";
const profileUrl = `http://localhost:5000/user/${userName}`;
const reposUrl = `http://localhost:5000/repo?page=1&limit=10`;



async function getData(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

function toggleLoader() {
    const loader = document.getElementById('loader-container');
    if (loader.style.display == 'none') {
        loader.style.display = 'flex';
    } else {
        loader.style.display = 'none';
    }
}

function createHeader(data) {

    document.getElementById("avatar").src = data.avatar_url;

    const name = document.getElementById('name');
    const h5 = document.createElement("h5");
    const textName = document.createTextNode(`${data.login}`);
    h5.appendChild(textName);
    name.appendChild(h5);

    const gitLink = document.getElementById('github');
    gitLink.appendChild(document.createTextNode(`https://github.com/${data.login}`));
    gitLink.href = `https://github.com/${data.login}`;

    const bio = document.getElementById('bio');
    const p = document.createElement("p");
    const b = (data.bio == null) ? "N/A" : data.bio;
    const textBio = document.createTextNode(b);
    p.appendChild(textBio);
    bio.appendChild(textBio);

    const loc = document.getElementById('loc');
    const l = data.location == null ? "N/A" : data.location;
    const location = document.createTextNode(l);
    loc.appendChild(location);

    const twitter = document.getElementById('twitter');
    const t = data.twitter == null ? "N/A" : data.twitter;
    const twit = document.createTextNode(t);
    twitter.appendChild(twit);

    document.getElementById('mainContainer').style.visibility = 'visible';
}

async function loadProfile(url) {
    const data = await getData(url);
    createHeader(data);
    toggleLoader();
}

loadProfile(profileUrl);
getRepos();

async function getRepos() {
    const response = await getData(reposUrl);
    const data = response.data;
    const page = response.page;
    showRepositories(data, page);
}

async function showRepositories(data, page) {
    toggleLoader();
    const repBox = document.getElementById('gistReposRow');
    repBox.innerHTML = '';
    data.forEach(rep => {
        const repo = makeRepo(rep.name, rep.description, rep.topics);
        repBox.appendChild(repo);
    });

    setPagination(page);

    toggleLoader();
}

const reposPerPageInput = document.getElementById("reposPerPage");
const searchRepo = document.getElementById("searchRepo");

reposPerPageInput.onchange = function () {
    handleLimitChange(reposPerPageInput.value);
};

searchRepo.onchange = function () {
    handleSearch(searchRepo.value);
}



async function handleLimitChange(n) {
    toggleLoader();
    currLimit = (n > 10 && n <= 100) ? n : 10;
    const reposLimitUrl = `http://localhost:5000/repo?page=1&limit=${currLimit}`;
    const data = await getData(reposLimitUrl);
    showRepositories(data.data, data.page);
    toggleLoader();
}

function makeRepo(name, desc, topic) {
    // <div class="col-md-6 mb-3 ">
    //     <div class="row repBox">
    //         <div class="col-sm-12 repName">
    //             <!-- rep name h5  -->
    //         </div>
    //         <div class="col-sm-12 repDesc">
    //             <!-- repo description text Node  -->
    //         </div>
    //         <div class="col-sm-12">
    //             <!-- all divs class col,repTitle and text node  -->
    //         </div>
    //     </div>
    // </div>
    const repoName = document.createTextNode(name);
    const h5 = document.createElement('h5');
    h5.appendChild(repoName);
    const repName = document.createElement('div');
    repName.classList.add('col-sm-12', 'repName');
    repName.appendChild(h5);                        // repo Name done

    const descText = document.createTextNode(desc == null ? "N/A" : desc);
    const description = document.createElement('div');
    description.classList.add('col-sm-12', 'repDesc');
    description.appendChild(descText);                        // repo desc done

    const topics = createTopic(topic);                          // topics done

    const repositoryBox = document.createElement('div');
    repositoryBox.classList.add('row', 'repBox');
    repositoryBox.appendChild(repName);
    repositoryBox.appendChild(description);
    repositoryBox.appendChild(topics);

    const repoMainBox = document.createElement('div');
    repoMainBox.classList.add('col-md-6', 'mb-3');
    repoMainBox.appendChild(repositoryBox);
    return repoMainBox;
}


function createTopic(topic) {
    const topBox = document.createElement('div');
    topBox.classList.add('col-sm-12');

    if (!topic || topic.length == 0) {
        const t = document.createTextNode("N/A");
        const tBox = document.createElement('div');
        tBox.classList.add('col', 'repTitle');
        tBox.appendChild(t);

        topBox.appendChild(tBox);

        return topBox;
    }

    topic.slice(0, 3).forEach((t, index) => {
        const tBox = document.createElement('div');
        tBox.classList.add('col', 'repTitle');

        if (index === 2 && topic.length > 3) {
            tBox.appendChild(document.createTextNode(t + ` +${topic.length - 3}`));
        } else {
            tBox.appendChild(document.createTextNode(t));
        }

        topBox.appendChild(tBox);
    });
    return topBox;
}

function setPagination(n) {
    const ulElement = document.getElementById('ul');
    ulElement.innerHTML = '';

    const newPrev = document.createElement('li');
    newPrev.classList.add('page-item');
    newPrev.id = 'prev';

    const newA = document.createElement('a');
    newA.classList.add('page-link');
    newA.setAttribute('aria-label', 'Previous');

    const newSpan1 = document.createElement('span');
    newSpan1.setAttribute('aria-hidden', 'true');
    newSpan1.textContent = '\xAB'; // Unicode character for 'raquo;'

    newA.appendChild(newSpan1);

    newPrev.appendChild(newA);

    // Append the anchor to the li
    ulElement.appendChild(newPrev);
    document.getElementById('prev').addEventListener('click', handlePrev);

    for (let i = 1; i <= n; i++) {
        const newLi = document.createElement('li');
        newLi.classList.add('page-item');

        // Create a new a element
        const newLink = document.createElement('a');
        newLink.classList.add('page-link');
        newLink.textContent = i;
        newLink.href = "";
        // Append the new link to the new li
        newLi.appendChild(newLink);

        // Insert the new li after the existing li
        ulElement.appendChild(newLi);
    }
    const newNext = document.createElement('li');
    newNext.classList.add('page-item');
    newNext.id = 'next';

    const newAA = document.createElement('a');
    newAA.classList.add('page-link');
    newAA.setAttribute('aria-label', 'Next');

    const newSpan2 = document.createElement('span');
    newSpan2.setAttribute('aria-hidden', 'true');
    newSpan2.textContent = '\xBB'; // Unicode character for 'raquo;'

    newAA.appendChild(newSpan2);

    newNext.appendChild(newAA);

    // Append the anchor to the li
    ulElement.appendChild(newNext);
    document.getElementById('next').addEventListener('click', handleNext);
}


async function handleNext() {
    toggleLoader();
    currPage++;
    const reposLimitUrl = `http://localhost:5000/repo?page=next&limit=${currLimit}`;
    const data = await getData(reposLimitUrl);
    showRepositories(data.data, data.page);
    toggleLoader();
};

async function handlePrev() {
    toggleLoader();
    currPage -= 1;
    const reposLimitUrl = `http://localhost:5000/repo?page=prev&limit=${currLimit}`;
    const data = await getData(reposLimitUrl);
    showRepositories(data.data, data.page);
    toggleLoader();
}


async function handleSearch(search) {
    toggleLoader();
    query=search;
    const searchUrl = `http://localhost:5000/search/${query}`;
    const data = await getData(searchUrl);
    showRepositories(data.data, data.page);
    toggleLoader();
}