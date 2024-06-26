import img from '../../utilities/spotify-icon.png';
const client_id = '0df017d91ed44c9ea6976b6094df9242';
const scope = 'user-read-private user-read-email user-top-read playlist-modify-public playlist-modify-private user-library-read user-library-modify user-follow-read user-follow-modify ugc-image-upload user-read-playback-state user-modify-playback-state user-read-currently-playing app-remote-control playlist-read-private playlist-read-collaborative user-read-playback-position';
const redirect_uri = 'http://localhost:5173/main/profile';
const state = 0;

const body = new URLSearchParams({
    response_type: 'code',
    client_id: client_id,
    scope: scope,
    redirect_uri: redirect_uri,
    state: state
});

export default function Login() {

    const link = 'https://accounts.spotify.com/authorize?' + body.toString();

    const clickHandler = () => {
        window.location.href = link;
    }

    return(
        <>
            <h1>Jamming</h1>
            <img src={img} alt="spotify icon" />
            <h2 onClick={clickHandler}>Log in using you spotify account</h2>
        </>
    );
}