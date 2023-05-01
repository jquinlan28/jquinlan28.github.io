let osc, envelope;

let scaleArray = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83, 84];
// piano sample files from https://theremin.music.uiowa.edu/MISpiano.html
let filePaths = ['A3.mp3', 'Bb3.mp3', 'B3.mp3', 'C4.mp3', 'Db4.mp3', 'D4.mp3', 'Eb4.mp3', 'E4.mp3', 'F4.mp3', 
                 'Gb4.mp3', 'G4.mp3', 'Ab4.mp3', 'A4.mp3', 'Bb4.mp3', 'B4.mp3', 'C5.mp3', 'Db5.mp3', 'D5.mp3', 
                 'Eb5.mp3', 'E5.mp3', 'F5.mp3', 'Gb5.mp3', 'G5.mp3', 'Ab5.mp3', 'A5.mp3', 'Bb5.mp3', 'B5.mp3', 
                 'C6.mp3', 'Db6.mp3']
let A3, Bb3, B3, C4, Db4, D4, Eb4, E4, F4, 
    Gb4, G4, Ab4, A4, Bb4, B4, C5, Db5, D5, 
    Eb5, E5, F5, Gb5, G5, Ab5, A5, Bb5, B5,
    C6, Db6; 
let notesToPlay = [A3, Bb3, B3, C4, Db4, D4, Eb4, E4, F4, 
                   Gb4, G4, Ab4, A4, Bb4, B4, C5, Db5, D5, 
                   Eb5, E5, F5, Gb5, G5, Ab5, A5, Bb5, B5, 
                   C6, Db6];
let note = 0;
let note1 = 2;
let note2 = 4;
let note3 = 6;
let adjList = [[1, 2, 3, 4, 5, 6],
               [4, 5],
               [1, 3, 4, 5, 6],
               [0, 1, 4, 5],
               [0, 5, 6],
               [0, 6],
               [1, 3, 4]]

let stepUp = [0, 2, 4, 5, 7, 7, 9]
let isPlaying = false;
let justStartedPlaying = false;
let isMajor = false;
let curWidth = 20;
let curHeight = 20;
let curX = 120;
let curY = 530;
let goalX = curX;
let goalY = curY;
let curChordName = 0;
let curChordOrder = -1;
let slider, generateButton;
let bubbleButton, hexButton, pianoButton;
let sInput;
let tInput;
let visualizerMode = 0; // 0 = bubbles, 1 = hexagons, 2 = piano
let curColor = 0;
let song;
let song1;
let song2;

function sleep(millisecondsDuration)
{
  return new Promise((resolve) => {
    setTimeout(resolve, millisecondsDuration);
  })
}

function getMode(c) {
  return (c == 0 || c == 3 || c == 4 || c == 5);
}

function playChord(n, myKey) {
  osc3.stop();
  note = n;
  note1 = n + 2;
  note2 = note1 + 2;
  
  let midiValue = scaleArray[note] + myKey;
  let freqValue = midiToFreq(midiValue);
  osc.freq(freqValue);
        
  let midiValue1 = scaleArray[note1] + myKey;
  let freqValue1 = midiToFreq(midiValue1);
  osc1.freq(freqValue1);
        
  let midiValue2 = scaleArray[note2] + myKey;
  let freqValue2 = midiToFreq(midiValue2);
  osc2.freq(freqValue2);
  
  osc.start();
  osc1.start();
  osc2.start();
  envelope.play(osc, random() / 50, 0.1);
  envelope1.play(osc1, random() / 50, 0.1);
  envelope2.play(osc2, random() / 50, 0.1);
}


