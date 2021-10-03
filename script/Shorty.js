class Shorty {
  constructor(data, ui) {
    Object.assign(this, data);
    this.stage = null;
    /*
    original YDKJ 4 stages are:
    • read category (big and centered)
    • anounce prize money (big and centered)
    • move category and prize money to edge
    • do introduction (optional, no text)
    • read question (display question, wait 2 seconds, display answers)
    • read answers
    • wait for input (music playing, timer running)
    • comment on answer or comment on no answer at all (optional, no text)
    • outro (optional, usually a quote, no text)
    */
    this.background_id = Math.floor(Math.random()*15)+1;
    this.ui = ui;
  }
  advanceQuestion() {
    this.currentSoundURL = "";
    this.currentTexts = [];
    if (this.stage === null) {
      this.stage = 'category';
      this.currentTexts = [this.category];
      this.currentSoundURL = `questions/shorties/${this.id}/A01.mp3`;
    } else if (this.stage == 'category' && this.audio.A02) {
      this.stage = 'intro';
      this.currentSoundURL = `questions/shorties/${this.id}/A02.mp3`;
    } else if (this.stage == 'intro' || this.stage == 'category') {
      this.stage = 'question';
      this.currentTexts = [this.question];
      this.currentSoundURL = `questions/shorties/${this.id}/A03.mp3`;
    } else if (this.stage == 'question') {
      this.stage = 'answers';
      this.currentTexts = [this.a1, this.a2, this.a3, this.a4];
      this.currentSoundURL = `questions/shorties/${this.id}/A05.mp3`;
      this.ui.showCountdown(true);
    } else if (this.stage == 'answers' || this.stage == 'comment') {
      this.stage = 'fill';
      this.currentSoundURL = `mus/G04I${pad00(this.background_id)}/fill.mp3`;
      // TODO: use a cool sound engine without gap in playback between fill and countdown
    } else if (this.stage == 'fill') {
      this.stage = 'countdown';
      this.currentSoundURL = `mus/G04I${pad00(this.background_id)}/countdown.mp3`;
    } else if (this.stage == 'countdown') {
      this.stage = 'timeout';
      let r = Math.floor(Math.random()*14)+1;
      this.currentSoundURL = `gen/C/c29/G04c29${pad00(r)}.mp3`;
    } else if (this.stage == 'timeout' && this.audio.A11) {
      // specific reveal of answer
      // TODO: irgendwas stimmt hier noch nicht. hört sich komisch an.
      this.stage = 'reveal';
      this.currentSoundURL = `questions/shorties/${this.id}/A11.mp3`;
      this.ui.highlightCorrectAnswer();
    } else if (this.stage == 'timeout') {
      // generic bridge to reveal of answer
      this.stage = 'bridge_reveal';
      let r = Math.floor(Math.random()*15)+1;
      this.currentSoundURL = `gen/C/c28/G04c28${pad00(r)}.mp3`;
    } else if (this.stage == 'bridge_reveal') {
      this.stage = 'reveal';
      this.currentSoundURL = `questions/shorties/${this.id}/A06.mp3`;
      this.ui.highlightCorrectAnswer();
    } else if (['reveal', 'solved'].includes(this.stage) && this.audio.A07 && this.audio.A06) {
      this.stage = 'outro';
      this.currentSoundURL = `questions/shorties/${this.id}/A07.mp3`;
    } else if (['reveal', 'solved', 'outro'].includes(this.stage)) {
      this.stage = 'finished';
      this.ui.showCountdown(false);
    } else {
      console.log('invalid question state while advancing question', this.stage);
    }
  }
  answer(answerIndex) {
    if (['answers', 'fill', 'countdown'].includes(this.stage)) {
      // only process events during appropriate stages
      if (answerIndex == 0) {
        // answerIndex 0 denotes the correct answer
        this.stage = 'solved';
        if (this.audio.A06) {
          // some questions do not have the "correct answer" comment
          this.currentSoundURL = `questions/shorties/${this.id}/A06.mp3`;
        } else {
          // I just hope they at least have an outro
          this.currentSoundURL = `questions/shorties/${this.id}/A07.mp3`;
        }
        return true;
      } else {
        this.stage = 'comment';
        let soundApplication = 'A0'+(7+answerIndex);
        if (this.audio[soundApplication]) {
          // play specific "wrong answer" comment
          this.currentSoundURL = `questions/shorties/${this.id}/${soundApplication}.mp3`;
        } else {
          // play generic "wrong answer" comment
          let r = Math.floor(Math.random()*85)+1;
          r = ('00'+r).slice(-2);
          this.currentSoundURL = `gen/C/c20/G04c20${r}.mp3`;
        }
        return false;
      }
    } else {
      return null;
    }
  }
}
