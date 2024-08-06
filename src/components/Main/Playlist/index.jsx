import { useEffect, useState, useRef } from "react";
import magnifyingGlass from '../../../utilities/search_24dp_FILL0_wght400_GRAD0_opsz24.svg';
import addIcon from '../../../utilities/add.svg';
import removeIcon from '../../../utilities/remove.svg';
import moreActionsIcon from '../../../utilities/actions.svg';
import orderByIcon from '../../../utilities/order.svg';
import editIcon from '../../../utilities/edit.svg';
import durationIcon from '../../../utilities/time.svg';
import playIcon from '../../../utilities/play_arrow.svg';
import playlistDefaultPhoto from '../../../utilities/playlistDefaultPhoto.svg';

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
    const [addPlaylistSignalValue, setAddPlaylistSignalValue] = useState(false);
    const [profileInfo, setProfileInfo] = useState(JSON.parse(localStorage.getItem('profile')));

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
        setShowSearchPlaylist(prev => {
            (indexClickedSearched === -1 && e.target.value !== prev) && setSearchedPlaylistArray([]);
            return e.target.value;
        });
        setItemSearchedFound([]);
    };

    const sideClickSearchHandler = index => {
        setIndexClickedSearched(index);
    };

    const addPlaylistHandler = () => {
        setAddPlaylistSignalValue(true);
    };

    const removePlaylistHandler = () => {
        
    };

    const moreActionsHandler = () => {
        
    };

    const reOrderHandler = () => {
        
    };

    const cancelAddBtnHandler = () => setAddPlaylistSignalValue(false);


    const actionsHandlerArray = [addPlaylistHandler, removePlaylistHandler, moreActionsHandler, reOrderHandler];
    const addPlaylistBox = [addPlaylistSignalValue, cancelAddBtnHandler]
    
    
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
                <Actions actionsFunctionHandler={actionsHandlerArray} />
            </div>
            <div>
                <SearchInput keyUpHandler={keyUpHandlerFunction} />
            </div>
            <div>
                <PlaylistSection data={playlists} onclick={clickHandler} currentIndex={indexG} playlistToShow={showSearchPlaylist} sideFunctionHandler={referenceFinder} searchHandler={sideClickSearchHandler} sideIndex={indexClickedSearched} addPlaylistSignal={addPlaylistBox} profileInfoProp={profileInfo} accessInfoProp={accessInfo} />
                <ShowPlaylistItems playlistToDisplay={playlistToSend} itemsToDisplay={arrayOfPlaylistsItems} indexOfListToDisplay={indexG} searchedIndex={indexClickedSearched} itemsToDisplaySearched={itemSearchedFound} playlistSearchedFoundDiv={searchedPlaylistArray} />
            </div>
        </>
    );
}

