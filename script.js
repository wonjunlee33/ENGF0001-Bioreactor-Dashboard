"use strict";

// DOM elements selection
const tempValue = document.getElementById("temp_value");
const phValue = document.getElementById("ph_value");
const rpmValue = document.getElementById("rpm_value");

const wantedTemp = document.getElementById("wanted_temp");
const wantedPh = document.getElementById("wanted_ph");
const wantedRpm = document.getElementById("wanted_rpm");

const btnTempInc = document.getElementById("temp_inc");
const btnTempDec = document.getElementById("temp_dec");
const btnPhInc = document.getElementById("ph_inc");
const btnPhDec = document.getElementById("ph_dec");
const btnRpmInc = document.getElementById("rpm_inc");
const btnRpmDec = document.getElementById("rpm_dec");

const setTemp = document.getElementById("set_temp");
const setPh = document.getElementById("set_ph");
const setRpm = document.getElementById("set_rpm");

const go1 = document.getElementById("go1");
const go2 = document.getElementById("go2");
const go3 = document.getElementById("go3");

///////////////////////////////////////////////////////////////////
// Implement button functionality for controlling temperature

// Temperature ////////////////////////////////////////////////////////////
btnTempInc.addEventListener("click", function (e) {
  if (+wantedTemp.textContent >= 99) return;
  e.preventDefault();
  wantedTemp.textContent = `${(+wantedTemp.textContent + 1).toFixed(1)}`;
});

btnTempDec.addEventListener("click", function (e) {
  if (+wantedTemp.textContent <= 0) return;
  e.preventDefault();
  wantedTemp.textContent = `${(+wantedTemp.textContent - 1).toFixed(1)}`;
});

// pH ////////////////////////////////////////////////////////////
btnPhInc.addEventListener("click", function (e) {
  if (+wantedPh.textContent >= 9) return;
  e.preventDefault();
  wantedPh.textContent = `${(+wantedPh.textContent + 1).toFixed(1)}`;
});

btnPhDec.addEventListener("click", function (e) {
  if (+wantedPh.textContent <= 0) return;
  e.preventDefault();
  wantedPh.textContent = `${(+wantedPh.textContent - 1).toFixed(1)}`;
});

// RPM ////////////////////////////////////////////////////////////
btnRpmInc.addEventListener("click", function (e) {
  if (+wantedRpm.textContent >= 2000) return;
  e.preventDefault();
  wantedRpm.textContent = `${+wantedRpm.textContent + 1}`;
});

btnRpmDec.addEventListener("click", function (e) {
  if (+wantedRpm.textContent <= 0) return;
  e.preventDefault();
  wantedRpm.textContent = `${+wantedRpm.textContent - 1}`;
});

// various error handling needed: for async function error out when too lagged from ESP32

/////////////////////////////////////////////////////////////////////////////

// fetch api to acquire information from ESP32
// create websocket connection

function toIsoString(date) {
  var tzo = -date.getTimezoneOffset(),
    dif = tzo >= 0 ? "+" : "-",
    pad = function (num) {
      return (num < 10 ? "0" : "") + num;
    };

  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds()) +
    dif +
    pad(Math.floor(Math.abs(tzo) / 60)) +
    ":" +
    pad(Math.abs(tzo) % 60)
  );
}

var dt = new Date();
const nowDate = toIsoString(dt);

const socket = new WebSocket(`ws://20.168.214.240/ws/api/`);

const constrGetUserData = {
  method: "getUserData",
  params: "null",
};

const constrGetData = {
  method: "getData",
  params: {
    date_from: "1997-07-16T19:20:30+01:00",
    date_to: `${nowDate}`,
  },
};

// open connection and receive
socket.addEventListener("open", (event) => {
  socket.send(JSON.stringify(constrGetUserData));
  socket.send(JSON.stringify(constrGetData));
});

// implement functionality to update initial wantedData

socket.addEventListener("message", (event) => {
  const receivedDataJSON = event.data;
  const receivedData = JSON.parse(receivedDataJSON);

  // handle problems lmao
  const receivedMethod = `${receivedData.method}`;
  if (receivedMethod !== "getUserDataResponse") {
    return;
  }

  receivedTemp = receivedData.data.temperature;
  receivedPh = receivedData.data.ph;
  receivedRpm = receivedData.data.rpm;

  wantedTemp.textContent = receivedTemp.toFixed(1);
  wantedPh.textContent = receivedPh.toFixed(1);
  wantedRpm.textContent = receivedRpm;
});

let receivedTemp = +tempValue.textContent;
let receivedPh = +phValue.textContent;
let receivedRpm = +rpmValue.textContent;

