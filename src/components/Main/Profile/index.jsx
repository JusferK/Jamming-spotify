import logout from '../../../utilities/turn_off_icon.svg';

export default function Profile(props) {
    const { profilePicture, userName, followers } = props;
    const indexOfSpace = userName.indexOf(' ');
    const userFirstName = userName.substring(0, indexOfSpace);

    return (
        <>
            <img src={profilePicture[0].url} width={profilePicture[0].width} height={profilePicture[0].height}></img>
            <h2>Welcome {indexOfSpace === -1 ? userName : userFirstName}!</h2>
            <p>Followers: {followers.total}</p>
            <img src={logout} alt="icon" width='64px' height='64px' />
        </>
    );
}