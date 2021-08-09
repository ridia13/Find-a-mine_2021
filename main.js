'use strict';

const ROW = 10;
const CELL = 10;
const MINE = 10;
const $tbody = document.querySelector('#table tbody');
const CODE = {
  MINE: -1,
  NORMAL: -2,
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

  const shuffle = [];//26
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

  for(let k = 0; k < shuffle.length; k++){
    const ver = Math.floor(shuffle[k] / CELL);//row 위치
    const hor = shuffle[k] % CELL;//cell 위치
    data[ver][hor] = CODE.MINE;
  }
  return data;
}

function drawTable() {
  data = plantMine();
  data.forEach((row,i,arr) => {
    const $tr = document.createElement('tr');
    $tbody.append($tr);
    row.forEach((cell,i,arr) => {
      const $td = document.createElement('td');
      $tr.append($td);
      if(cell === CODE.MINE){
        $td.textContent = 'X';//개발 편의를 위해(지뢰 위치)
      }
    })
  })
  
}

function init() {
  drawTable();
}
init();