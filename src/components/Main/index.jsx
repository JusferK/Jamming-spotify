import { useEffect, useState } from "react";
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import Profile from "./Profile";
import Search from './Search';
import Playlist from './Playlist';

const client_id = '0df017d91ed44c9ea6976b6094df9242';
const client_secret = '01f7d0ddd34f42879efc24a80d455479';
const redirect_uri = 'http://localhost:5173/main/profile';
const fifthyFiveMinutes = 3.3e+6;

const getToken = async token => {
    let response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        body: new URLSearchParams({
            code: token,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
        }).toString(),
        headers: {
           'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret).toString(),
           'Content-type': 'application/x-www-form-urlencoded'
        }
    });

    if(response.ok) {
        let data = await response.json();
        return data;
    } else {
        throw new Error().message;
    }
};

const getRefreshToken = async refreshToken => {
    let response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: client_id
        }).toString(),
        headers: {
           'Content-type': 'application/x-www-form-urlencoded'
        }
    });

    if(response.ok) {
        let data = await response.json();
        return data;
    }
} 

const everyFifthyFive = refreshToken => {

    const date = new Date();
    let hour = date.getHours(), minutes = date.getMinutes(), seconds = date.getSeconds();
    let countStartedAt = hour + ':' + minutes + ':' + seconds;
    let endTime = (hour + 1) + ':' + minutes + ':' + seconds;

    console.log('The count started at: ' + countStartedAt);
    console.log('The count will stop at: ' + endTime);

    setInterval(()=>{
        getRefreshToken(refreshToken).then((data) => {

            const accessInfo = {
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                date: (new Date().getDate() + '/' + (new Date().getMonth() + 1) + '/' + new Date().getFullYear()),
                hour: (new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds())
            };

            localStorage.setItem('accessInfo', accessInfo);
        });

        const date = new Date();
        let hour = date.getHours(), minutes = date.getMinutes(), seconds = date.getSeconds();
        let countStartedAt = hour + ':' + minutes + ':' + seconds;
        let endTime = (hour + 1) + ':' + minutes + ':' + seconds;

        console.log('The count started at: ' + countStartedAt);
        console.log('The count will stop at: ' + endTime);
    }, fifthyFiveMinutes);
}