socket.addEventListener("message", (event) => {
  const receivedDataJSON = event.data;
  const receivedData = JSON.parse(receivedDataJSON);

  // handle problems lmao
  const receivedMethod = `${receivedData.method}`;
  if (receivedMethod !== "telemetry") {
    return;
  }

  receivedTemp = receivedData.data.temperature;
  receivedPh = receivedData.data.ph;
  receivedRpm = receivedData.data.rpm;

  tempValue.textContent = receivedTemp.toFixed(1);
  phValue.textContent = receivedPh.toFixed(1);
  rpmValue.textContent = receivedRpm;
});

// Handle go button clicks

const buttonSend = function (sendTemp, sendPh, sendRpm) {
  const objectTemp = {
    method: "setTemperature",
    params: +sendTemp,
  };
  const objectPh = {
    method: "setpH",
    params: +sendPh,
  };
  const objectRpm = {
    method: "setRPM",
    params: +sendRpm,
  };

  socket.send(JSON.stringify(objectTemp));
  socket.send(JSON.stringify(objectPh));
  socket.send(JSON.stringify(objectRpm));
};

// Temperature
go1.addEventListener("click", function (e) {
  const input = (+setTemp.value).toFixed(1);
  if (input == 0.0) {
    buttonSend(
      wantedTemp.textContent,
      wantedPh.textContent,
      wantedRpm.textContent
    );
    return;
  }
  if (input > 100 || input <= 0) {
    alert("Invalid Input: (0 - 100)");
    setTemp.value = "";
    return;
  }
  e.preventDefault();
  wantedTemp.textContent = input;
  buttonSend(
    wantedTemp.textContent,
    wantedPh.textContent,
    wantedRpm.textContent
  );
  setTemp.value = "";
});

// pH
go2.addEventListener("click", function (e) {
  const input = (+setPh.value).toFixed(1);
  if (input == 0.0) {
    buttonSend(
      wantedTemp.textContent,
      wantedPh.textContent,
      wantedRpm.textContent
    );
    return;
  }
  if (input > 10 || input <= 0) {
    alert("Invalid Input: (0 - 10)");
    setPh.value = "";
    return;
  }
  e.preventDefault();
  wantedPh.textContent = input;
  buttonSend(
    wantedTemp.textContent,
    wantedPh.textContent,
    wantedRpm.textContent
  );
  setPh.value = "";
});

// RPM
go3.addEventListener("click", function (e) {
  const input = +setRpm.value;
  if (input == 0.0) {
    buttonSend(
      wantedTemp.textContent,
      wantedPh.textContent,
      wantedRpm.textContent
    );
    return;
  }
  if (input > 2000 || input <= 0) {
    alert("Invalid Input: (0 - 2000)");
    setRpm.value = "";
    return;
  }
  e.preventDefault();
  wantedRpm.textContent = input;
  buttonSend(
    wantedTemp.textContent,
    wantedPh.textContent,
    wantedRpm.textContent
  );
  setRpm.value = "";
});

// graph api
// using canvasjs

// some temporary variables here pls

var tempDPS = [];
var phDPS = [];
var rpmDPS = [];

socket.addEventListener("message", (event) => {
  const receivedDataJSON = event.data;
  const receivedData = JSON.parse(receivedDataJSON);

  // handle problems lmao
  const receivedMethod = `${receivedData.method}`;
  if (receivedMethod !== "getDataResponse") {
    return;
  }

  const dataArr = receivedData.params.result.slice(0, 10);

  tempDPS = [
    { x: 1, y: dataArr[0].temperature },
    { x: 2, y: dataArr[1].temperature },
    { x: 3, y: dataArr[2].temperature },
    { x: 4, y: dataArr[3].temperature },
    { x: 5, y: dataArr[4].temperature },
    { x: 6, y: dataArr[5].temperature },
    { x: 7, y: dataArr[6].temperature },
    { x: 8, y: dataArr[7].temperature },
    { x: 9, y: dataArr[8].temperature },
    { x: 10, y: dataArr[9].temperature },
  ];

  phDPS = [
    { x: 1, y: dataArr[0].ph },
    { x: 2, y: dataArr[1].ph },
    { x: 3, y: dataArr[2].ph },
    { x: 4, y: dataArr[3].ph },
    { x: 5, y: dataArr[4].ph },
    { x: 6, y: dataArr[5].ph },
    { x: 7, y: dataArr[6].ph },
    { x: 8, y: dataArr[7].ph },
    { x: 9, y: dataArr[8].ph },
    { x: 10, y: dataArr[9].ph },
  ];

  rpmDPS = [
    { x: 1, y: dataArr[0].rpm },
    { x: 2, y: dataArr[1].rpm },
    { x: 3, y: dataArr[2].rpm },
    { x: 4, y: dataArr[3].rpm },
    { x: 5, y: dataArr[4].rpm },
    { x: 6, y: dataArr[5].rpm },
    { x: 7, y: dataArr[6].rpm },
    { x: 8, y: dataArr[7].rpm },
    { x: 9, y: dataArr[8].rpm },
    { x: 10, y: dataArr[9].rpm },
  ];

  startGraphs();
});