export function PlaylistSection(props) {
    const { data, onclick, currentIndex, playlistToShow, sideFunctionHandler, searchHandler, sideIndex, addPlaylistSignal, profileInfoProp, accessInfoProp } = props;
    const [playlistToShowOnList, setPlaylistToShowOnList] = useState([]);
    const [notFound, setNotFound] = useState(true);
    const [queryArrayList, setQueryArrayList] = useState([]);
    const [formValue, setFormValue] = useState({
        name: 'New playlist',
        description: '',
        public: false
    });

    const [arrayOfListedItems, setArrayOfListedItems] = useState([]);
    
    const ulRef = useRef(null);

    const listedItemsFabric = (array, text, onclickArg, indexToWork) => {
        return array.map((item, index) => {
            let image = item.images !== null ? item.images.length !== 0 ? imageCreeator(item.images.length === 3 ? item.images[1].url : item.images[0].url, 'playlist image', 150, 150) : imageCreeator(playlistDefaultPhoto, 'playlist image', 150, 150) : imageCreeator(playlistDefaultPhoto, 'playlist image', 150, 150);
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

    useEffect(() => {
        setArrayOfListedItems([]);
        setArrayOfListedItems(prev => [...prev, listedItemsFabric(data, '', onclick, currentIndex)]);
    }, [data]);



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
        <ul ref={ulRef}>
            {queryArrayList.length !== 0 && (queryArrayList.length === 1 ? queryArrayList[0] : queryArrayList.map(item => item))}
        </ul>
    );

    let btnSaveCancel = addPlaylistSignal[0] && <button onClick={addPlaylistSignal[1]}>Cancel</button>;
    const onSubmitHandler = (e) => {

        e.preventDefault();
        let newID = {text: 'idk'};
        
        fetch(`https://api.spotify.com/v1/users/${profileInfoProp.id}/playlists`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + accessInfoProp.access_token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formValue)
        })
        .then(response => response.json())
        .then((answer) => {
            if(!answer.hasOwnProperty('error')) {
                let savedPlaylist = JSON.parse(localStorage.getItem('playlists'));
                savedPlaylist.items.push(answer);
                localStorage.setItem('playlists', JSON.stringify(savedPlaylist));
                newID.text = answer.id;
            }
        });

        let defaultPlaylistPhotoInsert = imageCreeator(playlistDefaultPhoto, 'playlist photo', 150, 150);
        let newPlaylistTitle = paragraphCreator(formValue.name, newID.text);

        let fragment = (
            <>
                {newPlaylistTitle}
                {defaultPlaylistPhotoInsert}
            </>
        );

        let elementToBeAdded = listedItemsCreator(fragment, (newID.text + '_key'), data.length + 1, onclick);

        setArrayOfListedItems(prev => [...prev, elementToBeAdded]);

        setFormValue({
            name: 'New playlist',
            description: '',
            public: false,
            image: null
        });
        
        addPlaylistSignal[1]();
    };

    const handleChange = (e) => {
        setFormValue(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const checkboxHandleChange = (e) => {
        setFormValue(prev => ({
            ...prev,
            [e.target.name]: e.target.checked
        }));
    };

    let addPlaylistForm = addPlaylistSignal[0] ? 
    (
        <li>
            <form>
                <input type="text" placeholder="New playlist" name="name" onChange={handleChange} />
                <input type="text" placeholder="Description" name="description" onChange={handleChange}/>
                <label htmlFor="publicInput">Public </label>
                <input type="checkbox" name="public" id="publicInput" onChange={checkboxHandleChange}/>
                <br />
                <input type="submit" value="Submit" onClick={onSubmitHandler} />
            </form>
        </li>
    ) : (
        <>
        </>
    )

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
                            <ul ref={ulRef}>
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
            {addPlaylistForm} 
            {btnSaveCancel}
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

export function Actions(props) {

    const { actionsFunctionHandler } = props;

    return (
        <>
            <button onClick={actionsFunctionHandler[0]}><img src={addIcon} /></button>
            <button onClick={actionsFunctionHandler[1]}><img src={removeIcon} /></button>
            <button onClick={actionsFunctionHandler[2]}><img src={moreActionsIcon} /></button>
            <button onClick={actionsFunctionHandler[3]}><img src={orderByIcon} /></button>
        </>
    );
}

export function ShowPlaylistItems(props) {
    const { playlistToDisplay, itemsToDisplay, itemsToDisplaySearched, searchedIndex, playlistSearchedFoundDiv } = props;
    const [hasContent, setHasContent] = useState(false);
    const [tracks, setTracks] = useState(null);
    const [arrayOfListedItems, setArrayOfListedItems] = useState(null);
    const [biggerPictureFrame, setBiggerPictureFrame] = useState(null);
    const [playlistSearchedOutter, setPlaylistSearchedOutter] = useState(null);
    const trFabric = (children) => <tr>{children}</tr>
    const tdFabric = (children) => <td>{children}</td>

    const millisToMinutesAndSeconds = millis => {
        var minutes = Math.floor(millis / 60000);
        var seconds = ((millis % 60000) / 1000).toFixed(0);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    };

    const tdCreatorFabric = array => {

        let months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ]        

        return array.map((item, index) => {

            let tdNumber = tdFabric((index + 1)); 
            let tdAlbum = tdFabric(item.track.album.name);
            
            
            let author;
            if(item.track.artists.length === 1) {
                author = item.track.artists[0].name;
            } else {
                let tempArray = []
                tempArray.push(item.track.artists.map(artist => artist.name));
                author = tempArray[0].join(', ');
            }

            let titleFragment = (
                <>
                    {imageCreeator(item.track.album.images.length === 3 ? item.track.album.images[1].url : item.track.album.images[0].url, 'song image', 100, 100)}
                    {item.track.name}
                    {author}
                </>
            );

            let tdTitleFragment = tdFabric(titleFragment);
            let addedDate = new Date(item.added_at);
            let tdFullAddedDate = tdFabric((months[addedDate.getUTCMonth()] + ' ' + addedDate.getUTCDate() + ', ' + addedDate.getUTCFullYear()));
            let tdTimeDuration = millisToMinutesAndSeconds(item.track.duration_ms);

            let finalFragment = (
                <>
                    {tdNumber}
                    {tdTitleFragment}
                    {tdAlbum}
                    {tdFullAddedDate}
                    {tdTimeDuration}
                    <button><img src={playIcon}/></button>
                </>
            );

            return trFabric(finalFragment);
        });
    };

    useEffect(() => {        
        itemsToDisplay.map(item => {
            playlistToDisplay !== null && (playlistToDisplay.tracks.href === item.track_href && (setTracks(item.items)));
        });
    }, [playlistToDisplay]);

    useEffect(() => {
        let itemsToDisplayClicked = null;
        searchedIndex === -1 && setPlaylistSearchedOutter(null);

        if(searchedIndex !== -1) {
            itemsToDisplayClicked = itemsToDisplaySearched[searchedIndex];
            setPlaylistSearchedOutter(playlistSearchedFoundDiv[searchedIndex]);
        }

        if(tracks !== null && itemsToDisplayClicked === null) {
            setArrayOfListedItems(tdCreatorFabric(tracks.items));
        } else if(itemsToDisplayClicked !== null && itemsToDisplayClicked !== undefined) {
            setArrayOfListedItems(tdCreatorFabric(itemsToDisplayClicked.items.items));
            setTracks(null);
        }

        if(tracks !== null && searchedIndex === -1) {
            setBiggerPictureFrame(
                <>
                    <h2>{playlistToDisplay.name}</h2>
                    {playlistToDisplay.images !== null ? (
                        playlistToDisplay.images.length !== 0 ? <img src={playlistToDisplay.images.length === 3 ? playlistToDisplay.images[1].url : playlistToDisplay.images[0].url} alt='playlist image' width='400px' height='400px' /> : <img src={playlistDefaultPhoto} alt='playlist image' width='400px' height='400px' />
                    ) : (
                        <img src={playlistDefaultPhoto} alt='playlist image' width='400px' height='400px' />
                    )}
                    <p>{playlistToDisplay.description}</p>
                    <a href={playlistToDisplay.external_urls.spotify} target="_blank">Link to spotify playlist</a>
                    <br />
                    <p>Owner: <a href={playlistToDisplay.owner.external_urls.spotify} target="_blank"> {playlistToDisplay.owner.display_name}</a></p>
                </>
            );
        } else if(searchedIndex !== -1 && playlistSearchedFoundDiv.length !== 0 && playlistSearchedOutter !== null) {
            setBiggerPictureFrame(
                <>
                    <h2>{playlistSearchedOutter.name}</h2>
                    {playlistSearchedOutter.images !== null ? (
                        playlistSearchedOutter.images.length !== 0 ? <img src={playlistSearchedOutter.images.length === 3 ? playlistSearchedOutter.images[1].url : playlistSearchedOutter.images[0].url} alt='playlist image' width='400px' height='400px' /> : <img src={playlistDefaultPhoto} alt='playlist image' width='400px' height='400px' />
                    ) : (
                        <img src={playlistDefaultPhoto} alt='playlist image' width='400px' height='400px' />
                    )}

                    <p>{playlistSearchedOutter.description}</p>
                    <a href={playlistSearchedOutter.external_urls.spotify} target="_blank">Link to spotify playlist</a>
                    <br />
                    <p>Owner: <a href={playlistSearchedOutter.owner.external_urls.spotify} target="_blank"> {playlistSearchedOutter.owner.display_name}</a></p>
                </>
            );
        }
    }, [searchedIndex, tracks, playlistSearchedOutter]);

    useEffect(() => {
        if(Array.isArray(arrayOfListedItems) && arrayOfListedItems !== null && tracks !== null) {
            if(tracks.total === 0 && biggerPictureFrame !== null && arrayOfListedItems.length === 0) {
                setHasContent(true);
            } else if(arrayOfListedItems.length !== 0 && arrayOfListedItems !== undefined && biggerPictureFrame !== null) {
                setHasContent(true);
            }
        }
    }, [arrayOfListedItems, tracks]);

    useEffect(() => {
        if(playlistSearchedOutter !== null) {
            (biggerPictureFrame !== null && playlistSearchedOutter.tracks.total === 0 && searchedIndex !== -1) && setHasContent(true);
        }
    }, [playlistSearchedOutter, biggerPictureFrame]);

    return (
        <>
            {!hasContent ? (
                <>
                </>
            ) : (
                <>
                    <div>
                        {biggerPictureFrame}
                        <button><img src={orderByIcon} /></button>
                        <button><img src={editIcon} /></button>
                        <button>Save</button>
                    </div>
                    <div>
                        <table>
                            <tr>
                                <th>#</th>
                                <th>Title</th>
                                <th>Album</th>
                                <th>Date added</th>
                                <th><img src={durationIcon}/></th>
                                <th></th>
                            </tr>
                            <tbody>
                                {Array.isArray(arrayOfListedItems) && arrayOfListedItems.map(item => item)}
                            </tbody>
                        </table>


                    </div>
                </>
            )}        
        </>
    );

}