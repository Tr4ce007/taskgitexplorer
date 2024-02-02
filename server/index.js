const express = require('express');
const cors = require('cors');


const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

app.get('/', (req, res) => res.send("Hello"));

let userName = "johnpapa";
let currPage = 1;
let currLimit = 10;


//      To fetch User Profile

app.get('/user/:username', async (req, res) => {
    try {
        console.log(req.url)
        const { username } = req.params;
        userName = username || "johnpapa";
        const response = await fetch(`https://api.github.com/users/${userName}`);
        const data = await response.json();
        return res.send(data);
    } catch (error) {
        console.log(error);
        res.send("Bad Request");
    }
});

//        To fetch User Repos

app.get('/repo', async (req, res) => {
    const { limit, page } = req.query;
    try {
        console.log(req.url)
        if (!page) currPage = 1;
        if (page == 'next') currPage++;
        if (page == 'prev') currPage = (currPage > 1) ? currPage - 1 : 1;
        currLimit = limit || 10;
        if (currLimit < 10) currLimit = 10;

        const response = await fetch(`https://api.github.com/users/${userName}/repos`);
        const data = await response.json();

        const sortedRepositories = data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        const totalPage = Math.ceil(sortedRepositories.length / currLimit);

        const startIndex = (currPage - 1) * currLimit;
        const endIndex = startIndex + currLimit;

        const repositoriesForPage = sortedRepositories.slice(startIndex, endIndex);

        return res.send({ status: 200, data: repositoriesForPage, limit: currLimit, page: totalPage });
    } catch (error) {
        console.log(error);
        res.send("Bad Request");
    }
});

// To fetch User Search Query

app.get('/search/:query', async (req, res) => {
    const { query } = req.params;
    try {
        console.log(req.url)
        const response = await fetch(`https://api.github.com/users/${userName}/repos`);
        const repositories = await response.json();
        
        let term = (query || '').toLowerCase();
        const filteredRepositories = repositories.filter(repo =>
            (repo.description && repo.description.toLowerCase().includes(term)) ||
            (repo.name && repo.name.toLowerCase().includes(term)) ||
            (repo.topics && repo.topics.some(topic => topic.toLowerCase().includes(term)))
        );
        let repos = filteredRepositories.slice(0, currLimit);
        if(repos.length == 0){
            repos = [{
                name:"No Results found.",
                description:"",
                topics:[]
            }]
        }
        res.send({ status: 200, data: repos, limit: currLimit, page: 1 });
    } catch (error) {
        console.log(error);
        res.send("Bad Request");
    }
})


app.listen(PORT || 5000, () => {
    console.log(`server started on : http://localhost:${PORT}`);
})