// temp chart //////////////////////////////////////////////

// window.onload = function () {
var startGraphs = function () {
  // var tempDPS = [
  //   { x: 1, y: 0 },
  //   { x: 2, y: 0 },
  //   { x: 3, y: 0 },
  //   { x: 4, y: 0 },
  //   { x: 5, y: 0 },
  //   { x: 6, y: 0 },
  //   { x: 7, y: 0 },
  //   { x: 8, y: 0 },
  //   { x: 9, y: 0 },
  //   { x: 10, y: 0 },
  // ]; //dataPoints.

  var chart = new CanvasJS.Chart("myChart", {
    title: {
      text: "Temperature",
    },
    axisX: {
      title: "Time",
    },
    axisY: {
      title: "DegC",
    },
    data: [
      {
        type: "line",
        dataPoints: tempDPS,
      },
    ],
  });

  chart.render();
  var tempxVal = tempDPS.length + 1;
  var tempyVal = 15;
  var tempupdateInterval = 1000;

  var updateTempChart = function () {
    tempyVal = receivedTemp;
    tempDPS.push({ x: tempxVal, y: tempyVal });

    tempxVal++;
    if (tempDPS.length > 10) {
      tempDPS.shift();
    }

    chart.render();

    // update chart after specified time.
  };

  setInterval(function () {
    updateTempChart();
  }, tempupdateInterval);

  ////////////////////////////////////////////////////

  // var phDPS = [
  //   { x: 1, y: 0 },
  //   { x: 2, y: 0 },
  //   { x: 3, y: 0 },
  //   { x: 4, y: 0 },
  //   { x: 5, y: 0 },
  //   { x: 6, y: 0 },
  //   { x: 7, y: 0 },
  //   { x: 8, y: 0 },
  //   { x: 9, y: 0 },
  //   { x: 10, y: 0 },
  // ]; //dataPoints.

  var chart1 = new CanvasJS.Chart("myChart1", {
    title: {
      text: "pH",
    },
    axisX: {
      title: "Time",
    },
    axisY: {
      title: "pH",
    },
    data: [
      {
        type: "line",
        dataPoints: phDPS,
      },
    ],
  });

  chart1.render();
  var phxVal = phDPS.length + 1;
  var phyVal = 15;
  var phupdateInterval = 1000;

  var updatePhChart = function () {
    phyVal = receivedPh;
    phDPS.push({ x: phxVal, y: phyVal });

    phxVal++;
    if (phDPS.length > 10) {
      phDPS.shift();
    }

    chart1.render();

    // update chart after specified time.
  };

  setInterval(function () {
    updatePhChart();
  }, phupdateInterval);

  //////////////////////////////////////////////////////

  // var rpmDPS = [
  //   { x: 1, y: 0 },
  //   { x: 2, y: 0 },
  //   { x: 3, y: 0 },
  //   { x: 4, y: 0 },
  //   { x: 5, y: 0 },
  //   { x: 6, y: 0 },
  //   { x: 7, y: 0 },
  //   { x: 8, y: 0 },
  //   { x: 9, y: 0 },
  //   { x: 10, y: 0 },
  // ]; //dataPoints.

  var chart2 = new CanvasJS.Chart("myChart2", {
    title: {
      text: "RPM",
    },
    axisX: {
      title: "Time",
    },
    axisY: {
      title: "RPM",
    },
    data: [
      {
        type: "line",
        dataPoints: rpmDPS,
      },
    ],
  });

  chart2.render();
  var rpmxVal = rpmDPS.length + 1;
  var rpmyVal = 15;
  var rpmupdateInterval = 1000;

  var updateRpmChart = function () {
    rpmyVal = receivedRpm;
    rpmDPS.push({ x: rpmxVal, y: rpmyVal });

    rpmxVal++;
    if (rpmDPS.length > 10) {
      rpmDPS.shift();
    }

    chart2.render();

    // update chart after specified time.
  };

  setInterval(function () {
    updateRpmChart();
  }, rpmupdateInterval);
};
