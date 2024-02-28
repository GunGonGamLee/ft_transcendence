export default function Tournament($container, info = null) {
  if (info === null) {
    return;
  }
  console.log(info);
  const ws = info.socket;
  ws.onmessage = (msg) => {
    let data = JSON.parse(msg.data);
    console.log(data);
  };

  const init = () => {
    render();
  };

  const render = () => {
    $container.innerHTML = `
			<div class="tournament-wrapper" style="background-image: url('../../../assets/images/tournament_background.png'); background-size: 100% 100%; background-repeat: no-repeat; width: 100vw; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center">
		`;
  };
  init();
}
