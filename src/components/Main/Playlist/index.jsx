import { useEffect, useState } from "react";
import magnifyingGlass from '../../../utilities/search_24dp_FILL0_wght400_GRAD0_opsz24.svg';

const listedItemsCreator = (children, keyInfo, currentIndex, customFuc, idKey) => <li key={keyInfo} id={idKey} onClick={() => customFuc(keyInfo, currentIndex)}>{children}</li>;
const paragraphCreator = (children, custKey) => <p key={custKey}>{children}</p>;
const imageCreeator = (source, text, width, height) => <img src={source} alt={text} width={width} height={height} />

export default function Playlist(props) {
    const { playlists } = props;
    const [indexG, setIndexG] = useState(-1);
    const [playlistToSend, setPlaylistToSend] = useState(null);
    const [arrayOfPlaylistsItems, setArrayOfPlaylistsItems] = useState([]);
    const [accessInfo, setAccessInfo] = useState(JSON.parse(localStorage.getItem('accessInfo')));
    const [showSearchPlaylist, setShowSearchPlaylist] = useState('');
    const [itemSearchedFound, setItemSearchedFound] = useState([]);
    const [indexClickedSearched, setIndexClickedSearched] = useState(-1);
    const [searchedPlaylistArray, setSearchedPlaylistArray] = useState([]);

    const referenceFinder = (item, saveItem) => {
        if(arrayOfPlaylistsItems.length !== 0) {
            for(const object of arrayOfPlaylistsItems) {
                if(object.track_href === item) {
                    setItemSearchedFound(prevArray => [...prevArray, object]);
                    setSearchedPlaylistArray(prevArray => [...prevArray, saveItem]);
                }
            }
        }
    };

    const clickHandler = (e, prevIndex) => {
        e !== prevIndex && setIndexG(e);
    };

    const keyUpHandlerFunction = (e) => {
        setShowSearchPlaylist(e.target.value);
        setItemSearchedFound([]);
        setSearchedPlaylistArray([]);
    };

    const sideClickSearchHandler = index => {
        setIndexClickedSearched(index);
    };

    
    
    useEffect(() => {
        if(playlists !== null && accessInfo !== null && arrayOfPlaylistsItems < (playlists.length - 1)) {
            playlists.forEach(item => {
                fetch((item.tracks.href), {
                    method: 'GET',
                    headers: {'Authorization': 'Bearer ' + (accessInfo !== null && accessInfo.access_token)}
                })
                  .then(response => response.json())
                  .then((data) => {
                    setArrayOfPlaylistsItems(prevArray => [...prevArray, {track_href: item.tracks.href, items: data}]);
                  });
            });
        }
    }, []);

    useEffect(() => {
        showSearchPlaylist === '' && setIndexClickedSearched(-1);
    }, [showSearchPlaylist]);

    if(indexG !== -1 && (playlistToSend !== null ? (playlists[indexG].tracks.href !== playlistToSend.tracks.href) : true)) setPlaylistToSend(playlists[indexG]);

    return (
        <>
            <div>
                <p>add, less, edit button icon's div</p>
                
            </div>
            <div>
                <SearchInput keyUpHandler={keyUpHandlerFunction} />
            </div>
            <div>
                <PlaylistSection data={playlists} onclick={clickHandler} currentIndex={indexG} playlistToShow={showSearchPlaylist} sideFunctionHandler={referenceFinder} searchHandler={sideClickSearchHandler} sideIndex={indexClickedSearched} />
                <ShowPlaylistItems playlistToDisplay={playlistToSend} itemsToDisplay={arrayOfPlaylistsItems} indexOfListToDisplay={indexG} searchedIndex={indexClickedSearched} itemsToDisplaySearched={itemSearchedFound} playlistSearchedFoundDiv={searchedPlaylistArray} />
            </div>
        </>
    );
}

export function PlaylistSection(props) {
    const { data, onclick, currentIndex, playlistToShow, sideFunctionHandler, searchHandler, sideIndex } = props;
    const [playlistToShowOnList, setPlaylistToShowOnList] = useState([]);
    const [notFound, setNotFound] = useState(true);
    const [queryArrayList, setQueryArrayList] = useState([]);

    const listedItemsFabric = (array, text, onclickArg, indexToWork) => {
        return array.map((item, index) => {
            let image = imageCreeator(item.images.length === 3 ? item.images[1].url : item.images[0].url, 'playlist image', 150, 150);
            let paragraph = paragraphCreator(item.name);

            let fragment = (
                <>
                    {paragraph}
                    {image}
                </>
            );

            let key = text ? ((Math.floor(Math.random() * 100)) + '_' + (index * (Math.floor(Math.random() * 100))) + '_' + text) : index;
            let idKey = key + '_id'

            let listItemToBeReturned = listedItemsCreator(fragment, key, indexToWork, onclickArg && onclickArg, idKey);

            return listItemToBeReturned;
        });
    };

    const arrayOfListedItems = listedItemsFabric(data, '', onclick, currentIndex);

    useEffect(() => {
        setPlaylistToShowOnList([]);
        let preparer = playlistToShow.toLowerCase();

        for(const object of data) {
            if((preparer === object.name.toLowerCase()) || (object.name.toLowerCase().includes(preparer.toLowerCase()) && preparer !== '')) {
                setNotFound(false);
                setPlaylistToShowOnList(prevArray => [...prevArray, object]);
                sideFunctionHandler(object.tracks.href, object);
            }
        }
    }, [playlistToShow]);

    useEffect(() => {
        if(playlistToShowOnList.length !== 0) {
            setNotFound(false);
        } else if(playlistToShowOnList.length === 0 && playlistToShow !== '') {
            setNotFound(true);
        } else if(playlistToShow === '') {
            setNotFound(true);
        }
    }, [playlistToShowOnList]);
    
    useEffect(() => {

        setQueryArrayList([]);

        if(playlistToShowOnList.length !== 0) {
            let liCreator = listedItemsFabric(playlistToShowOnList, '', searchHandler, sideIndex);
            setQueryArrayList(prevArray => [...prevArray, liCreator]);
        }
    }, [playlistToShowOnList]);

    let fragmentToShow = (
        <ul>
            {queryArrayList.length !== 0 && (queryArrayList.length === 1 ? queryArrayList[0] : queryArrayList.map(item => item))}
        </ul>
    );

    return (
        <>
            {notFound && playlistToShow !== '' ? (
                <>
                    <p>not matches found</p>
                </>
            ) : (
                <>
                    {notFound && playlistToShow === '' ? (
                        <>
                            <ul>
	                            {arrayOfListedItems.map(item => item)}
                            </ul>
                        </>
                    ) : (
                        <>
                            {fragmentToShow}
                        </>
                    )}
                </>
            )}
        </>
    );
}

