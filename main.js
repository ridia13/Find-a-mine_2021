'use strict';

const ROW = 10;
const CELL = 10;
const MINE = 10;
const $tbody = document.querySelector('#table tbody');
const CODE = {
  MINE: -1,
  NORMAL: -2, //닫힌 칸
  FLAG: -3,
  FLAG_MINE: -4,
  QUESTION: -5,
  QUESTION_MINE: -6,
  OPENED: 0, // 0이상이면 다모두 열린 칸
}
let data = [];

function plantMine() {
  const candidate = Array(ROW * CELL).fill().map((value, index) => {
    return index;
  });

  const shuffle = []; //26
  while (candidate.length > ROW * CELL - MINE) {
    const random = Math.floor(Math.random() * candidate.length);
    const chosen = candidate.splice(random, 1)[0];
    shuffle.push(chosen);
  }

  const data = [];
  for (let i = 0; i < ROW; i++) {
    const rowData = [];
    data.push(rowData);
    for (let j = 0; j < CELL; j++) {
      data[i].push(CODE.NORMAL);
    }
  }

  for (let k = 0; k < shuffle.length; k++) {
    const ver = Math.floor(shuffle[k] / CELL); //row 위치
    const hor = shuffle[k] % CELL; //cell 위치
    data[ver][hor] = CODE.MINE;
  }
  return data;
}

function drawTable() {
  data = plantMine();
  data.forEach((row, i, arr) => {
    const $tr = document.createElement('tr');
    $tbody.append($tr);
    row.forEach((cell, i, arr) => {
      const $td = document.createElement('td');
      $tr.append($td);
      if (cell === CODE.MINE) {
        $td.textContent = 'X'; //개발 편의를 위해(지뢰 위치)
      }
    })
  })

  $tbody.addEventListener('contextmenu', onRightClick); //버블링
  $tbody.addEventListener('click', onLeftClick); //버블링
}

function onRightClick(e) {
  e.preventDefault();
  const target = e.target;
  const rowIndex = target.parentNode.rowIndex;
  const cellIndex = target.cellIndex;
  const cellData = data[rowIndex][cellIndex];
  if (cellData === CODE.NORMAL || cellData === CODE.MINE) { //닫힌 칸이면
    data[rowIndex][cellIndex] = cellData === CODE.MINE ? CODE.QUESTION_MINE : CODE.QUESTION; //물음표로
    target.className = 'question';
    target.textContent = '❔';
  } else if (cellData === CODE.QUESTION || cellData === CODE.QUESTION_MINE) { //물음표이면
    data[rowIndex][cellIndex] = cellData === CODE.QUESTION_MINE ? CODE.FLAG_MINE : CODE.FLAG; //깃발로
    target.className = 'flag';
    target.textContent = '🚩';
  } else if (cellData === CODE.FLAG || cellData === CODE.FLAG_MINE) { //깃발이면
    data[rowIndex][cellIndex] = cellData === CODE.FLAG_MINE ? CODE.MINE : CODE.NORMAL; //닫힌 칸으로
    target.className = '';
    target.textContent = '';
  }
  console.log(data);
}

function countMine(rowIndex, cellIndex) {
  const mines = [CODE.MINE, CODE.QUESTION_MINE, CODE.FLAG_MINE];
  let count = 0;
  //위없는 경우, 아래 없는 경우, 왼 없는 경우, 오 없는 경우  등

  mines.includes(data[rowIndex - 1]?.[cellIndex - 1]) && count++;
  mines.includes(data[rowIndex - 1]?.[cellIndex]) && count++;
  mines.includes(data[rowIndex - 1]?.[cellIndex + 1]) && count++;
  mines.includes(data[rowIndex][cellIndex - 1]) && count++;
  mines.includes(data[rowIndex][cellIndex + 1]) && count++;
  mines.includes(data[rowIndex + 1]?.[cellIndex - 1]) && count++;
  mines.includes(data[rowIndex + 1]?.[cellIndex]) && count++;
  mines.includes(data[rowIndex + 1]?.[cellIndex + 1]) && count++;
  return count;
}

function onLeftClick(e) {
  e.preventDefault();
  const target = e.target;
  const rowIndex = target.parentNode.rowIndex;
  const cellIndex = target.cellIndex;
  const cellData = data[rowIndex][cellIndex];
  if (cellData === CODE.MINE) { //지뢰 칸이면
    // boom!!
    // THE END
  } else if (cellData === CODE.NORMAL) { //닫힌 칸이면 
    const count = countMine(rowIndex, cellIndex);
    target.textContent = count || '';
    target.className = 'opened';
    data[rowIndex][cellIndex] = count;
    if (true) {
      return;
    } //주변 빈칸 없으면
    // 열 수 있는 주변칸 열기
    if (true) {
      return;
    } //모든 칸 다 열지 않았으면
    // 이겼다고 표시
    // THE END
  }
  // 나머지 무시
}

function init() {
  drawTable();
}
init();