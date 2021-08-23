'use strict';

const $form = document.querySelector('#js-form'),
  $row = $form.querySelector('#js-row'),
  $cell = $form.querySelector('#js-cell'),
  $mine = $form.querySelector('#js-mine');
const $msg = document.querySelector('#js-msg');
const $tbody = document.querySelector('#table tbody');
const $time = document.querySelector('#js-time');
let ROW = 0;
let CELL = 0;
let MINE = 0;
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
let startTime;
let interval;

function onSubmit(e){
  e.preventDefault();
  const rowNum = $row.value; 
  const cellNum = $cell.value; 
  const mineNum = $mine.value; 
  // 값이 0보다 작같이나 값이 없나?
  // 경고 msg + return
  // 각각 값 저장
  if(rowNum <= 0 || rowNum === undefined || cellNum <= 0 || cellNum === undefined){
    $msg.textContent = '값입력해';
    return;
  }else{
    ROW = rowNum;
    CELL = cellNum;
    console.log(ROW);
    console.log(CELL);
  }
  // 숫자가 0보다 작같거나 값이 없거나 row*cell 개수보다 많은가?
  // 경고 msg + return
  // 값을 mine에 입력 후 화면 전환
  if(mineNum <= 0 || mineNum === undefined || mineNum > ROW*CELL){
    $msg.textContent = '경고';
    return;
  }else{
    MINE = mineNum;
    console.log(MINE);
    $msg.style.display = 'none';
    startTime = new Date();
    interval = setInterval(() => {//타이머
      const time = Math.floor(((new Date() - startTime) / 1000));
      $time.textContent = `Timer: ${time}s`;
    }, 1000);
    $tbody.innerHTML = '';
    drawTable();
  }
}

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

const dev = true;//개발 편의를 위해(지뢰 위치)
function drawTable() {
  data = plantMine();
  data.forEach((row, i, arr) => {
    const $tr = document.createElement('tr');
    $tbody.append($tr);
    row.forEach((cell, i, arr) => {
      const $td = document.createElement('td');
      $tr.append($td);
      if (cell === CODE.MINE) {
        dev && ($td.textContent = 'X'); 
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
    console.log('open');
    const endTime = new Date();
    const time = Math.floor((endTime - startTime) /1000);
    openCount = 0;
    clearInterval(interval);
    $tbody.removeEventListener('contextmenu', onRightClick); //버블링
    $tbody.removeEventListener('click', onLeftClick); //버블링
    setTimeout(() => {//이겼다고 표시
      alert(`You win!🎉 It took ${time} seconds.`);
    }, 100);
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
    openCount = 0;
    clearInterval(interval);
    $tbody.removeEventListener('contextmenu', onRightClick); //버블링
    $tbody.removeEventListener('click', onLeftClick); //버블링
  } // 깃발,물을표 무시

}

function init() {
  $form.addEventListener('submit', onSubmit);
}
init();

// 첫 클릭 시 지뢰 피하기

// 처음 클릭인가
// y 클릭한 자리가 지뢰인가
  // y 주변 지뢰가 아닌 자리로 옮긴다
  // n 대기
// n return