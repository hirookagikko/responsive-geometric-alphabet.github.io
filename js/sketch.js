function setup() {
  const canvas = createCanvas(800, 800);
  canvas.parent("canvasWrapper");
  input = createInput("responsive geometric alphabet");
  input.parent("control").size(width / 2, 24);
  button = createButton("PUSH");
  button.parent("control");
  button.mousePressed(draw);
  angleMode(DEGREES);
}

function generate() {
  let inputValue = input.value();
  console.log(inputValue);
  redraw();
}

function draw() {
  let inputValue = input.value();
  noLoop();
  background(0);
  pixelDensity(2);
  const gridSize = height / 200;
  const givenText = inputValue.toUpperCase();

  // モードの指定
  let charHeightMode = "full";
  if (random(1) > 0.5) {
    charHeightMode = "random";
  }
  const mode = {
    line: "line-per-word", // 改行モード
    valign: "baseline", // 行揃え
    charHeight: charHeightMode // 文字の高さ
  };

  // テキストを行に分割して配列化
  let lines = [];
  let lineCount = 0;
  for (const char in givenText) {
    if (!lines[lineCount]) {
      lines[lineCount] = "";
    }
    // 改行モードによって処理を分ける
    switch(mode.line) {
      case("line-per-word"):
        if (givenText[char].match(/\s+/)) {
          lineCount++;
        } else {
          lines[lineCount] += givenText[char];
        }
        if (givenText[char].match(/[.,!?]/g)) {
          lineCount++;
        }
        break;
      case("line-per-sentence"):
        lines[lineCount] += givenText[char];
        if (givenText[char].match(/[.,!?]/g)) {
          lineCount++;
        }
        break;
      default:
        break;
    }
  }

  // 行ごとにRGAインスタンスを入れる配列を作成
  const RGAs = new Array(lines.length);

  const palettes = [["#FFFFFF", "#000000"], ["#FF0000", "#000000"], ["#00FF00", "#000000"], ["#0000FF", "#000000"], ["#FF0000", "#FFFFFF"], ["#00FF00", "#FFFFFF"], ["#0000FF", "#FFFFFF"], ["#FF0000", "#00FF00"], ["#00FF00", "#0000FF"], ["#00FFFF", "#FF0000"], ["#FFFF00", "#FF0000"], ["#FFFF00", "#000000"], ["#FFFF00", "#FFFFFF"], ["#FFFF00", "#FF00FF"], ["#990000", "#FF0000"], ["#000099", "#000011"]];
  const selectedPalette1 = palettes[int(random(palettes.length))];
  const selectedPalette2 = palettes[int(random(palettes.length))];
  const selectedPalette3 = palettes[int(random(palettes.length))];

  // 背景
  if (random(1) > 0.75) {
    pattern(PTN.dot(gridSize * int(random(1, 5)), gridSize * 2 / int(random(2, 5))));
  } else if (random(1) > 0.5) {
    pattern(PTN.triangle(gridSize * random(2, 4), gridSize * random(2, 4)));
  } else if (random(1) > 0.25) {
    pattern(PTN.stripePolygon(random(3, 12), gridSize / 4 * random(2, 7)));
  } else {
    pattern(PTN.stripeCircle(gridSize / 4 * random(1, 7)));
  }
  patternAngle(0);
  patternColors([selectedPalette1[0], selectedPalette1[1]]);
  rectPattern(0, 0, width, height);
  // fill(color("#000000"));
  // rect(0, 0, width, height);

  // 2パターン用グラフィック
  const pg1 = createGraphics(width, height);
  const pg2 = createGraphics(width, height);
  // pg1.fill(color(selectedPalette[0]));
  // pg1.rect(0, 0, width, height);
  // pg2.fill(color(selectedPalette[1]));
  // pg2.rect(0, 0, width, height);
  pg1.pattern(PTN.checked(gridSize * 2));
  pg1.patternAngle(PI / 2);
  pg1.patternColors([selectedPalette2[0], selectedPalette2[1]]);
  pg1.rectPattern(0, 0, width, height);
  pg2.pattern(PTN.checked(gridSize));
  pg2.patternAngle(PI / 2);
  pg2.patternColors([selectedPalette3[1], selectedPalette3[0]]);
  pg2.rectPattern(0, 0, width, height);

  // テキストのマスク
  const textMask1 = createGraphics(width, height);

  // 文字を並べる部分は最終的に関数化すること
  let posX = 0;
  let posY = 0;
  // let lineHeight = 0;
  let option = "outline";
  let weight, strokeWeight, maxUX, maxUY, offsetX, offsetY, innerGap;
  let step;
  let rand = random(1) > 0.5;

  // lは行数
  let lineLengths = [];
  for (const n in lines) {
    lineLengths.push(lines[n].length);
  }
  let maxLength = lineLengths.reduce(function(a, b) {
    return Math.max(a, b);
  });
  console.log(maxLength);
  weight = int(random(2, width / (maxLength + 1) / 6));
  const lineHeight = (height + weight) / lines.length;

  for (let l = 0;l < lines.length;l++) {

    if (rand) {
      option = "outline";
      rand = false;
    } else {
      option = "normal";
      rand = true;
    }
    for (let c = 0;c < lines[l].length;c++) {
      if (mode.line == "line-per-word") {
        maxUX = (width - (weight * (lines[l].length - 1))) / lines[l].length / weight;
      }
      if (mode.charHeight == "random") {
        maxUY = random(5, (lineHeight - weight) / weight);
      } else {
        maxUY = (lineHeight - weight) / weight;
      }

      console.log(mode.charHeight);

      offsetX = weight * maxUX + weight;
      offsetY = weight * maxUY + weight;
      strokeWeight = weight / 2;
      innerGap = lineHeight - (weight * maxUY) - weight;

      // 確認用
      // textMask1.noFill();
      // textMask1.stroke(112);
      // textMask1.rect(posX, posY, maxUX * weight, lineHeight - weight);
      // textMask1.line(posX - weight / 2, posY + innerGap, posX + maxUX * weight + weight / 2, posY + innerGap);

      styleSelected = "rounded";
      RGAs[l] = new RGAlphabet(lines[l][c], weight, maxUX, maxUY, styleSelected, option, strokeWeight, textMask1);
      textMask1.push();
      if (mode.valign == "baseline") {
        posY += innerGap;
      }
      textMask1.translate(posX, posY);
      RGAs[l].print();
      textMask1.pop();
      posX += offsetX;
      if (mode.valign == "baseline") {
        posY -= innerGap;
      }

      if (mode.line == "line-per-sentence") {
        if (posX > width) {
          posX = 0;
          posY += lineHeight;
        }
      }
    }
    if (mode.line == "line-per-word") {
      posX = 0;
      posY += lineHeight;
    } else {
      posX += offsetX / 2;
    }
  }

  const textMask2 = createGraphics(width, height);
  textMask2.copy(textMask1, 0, 0, width, height, 0, 0, width, height);
  textMask2.filter(INVERT);

  const maskedBG1 = pgMask(pg1, textMask1);
  image(maskedBG1, 0, 0);
  const maskedBG2 = pgMask(pg2, textMask2);
  image(maskedBG2, 0, 0);

  textMask1.remove();
  textMask2.remove();
  pg1.remove();
  pg2.remove();
}
