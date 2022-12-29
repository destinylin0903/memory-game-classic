const GAME_STATE = { //設定遊戲狀態
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
};

const Symbols = [
  //此處Symbol常數儲存的資料不會變動，所以用大寫字母表現這個特性
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png", // 黑桃
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png", // 愛心
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png", // 方塊
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png", // 梅花
];

const view = {
  //將函式包在名為view的物件中
  getCardContent(index) {
    //點擊時回傳數字跟花色
    const number = this.transformNumber((index % 13) + 1);
    const symbol = Symbols[Math.floor(index / 13)];

    return `
    <p>${number}</p>
    <img src="${symbol}" alt="">
    <p>${number}</p>
    `;
  },

  getCardElement(index) {
    //負責生成卡片，初始化時渲染背景的花色
    return `  <div data-index="${index} "class="card back"></div>`;
  },

  displayCards(indexes) {
    //負責選出#cards並抽換內容
    const rootElement = document.querySelector("#cards");
    rootElement.innerHTML = indexes.map((index) => this.getCardElement(index)).join("");
  },

  transformNumber(number) {
    switch (number) {
      case 1:
        return "A";
      case 11:
        return "J";
      case 12:
        return "Q";
      case 13:
        return "K";
      default:
        return number;
    }
  },

  flipCards(...cards) { //... 只有一個值的時候會被變成陣列，如果有兩個以上的值則是會被展開運算
    cards.map(card => {
    if (card.classList.contains("back")) {
      //回傳正面
      card.classList.remove("back");
      card.innerHTML = this.getCardContent(Number(card.dataset.index));
      return;
    }

    //回傳背面
    card.classList.add("back");
    card.innerHTML = null;
    })
  },
  
  pairedCards(...cards) {
    cards.map(card => {
    card.classList.add('paired')
    })
  },

  renderScore(score) {
    document.querySelector('.score').textContent = `Score: ${score}`
  },

  renderTriedTimes(times) {
    document.querySelector('.tried').textContent = `You've tried: ${times} times`;
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => {
        event.target.classList.remove('wrong'), {once: true}
      })
    })
  },

  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
    <p>Complete!</p>
    <p>Score: ${model.score}</p>
    <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }

};

const utility = { //洗牌
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys());
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [
        number[randomIndex],
        number[index],
      ];
    }
    return number;
  },
};

const controller = { //所有程式動作由controller統一發派
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() { //呈現洗好52張牌的樣子
    view.displayCards(utility.getRandomNumberArray(52))
  },

  dispatchCardAction (card) { //調度牌
    if (!card.classList.contains('back')) {
      return
    }

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break

      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++ model.triedTimes) //++寫在變數前面會先遞增再回傳，寫在後面會先回傳原本的值才遞增
        view.flipCards(card)
        model.revealedCards.push(card)

        //判斷是否配對成功
        if (model.isRevealedCardsMatched()) {
          //配對成功
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairedCards(...model.revealedCards)
          if (model.score === 260) {
            console.log ('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          model.revealedCards = []
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          //配對失敗 停頓1秒讓玩家可以記憶牌卡
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        break
    }

  }
  console.log("this.currentState:", this.currentState);
  console.log(
    "revealedCards:",
    model.revealedCards.map((card) => card.dataset.index)
  );
  },

  resetCards() {
    view.flipCards(...model.revealedCards);
    model.revealedCards = [];
    controller.currentState = GAME_STATE.FirstCardAwaits;
  }
}

const model = {
  revealedCards: [], //暫存牌組，用來比對兩張卡片有沒有一樣，比對完後需要清空

  isRevealedCardsMatched() { //比較兩張牌的數字有沒有一樣
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },

  score: 0,
  triedTimes: 0,
}

controller.generateCards();

document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", (event) => {
    controller.dispatchCardAction(card);
  });
});


