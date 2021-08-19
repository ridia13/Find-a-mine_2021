'use strict';

const $time = document.querySelector('#js-time');
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
  OPENED: 0, // 0~8 열린 칸
}
let data = [];
let openCount = 0;
const startTime = new Date();
const interval = setInterval(() => {
  const time = Math.floor(((new Date() - startTime) / 1000));
  $time.textContent = `Timer: ${time}s`;
}, 1000);

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
        // $td.textContent = 'X'; //개발 편의를 위해(지뢰 위치)
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

function open(rowIndex, cellIndex) {
  const target = $tbody.children[rowIndex]?.cells[cellIndex];
  if (!target)return;//target 칸 없을 경우
  if(data[rowIndex][cellIndex] >= CODE.OPENED)return;//이미 열린 칸일 경우
  
  openCount++;
  console.log(openCount);

  const count = $tbody.children[rowIndex] ?.cells[cellIndex] && countMine(rowIndex, cellIndex);
  data[rowIndex][cellIndex] = count;
  target.textContent = count || '';
  target.className = 'opened';

  if(openCount === ROW*CELL - MINE){//모든칸 열었나?
    const endTime = new Date();
    const time = Math.floor((endTime - startTime) /1000);
    clearInterval(interval);
    $tbody.removeEventListener('contextmenu', onRightClick); //버블링
    $tbody.removeEventListener('click', onLeftClick); //버블링
    setTimeout(() => {//이겼다고 표시
      alert(`You win!🎉 It took ${time} seconds.`);
    }, 500);
  };
  return count;
}

function openAround(rI, cI) { //target 주변 칸이 있는가
  setTimeout(() => {
    const count = open(rI, cI); //주변 지뢰o 경우
    if (count === 0) { //주변 지뢰x 경우
      //주변 칸 같이 열수 o 연다(해당 칸 기준 aroundTarget)
      openAround(rI - 1, cI - 1);
      openAround(rI - 1, cI);
      openAround(rI - 1, cI + 1);
      openAround(rI, cI - 1);
      openAround(rI, cI + 1);
      openAround(rI + 1, cI - 1);
      openAround(rI + 1, cI);
      openAround(rI + 1, cI + 1);
    }
  }, 0);
}

function onLeftClick(e) {
  e.preventDefault();
  const target = e.target;
  const rowIndex = target.parentNode.rowIndex;
  const cellIndex = target.cellIndex;
  const cellData = data[rowIndex][cellIndex];
  if (cellData === CODE.NORMAL) { //닫힌 칸이면 
    openAround(rowIndex, cellIndex);
  } else if (cellData === CODE.MINE) { //지뢰 칸이면
    target.textContent = '💣';
    target.className = 'opened';
    $tbody.removeEventListener('contextmenu', onRightClick); //버블링
    $tbody.removeEventListener('click', onLeftClick); //버블링
    clearInterval(interval);
  } // 깃발,물을표 무시

}

function init() {
  drawTable();
}
init();