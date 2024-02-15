import {importCss} from '../../utils/importCss.js'


export default function friendsInfoModal(isVisible) {
    importCss('../../../assets/css/friendsInfoModal.css');

    return `
        <div class="friends-info-modal-wrapper" id="friends-info-wrapper">
            <div class="list-wrapper" id="friends-list-wrapper">
                <div class="list-subject">
                    친구 (1 / 8)
                </div>
                <div id="friends-list"></div>
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