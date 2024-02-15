import {importCss} from '../../utils/importCss.js'


export default function friendsInfoModal(isVisible) {
    importCss('../../../assets/css/friendsInfoModal.css');

    return `
        <div class="friends-info-modal-wrapper" id="friends-list-wrapper">
            <div class="friends-info-modal-wrapper" id="friends-list">
                
            </div>
            <div class="friends-info-modal-wrapper" id="user-search">
                
            </div>
            <div class="friends-info-modal-wrapper" id="friend-request-list">
                
            </div>
        </div>
    `;
}