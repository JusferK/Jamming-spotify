import turnOffIcon from '../../utilities/turn_off_icon.svg';
import { useEffect, useState } from "react";
import { Route, Routes} from 'react-router-dom';
import Profile from "./Profile";

const controller = new AbortController();
const client_id = '0df017d91ed44c9ea6976b6094df9242';
const client_secret = '01f7d0ddd34f42879efc24a80d455479';
const redirect_uri = 'http://localhost:5173/main';


export default function Main() {
    const [url, setUrl] = useState(window.location.href);
    const [tokens, setTokens] = useState({
        access_token: null,
        refresh_token: null
    });

    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {

        if(url.includes('?code=')) {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            //localStorage.setItem('code', code);
            
            if(code !== null) {

                //let codeLS = localStorage.getItem('code') !== null ? localStorage.getItem('code') : code;

                fetch('https://accounts.spotify.com/api/token', {
                    method: 'POST',
                    body: new URLSearchParams({
                        code: code,
                        redirect_uri: redirect_uri,
                        grant_type: 'authorization_code'
                    }).toString(),
                    headers: {
                        'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret).toString(),
                        'Content-type': 'application/x-www-form-urlencoded'
                    }
                })
                .then((response) => response.json())
                .then((data) => {
                    setTokens({
                        access_token: data.access_token,
                        refresh_token: data.refresh_token
                    });


                    //localStorage.setItem('accessToken', data.access_token);
                });
            }
        }
    }, []);

    useEffect(() => {

        if(tokens?.access_token !== null){
            fetch('https://api.spotify.com/v1/me', {
                method: 'GET',
                headers: {Authorization: 'Bearer ' + tokens?.access_token}
            })
            .then((response) => response.json())
            .then((answer) => {
                    setProfile(answer);
                    setIsLoading(false);
            });
        }
    }, [tokens.access_token]);


    return (
        <>
            {isLoading ? (
            'Loading...'
            ) : (
                <>  
                    <nav>
                      <ul>
                        <li><a href="/">Home</a></li>
                        <li><a href="/category">Playlist</a></li>
                        <li><a href="/Search">Search</a></li>
                      </ul>
                    </nav>

                    <Routes>
                        <Route path="/" element={ <Profile profilePicture={profile.images} userName={profile.display_name} /> } ></Route>
                        <Route path="/playlist"></Route>
                        <Route path="/Search"></Route>
                    </Routes>

                    <img src={turnOffIcon} alt="icon" width='64px' height='64px' />
                </>
            )}
        </>
    );
}