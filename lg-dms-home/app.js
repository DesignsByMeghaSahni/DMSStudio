(function () {
  var clock = document.getElementById('clock');
  var message = document.getElementById('message');
  function updateClock() {
    clock.textContent = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  }
  updateClock(); setInterval(updateClock, 30000);
  function launch(id) {
    if (!window.webOS || !webOS.service) {
      message.textContent = 'App launching is available on the TV.';
      return;
    }
    message.textContent = 'Opening…';
    webOS.service.request('luna://com.webos.applicationManager/launch', {
      method: 'launch', parameters: {id: id},
      onSuccess: function () { message.textContent = ''; },
      onFailure: function () { message.textContent = 'This app is not available on this TV.'; }
    });
  }
  document.querySelectorAll('[data-app]').forEach(function (button) {
    button.addEventListener('click', function () { launch(button.dataset.app); });
  });
}());
