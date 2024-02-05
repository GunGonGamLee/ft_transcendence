import { hoverChangeCursor } from "../../utils/hoverEvent.js";
import { click } from "../../utils/clickEvent.js";
import userCard from "./userCard.js";
import useState from "../../utils/useState.js";
/**
 * 사용자 전적 페이지에 사용하는 header 컴포넌트
 * @param {HTMLElement} $container
 */
export default function historiesHeader($container) {
  this.$container = $container;
  let friends = [
    {
      avatar: "../../assets/images/avatar/red_bust.png",
      name: "김수한무거북이와",
    },
    {
      avatar: "../../../assets/images/avatar/red_bust.png",
      name: "두루미",
    },
    {
      avatar: "../../../assets/images/avatar/blue_bust.png",
      name: "john",
    },
    {
      avatar: "../../../assets/images/avatar/green_bust.png",
      name: "doe",
    },
    // {
    //   avatar: "../../../assets/images/avatar/red_bust.png",
    //   name: "김수한무거북이와",
    // },
    // {
    //   avatar: "../../../assets/images/avatar/red_bust.png",
    //   name: "두루미",
    // },
    // {
    //   avatar: "../../../assets/images/avatar/blue_bust.png",
    //   name: "john",
    // },
    // {
    //   avatar: "../../../assets/images/avatar/green_bust.png",
    //   name: "doe",
    // },
  ];

  this.setState = () => {
    this.render();
    this.renderFriends();
    document.getElementById("go-back").addEventListener("click", () => {
      history.back();
    });
    click(this.$container.querySelector("#friends"), () => {
      this.$container.querySelector("#modalBackdrop").style.display = "block";
    });
    click(this.$container.querySelector("#modalBackdrop"), () => {
      this.$container.querySelector("#modalBackdrop").style.display = "none";
    });
    click(this.$container.querySelector("#myModal"), (e) => {
      // 이벤트 버블링 방지 (모달창을 클릭해도 닫히지 않도록)
      e.stopPropagation();
    });
    hoverChangeCursor(document.getElementById("go-back"), "pointer");
    hoverChangeCursor(document.getElementById("user-avatar"), "pointer");
    hoverChangeCursor(document.getElementById("friends"), "pointer");

    let [getFriends, setFriends] = useState(friends, this, "renderFriends");
  };

  this.render = () => {
    this.$container.innerHTML = `
        <div class="main header-wrapper">
            <div class="main" id="left-side">
                <img src="../../../assets/images/go_back.png" alt="뒤로가기" class="main" id="go-back">
            </div>
            <div class="main" id="title">사십 이 초-월</div>
            <div class="main" id="right-side">
                <img src="../../../assets/images/avatar/red_bust.png" alt="아바타" id="user-avatar">
                <img src="../../../assets/images/friends.png" alt="친구 목록" id="friends">
            </div>
        </div>
        <div id="modalBackdrop" class="modal-backdrop">
           <div id="myModal" class="modal-content">
          </div>
        </div>
        `;
  };

  this.renderFriends = () => {
    this.$container.querySelector("#myModal").innerHTML = `
        <div class="user-card-wrapper">
          ${userCard(friends[0] || null)}
          ${userCard(friends[2] || null)}
          ${userCard(friends[4] || null)}
          ${userCard(friends[6] || null)}
        </div>
        <div class="user-card-wrapper">
          ${userCard(friends[1] || null)}
          ${userCard(friends[3] || null)}
          ${userCard(friends[5] || null)}
          ${userCard(friends[7] || null)}
        </div>
    `;
  };
  this.setState();
}
