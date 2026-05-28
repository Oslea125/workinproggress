
// script.js

document.addEventListener('DOMContentLoaded', () => {

  /* USER */

  let username =
    localStorage.getItem('username');

  if (!username) {

    username =
      prompt('Enter your name');

    localStorage.setItem(
      'username',
      username
    );
  }

  const senderType =
    username.toLowerCase() === 'scott'
      ? 'them'
      : 'me';

  /* LOADER */

  const loader =
    document.getElementById('loader');

  function hideLoader() {

    if (!loader) return;

    loader.classList.add('hidden');

    setTimeout(() => {
      loader.style.display = 'none';
    }, 400);
  }

  window.addEventListener('load', hideLoader);

  setTimeout(hideLoader, 2500);

  /* STATE */

  let currentScreen = 'home';

  const historyStack = ['home'];

  /* NAVIGATION */

  function setActiveScreen(id) {

    const target =
      document.getElementById(id);

    if (!target) return;

    document.querySelectorAll('.screen')
      .forEach(screen => {
        screen.classList.remove('active');
      });

    document.querySelectorAll('.nav-item')
      .forEach(item => {
        item.classList.remove('active');
      });

    target.classList.add('active');

    const navButton =
      document.getElementById(`nav-${id}`);

    if (navButton) {
      navButton.classList.add('active');
    }

    currentScreen = id;

    target.scrollTop = 0;
  }

  function nav(id) {

    if (id === currentScreen) return;

    setActiveScreen(id);

    historyStack.push(id);

    try {

      history.pushState(
        { screen:id },
        '',
        `#${id}`
      );

    } catch(err) {

      console.warn(err);

    }
  }

  function goBack() {

    if (historyStack.length <= 1) {

      nav('home');

      return;
    }

    historyStack.pop();

    const previous =
      historyStack[historyStack.length - 1];

    setActiveScreen(previous);
  }

  /* EVENTS */

  document.querySelectorAll('[data-nav]')
    .forEach(button => {

      button.addEventListener('click', () => {

        nav(button.dataset.nav);

      });

    });

  document.querySelectorAll('.back-button')
    .forEach(button => {

      button.addEventListener('click', goBack);

    });

  /* CLOCK */

  function tick() {

    const now = new Date();

    const h =
      String(now.getHours()).padStart(2,'0');

    const m =
      String(now.getMinutes()).padStart(2,'0');

    document.getElementById(
      'statusTime'
    ).textContent = `${h}:${m}`;
  }

  tick();

  setInterval(tick, 10000);

  /* DAY COUNT */

  (() => {

    const start =
      new Date('2026-04-13');

    const now =
      new Date();

    const diff = Math.max(
      1,
      Math.floor(
        (now - start) /
        (1000 * 60 * 60 * 24)
      )
    );

    document.getElementById(
      'dayCount'
    ).textContent = diff;

  })();

  /* CHAT */

  const chatMessages =
    document.getElementById('chatMessages');

  const chatInput =
    document.getElementById('chatInput');

  const sendBtn =
    document.getElementById('sendBtn');

  function escapeHTML(str='') {

    return String(str).replace(
      /[&<>"']/g,
      m => ({
        '&':'&amp;',
        '<':'&lt;',
        '>':'&gt;',
        '"':'&quot;',
        "'":'&#039;'
      })[m]
    );
  }

  function scrollChatBottom() {

    chatMessages.scrollTo({
      top:chatMessages.scrollHeight,
      behavior:'smooth'
    });
  }

  function loadMessages() {

    db.collection('messages')
      .orderBy('timestamp')

      .onSnapshot(snapshot => {

        chatMessages.innerHTML = '';

        snapshot.forEach(doc => {

          const data = doc.data();

          const row =
            document.createElement('div');

          row.className =
            `msg-row ${data.sender}`;

          row.innerHTML = `
            <div class="bubble">
              ${escapeHTML(data.text)}
            </div>

            <div class="msg-time">
              ${data.name} · ${data.time}
            </div>
          `;

          chatMessages.appendChild(row);

        });

        scrollChatBottom();

      });
  }

  async function sendMsg() {

    const val =
      chatInput.value.trim();

    if (!val) return;

    const now =
      new Date();

    const time =
      `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    await db.collection('messages').add({

      text: val,

      sender: senderType,

      name: username,

      time: time,

      timestamp: Date.now()

    });

    chatInput.value = '';
  }

  if (sendBtn) {

    sendBtn.addEventListener(
      'click',
      sendMsg
    );
  }

  if (chatInput) {

    chatInput.addEventListener(
      'keydown',
      e => {

        if (e.key === 'Enter') {

          e.preventDefault();

          sendMsg();
        }

      }
    );
  }

  loadMessages();

  /* GALLERY */

  const imageUpload =
    document.getElementById('imageUpload');

  const galleryGrid =
    document.getElementById('galleryGrid');

  if (imageUpload) {

    imageUpload.addEventListener(
      'change',
      async e => {

        const file =
          e.target.files[0];

        if (!file) return;

        const storageRef =
          storage.ref();

        const fileRef =
          storageRef.child(
            `gallery/${Date.now()}-${file.name}`
          );

        await fileRef.put(file);

        const url =
          await fileRef.getDownloadURL();

        await db.collection('gallery').add({

          image:url,

          uploadedBy:username,

          timestamp:Date.now()

        });

      }
    );
  }

  function loadGallery() {

    db.collection('gallery')
      .orderBy('timestamp', 'desc')

      .onSnapshot(snapshot => {

        galleryGrid.innerHTML = '';

        snapshot.forEach(doc => {

          const data = doc.data();

          const img =
            document.createElement('img');

          img.src = data.image;

          galleryGrid.appendChild(img);

        });

      });
  }

  loadGallery();

  /* DARK MODE */

  const darkModeToggle =
    document.getElementById(
      'darkModeToggle'
    );

  function toggleDarkMode() {

    document.body.classList.toggle('dark');

    localStorage.setItem(
      'darkMode',
      document.body.classList.contains('dark')
    );
  }

  if (
    localStorage.getItem('darkMode') === 'true'
  ) {
    document.body.classList.add('dark');
  }

  if (darkModeToggle) {

    darkModeToggle.addEventListener(
      'click',
      toggleDarkMode
    );
  }

});