function playChordPiano(n, myKey, isV7) {
   let startNote = 3 + myKey + stepUp[n];
   let endNote = startNote + 7;
   let middleNote = startNote + (getMode(n) ? 4 : 3);
   notesToPlay[startNote].play();
   notesToPlay[endNote].play();
   notesToPlay[middleNote].play();
   if (isV7) {
     notesToPlay[startNote + 10].play();
   }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getNeighbors(node) {
  return shuffleArray(adjList[node]);
}

function findPathBFS(startNode, endNode, k) {
  if (k === 1) {
    return startNode === endNode ? [startNode] : [];
  }
  
  const queue = [];
  queue.push([startNode]);

  while (queue.length > 0) {
    const path = queue.shift();
    const node = path[path.length - 1];

    if (path.length === k && node === endNode) {
      return path;
    }

    if (path.length < k) {
      const neighbors = getNeighbors(node);
      for (const neighbor of neighbors) {
          queue.push([...path, neighbor]);
      }
    }

    // Get all neighbors of the current node
  }
  return [];
}

function findPathDFS(startNode, endNode, k) {
  if (k === 1) {
    return startNode === endNode ? [startNode] : [];
  }
  
  const stack = [];
  stack.push([startNode]);

  while (stack.length > 0) {
    const path = stack.shift();
    const node = path[path.length - 1];

    if (path.length === k && node === endNode) {
      return path;
    }

    if (path.length < k) {
      const neighbors = getNeighbors(node);
      for (const neighbor of neighbors) {
          stack.unshift([...path, neighbor]);
      }
    }

    // Get all neighbors of the current node
  }
  return [];
}

function findPathMeasures(start, measureLength, numMeasures) {
  let result = [];
  for (var i = 0; i < numMeasures; i++) {
    let toAdd = findPathBFS(start, start, measureLength + 1)
    result = result.concat(toAdd.slice(0, measureLength));
  }
  return result.concat([start]);
}

function playV7(myKey) {
  note = 4;
  note1 = 6;
  note2 = 8;
  note3 = 10;
  
  let midiValue = scaleArray[note] + myKey;
  let freqValue = midiToFreq(midiValue);
  osc.freq(freqValue);
        
  let midiValue1 = scaleArray[note1] + myKey;
  let freqValue1 = midiToFreq(midiValue1);
  osc1.freq(freqValue1);
        
  let midiValue2 = scaleArray[note2] + myKey;
  let freqValue2 = midiToFreq(midiValue2);
  osc2.freq(freqValue2);
  
  let midiValue3 = scaleArray[note3] + myKey;
  let freqValue3 = midiToFreq(midiValue3);
  osc3.freq(freqValue3);
  
  osc.start();
  osc1.start();
  osc2.start();
  osc3.start();
  envelope.play(osc, random() / 50, 0.1);
  envelope1.play(osc1, random() / 50, 0.1);
  envelope2.play(osc2, random() / 50, 0.1);
  envelope3.play(osc3, random() / 50, 0.1);
}

function indexToName(i) {
  const chords = ["I", "ii", "iii", "IV", "V", "V7", "vi"]
  return chords[i % 7];
}

function indexToKey(i) {
  const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  return keys[(i + 12) % 12];
}

function styleButton(button) {
  button.style('border-radius', '2px');
  button.style('border', '0.5px solid black');
  button.style('height', '21px');
}

function styleButtons() {
  let buttons = [bubbleButton, hexButton, pianoButton];
  buttons.forEach(styleButton);
}

function bubblePressed() {
  visualizerMode = 0;
  bubbleButton.style('background-color', 'green');
  hexButton.style('background-color', '#f0ecec');
  pianoButton.style('background-color', '#f0ecec');
  styleButtons();
  resetVisualizer();
}

function hexPressed() {
  visualizerMode = 1;
  bubbleButton.style('background-color', '#f0ecec');
  hexButton.style('background-color', 'green');
  pianoButton.style('background-color', '#f0ecec');
  styleButtons();
  resetVisualizer();
}

function pianoPressed() {
  visualizerMode = 2;
  bubbleButton.style('background-color', '#f0ecec');
  hexButton.style('background-color', '#f0ecec');
  pianoButton.style('background-color', 'green');
  styleButtons();
  resetVisualizer();
}


function resetBubbleText() {
  fill(200);
  text('I', 98, 155);
  text('ii', 198, 155);
  text('iii', 296, 155);
  text('IV', 394, 155);
  text('V', 145, 255);
  text('V7', 244, 255);
  text('vi', 345, 255);
}

function resetBubbles() {
  strokeWeight(1);
  stroke(51);
  fill('#bf2222');
  ellipse(100, 150, 50);
  ellipse(200, 150, 50);
  ellipse(300, 150, 50);
  ellipse(400, 150, 50);
  ellipse(150, 250, 50);
  ellipse(250, 250, 50);
  ellipse(350, 250, 50);
  resetBubbleText();
}

function resetPiano() {
  let h = 140;
  let w = 20;
  let startY = 180;
  let startX = 80;
  strokeWeight(1);
  stroke(0);
  
  // white keys
  fill(255);
  for (let i = 0; i < 18; i++) {
    rect(startX + w * i, startY, w, h);
  }
  
  // black keys
  fill(0);
  for (let i = 0; i < 17; i++) {
    if ((i + 5) % 7 != 2 && (i + 5) % 7 != 6) {
      rect(startX + w * (0.7 + i), startY, w * 0.6, h * 0.6);
    }
  }
}

function activateBubbles(cur) {
  resetBubbles();
  strokeWeight(1);
  stroke(51);
  fill("#0874fc");
  let x = 100 + (100 * (cur % 4) + 50 * Math.floor(cur / 4));
  ellipse(x, 150 + 100 * Math.floor(cur / 4), 50);
  resetBubbleText();
}

function isWhiteKey(pc) {
  return (pc >= 4 || pc % 2 == 0) && (pc <= 5 || pc % 2 == 1);
}

function getPianoOffset(myNote) {
  if (myNote < -1) return -2;
  let result = myNote;
  const thresholds = [0, 2, 5, 7, 9, 12, 14, 17];
  for (const th of thresholds) {
    if (myNote > th) result--;
  }
  return result;
}

function middleIsWhite(rootClass, isMajor) { // assumes root is also white
  if (isMajor) return rootClass == 0 || rootClass == 5 || rootClass == 7;
  else return rootClass == 2 || rootClass == 4 || rootClass == 9 || rootClass == 11;
}

function activatePiano(cur, myKey) {
  resetPiano();
  fill("green");
  let h = 140;
  let w = 20;
  let startY = 180;
  let startX = 80;
  let actualNote = myKey + stepUp[cur];
  let rootClass = ((actualNote + 12) % 12); // pitch class
  let isWhiteKeyRoot = isWhiteKey(rootClass);
  let isMajor = getMode(cur);
  let rootX = 0, fifthX = 0, middleX = 0, seventhX = 0;
  if (isWhiteKeyRoot) {
    // strokeWeight(1);
    // stroke(0);
    rootX = (startX + 2 * w) + getPianoOffset(actualNote) * w;
    rect(rootX, startY, w, h);
    if (rootClass != 11) {
      fifthX = rootX + 4 * w
      rect(fifthX, startY, w, h);
    }
    else rect(rootX + 4.7 * w, startY, w * 0.6, h * 0.6);

    if (middleIsWhite(rootClass, isMajor)) {
      middleX = rootX + 2 * w;
      rect(middleX, startY, w, h);
    }
    else rect(rootX + (1.7 + Number(isMajor)) * w, startY, w * 0.6, h * 0.6);

    if (cur == 5) {
      if (rootClass == 0 || rootClass == 5) rect(fifthX + 1.7 * w, startY, w * 0.6, h * 0.6);
      else {
        seventhX = rootX + 6 * w;
        rect(seventhX, startY, w, h)
      }
    }

    fill(0);
    for (let i = 0; i < 17; i++) {
      if ((i + 5) % 7 != 2 && (i + 5) % 7 != 6) {
        let plannedX = startX + w * (0.7 + i);
        if (abs(plannedX - rootX) < w || abs(plannedX - fifthX) < w 
            || abs(plannedX - middleX) < w || abs(plannedX - seventhX) < w) {
          rect(plannedX, startY, w * 0.6, h * 0.6);
        }
      }
    }
    
  } else {
    let slipLeft = (startX + 2 * w) + getPianoOffset(actualNote) * w;
    rootX = slipLeft + 0.7 * w;
    rect(rootX, startY, w * 0.6, h * 0.6);
    
    if (rootClass != 10) rect(rootX + 4 * w, startY, w * 0.6, h * 0.6);
    else {
      fifthX = rootX + 4.3 * w;
      rect(fifthX, startY, w, h);
    }

    if (isWhiteKey((rootClass + 3 + Number(isMajor)) % 12)) {
      middleX = rootX + (1.3 + Number(isMajor)) * w;
      rect(middleX, startY, w, h);
    } else {
      rect(rootX + 2 * w, startY, w * 0.6, h * 0.6);
    }

    if (cur == 5) {
      if (rootClass == 1 || rootClass == 6) {
        seventhX = rootX + 5.3 * w;
        rect(seventhX, startY, w, h);
      }
      else {
        rect(rootX + 6 * w, startY, w * 0.6, h * 0.6);
      }
    }

    fill(0);
    for (let i = 0; i < 17; i++) {
      if ((i + 5) % 7 != 2 && (i + 5) % 7 != 6) {
        let plannedX = startX + w * (0.7 + i);
        if (abs(plannedX - fifthX) < w || abs(plannedX - middleX) < w) {
          rect(plannedX, startY, w * 0.6, h * 0.6);
        }
      }
    }


  }
}

function hexagon(transX, transY, s, fillColor) {
  stroke(255);
  strokeWeight(5);
  fill(fillColor);
  push();
  translate(transX, transY);
  scale(s);
  beginShape();
  vertex(-75, -130);
  vertex(75, -130);
  vertex(150, 0);
  vertex(75, 130);
  vertex(-75, 130);
  vertex(-150, 0);
  endShape(CLOSE); 
  pop();
}

function resetHexagonText() {
  let stepY = 53;
  let startYs = [173, 146.5, 120, 146.5, 120, 146.5, 173];
  let colHeights = [4, 4, 5, 5, 5, 4, 4];
  let col1 = ["E", "A", "D", "G"];
  let col2 = ["G#/Ab", "C#/Db", "F#/Gb", "B"];
  let col3 = ["C", "F", "A#/Bb", "D#/Eb", "G#/Ab"];
  let col4 = ["A", "D", "G", "C", "F"];
  let col5 = ["C#/Db", "F#/Gb", "B", "E", "A"];
  let col6 = ["A#/Bb", "D#/Eb", "G#/Ab", "C#/Db"];
  let col7 = ["G", "C", "F", "A#/Bb"];
  let colTexts = [col1, col2, col3, col4, col5, col6, col7];
  fill(200);
  noStroke();
  textSize(20);
  let curText = "";

  for (var curCol = 0; curCol < 7; curCol++) {
    for (var curRow = 0; curRow < colHeights[curCol]; curRow++) {
      curText = colTexts[curCol][curRow];
      if (curText.length === 1) {
        textSize(20);
        text(curText, 102 + 46 * curCol, 8 + startYs[curCol] + curRow * stepY);
      } else {
        textSize(14);
        text(curText.substring(0, 2), 90 + 46 * curCol, -1 + startYs[curCol] + curRow * stepY);
        textSize(30);
        text("̸", 117 + 46 * curCol, 11 + startYs[curCol] + curRow * stepY);
        textSize(14);
        text(curText.substring(3), 111 + 46 * curCol, 12 + startYs[curCol] + curRow * stepY);
      }
    }
  }
}

function resetHexagons() {
  let stepY = 53;
  let stepX = 46;
  let startX = 110;
  let startYs = [173, 146.5, 120, 146.5, 120, 146.5, 173];
  let colHeights = [4, 4, 5, 5, 5, 4, 4];

  for (var curCol = 0; curCol < 7; curCol++) {
    for (var curRow = 0; curRow < colHeights[curCol]; curRow++) {
      hexagon(startX + stepX * curCol, startYs[curCol] + curRow * stepY, 0.2, "green");
    }
  }
  resetHexagonText();
}

function activateHexagons(cur, myKey) {
  let xCoords = [248, 340, 248, 202, 294, 248, 156, 248, 202, 294, 202, 294];
  let yCoords = [305.5, 305.5, 199.5, 279, 279, 305.5 + 53, 252.5, 252.5, 332, 332, 226, 226];
  resetHexagons();
  let actualNote = (myKey + stepUp[cur] + 12) % 12;
  let x = xCoords[actualNote];
  let y = yCoords[actualNote];
  let isMajor = getMode(cur);
  let color = "#008ffc";
  hexagon(x, y, 0.2, color);
  hexagon(x, y - 53, 0.2, color);
  if (isMajor) hexagon(x + 46, y - 27, 0.2, color);
  else hexagon (x - 46, y - 27, 0.2, color);
  if (cur == 5) hexagon(x - 46, y - 80, 0.2, color);
  resetHexagonText();
}

function resetVisualizer() {
  fill(240);
  noStroke();
  rect(50, 93, 400, 320);
  if (visualizerMode == 0) {
    resetBubbles();
  } else if (visualizerMode == 1) {
    resetHexagons();
  } else {
    resetPiano();
  }
}

function activateVisualizer(cur, myKey) {
  if (visualizerMode == 0) {
    activateBubbles(cur);
  } else if (visualizerMode == 1) {
    activateHexagons(cur, myKey);
  } else {
    activatePiano(cur, myKey);
  }
}

function playChordIndex(i, myKey) {
  playChordPiano(i === 5 ? 4 : i, myKey, i === 5);
}


function playList(lst, myKey) {
  fill(240);
  noStroke();
  // backing for chord progression list
  rect(470, 150, 280, 60);
  // backing for visualizer path
  rect(102, 462, 550, 195)
  fill("#0874fc");
  textSize(18);
  if (lst.length == 0) {
    fill("#0874fc");
    textSize(18);
    text("No progression found.", 500, 175);
    return;
  }
  let newList = lst.map(i => indexToName(i))
  text("Chords:", 500, 175);
  text(newList, 500, 200);
  textSize(12);
  curColor = 0;
  curChordOrder = -1;
  curChordName = lst[0];
  isPlaying = true;
  justStartedPlaying = true;
  for(var i = 0; i <= lst.length; i++) {
    const cur = i < lst.length ? lst[i] : -1;
    sleep(i * 1100).then(function() {
       if (cur == -1) {
         isPlaying = false;
         curColor = 0;
         curChordOrder = -1;
         resetVisualizer();
         return;
       }
       strokeWeight(1);
       stroke(51);
       fill(240);
       activateVisualizer(cur, myKey);
       isMajor = getMode(cur);
       curChordName = cur;
       curChordOrder = min(curChordOrder + 1, 11);
       playChordIndex(cur, myKey);
    })
  }
}

function generate() {
  playList(findPathBFS(sInput.value(), tInput.value(), progLen), keySlider.value());
}

function setup() {
  cnv = createCanvas(700, 700);
  background(240);
  for (var i = 0; i < notesToPlay.length; i++) {
    notesToPlay[i] = loadSound('assets/piano_notes/' + filePaths[i]);
  }
  lengthSlider = createSlider(3, 10, 5);
  lengthSlider.position(55, 45);
  sInput = createSlider(0, 6, 0);
  sInput.size = 100;
  sInput.position (205, 45);
  tInput = createSlider(0, 6, 0);
  tInput.size = 100;
  tInput.position (355, 45);
  keySlider = createSlider(-3, 8, 0);
  keySlider.size = 100;
  keySlider.position(505, 45);
  text("Progression length: ", 59, 33);
  text("Starting chord: ", 212, 33);
  text("Ending chord: ", 362, 33);
  text("Key: ", 512, 33);
  generateButton = createButton("generate");
  generateButton.mousePressed(generate);
  generateButton.position(55, 70);
  bubbleButton = createButton("Bubble visualizer");
  bubbleButton.mousePressed(bubblePressed);
  bubbleButton.position(155, 70);
  hexButton = createButton("Hexagon visualizer");
  hexButton.mousePressed(hexPressed);
  hexButton.position(300, 70);
  pianoButton = createButton("Piano visualizer");
  pianoButton.mousePressed(pianoPressed);
  pianoButton.position(455, 70);
  styleButtons();
  bubblePressed();
  osc = new p5.SinOsc();
  osc1 = new p5.SinOsc();
  osc2 = new p5.SinOsc();
  osc3 = new p5.SinOsc();
  resetVisualizer();
  // Instantiate the envelopes
  envelope = new p5.Env();
  envelope1 = new p5.Env();
  envelope2 = new p5.Env();
  envelope3 = new p5.Env();
  // set attackTime, decayTime, sustainRatio, releaseTime
  envelope.setADSR(0.03, 0.5, 0.1, 0.5);
  envelope1.setADSR(0.03, 0.5, 0.1, 0.5);
  envelope2.setADSR(0.03, 0.5, 0.1, 0.5);
  envelope3.setADSR(0.03, 0.5, 0.1, 0.5);
  // set attackLevel, releaseLevel
  envelope.setRange(1, 0);
  envelope1.setRange(1, 0);
  envelope2.setRange(1, 0);
  envelope3.setRange(1, 0);
  noStroke();
  fill(0);
  textSize(12);
  text("Chord", 30, 575);
  for (let i = 0; i < 7; i++) {
    text(indexToName(i), 80, 635 - 25 * i);
  }

}

function hexAverageWithHash(hex1, hex2) {
  // Remove the leading "#" and convert to decimal
  const dec1 = parseInt(hex1.slice(1), 16);
  const dec2 = parseInt(hex2.slice(1), 16);

  // Compute the average and convert back to hexadecimal
  const average = Math.floor((dec1 + dec2) / 2);
  const hexAverage = "#" + (average.toString(16)).padStart(6, '0');

  return hexAverage;
}

function draw() {
  fill(0);
  noStroke();
  progLen = lengthSlider.value();
  fill(240);
  // backing for chord prog length & starting/ending chords
  rect(165, 20, 20, 20);
  rect(293, 20, 20, 20);
  rect(438, 20, 20, 20);
  rect(538, 20, 20, 20);
  fill(0);
  textSize(12);
  text(progLen, 166, 33);
  text(indexToName(sInput.value()), 294, 33);
  text(indexToName(tInput.value()), 439, 33);
  text((indexToKey(keySlider.value())), 539, 33);
  fill(240);
  noStroke();
  strokeWeight(1);
  stroke(51);
  line(100, 650, 100, 470);
  if (isPlaying) {
    if (justStartedPlaying) { // starting to play
      curColor = isMajor ? "#07de2b" : "#0727de"
      curY = 630 - 25 * curChordName;
      curX = 120;
      justStartedPlaying = false;
    } else {
      curColor = isMajor ? hexAverageWithHash(curColor, "#07de2b") : hexAverageWithHash(curColor, "#0727de");
      goalX = 120 + 50 * max(curChordOrder, 0);
      goalY = 630 - 25 * curChordName;
      curX = curX + ((goalX - curX) / 8);
      curY = curY + ((goalY - curY) / 8);
    }
  }
  fill(curColor);
  noStroke();
  if (isPlaying) {
    ellipse(curX, curY, curWidth, curHeight);
  }
  fill(240);
  noStroke();
  rect(120, 645, 600, 10);
  stroke(0);
  line(100, 650, 100 + 50 * progLen, 650);
  fill(0);
  noStroke();
  text("Time", 200, 670);
}