let model;
let class_indices;
let fileUpload = document.getElementById("uploadImage");
let img = document.getElementById("image");
let boxResult = document.querySelector(".box-result");
let confidence = document.querySelector(".confidence");
let pconf = document.querySelector(".box-result p");

const article = document.getElementById("article");
const stats = document.getElementById("stats");
const home = document.getElementById("home");
const about = document.getElementById("about");

home.addEventListener("click", function () {
  if (article.classList.contains("hidden")) {
    article.classList.remove("hidden");
    stats.classList.add("hidden");
  }
});

about.addEventListener("click", function () {
  if (stats.classList.contains("hidden")) {
    article.classList.add("hidden");
    stats.classList.remove("hidden");
  }
});

for (let i in localStorage) {
  stats.innerHTML += JSON.parse(localStorage.getItem(localStorage.key(i)))[0];
  stats.innerHTML += JSON.parse(localStorage.getItem(localStorage.key(i)))[1];
  stats.innerHTML += JSON.parse(localStorage.getItem(localStorage.key(i)))[2];
  stats.innerHTML += JSON.parse(localStorage.getItem(localStorage.key(i)))[3];
}
// for (let i in localStorage) {
//   stats.innerHTML += JSON.parse(localStorage.getItem(localStorage.key(i)))[1];
// }
// for (let i in localStorage) {
//   stats.innerHTML += JSON.parse(localStorage.getItem(localStorage.key(i)))[2];
// }
// for (let i in localStorage) {
//   stats.innerHTML += JSON.parse(localStorage.getItem(localStorage.key(i)))[3];
// }

let progressBar = new ProgressBar.Circle("#progress", {
  color: "limegreen",
  strokeWidth: 10,
  duration: 2000,
  easing: "easeInOut",
});

async function fetchData() {
  let response = await fetch("./class_indices.json");
  let data = await response.json();
  data = JSON.stringify(data);
  data = JSON.parse(data);
  return data;
}

async function initialize() {
  let status = document.querySelector(".init_status");
  status.innerHTML =
    'Завантаження моделі .... <span class="fa fa-spinner fa-spin"></span>';
  model = await tf.loadLayersModel("./tensorflowjs-model/model.json");
  status.innerHTML =
    'Модель завантажена успішно  <span class="fa fa-check"></span>';
}

async function predict() {
  let img = document.getElementById("image");
  let offset = tf.scalar(255);
  let tensorImg = tf.browser
    .fromPixels(img)
    .resizeNearestNeighbor([224, 224])
    .toFloat()
    .expandDims();
  let tensorImg_scaled = tensorImg.div(offset);
  prediction = await model.predict(tensorImg_scaled).data();

  fetchData().then((data) => {
    predicted_class = tf.argMax(prediction);

    class_idx = Array.from(predicted_class.dataSync())[0];
    let plantName, plantStatus;
    plantName = data[class_idx].split("___")[0];
    plantStatus = data[class_idx].split("___")[1].split("_").join(" ");
    document.querySelector(".plant-name").innerHTML = plantName;
    document.querySelector(".pred_class").innerHTML = plantStatus;
    document.querySelector(".inner").innerHTML = `${parseFloat(
      prediction[class_idx] * 100
    ).toFixed(2)}%`;
    console.log(data);
    console.log(data[class_idx]);
    console.log(data[class_idx].split("___"));
    console.log(data[class_idx].split("___")[1].split("_"));
    console.log(prediction);

    let today = new Date();
    let date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    let time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let dateTime = date + " " + time;
    let guid =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    let userArray = [
      plantName,
      plantStatus,
      dateTime,
      Math.round(prediction[class_idx] * 100),
    ];
    localStorage.setItem(guid, JSON.stringify(userArray));
    console.log(JSON.stringify(localStorage));
    progressBar.animate(prediction[class_idx] - 0.005);

    pconf.style.display = "block";

    confidence.innerHTML = Math.round(prediction[class_idx] * 100);
  });
}

fileUpload.addEventListener("change", function (e) {
  let uploadedImage = e.target.value;
  if (uploadedImage) {
    document.getElementById("blankFile-1").innerHTML = uploadedImage.replace(
      "C:\\fakepath\\",
      ""
    );
    document.getElementById("choose-text-1").innerText = "Замінити фотографію";
    document.querySelector(".success-1").style.display = "inline-block";

    let extension = uploadedImage.split(".")[1];
    if (!["doc", "docx", "pdf"].includes(extension)) {
      document.querySelector(".success-1 i").style.border =
        "1px solid limegreen";
      document.querySelector(".success-1 i").style.color = "limegreen";
    } else {
      document.querySelector(".success-1 i").style.border =
        "1px solid rgb(25,110,180)";
      document.querySelector(".success-1 i").style.color = "rgb(25,110,180)";
    }
  }
  let file = this.files[0];
  if (file) {
    boxResult.style.display = "block";
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener("load", function () {
      img.style.display = "block";
      img.setAttribute("src", this.result);
    });
  } else {
    img.setAttribute("src", "");
  }

  initialize().then(() => {
    predict();
  });
});
