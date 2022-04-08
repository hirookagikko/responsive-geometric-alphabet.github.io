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
  frameRate(20);
  background(0);
  pixelDensity(2);
  const gridSize = height / 200;
  const givenText = inputValue.toUpperCase();

  const palettes = [["#FFFFFF", "#000000"], ["#FF0000", "#000000"], ["#00FF00", "#000000"], ["#0000FF", "#000000"], ["#FF0000", "#FFFFFF"], ["#00FF00", "#FFFFFF"], ["#0000FF", "#FFFFFF"], ["#FF0000", "#00FF00"], ["#00FF00", "#0000FF"], ["#00FFFF", "#FF0000"], ["#FFFF00", "#FF0000"], ["#FFFF00", "#000000"], ["#FFFF00", "#FFFFFF"], ["#FFFF00", "#FF00FF"], ["#990000", "#FF0000"], ["#000099", "#000011"]];
  const selectedPalette1 = palettes[int(random(palettes.length))];
  const selectedPalette2 = palettes[int(random(palettes.length))];
  const selectedPalette3 = palettes[int(random(palettes.length))];

  // 背景
  // if (random(1) > 0.75) {
  //   pattern(PTN.dot(gridSize * int(random(1, 5)), gridSize * 2 / int(random(2, 5))));
  // } else if (random(1) > 0.5) {
  //   pattern(PTN.triangle(gridSize * random(2, 4), gridSize * random(2, 4)));
  // } else if (random(1) > 0.25) {
  //   pattern(PTN.stripePolygon(random(3, 12), gridSize / 4 * random(2, 7)));
  // } else {
  //   pattern(PTN.stripeCircle(gridSize / 4 * random(1, 7)));
  // }
  // patternAngle(0);
  // patternColors([selectedPalette1[0], selectedPalette1[1]]);
  // rectPattern(0, 0, width, height);
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
  const textMask2 = createGraphics(width, height);
  textMask2.copy(textMask1, 0, 0, width, height, 0, 0, width, height);
  textMask2.filter(INVERT);

  const maskedBG1 = pgMask(pg1, textMask1);
  image(maskedBG1, 0, 0);
  const maskedBG2 = pgMask(pg2, textMask2);
  image(maskedBG2, 0, 0);

  const lineHeight = (height - height / 20) / 3;
  composeRGA({
    givenText: "VERTICAL-ALIGN: TOP", // テキスト文字列
    posX: width / 20, // X軸方向の位置
    posY: height / 20, // Y軸方向の位置
    width: width - width / 10, // 領域の幅
    height: lineHeight, // 領域の高さ
    thickness: 5, // 文字の太さ
    strokeWeight: 1, // 線幅
    line: "line-per-word", // 改行モード
    valign: "top", // 文字揃え "top", "middle", "bottom", "baseline", ...
    charHeight: "random", // 文字高の種類 "full", "random"
    style: "rounded", // 書体スタイル "bitmap", "rounded", ...
    option: "normal", // オプション "normal", "outlined"
    colorFill: "#FFFFFF", // 塗り色
    colorStroke: "#FF0000", // 線色
    target: null // レンダリングターゲット
  });
  composeRGA({
    givenText: "VERTICAL-ALIGN:MIDDLE", // テキスト文字列
    posX: width / 20, // X軸方向の位置
    posY: height / 2 - lineHeight / 2, // Y軸方向の位置
    width: width - width / 10, // 領域の幅
    height: lineHeight, // 領域の高さ
    thickness: 5, // 文字の太さ
    strokeWeight: 2, // 線幅
    line: "line-per-word", // 改行モード
    valign: "middle", // 文字揃え "top", "middle", "bottom", "baseline", ...
    charHeight: "random", // 文字高の種類 "full", "random"
    style: "bitmap", // 書体スタイル "bitmap", "rounded", ...
    option: "normal", // オプション "normal", "outlined"
    colorFill: "#FFFFFF", // 塗り色
    colorStroke: "#FF0000", // 線色
    target: null // レンダリングターゲット
  });
  composeRGA({
    givenText: "VERTICAL-ALIGN:BOTTOM", // テキスト文字列
    posX: width / 20, // X軸方向の位置
    posY: lineHeight * 2, // Y軸方向の位置
    width: width - width / 10, // 領域の幅
    height: lineHeight, // 領域の高さ
    thickness: 10, // 文字の太さ
    strokeWeight: 1, // 線幅
    line: "line-per-word", // 改行モード
    valign: "bottom", // 文字揃え "top", "middle", "bottom", "baseline", ...
    charHeight: "random", // 文字高の種類 "full", "random"
    style: "rounded", // 書体スタイル "bitmap", "rounded", ...
    option: "normal", // オプション "normal", "outlined"
    colorFill: "#FFFFFF", // 塗り色
    colorStroke: "#FF0000", // 線色
    target: textMask1 // レンダリングターゲット
  });
  console.log(RGAs);
  RGAs.forEach(RGA => {
    RGA.forEach(char => {
      if (RGA.target === null) {
        noFill();
        stroke(RGAmode.colorStroke);
        push();
        translate(char.posX, char.posY);
        console.log(char.posX, char.posY);
        rect(char.posX, char.posY, 200, 200);
        char.draw();
        pop();
      } else {
        // target.push();
        // target.translate(posX, posY);
        // char.print();
        // target.pop();
      }
    });
  });
  textMask1.remove();
  textMask2.remove();
  pg1.remove();
  pg2.remove();
}
