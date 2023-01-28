const socket = io();

$msgForm = document.querySelector("#msg-form");
$msgInput = $msgForm.querySelector("input");
$msgs = document.querySelector("#msgs");
$location = document.querySelector("#location");

//Template
msgsTemp = document.querySelector("#msg-temp").innerHTML;
locTemp = document.querySelector("#loc-temp").innerHTML;
sidebarTemp = document.querySelector("#sidebar-temp").innerHTML;

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  //new message element
  const $newmsg = $msgs.lastElementChild;

  const newMessageStyles = getComputedStyle($newmsg);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newmsg.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $msgs.offsetHeight;

  // Height of messages container
  const containerHeight = $msgs.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = $msgs.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $msgs.scrollTop = $msgs.scrollHeight;
  }
};

socket.on("newMessage", (message) => {
  console.log(message);
  html = Mustache.render(msgsTemp, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $msgs.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMsg", (locurl) => {
  console.log(locurl);
  html = Mustache.render(locTemp, {
    username: locurl.username,
    url: locurl.url,
    createdAt: moment(locurl.createdAt).format("h:mm a"),
  });
  $msgs.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  html = Mustache.render(sidebarTemp, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

document.querySelector("#msg-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const message = e.target.elements.message.value;

  socket.emit("msg", message, () => {
    $msgInput.value = "";
    $msgInput.focus();

    // if(error){
    //     return console.log(error)
    // }
    console.log("Delivered !");
  });
});

document.querySelector("#location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported on your brower.");
  }

  $location.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $location.removeAttribute("disabled");
        console.log("Location Shared !");
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
