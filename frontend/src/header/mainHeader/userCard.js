export default function userCard(props) {
  if (props === null) {
    return `
      <div class="user-card">
      </div>
    `;
  }
  return `
    <div class="user-card">
      <img src="${props.avatar}" alt="User Avatar">
      <div class="user-info">
          <h3>${props.name}</h3>
      </div>
      <div class="user-actions">
          <button>삭제</button>
          <button>초대</button>
      </div>
    </div>
  `;
}
