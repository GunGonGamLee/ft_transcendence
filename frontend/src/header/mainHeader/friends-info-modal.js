import {importCss} from '../../utils/importCss.js'


export default function friendsInfoModal(isVisible) {
    importCss('../../../assets/css/friendsInfoModal.css');

    const friendList = [
        {
            username: '효조초다호호호호',
            avatarImagePath: '../../assets/images/avatar/darth_vader.png'
        },
        {
            username: 'yena',
            avatarImagePath: '../../assets/images/avatar/han_solo.png'
        },
        {
            username: 'sejokim',
            avatarImagePath: '../../assets/images/avatar/luke_skywalker.png'
        },
        {
            username: 'sejokim',
            avatarImagePath: '../../assets/images/avatar/luke_skywalker.png'
        },
        {
            username: 'sejokim',
            avatarImagePath: '../../assets/images/avatar/luke_skywalker.png'
        },
        {
            username: 'sejokim',
            avatarImagePath: '../../assets/images/avatar/luke_skywalker.png'
        }
    ];

    const foundUserCardList = [
        {
            username: '효조초다호호호호',
            avatarImagePath: '../../assets/images/avatar/darth_vader.png'
        },
        {
            username: 'yena',
            avatarImagePath: '../../assets/images/avatar/han_solo.png'
        },
        {
            username: 'sejokim',
            avatarImagePath: '../../assets/images/avatar/luke_skywalker.png'
        },
        {
            username: 'sejokim',
            avatarImagePath: '../../assets/images/avatar/luke_skywalker.png'
        },
        {
            username: 'sejokim',
            avatarImagePath: '../../assets/images/avatar/luke_skywalker.png'
        },
        {
            username: 'sejokim',
            avatarImagePath: '../../assets/images/avatar/luke_skywalker.png'
        }
    ];

    const requesterlist = [
        {
            username: '효조초다호호호호',
            avatarImagePath: '../../assets/images/avatar/darth_vader.png'
        },
        {
            username: 'yena',
            avatarImagePath: '../../assets/images/avatar/han_solo.png'
        },
        {
            username: 'sejokim',
            avatarImagePath: '../../assets/images/avatar/luke_skywalker.png'
        },
        {
            username: 'sejokim',
            avatarImagePath: '../../assets/images/avatar/luke_skywalker.png'
        },
        {
            username: 'sejokim',
            avatarImagePath: '../../assets/images/avatar/luke_skywalker.png'
        },
        {
            username: 'sejokim',
            avatarImagePath: '../../assets/images/avatar/luke_skywalker.png'
        },
        {
            username: 'sejokim',
            avatarImagePath: '../../assets/images/avatar/luke_skywalker.png'
        },
        {
            username: 'sejokim',
            avatarImagePath: '../../assets/images/avatar/luke_skywalker.png'
        }
    ];

    function createInfoCard(friend, style = {}, image = {}) {
        const { username, avatarImagePath, iconImagePath } = friend;
        const borderColor = style.borderColor;
        const imagePath = image.iconImagePath;
        // accept.png 아이콘일 경우에만 추가할 HTML 조각을 정의
        const additionalIconHTML = imagePath === '../../assets/images/accept.png' ?
            `<div>
                <img class="icon" src="../../assets/images/close.png" />
            </div>` : '';
        // 조건에 따라 클래스 추가
        const wrapperClass = imagePath === '../../assets/images/accept.png' ? 'friend-card-wrapper with-additional-icon' : 'friend-card-wrapper';

        return `
        <div class="${wrapperClass}" style="border-color: ${borderColor};">
            <div>
                <img class="avatar-image" src="${avatarImagePath}" />
            </div>
            <div class="user-name">
                ${username}
            </div>
            <div>
                <img class="icon" src="${imagePath}" />
            </div>
            ${additionalIconHTML}
        </div>
    `;
    }

    const friendCards = friendList.slice(0, 8).map(card =>
        createInfoCard(card, {borderColor: '#07F7B0'}, {iconImagePath: '../../assets/images/trash.png'})).join('');

    const foundUserCards = foundUserCardList.map((card) =>
        createInfoCard(card, {borderColor: '#FF52A0'}, {iconImagePath: '../../assets/images/paper_plane.png'})).join('');

    const requesterCards = requesterlist.map(card =>
        createInfoCard(card, {borderColor: '#29ABE2'}, {iconImagePath: '../../assets/images/accept.png'})).join('');

    return `
        <div class="friends-info-modal-wrapper" id="friends-info-wrapper">
            <div class="list-wrapper" id="friends-list-wrapper">
                <div class="list-subject">
                    친구 (${friendList.length} / 8)
                </div>
                <div id="friends-list">
                    ${friendCards}
                </div>
            </div>
            <div class="list-wrapper" id="user-search-wrapper">
                <div class="list-subject">
                    유저 찾기 (${foundUserCardList.length})
                </div>
                <div id="search-form">
                    <image src="../../assets/images/search.png"></image>
                    <input />
                </div>
                <div id="user-search">
                    ${foundUserCards}
                </div>
            </div>
            <div class="list-wrapper" id="friend-request-list-wrapper">
                <div class="list-subject">
                    친구 요청 (${requesterlist.length})
                </div>
                <div id="friend-request-list">
                    ${requesterCards}
                </div>
            </div>
        </div>
    `;
}