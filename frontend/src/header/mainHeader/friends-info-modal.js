import {importCss} from '../../utils/importCss.js'


export default function friendsInfoModal(isVisible) {
    importCss('../../../assets/css/friendsInfoModal.css');

    const friends = [
        {
            username: '효조초다호호호호',
            avatarImagePath: '../../assets/images/avatar/darth_vader.png',
            iconImagePath: '../../assets/images/trash.png'
        },
        {
            username: 'yena',
            avatarImagePath: '../../assets/images/avatar/han_solo.png',
            iconImagePath: '../../assets/images/trash.png'
        },
        {
            username: 'sejokim',
            avatarImagePath: '../../assets/images/avatar/luke_skywalker.png',
            iconImagePath: '../../assets/images/trash.png'
        }
        // 배열은 최대 8개의 친구 정보 객체를 담을 수 있음
        // ...
    ];

    function createFriendCard(friend) {
        // friend 객체에서 필요한 정보를 직접 추출
        const { username, avatarImagePath, iconImagePath } = friend;
        return `
        <div class="friend-card-wrapper">
            <div>
                <image class="avatar-image" src="${avatarImagePath}"></image>
            </div>
            <div class="user-name">
                ${username}
            </div>
            <div >
                <image class="icon" src="${iconImagePath}"></image>
            </div>
        </div>
    `;
    }

    const friendCards = friends.slice(0, 8).map(friend =>
        createFriendCard(friend)).join('');

    return `
        <div class="friends-info-modal-wrapper" id="friends-info-wrapper">
            <div class="list-wrapper" id="friends-list-wrapper">
                <div class="list-subject">
                    친구 (${friends.length} / 8)
                </div>
                <div id="friends-list">
                    ${friendCards}
                </div>
            </div>
            <div class="list-wrapper" id="user-search-wrapper">
                <div class="list-subject">
                    유저 찾기
                </div>
                <div id="search-form">
                    <image src="../../assets/images/search.png"></image>
                    <input />
                </div>
                <div id="user-search"></div>
            </div>
            <div class="list-wrapper" id="friend-request-list-wrapper">
                <div class="list-subject">
                    친구 요청
                </div>
                <div id="friend-request-list"></div>
            </div>
        </div>
    `;
}