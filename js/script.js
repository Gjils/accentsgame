document.addEventListener("DOMContentLoaded", () => {
  function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
  }
  fetch("../words.json")
  .then(data => data.json())
  .then(data => {
    shuffle(data)
    class Block {
      constructor(wordInfo, wordBlock) {
        this.word = wordInfo.word
        wordBlock.correct = wordInfo.correct
        this.context = wordInfo.context
      }

      buildBlock() {
        wordBlock.classList.add("word")
        wordBlock.classList.add("appear")
        let wordArr = Array.from(this.word)
        wordBlock.makeInactive = function() {
          wordBlock.childNodes.forEach(i => {
            i.classList.remove("active")
          })
        wordBlock.closeElem = function() {
          document.querySelector(".next").removeEventListener
          ("click", wordBlock.closeElem)
          wordBlock.classList.remove("shaking")
          wordBlock.classList.remove("appear")
          wordBlock.classList.add("disapear")
          document.querySelector(".next").classList.remove("appear")
          document.querySelector(".next").classList.add("disapear")
          setTimeout(() => {
            wordBlock.innerHTML = ""
            wordBlock.classList.remove("disapear")
            document.querySelector(".next").classList.remove("disappear")
            document.querySelector(".next").classList.add("hidden")
          }, 190)
          }
        }
        wordBlock.correctChoice = function() {
          this.makeInactive()
          wordBlock.childNodes[this.correct].classList.add("correct")
          wordBlock.status = 0
          wordBlock.closeElem()
        }
        wordBlock.incorrectChoice = function(ind) {
          wordBlock.classList.remove("appear")
          wordBlock.classList.add("shaking")
          this.makeInactive()
          wordBlock.childNodes[this.correct].classList.add("correct")
          wordBlock.childNodes[ind].classList.add("incorrect")
          document.querySelector(".next").classList.remove("hidden")
          document.querySelector(".next").classList.add("appear")
          document.querySelector(".next").addEventListener
          ("click", wordBlock.closeElem)
          wordBlock.status = 1
        }
        wordBlock.submit = function(event) {
          if (event.target.classList.contains("char") && (event.target.classList.contains("vow"))) {
            wordBlock.removeEventListener("click", this.submit)
            if (event.target.index === this.correct) {
              this.correctChoice()
            }
            else {
              this.incorrectChoice(event.target.index)
            }
          }
        }
        wordBlock.addEventListener("click", wordBlock.submit)
        wordArr.forEach((i, n) => {
          let char = document.createElement("div")
          char.classList.add("char", "active")
          char.index = n
          char.innerHTML = i
          if ("бвгджзйклмнпрстфхцчшщ".includes(i)) {
            char.classList.add("cons")
          }
          if ("аеёиоуыэюя".includes(i)) {
            char.classList.add("vow")
          }
          wordBlock.append(char)
        });
        if (this.context != "") {
          let contextElem = document.createElement("div")
          contextElem.classList.add("context")
          contextElem.innerHTML = `(${this.context})`
          wordBlock.append(contextElem)
        }
      }

      
    }
    const wordBlock = document.querySelector(".word")
    let right = 0
    let common = 0
    new Block(data[0], wordBlock).buildBlock()
    document.querySelector(".info").innerHTML = `
    <div class="count">${right}/${common}</div>
    <div class="rate">${Math.floor((right / 1)*100)}%</div>`
    let observeChildNodes = new MutationObserver(() => {
      if (wordBlock.innerHTML != "") {
        return
      }
      if (wordBlock.status == 0) {
        data.push(data[0])
        data.shift()
        right += 1
        common += 1
      }
      else if (wordBlock.status == 1) {
        data.splice(15, 0, data[0])
        data.shift()
        common += 1
      }
      document.querySelector(".info").innerHTML = `
        <div class="count">${right}/${common}</div>
        <div class="rate">${Math.floor((right / common)*100)}%</div>`
      new Block(data[0], wordBlock).buildBlock()});
    observeChildNodes.observe(wordBlock, {childList: true})
  })
})