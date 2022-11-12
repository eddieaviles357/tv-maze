"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm( term ) {
  let parameters = { params: { q: term } };
  let tvmazeURL = "https://api.tvmaze.com/search/shows/";
  let { data } = await axios.get(tvmazeURL, parameters);
  
  return data.reduce(( show, next ) => {
    let {id, name, summary } = next.show;
    let image = ''; 
    // next.show.image cannot be destructured if null so we handle a default image
    !(next.show.image === null) ?
      image = next.show.image.original :
      image = 'https://store-images.s-microsoft.com/image/apps.65316.13510798887490672.6e1ebb25-96c8-4504-b714-1f7cbca3c5ad.f9514a23-1eb8-4916-a18e-99b1a9817d15?mode=scale&q=90&h=300&w=300';

    return [ ...show, { id, name, summary, image } ];
  }, [] );
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();
  
  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image}
              alt=${show.name}
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);
  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  try {
    await searchForShowAndDisplay();
  } catch (error) {
    throw new Error(error.message)
  }
});

// newly added for episodes
async function searchForEpisodesAndDisplay(episodes) {
  $episodesArea.show();
  populateEpisodes(episodes);
}

// get episodes when button is clicked
$showsList.on('click', async function(e) {
  let target = e.target;
  // only when the button gets clicked
  if(target.tagName === 'BUTTON'){
    let id = $(target).closest(".Show").data("show-id");
    try {
      let episodes = await getEpisodesOfShow(id);
      searchForEpisodesAndDisplay(episodes);
    } catch (error) {
      throw new Error('Could not get Episodes try again');
    }
  }
})


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) { 
  if(typeof id !== 'number') throw new Error('Id is not a number')
  let tvmazeURL = `https://api.tvmaze.com/shows/${id}/episodes`;

  try {
    let {data} = await axios.get(tvmazeURL);
    
    return data.reduce((episodes, next, idx) => {
      let { id, name, season, number } = next;
      let image = '';

      !(next.image === null) ?
      image = next.image.original :
      image = 'https://store-images.s-microsoft.com/image/apps.65316.13510798887490672.6e1ebb25-96c8-4504-b714-1f7cbca3c5ad.f9514a23-1eb8-4916-a18e-99b1a9817d15?mode=scale&q=90&h=300&w=300';

      return [...episodes, { id, name, season, image, number }]
    }, [] );
  } catch (error) {
    throw new Error(error.message);
  };
}

/** Write a clear docstring for this function... */


// populate Episodes
function populateEpisodes(episodes) {
  $episodesArea.empty();
  for (let episode of episodes) {
    const $episode = $(
      `<li data-episode-id="${episode.id}" class="Episode list-group-item">
        <img
           src=${episode.image}
           alt=season ${episode.season}
           class="w-25 me-3">
          <h5 class="text-primary">Season: ${episode.season}</h5>
          <div><small>${episode.name}</small></div>
      </li>
   `);

   

    $episodesArea.append($episode);
  }
}