export function ShowPlaylistItems(props) {
    const { playlistToDisplay, itemsToDisplay, itemsToDisplaySearched, searchedIndex, playlistSearchedFoundDiv } = props;
    const [hasContent, setHasContent] = useState(false);
    const [tracks, setTracks] = useState(null);
    const [arrayOfListedItems, setArrayOfListedItems] = useState(null);
    const [biggerPictureFrame, setBiggerPictureFrame] = useState(null);

    const listedItemsFabric = array => {
        return array.map(item => {
            let image = imageCreeator(item.track.album.images.length === 3 ? item.track.album.images[1].url : item.track.album.images[0].url, 'song image', 100, 100);
            let paragraph = paragraphCreator(item.track.name);
            let author = [];
            
            if(item.track.artists.length === 1) {
                author.push(paragraphCreator(item.track.artists[0].name, (item.track.artists[0].id + '_' + (Math.floor(Math.random() + 100)))));
            } else {
                author.push(item.track.artists.map(artist => paragraphCreator(artist.name, (artist.id + '_' + (Math.floor(Math.random() + 100)) + '_' + (Math.floor(Math.random() + 100))))));
            }

            let fragment = (
                <>
                    {image}
                    {paragraph}
                    {author.map((auth, authorIndex) => <div key={`auth-${item.track.id}-${authorIndex}`}>{auth}</div>)}
                </>
            );

            let listItemToBeReturned = listedItemsCreator(fragment, (item.track.id + '_li_' + (Math.floor(Math.random() * 100)) + '_' + (Math.floor(Math.random() * 100))));
            
            return listItemToBeReturned;
        });
    };

    useEffect(() => {        
        itemsToDisplay.map(item => {
            playlistToDisplay !== null && (playlistToDisplay.tracks.href === item.track_href && (setTracks(item.items)));
        });
    }, [playlistToDisplay]);

    useEffect(() => {
        let itemsToDisplayClicked = null;
        let biggerPicture = null;

        if(searchedIndex !== -1) {
            itemsToDisplayClicked = itemsToDisplaySearched[searchedIndex];
            biggerPicture = playlistSearchedFoundDiv[searchedIndex];
        }


        if(tracks !== null && itemsToDisplayClicked === null) {
            setArrayOfListedItems(listedItemsFabric(tracks.items));
        } else if(itemsToDisplayClicked !== null) {
            setArrayOfListedItems(listedItemsFabric(itemsToDisplayClicked.items.items));
            setTracks(null);
        }

        if(tracks !== null && searchedIndex === -1) {
            setBiggerPictureFrame(
                <>
                    <h2>{playlistToDisplay.name}</h2>
                    <img src={playlistToDisplay.images[0].url} alt='playlist image' width='400px' height='400px' />
                    <a href={playlistToDisplay.external_urls.spotify} target="_blank">Link to spotify playlist</a>
                    <br />
                    <p>Owner: <a href={playlistToDisplay.owner.external_urls.spotify} target="_blank"> {playlistToDisplay.owner.display_name}</a></p>
                </>
            );
        } else if(searchedIndex !== -1 && playlistSearchedFoundDiv.length !== 0 && biggerPicture !== null) {
            setBiggerPictureFrame(
                <>
                    <h2>{biggerPicture.name}</h2>
                    <img src={biggerPicture.images[0].url} alt='playlist image' width='400px' height='400px' />
                    <a href={biggerPicture.external_urls.spotify} target="_blank">Link to spotify playlist</a>
                    <br />
                    <p>Owner: <a href={biggerPicture.owner.external_urls.spotify} target="_blank"> {biggerPicture.owner.display_name}</a></p>
                </>
            );
        }

    }, [searchedIndex, tracks]);

    useEffect(() => {
        if(arrayOfListedItems !== null) {
            if(arrayOfListedItems.length !== 0 && arrayOfListedItems !== null && arrayOfListedItems !== undefined && biggerPictureFrame !== null) {
                setHasContent(true);
            }
        }
    }, [arrayOfListedItems]);

    return (
        <>
            {!hasContent ? (
                <>
                </>
            ) : (
                <>
                    <div>
                        {biggerPictureFrame}
                    </div>
                    <div>
                        {(arrayOfListedItems !== null && Array.isArray(arrayOfListedItems)) && 
                        (
                            <ul>
                                {
                                    Array.isArray(arrayOfListedItems) && arrayOfListedItems.map(item => item)
                                }
                            </ul>
                        )}
                    </div>
                </>
            )}        
        </>
    );

}

export function SearchInput(props) {

    const { keyUpHandler } = props;

    return(
        <>
            <input type="text" placeholder="Search a playlist" onKeyUp={keyUpHandler} />
            <img src={magnifyingGlass}/>
        </>
    );
}