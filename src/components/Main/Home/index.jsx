export default function Profile(props) {
    const { profilePicture, userName } = props;
    const indexOfSpace = userName.indexOf(' ');
    const userFirstName = userName.substring(0, indexOfSpace);

    return (
        <>
            <img src={profilePicture[0].url} width={profilePicture[0].width} height={profilePicture[0].height}></img>
            <h2>Welcome {userFirstName}!</h2>
        </>
    );
}