export default function Main() {
    const [url, setUrl] = useState(window.location.href);
    const [tokenInfo, setTokenInfo] = useState(JSON.parse(localStorage.getItem('accessInfo')));
    const [profile, setProfile] = useState(JSON.parse(localStorage.getItem('profile')));
    const [isLoading, setIsLoading] = useState(true);
    const [codeURL, setCodeURL] = useState(localStorage.getItem('code'));
    const [userPlaylist, setUserPlaylist] = useState(JSON.parse(localStorage.getItem('playlists')));
    const navigate = useNavigate();

    useEffect(() => {
        if(url.includes('?code=') && profile === null && tokenInfo === null) {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            codeURL === null && setCodeURL(codeURL);
            localStorage.setItem('code', code);
            
            if(code !== null) {
                getToken(code)
                .then((data) => {
                    const accessInfo = {
                        access_token: data.access_token,
                        refresh_token: data.refresh_token,
                        date: (new Date().getDate() + '/' + (new Date().getMonth() + 1) + '/' + new Date().getFullYear()),
                        hour: (new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds())
                    };
                    setTokenInfo(accessInfo);
                    localStorage.setItem('accessInfo', JSON.stringify(accessInfo));
                    everyFifthyFive(data.refresh_token);
                });
            }
        } else if(tokenInfo !== null && codeURL !== null && profile !== null) {
            let partsFullDate = tokenInfo.date.split('/');
            let partsFullHour = tokenInfo.hour.split(':');
            let newDate = new Date(partsFullDate[2], (partsFullDate[1] - 1), partsFullDate[0], partsFullHour[0], partsFullHour[1], partsFullHour[2]);
            let milisecondsHasPassed = (new Date().getTime()) - newDate.getTime();
            let timeHasPassedInHours = Math.abs(milisecondsHasPassed) / 3.6e+6;
            let timeForIntervalHR = 0.916667 - timeHasPassedInHours;
            let intervalTimeMS = Math.abs(timeForIntervalHR) * 3.6e+6;
            let todaysDate = (new Date().getDate()) + '/' + (new Date().getMonth()) + '/' + (new Date().getFullYear());

            if(tokenInfo.date === todaysDate) {
                if((new Date().getHours()) > (newDate.getHours() + 1)) {
                    getToken(codeURL)
                    .then((data) => {
                        const accessInfo = {
                            access_token: data.access_token,
                            refresh_token: data.refresh_token,
                            date: (new Date().getDate() + '/' + (new Date().getMonth() + 1) + '/' + new Date().getFullYear()),
                            hour: (new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds())
                        };
                        setTokenInfo(accessInfo);
                        localStorage.setItem('accessInfo', JSON.stringify(accessInfo));
                        everyFifthyFive(data.refresh_token);
                    });
                }
            } else if(tokenInfo.date === todaysDate && ((new Date().getHours()) < (newDate.getHours() + 1))) {
                if(timeForIntervalHR > 0 && timeHasPassedInHours >= 0.916667) {
                    setTimeout(() => {
                        getRefreshToken(tokenInfo.refresh_token)
                        .then((data) => {
                            const accessInfo = {
                                access_token: data.access_token,
                                refresh_token: data.refresh_token,
                                date: (new Date().getDate() + '/' + (new Date().getMonth() + 1) + '/' + new Date().getFullYear()),
                                hour: (new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds())
                            };
                            setTokenInfo(accessInfo);
                            localStorage.setItem('accessInfo', JSON.stringify(accessInfo));
                            everyFifthyFive(data.refresh_token);
                        });
                    }, intervalTimeMS);
                }
            }            
        }
    }, []);

    useEffect(() => {
        if(profile === null && tokenInfo?.access_token !== undefined){
            fetch('https://api.spotify.com/v1/me', {
                method: 'GET',
                headers: {Authorization: 'Bearer ' + tokenInfo?.access_token},
            })
            .then((response) => response.json())
            .then((answer) => {
                setProfile(answer);
                localStorage.setItem('profile', JSON.stringify(answer));
                setIsLoading(false);
                navigate('/main/profile');
            }).catch((e) => {
                console.log(e);
            })
        } else if(profile !== null) {
            setIsLoading(false);
        }

    }, [tokenInfo]);

    useEffect(() => {
        if(profile !== null && userPlaylist === null) {
            const playListURL = `https://api.spotify.com/v1/users/${profile.id}/playlists`;
            fetch(playListURL, {
                method: 'GET',
                headers: {'Authorization': 'Bearer ' + tokenInfo?.access_token},
            })
            .then((response) => response.json())
            .then((answer) => {
                userPlaylist === null && setUserPlaylist(answer);
                localStorage.setItem('playlists', JSON.stringify(answer));
            })
        }
    }, [profile]);

    return (
        <>
            {isLoading ? (
            'Loading...'
            ) : (
                <>  
                    <nav>
                      <ul>
                        <li><Link to='/main/profile'>Profile</Link></li>
                        <li><Link to='/main/playlist'>Playlist</Link></li>
                        <li><Link to='/main/search'>Search</Link></li>
                      </ul>
                    </nav>

                    <Routes>
                        <Route path='/profile' element={<Profile profilePicture={profile?.images} userName={profile?.display_name} followers={profile?.followers} />}></Route>
                        <Route path='/playlist' element={<Playlist playlists={userPlaylist?.items} />}></Route>
                        <Route path='/search' element={<Search /> } ></Route>
                    </Routes>
                </>
            )}
        </>
    );
}