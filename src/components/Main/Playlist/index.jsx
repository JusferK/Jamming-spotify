import { useEffect, useState } from "react";

const listedItemsCreator = (children, keyInfo, currentIndex, customFuc) => {
    return <li key={keyInfo} onClick={() => customFuc(keyInfo, currentIndex)}>{children}</li>;
};

const paragraphCreator = (children, custKey) => {
    return <p key={custKey}>{children}</p>;
};

const imageCreeator = (source, text, width, height) => {
    return <img src={source} alt={text} width={width} height={height} />
};

export default function Playlist(props) {
    const { playlists } = props;
    const [indice, setIndice] = useState(-1);

    const clickHandler = (e, prevIndex) => {
        e !== prevIndex && setIndice(e);
    };

    const [playlistToSend, setPlaylistToSend] = useState(null);

    if(indice !== -1 && playlists[indice] !== playlistToSend) setPlaylistToSend(playlists[indice]);

    return (
        <>
            <div>
                <p>add, less, edit button icon's div</p>
            </div>
            <div>
                <input type="text" />
            </div>
            <div>
                <PlaylistSection data={playlists} onclick={clickHandler} currentIndex={indice}/>
                <ShowPlaylistItems playlistToDisplay={playlistToSend} />
            </div>
        </>
    );
}

export function PlaylistSection(props) {

    const { data, onclick, currentIndex } = props;

    const listedItemsFabric = array => {
        return array.map((item, index) => {
            let image = imageCreeator(item.images.length === 3 ? item.images[1].url : item.images[0].url, 'playlist image', 150, 150);
            let paragraph = paragraphCreator(item.name);

            let fragment = (
                <>
                    {paragraph}
                    {image}
                </>
            );

            let listItemToBeReturned = listedItemsCreator(fragment, index, currentIndex, onclick);

            return listItemToBeReturned;
        });
    }

    const arrayOfListedItems = listedItemsFabric(data);

    return (
        <ul>
            {arrayOfListedItems.map(item => item)}
        </ul>
    );
}

export function ShowPlaylistItems(props) {
    const { playlistToDisplay } = props;
    const [hasContent, setHasContent] = useState(false);
    const [accessInfo, setAccessInfo] = useState(JSON.parse(localStorage.getItem('accessInfo')));
    const [tracks, setTracks] = useState(null);
    let arrayOfListedItems;

    const listedItemsFabric = array => {
        return array.map(item => {
            let image = imageCreeator(item.track.album.images.length === 3 ? item.track.album.images[1].url : item.track.album.images[0].url, 'song image', 100, 100);
            let paragraph = paragraphCreator(item.track.name);
            let author = [];
            
            if(item.track.artists.length === 1) {
                author.push(paragraphCreator(item.track.artists[0].name, item.track.artists[0].name));
            } else {
                author.push(item.track.artists.map(artist => paragraphCreator(artist.name, artist.name)));
            }

            let fragment = (
                <>
                    {image}
                    {paragraph}
                    {author.map((auth, authorIndex) => <div key={`${item.track.id}-auth-${authorIndex}`}>{auth}</div>)}
                </>
            );

            let listItemToBeReturned = listedItemsCreator(fragment, item.track.id);
            
            return listItemToBeReturned;
        });
    }

    useEffect(() => {
        playlistToDisplay !== null && setHasContent(true);

        if(playlistToDisplay !== null) {
            fetch((playlistToDisplay.tracks.href + '?limit=100'), {
                method: 'GET',
                headers: {'Authorization': 'Bearer ' + (accessInfo !== null && accessInfo.access_token)}
            })
              .then(response => response.json())
              .then((data) => {
                setTracks(data);
              });
        }
    }, [playlistToDisplay]);

    if(tracks !== null) {
        arrayOfListedItems = listedItemsFabric(tracks.items);
    }

    return (
        <>
            {!hasContent ? (
                <>
                </>
            ) : (
                <>
                    <div>
                        <h2>{playlistToDisplay.name}</h2>
                        <img src={playlistToDisplay.images[0].url} alt='playlist image' width='400px' height='400px' />
                        <a href={playlistToDisplay.external_urls.spotify} target="_blank">Link to spotify playlist</a>
                        <br />
                        <p>Owner <a href={playlistToDisplay.owner.external_urls.spotify} target="_blank"> {playlistToDisplay.owner.display_name}</a></p>
                    </div>
                    <div>

                        {tracks === null ? (
                            'loading'
                        ) : (
                            <ul>
                                {arrayOfListedItems?.map(listedItem => listedItem)}
                            </ul>
                        )}
                    </div>
                </>
            )}
        </>
    );

}