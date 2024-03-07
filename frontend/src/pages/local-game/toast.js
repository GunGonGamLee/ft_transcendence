export default function Toast() {
  return `
      <div id="toastContainer" class="toast-container position-fixed bottom-0 end-0 p-3">
        <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <strong class="me-auto" style="font-family: Galmuri11, serif">맵 변경이 가능하다</strong>
<!--          <small class="text-body-secondary">11 mins ago</small>-->
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body" style="font-family: Galmuri11, serif">
          1 - 4번 키를 눌러봐라
        </div>
      </div>
     </div>
  `;
}
