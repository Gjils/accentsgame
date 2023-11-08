document.addEventListener("DOMContentLoaded", () => {
	function shuffle(array) {
		array.sort(() => Math.random() - 0.5);
	}
	fetch("words.json")
		.then((words) => words.json())
		.then((words) => {
			// Перемешиваю массив слов
			shuffle(words);
			// Выбираю элементы с которыми буду работать
			const wordBlock = document.querySelector(".word");
			const bodyBlock = document.querySelector("body");
			const nextButton = document.querySelector(".next");
			const infoBlock = document.querySelector(".info");
			// const countdownBlock = document.querySelector(".countdown")

			// Создаю счетчик ответов с замыканием
			function createCounter() {
				let correct = 0,
					common = 0,
					streak = 0;
				// Функция, обновляющая счет при верном ответе
				function addRight() {
					correct += 1;
					common += 1;
					streak += 1;

					// Меняю счет с анимациями
					correctBlock = this.querySelector(".count-correct");
					correctBlock.innerHTML = `${correct}`;

					commonBlock = this.querySelector(".count-common");
					commonBlock.innerHTML = `${common}`;

					rateBlock = this.querySelector(".rate-count");
					rateBlock.innerHTML = `${Math.floor((correct / common) * 100)}`;

					// Обновляю или показываю серию
					if (streak >= 3) {
						streakCountBlock = this.querySelector(".streak-count");
						streakBlock = this.querySelector(".streak");

						streakCountBlock.innerHTML = `${streak}`;

						streakBlock.classList.remove("hidden");
						streakBlock.classList.add("appear");
					}
				}
				// Функция, обновляющая счет при неверном ответе
				function addWrong() {
					common += 1;
					streak = 0;

					// Меняю счет с анимациями
					commonBlock = this.querySelector(".count-common");
					commonBlock.innerHTML = `${common}`;

					rateBlock = this.querySelector(".rate-count");
					rateBlock.innerHTML = `${Math.floor((correct / common) * 100)}`;

					// Скрываю серию
					streakCountBlock = this.querySelector(".streak-count");
					streakBlock = this.querySelector(".streak");

					streakCountBlock.innerHTML = `${streak}`;

					streakBlock.classList.add("shaking");
					setTimeout(() => {
						streakBlock.classList.remove("shaking");
						streakBlock.classList.add("hidden");
					}, 300);
				}
				return [addRight, addWrong];
			}

			// wordBlock.startCountdown = function() {
			// 	if (wordBlock.countdown) {
			// 		setTimeout("")
			// 	} 
			// }
			// Дестуктуризирую массив с функциями полученный функции создания счетчиков и записываю данные из него в методы блока с информацией
			[infoBlock.addRight, infoBlock.addWrong] = createCounter();

			// Функция срабатывающая при нажатии на букву
			wordBlock.submit = function (event) {
				// Проверяю что нажата именно буква и она гласная
				if (event.target.classList.contains("vow")) {
					// Если буква выбрана верно
					if (event.target.index === wordBlock.wordInfo.correct) {
						wordBlock.correctChoice();
						// Если буква выбрана неверно
					} else {
						wordBlock.incorrectChoice(event.target.index);
					}
				}
			};

			// Функция очищающая блок для того чтобы загрузить следующее слово
			wordBlock.clearBlock = function () {
				// Отключаю возможность нажимать кнопку во время анимации исчезновения (защита от множественных кликов)
				nextButton.setAttribute("disabled", "");
				// Удаляю остаточные классы с элементов
				wordBlock.classList.remove("shaking");
				wordBlock.classList.remove("appear");
				nextButton.classList.remove("appear");
				// Добавляю классы анимации исчезновения
				wordBlock.classList.add("disapear");
				nextButton.classList.add("disapear");
				// Послностью очищаю блок со словом, скрываю кнопку, а также удаляю классы анимации исчезновения после выполнения анимации
				setTimeout(() => {
					wordBlock.innerHTML = "";
					nextButton.classList.add("hidden");
					nextButton.removeAttribute("disabled");
					wordBlock.classList.remove("disappear");
					nextButton.classList.remove("disappear");
				}, 160);
			};

			// Вешаю обработчик событий на кнопку, которая будет переключать слова
			nextButton.addEventListener("click", wordBlock.clearBlock);
			// Вешаю обработчик событий, который будет отслеживать нажатия на буквы
			bodyBlock.addEventListener("click", wordBlock.submit);

			// Функция, которая строит слово в блоке
			wordBlock.buildBlock = function (wordInfo) {
				// Создаю внутри блока объект, который содержит информацию о слове
				this.wordInfo = wordInfo;
				// Размещаю буквы в блоке, помечаю их как гласные и согласные
				let wordArr = Array.from(this.wordInfo.word);
				wordArr.forEach((letter, i) => {
					let letterBlock = document.createElement("button");
					letterBlock.classList.add("letter", "active");
					letterBlock.index = i;
					letterBlock.innerHTML = letter;
					if ("бвгджзйклмнпрстфхцчшщ".includes(letter)) {
						letterBlock.classList.add("cons");
					}
					if ("аеёиоуыэюя".includes(letter)) {
						letterBlock.classList.add("vow");
					}
					this.append(letterBlock);
				});
				// Добавляю контекст (если он есть)
				if (this.wordInfo.context != "") {
					let contextElem = document.createElement("div");
					contextElem.classList.add("context");
					contextElem.innerHTML = `(${wordBlock.wordInfo.context})`;
					wordBlock.append(contextElem);
				}
				// Добавляю класс анимации появления
				wordBlock.classList.add("appear");
			};

			// Функция отключаящая анимации при наведении и возможность выбора ответа после выбора ответа
			wordBlock.makeInactive = function () {
				this.childNodes.forEach((letter) => {
					letter.classList.remove("active");
					letter.setAttribute("disabled", "");
				});
			};

			// Функция помечающая верную букву и удаляющая слово, если буква выбрана верно
			wordBlock.correctChoice = function () {
				this.makeInactive();
				this.childNodes[this.wordInfo.correct].classList.add("correct");
				// Даю понять счетчику, что слово введено верно (костыль)
				this.status = 0;
				// Обновляю счет
				infoBlock.addRight();

				// Запускаю очистку блока
				this.clearBlock();
			};

			// Функция помечающая верную и неврную букву, а такжже показывающая кнопку для переключения слова, если буква выбрана неверно
			wordBlock.incorrectChoice = function (chosenIndex) {
				this.makeInactive();
				// Удаляю прошлый класс анимации
				this.classList.remove("appear");
				// Добавляю анимацияю тряски
				this.classList.add("shaking");
				// Помечаю верную букву
				this.childNodes[this.wordInfo.correct].classList.add("correct");
				// Помечаю неверную букву
				this.childNodes[chosenIndex].classList.add("incorrect", "appear");
				// Показываю кнопку
				nextButton.classList.remove("hidden");
				nextButton.classList.add("appear");
				// Даю понять счетчику, что слово введено неверно (костыль)
				this.status = 1;
				// Обновляю счет
				infoBlock.addWrong();
			};

			// Строю первое слово
			wordBlock.buildBlock(words[0]);

			// Функция наблюдатель, сменяющая слово в массиве
			const childNodesObserver = new MutationObserver(() => {
				// Проверяю что выбран верный случай
				if (wordBlock.innerHTML != "") {
					return;
				}
				// Если выбана верная буква
				if (wordBlock.status == 0) {
					// Выкидываю элемент из начала массива и добавляю в конец (список подходит для моих целей лучше, но мне лень)
					words.push(words[0]);
					words.shift();
				} else if (wordBlock.status == 1) {
					// Выкидываю элемент из начала массива и на 15 позицию
					words.splice(15, 0, words[0]);
					words.shift();
				}
				wordBlock.buildBlock(words[0]);
			});
			// Говорю наблюдателю наблюдать за изменением блока со словом
			childNodesObserver.observe(wordBlock, { childList: true });
		});
});
