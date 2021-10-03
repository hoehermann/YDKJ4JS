function new_random_question(ui) {
  // clear all display elements
  document.querySelectorAll('#shorty > div').forEach(e => e.innerHTML = '');
  // select random dataset
  let random_index = Math.floor(Math.random() * allTheShorties.length);
  // create object from dataset
  let question = new Shorty(allTheShorties[random_index], ui);
  //console.log(random_index, question);
  let dom_audio = document.getElementById('audio');
  dom_audio.oncanplay = () => {
    let dom_text = document.getElementById(question.stage);
    if (dom_text) {
      if (question.currentTexts.length == 1) {
        dom_text.innerHTML = question.currentTexts[0];
      } else {
        Array.from(question.order).forEach((answerIndex, orderIndex) => {
          answerIndex = parseInt(answerIndex)-1;
          let dom_answer = document.createElement('div');
          dom_answer.innerHTML = '<div class="number">'+(orderIndex+1)+'</div><div class="neutral text">'+question.currentTexts[answerIndex]+'</div>';
          let classList = dom_answer.querySelector('.text').classList;
          dom_answer.onclick = () => {
            let a = question.answer(answerIndex);
            if (a !== null) {
              dom_answer.onclick = null; // remove handler (inhibit double-clicking)
              dom_audio.src = question.currentSoundURL;
              if (a) {
                classList.add('correct');
              } else {
                classList.add('incorrect');
              }
              classList.remove('neutral');
            }
          };
          if (answerIndex == 0) { // TODO: move this check into question class
            question.ui.highlightCorrectAnswer = () => {
              classList.add('correct');
              classList.remove('neutral');
            };
          }
          dom_text.appendChild(dom_answer);
        });
      }
    }
    try {
      dom_audio.play();
    } catch (DOMException) {
      // ignore "autoplay disabled"
    }
  };
  // state machine shall change states whenever audio playback finishes
  dom_audio.onended = event => {
    question.advanceQuestion();
    if (question.currentSoundURL) {
      dom_audio.src = question.currentSoundURL;
    }
    if (question.stage == 'finished') {
      new_random_question(ui);
    }
  };
  // update question countdown based on audio time (only applicable during some question states)
  // TODO: only enable this callback when neccessary
  let dom_cube = document.getElementById('cube');
  dom_cube.onanimationend = () => {
    dom_cube.classList.remove('turn');
  }
  let update_cube_while_rotating = (innerHTML) => {
    let dom_back = dom_cube.querySelector('.back');
    let dom_front = dom_cube.querySelector('.front');
    window.setTimeout(() => {
      dom_back.innerHTML = innerHTML;
      dom_front.innerHTML = innerHTML;
    }, 400);
    dom_cube.classList.add('turn');
  }
  ui.showCountdown = (show) => {
    if (show) {
      dom_cube.style.display = 'block';
    } else {
      dom_cube.style.display = 'none';
      update_cube_while_rotating(10);
    }
  }
  let time_remaining = 10;
  dom_audio.ontimeupdate = timeupdate => {
    if (question.stage == 'countdown') {
      let tr = time_remaining;
      tr = 10 - Math.floor(dom_audio.currentTime);
      if (time_remaining != tr) {
        time_remaining = tr;
        update_cube_while_rotating(time_remaining);
      }
    }
  }
  // start with first state
  question.advanceQuestion();
  dom_audio.src = question.currentSoundURL;
};
