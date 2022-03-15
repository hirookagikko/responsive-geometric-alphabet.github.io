// Responsive Geometric Alphabet

// RGAインスタンスを入れる配列を用意
const RGAs = new Array();

// モードの設定
const RGAmode = {
  line: "line-per-word", // 改行モード
  valign: "baseline", // 行揃え
  charHeight: "random", // 文字の高さ "random", "full"
  style: "rounded", // スタイル
  option: "outlined"
}

// 文字を組む
const composeRGA = (givenText, posX, posY, RGAmode, _r) => {

  // テキスト処理 行に分割して配列化
  let lines = [];
  let lineCount = 0;
  for (const char in givenText) {
    if (!lines[lineCount]) {
      lines[lineCount] = "";
    }
    // 改行モードによって処理を分岐
    switch(RGAmode.line) {
      case("line-per-word"): // 単語ごとに分割する場合
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
  // 文字を並べる
  let weight, strokeWeight, maxUX, maxUY, offsetX, offsetY, innerGap;

  // lは行数
  let lineLengths = [];
  for (const n in lines) {
    lineLengths.push(lines[n].length);
  }
  let maxLength = lineLengths.reduce(function(a, b) {
    return Math.max(a, b);
  });
  weight = int(random(2, width / (maxLength + 1) / 6));
  const lineHeight = (height + weight) / lines.length;

  for (let l = 0;l < lines.length;l++) {
    for (let c = 0;c < lines[l].length;c++) {
      if (RGAmode.line == "line-per-word") {
        maxUX = (width - (weight * (lines[l].length - 1))) / lines[l].length / weight;
      }
      if (RGAmode.charHeight == "random") {
        maxUY = random(5, (lineHeight - weight) / weight);
      } else {
        maxUY = (lineHeight - weight) / weight;
      }

      offsetX = weight * maxUX + weight;
      offsetY = weight * maxUY + weight;
      strokeWeight = weight / 2;
      innerGap = lineHeight - (weight * maxUY) - weight;
      console.log("strokeWeight = " + strokeWeight);

      if (!RGAs[l]) {
        RGAs[l] = [];
      }
      RGAs[l][c] = new RGAlphabet(lines[l][c], weight, maxUX, maxUY, RGAmode, strokeWeight, _r);

      if (_r === undefined) {

      } else {
        _r.push();
        if (RGAmode.valign == "baseline") {
          posY += innerGap;
        }
        _r.translate(posX, posY);
        RGAs[l].print();
        _r.pop();
        posX += offsetX;
        if (RGAmode.valign == "baseline") {
          posY -= innerGap;
        }

        if (RGAmode.line == "line-per-sentence") {
          if (posX > width) {
            posX = 0;
            posY += lineHeight;
          }
        }
      }
    }
    if (RGAmode.line == "line-per-word") {
      posX = 0;
      posY += lineHeight;
    } else {
      posX += offsetX / 2;
    }
  }
}
console.log(RGAs);

class RGAlphabet {
  constructor(_char, _u, _maxUX, _maxUY, _style, _option, _strokeWeight, _r) {
    this.char = _char;
    this.u = _u;
    this.maxUX = _maxUX;
    this.maxUY = _maxUY;
    this.style = _style;
    this.strokeWeight = _strokeWeight * 2;
    this.r = _r;
    this.parts = [];
  }
  // 文字を生成して格納
  generate() {
    const u = this.u;
    this.parts.length = 0;
    let offset = 0;
    if (this.option == "outline") {
      offset = this.strokeWeight / 2;
    }
    switch(this.style) {

      // rounded style
      case "rounded":
        let r, eX, eY; // radius, expandX, expandY
        if (this.char == "A") {
          if (this.maxUY > this.maxUX) {
            r = u * this.maxUX - this.strokeWeight / 2 - offset;
          } else {
            r = u * this.maxUY - this.strokeWeight / 2 - offset;
          }
          this.parts.push(
            {
              type: "arc",
              posX: r / 2 + offset,
              posY: r / 2 + offset,
              radius: r - this.strokeWeight,
              start: - PI,
              end: - PI / 2
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - offset,
              posY: r / 2 + offset,
              radius: r - this.strokeWeight,
              start: - PI / 2,
              end: 0
            }
          );
          if (this.maxUY < this.maxUX) {
            this.parts.push(
              {
                type: "line",
                startPosX: r / 2 + offset,
                startPosY: u / 2 + offset,
                endPosX: u * this.maxUX - r / 2 - offset,
                endPosY: u / 2 + offset
              }
            );
          }
          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: r / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              startPosY: r / 2 + offset,
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY - u * (this.maxUY / 4),
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - u * (this.maxUY / 4)
            }
          );
        }
        if (this.char == "B") {
          if (this.maxUY > this.maxUX * 2) {
            r = u * this.maxUX - this.strokeWeight / 2 - offset;
            eY = this.maxUY - this.maxUX;
            this.parts.push(
              {
                type: "line",
                startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                startPosY: r / 2 + this.strokeWeight / 2 + offset,
                endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                endPosY: u * (eY / 2) + offset
              },
              {
                type: "line",
                startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                startPosY: u * this.maxUY - u * (eY / 2) - offset,
                endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                endPosY: u * this.maxUY - r / 2 - offset
              },
              {
                type: "arc",
                posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
                posY: u * (eY / 2) + offset,
                radius: r,
                start: 0,
                end: PI / 2
              },
              {
                type: "arc",
                posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
                posY: u * this.maxUY - u * (eY / 2) - offset,
                radius: r,
                start: - PI / 2,
                end: 0
              }
            );
          } else {
            r = u * this.maxUY / 2 - this.strokeWeight / 2 - offset;
            eY = 0;
            this.parts.push(
              {
                type: "arc",
                posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
                posY: r / 2 + this.strokeWeight / 2 + offset,
                radius: r,
                start: 0,
                end: PI / 2
              },
              {
                type: "arc",
                posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
                posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
                radius: r,
                start: - PI / 2,
                end: 0
              }
            )
          }
          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY / 2,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY / 2
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI / 2,
              end: 0
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: PI / 2
            }
          );
        }
        if (this.char == "C") {
          if (this.maxUY > this.maxUX) {
            r = u * this.maxUX - this.strokeWeight - offset;
            this.parts.push(
              {
                type: "line",
                startPosX: this.strokeWeight / 2 + offset,
                startPosY: r / 2 + this.strokeWeight / 2 + offset,
                endPosX: this.strokeWeight / 2 + offset,
                endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
              },
              {
                type: "line",
                startPosX: r / 2 + offset,
                startPosY: this.strokeWeight / 2 + offset,
                endPosX: u * this.maxUX - r / 2.75 - offset,
                endPosY: this.strokeWeight / 2 + offset
              },
              {
                type: "line",
                startPosX: r / 2 + offset,
                startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
                endPosX: u * this.maxUX - r / 2.75 - offset,
                endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
              }
            );
          } else {
            r = u * this.maxUY - this.strokeWeight - offset;
            this.parts.push(
              {
                type: "line",
                startPosX: r / 2 + offset,
                startPosY: this.strokeWeight / 2 + offset,
                endPosX: u * this.maxUX - r / 2.75 - offset,
                endPosY: this.strokeWeight / 2 + offset
              },
              {
                type: "line",
                startPosX: r / 2 + offset,
                startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
                endPosX: u * this.maxUX - r / 2.75 - offset,
                endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
              }
            );
          }
          this.parts.push(
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI,
              end: - PI / 2
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: PI / 2,
              end: - PI
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2.75 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI / 2,
              end: - PI / 4
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2.75 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: PI / 4,
              end: PI / 2
            }
          );
        }
        if (this.char == "D") {
          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            }
          );
          if (this.maxUY >= this.maxUX) {
            r = u * this.maxUX - this.strokeWeight - offset;
            this.parts.push(
              {
                type: "line",
                startPosX: this.strokeWeight / 2 + offset,
                startPosY: r / 2 + this.strokeWeight / 2 + offset,
                endPosX: this.strokeWeight / 2 + offset,
                endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
              },
              {
                type: "line",
                startPosX: this.strokeWeight / 2 + offset,
                startPosY: this.strokeWeight / 2 + offset,
                endPosX: u * this.maxUX - r / 2 - offset,
                endPosY: this.strokeWeight / 2 + offset
              },
              {
                type: "line",
                startPosX: this.strokeWeight / 2 + offset,
                startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
                endPosX: u * this.maxUX - r / 2 - offset,
                endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
              },
              {
                type: "line",
                startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                startPosY: r / 2 + this.strokeWeight / 2 + offset,
                endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
              }
            );
          } else {
            r = u * this.maxUY - this.strokeWeight - offset;
            this.parts.push(
              {
                type: "line",
                startPosX: this.strokeWeight / 2 + offset,
                startPosY: this.strokeWeight / 2 + offset,
                endPosX: u * this.maxUX - r / 2 - offset,
                endPosY: this.strokeWeight / 2 + offset
              },
              {
                type: "line",
                startPosX: this.strokeWeight / 2 + offset,
                startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
                endPosX: u * this.maxUX - r / 2 - offset,
                endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
              }
            );
          }
          this.parts.push(
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI / 2,
              end: 0
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: PI / 2
            }
          );
        }
        if (this.char == "E") {
          if (this.maxUY > this.maxUX * 2) {
            r = u * this.maxUX - this.strokeWeight / 2 - offset;
          } else {
            r = u * this.maxUY / 2 - this.strokeWeight / 2 - offset;
          }
          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.maxUY - r / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY / 2,
              endPosX: u * (this.maxUX - 1.5) - offset,
              endPosY: u * this.maxUY / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
              endPosX: u * this.maxUX - this.strokeWeight  / 2 - offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI,
              end: - PI / 2
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: - PI * 1.5,
              end: - PI
            }
          );
        }
        if (this.char == "F") {
          if (this.maxUY > this.maxUX * 2) {
            r = u * this.maxUX - this.strokeWeight / 2 - offset;
            eY = this.maxUY - this.maxUX;
          } else {
            r = u * this.maxUY / 2 - this.strokeWeight / 2 - offset;
            eY = 0;
          }
          this.parts.push(
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY / 2,
              endPosX: u * (this.maxUX - 1.5) - offset,
              endPosY: u * this.maxUY / 2
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI,
              end: - PI / 2
            }
          );
        }
        if (this.char == "G") {
          if (this.maxUY > this.maxUX) {
            r = u * this.maxUX - this.strokeWeight - offset;
            this.parts.push(
              {
                type: "line",
                startPosX: this.strokeWeight / 2 + offset,
                startPosY: r / 2 + this.strokeWeight / 2 + offset,
                endPosX: this.strokeWeight / 2 + offset,
                endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
              },
              {
                type: "line",
                startPosX: r / 2 + offset,
                startPosY: this.strokeWeight / 2 + offset,
                endPosX: u * this.maxUX - r / 2.75 - offset,
                endPosY: this.strokeWeight / 2 + offset
              },
              {
                type: "line",
                startPosX: r / 2 + offset,
                startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
                endPosX: u * this.maxUX - r / 2.75 - offset,
                endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
              }
            );
          } else {
            r = u * this.maxUY - this.strokeWeight - offset;
            this.parts.push(
              {
                type: "line",
                startPosX: r / 2 + offset,
                startPosY: this.strokeWeight / 2 + offset,
                endPosX: u * this.maxUX - r / 2.75 - offset,
                endPosY: this.strokeWeight / 2 + offset
              },
              {
                type: "line",
                startPosX: r / 2 + offset,
                startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
                endPosX: u * this.maxUX - r / 2.75 - offset,
                endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
              }
            );
          }
          this.parts.push(
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI,
              end: - PI / 2
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: PI / 2,
              end: - PI
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2.75 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI / 2,
              end: - PI / 4
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 3 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY - r / 3 - this.strokeWeight / 2 - offset,
              radius: r / 1.5,
              start: 0,
              end: PI / 2
            },
            {
              type: "line",
              startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              startPosY: u * this.maxUY - u * this.maxUY / 2.5,
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.maxUX - u * this.maxUX / 2.5,
              startPosY: u * this.maxUY - u * this.maxUY / 2.5,
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - u * this.maxUY / 2.5
            }
          );
        }
        if (this.char == "H") {
          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY / 2,
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY / 2
            }
          );
        }
        if (this.char == "I") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.maxUX / 2,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX / 2,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.maxUX / 2 - u * this.maxUX / 4,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX / 2 + u * this.maxUX / 4,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "line",
              startPosX: u * this.maxUX / 2 - u * this.maxUX / 4,
              startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
              endPosX: u * this.maxUX / 2 + u * this.maxUX / 4,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "J") {
          r = u * (this.maxUY / 5 * 3);
          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "arc",
              posX: u * this.maxUX - u * (this.maxUX / 4) - r / 2 - offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: PI / 2
            },
            {
              type: "line",
              startPosX: u * this.maxUX - u * (this.maxUX / 4) - offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - u * (this.maxUX / 4) - offset,
              endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
              endPosX: u * this.maxUX - u * (this.maxUX / 4) - r / 2 - offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "K") {
          if (this.maxUY > this.maxUX * 2) {
            r = u * this.maxUX - this.strokeWeight - offset * 2;
            this.parts.push(
              {
                type: "line",
                startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                startPosY: this.strokeWeight / 2 + offset,
                endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                endPosY: u * (this.maxUY / 2) - r
              },
              {
                type: "arc",
                posX: u * this.maxUX - r - this.strokeWeight / 2 - offset,
                posY: u * (this.maxUY / 2) - r,
                radius: r * 2,
                start: 0,
                end: PI / 2
              },
              {
                type: "arc",
                posX: u * this.maxUX - r - this.strokeWeight / 2 - offset,
                posY: u * (this.maxUY / 2) + r,
                radius: r * 2,
                start: - PI / 2,
                end: 0
              },
              {
                type: "line",
                startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                startPosY: u * (this.maxUY / 2) + r,
                endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
              }
            );
          } else {
            r = u * this.maxUY / 2 - this.strokeWeight / 2 - offset;
            this.parts.push(
              {
                type: "arc",
                posX: u * this.maxUX - r - this.strokeWeight / 2 - offset,
                posY: u * (this.maxUY / 2) - r,
                radius: r * 2,
                start: 0,
                end: PI / 2
              },
              {
                type: "arc",
                posX: u * this.maxUX - r - this.strokeWeight / 2 - offset,
                posY: u * (this.maxUY / 2) + r,
                radius: r * 2,
                start: - PI / 2,
                end: 0
              },
              {
                type: "line",
                startPosX: this.strokeWeight / 2 + offset,
                startPosY: u * (this.maxUY / 2),
                endPosX: u * this.maxUX - r,
                endPosY: u * (this.maxUY / 2)
              }
            );
          }
          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "L") {
          if (this.maxUY > this.maxUX) {
            r = u * (this.maxUX / 2) - this.strokeWeight - offset * 2;
          } else {
            r = u * (this.maxUY / 2) - this.strokeWeight - offset * 2;
          }
          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: - PI * 1.5,
              end: - PI
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "M") {
          if (this.maxUX > this.maxUY * 2) {
            r = u * this.maxUY - this.strokeWeight / 2 - offset;
            eX = this.maxUX - this.maxUY;
            this.parts.push(
              {
                type: "line",
                startPosX: r / 2 + this.strokeWeight / 2 + offset,
                startPosY: this.strokeWeight / 2 + offset,
                endPosX: u * (eX / 2) + offset,
                endPosY: this.strokeWeight / 2 + offset
              },
              {
                type: "line",
                startPosX: u * this.maxUX - u * (eX / 2) - offset,
                startPosY: this.strokeWeight / 2 + offset,
                endPosX: u * this.maxUX - r / 2 - offset,
                endPosY: this.strokeWeight / 2 + offset
              },
              {
                type: "arc",
                posX: u * (eX / 2) + offset,
                posY: r / 2 + this.strokeWeight / 2 + offset,
                radius: r,
                start: - PI / 2,
                end: 0
              },
              {
                type: "arc",
                posX: u * this.maxUX - u * (eX / 2) - offset,
                posY: r / 2 + this.strokeWeight / 2 + offset,
                radius: r,
                start: - PI,
                end: - PI / 2
              }
            );
          } else {
            r = u * this.maxUX / 2 - this.strokeWeight / 2 - offset;
            eX = 0;
            this.parts.push(
              {
                type: "arc",
                posX: r / 2 + this.strokeWeight / 2 + offset,
                posY: r / 2 + this.strokeWeight / 2 + offset,
                radius: r,
                start: - PI / 2,
                end: 0
              },
              {
                type: "arc",
                posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
                posY: r / 2 + this.strokeWeight / 2 + offset,
                radius: r,
                start: - PI,
                end: - PI / 2
              }
            )
          }
          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.maxUX / 2,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX / 2,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - this.strokeWeight  / 2 - offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI,
              end: - PI / 2
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI / 2,
              end: 0
            }
          );
        }
        if (this.char == "N") {
          if (this.maxUX > this.maxUY * 2) {
            r = u * this.maxUY - this.strokeWeight / 2 - offset;
            eX = this.maxUX - this.maxUY;
            this.parts.push(
              {
                type: "line",
                startPosX: r / 2 + this.strokeWeight / 2 + offset,
                startPosY: this.strokeWeight / 2 + offset,
                endPosX: u * (eX / 2) + offset,
                endPosY: this.strokeWeight / 2 + offset
              },
              {
                type: "line",
                startPosX: u * this.maxUX - u * (eX / 2) - offset,
                startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
                endPosX: u * this.maxUX - r / 2 - offset,
                endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
              },
              {
                type: "arc",
                posX: u * (eX / 2) + offset,
                posY: r / 2 + this.strokeWeight / 2 + offset,
                radius: r,
                start: - PI / 2,
                end: 0
              },
              {
                type: "arc",
                posX: u * this.maxUX - u * (eX / 2) - offset,
                posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
                radius: r,
                start: PI / 2,
                end: - PI
              }
            );
          } else {
            r = u * this.maxUX / 2 - this.strokeWeight / 2 - offset;
            eX = 0;
            this.parts.push(
              {
                type: "arc",
                posX: r / 2 + this.strokeWeight / 2 + offset,
                posY: r / 2 + this.strokeWeight / 2 + offset,
                radius: r,
                start: - PI / 2,
                end: 0
              },
              {
                type: "arc",
                posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
                posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
                radius: r,
                start: PI / 2,
                end: - PI
              }
            )
          }
          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.maxUX / 2,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX / 2,
              endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - this.strokeWeight  / 2 - offset,
              endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI,
              end: - PI / 2
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: PI / 2
            }
          );
        }
        if (this.char == "O") {
          if (this.maxUY > this.maxUX) {
            r = u * this.maxUX - this.strokeWeight / 2 - offset;
          } else {
            r = u * this.maxUY - this.strokeWeight / 2 - offset;
          }
          this.parts.push(
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI,
              end: - PI / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI / 2,
              end: 0
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - this.strokeWeight  / 2 - offset,
              endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: PI / 2,
              end: PI
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: PI / 2
            }
          );
        }
        if (this.char == "P") {
          if (this.maxUY > this.maxUX * 2) {
            r = u * this.maxUX - this.strokeWeight / 2 - offset;
            eY = this.maxUY - this.maxUX;
            this.parts.push(
              {
                type: "line",
                startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                startPosY: r / 2 + this.strokeWeight / 2 + offset,
                endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                endPosY: u * (eY / 2) + offset
              },
              {
                type: "arc",
                posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
                posY: u * (eY / 2) + offset,
                radius: r,
                start: 0,
                end: PI / 2
              }
            );
          } else {
            r = u * this.maxUY / 2 - this.strokeWeight / 2 - offset;
            eY = 0;
            this.parts.push(
              {
                type: "arc",
                posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
                posY: r / 2 + this.strokeWeight / 2 + offset,
                radius: r,
                start: 0,
                end: PI / 2
              }
            )
          }
          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY / 2,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY / 2
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI / 2,
              end: 0
            }
          );
        }
        if (this.char == "Q") {
          if (this.maxUY > this.maxUX) {
            r = u * this.maxUX - this.strokeWeight / 2 - offset;
          } else {
            r = u * this.maxUY - this.strokeWeight / 2 - offset;
          }
          this.parts.push(
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI,
              end: - PI / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI / 2,
              end: 0
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - this.strokeWeight  / 2 - offset,
              endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: PI / 2,
              end: PI
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: PI / 2
            },
            {
              type: "line",
              startPosX: u * this.maxUX / 1.5,
              startPosY: u * this.maxUY / 1.5,
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "R") {
          if (this.maxUY > this.maxUX * 2) {
            r = u * this.maxUX - this.strokeWeight / 2 - offset;
            eY = this.maxUY - this.maxUX;
            this.parts.push(
              {
                type: "line",
                startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                startPosY: r / 2 + this.strokeWeight / 2 + offset,
                endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                endPosY: u * (eY / 2) + offset
              },
              {
                type: "line",
                startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                startPosY: u * this.maxUY - u * (eY / 2) - offset,
                endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                endPosY: u * this.maxUY - r / 2 - offset
              },
              {
                type: "arc",
                posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
                posY: u * (eY / 2) + offset,
                radius: r,
                start: 0,
                end: PI / 2
              },
              {
                type: "arc",
                posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
                posY: u * this.maxUY - u * (eY / 2) - offset,
                radius: r,
                start: - PI / 2,
                end: 0
              }
            );
          } else {
            r = u * this.maxUY / 2 - this.strokeWeight / 2 - offset;
            eY = 0;
            this.parts.push(
              {
                type: "arc",
                posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
                posY: r / 2 + this.strokeWeight / 2 + offset,
                radius: r,
                start: 0,
                end: PI / 2
              },
              {
                type: "arc",
                posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
                posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
                radius: r,
                start: - PI / 2,
                end: 0
              }
            )
          }
          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY / 2,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY / 2
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI / 2,
              end: 0
            },
            {
              type: "line",
              startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              startPosY: u * (this.maxUY / 2) + r / 2 + offset,
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "S") {
          if (this.maxUY > this.maxUX * 2) {
            r = u * this.maxUX - this.strokeWeight / 2 - offset;
            this.parts.push(
              {
                type: "line",
                startPosX: this.strokeWeight / 2 + offset,
                startPosY: r / 2 + this.strokeWeight / 2 + offset,
                endPosX: this.strokeWeight / 2 + offset,
                endPosY: u * this.maxUY / 2 - r / 2
              },
              {
                type: "line",
                startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                startPosY: u * this.maxUY / 2 + r / 2,
                endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                endPosY: u * this.maxUY - r / 2
              }
            );
          } else {
            r = u * this.maxUY / 2 - this.strokeWeight / 2 - offset;
            this.parts.push(
              {
                type: "line",
                startPosX: r / 2 + this.strokeWeight / 2 + offset,
                startPosY: u * this.maxUY / 2,
                endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
                endPosY: u * this.maxUY / 2
              }
            );
          }
          this.parts.push(
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI,
              end: - PI / 2
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.maxUY / 2 - r / 2,
              radius: r,
              start: PI / 2,
              end: PI
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY / 2 + r / 2,
              radius: r,
              start: - PI / 2,
              end: 0
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: PI / 2
            }
          );
        }
        if (this.char == "T") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.maxUX / 2,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX / 2,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            }
          );
        }
        if (this.char == "U") {
          if (this.maxUY > this.maxUX) {
            r = u * this.maxUX - this.strokeWeight - offset * 2;
          } else {
            r = u * this.maxUY - this.strokeWeight - offset * 2;
          }
          this.parts.push(
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: PI / 2,
              end: PI
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: PI / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight - offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            }
          );

          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "V") {
          if (this.maxUY >= this.maxUX) {
            r = u * this.maxUX * 2 - this.strokeWeight * 2 - offset * 4;
            this.parts.push(
              {
                type: "line",
                startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                startPosY: this.strokeWeight / 2 + offset,
                endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
              }
            );
          } else {
            r = u * this.maxUY * 2 - this.strokeWeight * 2 - offset * 4;
            this.parts.push(
              {
                type: "line",
                startPosX: this.strokeWeight / 2 + offset,
                startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
                endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
                endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
              }
            );
          }
          this.parts.push(
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: PI / 2
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "W") {
          if (this.maxUX > this.maxUY * 2) {
            r = u * this.maxUY - this.strokeWeight / 2 - offset;
            eX = this.maxUX - this.maxUY;
            this.parts.push(
              {
                type: "line",
                startPosX: r / 2 + this.strokeWeight / 2 + offset,
                startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
                endPosX: u * (eX / 2) + offset,
                endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
              },
              {
                type: "line",
                startPosX: u * this.maxUX - u * (eX / 2) - offset,
                startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
                endPosX: u * this.maxUX - r / 2 - offset,
                endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
              },
              {
                type: "arc",
                posX: u * (eX / 2) + offset,
                posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
                radius: r,
                start: 0,
                end: PI / 2
              },
              {
                type: "arc",
                posX: u * this.maxUX - u * (eX / 2) - offset,
                posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
                radius: r,
                start: PI / 2,
                end: PI
              }
            );
          } else {
            r = u * this.maxUX / 2 - this.strokeWeight / 2 - offset;
            eX = 0;
            this.parts.push(
              {
                type: "arc",
                posX: r / 2 + this.strokeWeight / 2 + offset,
                posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
                radius: r,
                start: 0,
                end: PI / 2
              },
              {
                type: "arc",
                posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
                posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
                radius: r,
                start: PI / 2,
                end: PI
              }
            )
          }
          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.maxUX / 2,
              startPosY: u * this.maxUY / 2,
              endPosX: u * this.maxUX / 2,
              endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - this.strokeWeight  / 2 - offset,
              endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: PI / 2,
              end: PI
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: PI / 2
            }
          );
        }
        if (this.char == "X") {
          if (this.maxUY > this.maxUX) {
            r = u * this.maxUX - this.strokeWeight / 2 - offset;
          } else {
            r = u * this.maxUY - this.strokeWeight / 2 - offset;
          }
          this.parts.push(
            {
              type: "arc",
              posX: u * this.maxUX / 2 + r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: PI,
              end: - PI / 2
            },
            {
              type: "line",
              startPosX: u * this.maxUX / 2 + r / 2 - this.strokeWeight / 2 - offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "line",
              startPosX: u * this.maxUX / 2 + r / 2 - this.strokeWeight / 2 - offset,
              startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: u * this.maxUX / 2 + r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: PI / 2,
              end: PI
            },
            {
              type: "line",
              startPosX: u * this.maxUX / 2 - this.strokeWeight / 2 - offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: u * this.maxUX / 2 - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: PI / 2
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX / 2 - r / 2,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
              endPosX: u * this.maxUX / 2 - r / 2,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: u * this.maxUX / 2 - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI / 2,
              end: 0
            }
          );
        }
        if (this.char == "Y") {
          if (this.maxUY > this.maxUX) {
            r = u * this.maxUX - this.strokeWeight - offset * 2;
          } else {
            r = u * this.maxUY - this.strokeWeight - offset * 2;
          }
          this.parts.push(
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.maxUY / 1.5 - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: PI / 2,
              end: PI
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY / 1.5 - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: PI / 2
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: PI / 2
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.maxUY / 1.5 - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY / 1.5 - this.strokeWeight / 2 - offset,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY / 1.5 - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.maxUX / 4,
              startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "Z") {
          if (this.maxUY > this.maxUX) {
            r = u * this.maxUX - this.strokeWeight - offset * 2;
            this.parts.push(
              {
                type: "line",
                startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                startPosY: this.strokeWeight / 2 + offset,
                endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                endPosY: u * this.maxUY / 2 - r / 2
              },
              {
                type: "line",
                startPosX: this.strokeWeight / 2 + offset,
                startPosY: u * this.maxUY / 2 + r / 2,
                endPosX: this.strokeWeight / 2 + offset,
                endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
              }
            );
          } else {
            r = u * this.maxUY - this.strokeWeight - offset * 2;
            this.parts.push(
              {
                type: "line",
                startPosX: r / 2 + this.strokeWeight / 2 + offset,
                startPosY: u * this.maxUY / 2,
                endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
                endPosY: u * this.maxUY / 2
              }
            );
          }
          this.parts.push(
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY / 2 - r / 2,
              radius: r,
              start: 0,
              end: PI / 2
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.maxUY / 2 + r / 2,
              radius: r,
              start: PI,
              end: PI * 1.5
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.maxUX / 4,
              startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "1") {
          if (this.maxUY > this.maxUX) {
            r = u * this.maxUX - this.strokeWeight - offset;
          } else {
            r = u * this.maxUY - this.strokeWeight - offset;
            this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX / 2 - r / 2,
              endPosY: r / 2 + this.strokeWeight / 2 + offset
            }
          );
          }
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.maxUX / 2,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX / 2,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: u * this.maxUX / 2 - r / 2,
              posY: this.strokeWeight / 2 + offset,
              radius: r,
              start: 0,
              end: PI / 2
            }
          );
        }
        if (this.char == "2") {
          if (this.maxUY > this.maxUX * 1.5) {
            r = u * this.maxUX - this.strokeWeight / 2 - offset;
            eY = this.maxUY - this.maxUX;
            this.parts.push(
              {
                type: "line",
                startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                startPosY: r / 2 + this.strokeWeight / 2 + offset,
                endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                endPosY: u * (eY / 2) + offset
              },
              {
                type: "line",
                startPosX: this.strokeWeight / 2 + offset,
                startPosY: u * this.maxUY - u * (eY / 2) - offset,
                endPosX: this.strokeWeight / 2 + offset,
                endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
              },
              {
                type: "arc",
                posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
                posY: u * (eY / 2) + offset,
                radius: r,
                start: 0,
                end: PI / 2
              },
              {
                type: "arc",
                posX: r / 2 + this.strokeWeight / 2 + offset,
                posY: u * this.maxUY / 2 + r / 2,
                radius: r,
                start: - PI,
                end: - PI / 2
              }
            );
          } else {
            r = u * this.maxUY / 2 - this.strokeWeight / 2 - offset;
            eY = 0;
            this.parts.push(
              {
                type: "arc",
                posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
                posY: r / 2 + this.strokeWeight / 2 + offset,
                radius: r,
                start: 0,
                end: PI / 2
              },
              {
                type: "arc",
                posX: r * 1.5 / 2 + this.strokeWeight / 2 + offset,
                posY: u * this.maxUY / 2 + r * 1.5 / 2,
                radius: r * 1.5,
                start: - PI,
                end: - PI / 2
              },
              {
                type: "line",
                startPosX: r * 1.5 / 2 + this.strokeWeight / 2 + offset,
                startPosY: u * this.maxUY / 2,
                endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
                endPosY: u * this.maxUY / 2
              },
              {
                type: "line",
                startPosX: this.strokeWeight / 2 + offset,
                startPosY: u * this.maxUY / 2 + r * 1.5 / 2,
                endPosX: this.strokeWeight / 2 + offset,
                endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
              }
            )
          }
          this.parts.push(
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI,
              end: - PI / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI / 2,
              end: 0
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "3") {
          if (this.maxUY > this.maxUX * 2) {
            r = u * this.maxUX - this.strokeWeight / 2 - offset;
            eY = this.maxUY - this.maxUX;
            this.parts.push(
              {
                type: "line",
                startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                startPosY: r / 2 + this.strokeWeight / 2 + offset,
                endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                endPosY: u * (eY / 2) + offset
              },
              {
                type: "arc",
                posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
                posY: u * (eY / 2) + offset,
                radius: r,
                start: 0,
                end: PI / 2
              },
              {
                type: "arc",
                posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
                posY: u * this.maxUY / 2 + r / 2,
                radius: r,
                start: - PI / 2,
                end: 0
              },
              {
                type: "line",
                startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                startPosY: u * this.maxUY / 2 + r / 2,
                endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                endPosY: u * this.maxUY - r / 2
              }
            );
          } else {
            r = u * this.maxUY / 2 - this.strokeWeight / 2 - offset;
            eY = 0;
            this.parts.push(
              {
                type: "arc",
                posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
                posY: r / 2 + this.strokeWeight / 2 + offset,
                radius: r,
                start: 0,
                end: PI / 2
              },
              {
                type: "line",
                startPosX: u * this.maxUX / 2,
                startPosY: u * this.maxUY / 2,
                endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
                endPosY: u * this.maxUY / 2
              },
              {
                type: "arc",
                posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
                posY: u * this.maxUY / 2 + r / 2,
                radius: r,
                start: - PI / 2,
                end: 0
              }
            )
          }
          this.parts.push(
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI,
              end: - PI / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI / 2,
              end: 0
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: PI / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: PI / 2,
              end: PI
            }
          );
        }
        if (this.char == "4") {
          if (this.maxUY > this.maxUX) {
            r = u * (this.maxUX / 2) - this.strokeWeight - offset * 2;
          } else {
            r = u * (this.maxUY / 2) - this.strokeWeight - offset * 2;
          }
          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * (this.maxUY / 4 * 3) - r / 2
            },
            {
              type: "line",
              startPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * (this.maxUY / 4 * 3) - r / 2,
              radius: r,
              start: PI / 2,
              end: PI
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * (this.maxUY / 4 * 3),
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: u * (this.maxUY / 4 * 3)
            }
          );
        }
        if (this.char == "5") {
          if (this.maxUY > this.maxUX * 2) {
            r = u * this.maxUX - this.strokeWeight / 2 - offset;
            eY = this.maxUY - this.maxUX;
            this.parts.push(
              {
                type: "line",
                startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                startPosY: u * this.maxUY / 2 + r / 2,
                endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                endPosY: u * this.maxUY - r / 2
              }
            );
          } else {
            r = u * this.maxUY / 2 - this.strokeWeight / 2 - offset;
            eY = 0;
          }
          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.maxUY / 2
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY / 2,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY / 2
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY / 2 + r / 2,
              radius: r,
              start: - PI / 2,
              end: 0
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: PI / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: PI / 2,
              end: PI
            }
          );
        }
        if (this.char == "6") {
          if (this.maxUY > this.maxUX * 2) {
            r = u * this.maxUX - this.strokeWeight / 2 - offset;
            eY = this.maxUY - this.maxUX;
            this.parts.push(
              {
                type: "line",
                startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                startPosY: u * this.maxUY / 2 + r / 2,
                endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                endPosY: u * this.maxUY - r / 2
              }
            );
          } else {
            r = u * this.maxUY / 2 - this.strokeWeight / 2 - offset;
            eY = 0;
          }
          this.parts.push(
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI,
              end: - PI / 2
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI / 2,
              end: 0
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.maxUY / 2 + r / 2,
              radius: r,
              start: - PI,
              end: - PI / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY / 2,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY / 2
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY / 2 + r / 2,
              radius: r,
              start: - PI / 2,
              end: 0
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: PI / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: PI / 2,
              end: PI
            }
          );
        }
        if (this.char == "7") {
          if (this.maxUY > this.maxUX) {
            r = u * this.maxUX / 2 - this.strokeWeight - offset * 2;
          } else {
            r = u * this.maxUY / 2 - this.strokeWeight - offset * 2;
          }
          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.maxUY / 4
            },
            {
              type: "line",
              startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY / 2 - r / 2
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY / 2 - r / 2,
              radius: r,
              start: 0,
              end: PI / 2
            },
            {
              type: "arc",
              posX: u * this.maxUX / 2 + r / 2,
              posY: u * this.maxUY / 2 + r / 2,
              radius: r,
              start: PI,
              end: PI * 1.5
            },
            {
              type: "line",
              startPosX: u * this.maxUX / 2 + r / 2,
              startPosY: u * this.maxUY / 2,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY / 2
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "line",
              startPosX: u * this.maxUX / 2,
              startPosY: u * this.maxUY / 2 + r / 2,
              endPosX: u * this.maxUX / 2,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "8") {
          if (this.maxUY > this.maxUX * 2) {
            r = u * this.maxUX - this.strokeWeight / 2 - offset;
            eY = this.maxUY - this.maxUX;
            this.parts.push(
              {
                type: "line",
                startPosX: this.strokeWeight / 2 + offset,
                startPosY: r / 2 + this.strokeWeight / 2 + offset,
                endPosX: this.strokeWeight / 2 + offset,
                endPosY: u * this.maxUY / 2 - r / 2
              },
              {
                type: "line",
                startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                startPosY: r / 2 + this.strokeWeight / 2 + offset,
                endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                endPosY: u * this.maxUY / 2 - r / 2
              },
              {
                type: "line",
                startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                startPosY: u * this.maxUY / 2 + r / 2,
                endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                endPosY: u * this.maxUY - r / 2
              },
              {
                type: "line",
                startPosX: this.strokeWeight / 2 + offset,
                startPosY: u * this.maxUY / 2 + r / 2,
                endPosX: this.strokeWeight / 2 + offset,
                endPosY: u * this.maxUY - r / 2
              },
              {
                type: "line",
                startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                startPosY: u * this.maxUY / 2 + r / 2,
                endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
                endPosY: u * this.maxUY - r / 2
              }
            );
          } else {
            r = u * this.maxUY / 2 - this.strokeWeight / 2 - offset;
            eY = 0;
          }
          this.parts.push(
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI,
              end: - PI / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI / 2,
              end: 0
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.maxUY / 2 - r / 2,
              radius: r,
              start: PI / 2,
              end: PI
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY / 2 - r / 2,
              radius: r,
              start: 0,
              end: PI / 2
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.maxUY / 2 + r / 2,
              radius: r,
              start: - PI,
              end: - PI / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY / 2,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY / 2
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY / 2 + r / 2,
              radius: r,
              start: - PI / 2,
              end: 0
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: PI / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: PI / 2,
              end: PI
            }
          );
        }
        if (this.char == "9") {
          if (this.maxUY > this.maxUX * 2) {
            r = u * this.maxUX - this.strokeWeight / 2 - offset;
            eY = this.maxUY - this.maxUX;
          } else {
            r = u * this.maxUY / 2 - this.strokeWeight / 2 - offset;
            eY = 0;
          }
          this.parts.push(
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI,
              end: - PI / 2
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.maxUY / 2 - r / 2
            },
            {
              type: "line",
              startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI / 2,
              end: 0
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.maxUY / 2 - r / 2,
              radius: r,
              start: PI / 2,
              end: PI
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY / 2,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY / 2
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY / 2 - r / 2,
              radius: r,
              start: 0,
              end: PI / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: PI / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: PI / 2,
              end: PI
            }
          );
        }
        if (this.char == "0") {
          if (this.maxUY > this.maxUX) {
            r = u * this.maxUX - this.strokeWeight / 2 - offset;
          } else {
            r = u * this.maxUY / 2 - this.strokeWeight / 2 - offset;
          }
          this.parts.push(
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI,
              end: - PI / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI / 2,
              end: 0
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - this.strokeWeight  / 2 - offset,
              endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: PI / 2,
              end: PI
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: PI / 2
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: r / 2 + this.strokeWeight / 2 + offset
            }
          );
        }
        if (this.char == ".") {
          this.parts.push(
            {
              type: "point",
              posX: u + this.strokeWeight / 2 + offset,
              posY: u * this.maxUY - this.strokeWeight / 2 - offset,
              radius: this.strokeWeight
            }
          );
        }
        if (this.char == ",") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * 1.5 + this.strokeWeight / 2 + offset,
              startPosY: u * (this.maxUY - 1.25) - this.strokeWeight / 2 - offset,
              endPosX: u + this.strokeWeight / 2 + offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "!") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.maxUX / 2,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX / 2,
              endPosY: u * (this.maxUY - 3) - this.strokeWeight / 2 - offset
            },
            {
              type: "point",
              posX: u * this.maxUX / 2,
              posY: u * this.maxUY - this.strokeWeight / 2 - offset,
              radius: this.strokeWeight
            }
          );
        }
        if (this.char == "?") {
          if (this.maxUY > this.maxUX * 2) {
            r = u * this.maxUX - this.strokeWeight / 2 - offset;
            eY = this.maxUY - this.maxUX;
            this.parts.push(
            );
          } else {
            r = u * this.maxUY / 2 - this.strokeWeight / 2 - offset;
            eY = 0;
            this.parts.push(

            );
          }
          this.parts.push(
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI,
              end: - PI / 2
            },
            {
              type: "line",
              startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY / 2 - r / 4 - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.maxUX / 2 + r / 4,
              startPosY: u * this.maxUY / 2 - this.strokeWeight / 2 - offset,
              endPosX: u * this.maxUX - r / 4 - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI / 2,
              end: 0
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 4 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY / 2 - r / 4 - this.strokeWeight / 2 - offset,
              radius: r / 2,
              start: 0,
              end: PI / 2
            },
            {
              type: "arc",
              posX: u * this.maxUX / 2 + r / 4,
              posY: u * this.maxUY / 2 + r / 4 - this.strokeWeight / 2 - offset,
              radius: r / 2,
              start: - PI,
              end: - PI / 2
            },
            {
              type: "line",
              startPosX: u * this.maxUX / 2,
              startPosY: u * this.maxUY / 2 + r / 4 - this.strokeWeight / 2 - offset,
              endPosX: u * this.maxUX / 2,
              endPosY: u * (this.maxUY - 3) - this.strokeWeight / 2 - offset
            },
            {
              type: "point",
              posX: u * this.maxUX / 2,
              posY: u * this.maxUY - this.strokeWeight / 2 - offset,
              radius: this.strokeWeight
            }
          );
        }
        if (this.char == ";") {
          this.parts.push(
            {
              type: "point",
              posX: u * 1.5 + this.strokeWeight / 2 + offset,
              posY: u * this.maxUY / 2,
              radius: this.strokeWeight
            },
            {
              type: "line",
              startPosX: u * 1.5 + this.strokeWeight / 2 + offset,
              startPosY: u * (this.maxUY - 1.25) - this.strokeWeight / 2 - offset,
              endPosX: u + this.strokeWeight / 2 + offset,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == ":") {
          this.parts.push(
            {
              type: "point",
              posX: u + this.strokeWeight / 2 + offset,
              posY: u * this.maxUY / 2,
              radius: this.strokeWeight
            },
            {
              type: "point",
              posX: u + this.strokeWeight / 2 + offset,
              posY: u * this.maxUY - this.strokeWeight / 2 - offset,
              radius: this.strokeWeight
            }
          );
        }
        if (this.char == "-") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.maxUX / 4,
              startPosY: u * this.maxUY / 2,
              endPosX: u * this.maxUX - u * this.maxUX / 4,
              endPosY: u * this.maxUY / 2
            }
          );
        }
        if (this.char == "=") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.maxUX / 4,
              startPosY: u * this.maxUY / 2.5,
              endPosX: u * this.maxUX - u * this.maxUX / 4,
              endPosY: u * this.maxUY / 2.5
            },
            {
              type: "line",
              startPosX: u * this.maxUX / 4,
              startPosY: u * this.maxUY - u * this.maxUY / 2.5,
              endPosX: u * this.maxUX - u * this.maxUX / 4,
              endPosY: u * this.maxUY - u * this.maxUY / 2.5
            }
          );
        }
        if (this.char == "+") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.maxUX / 4,
              startPosY: u * this.maxUY / 2,
              endPosX: u * this.maxUX - u * this.maxUX / 4,
              endPosY: u * this.maxUY / 2
            },
            {
              type: "line",
              startPosX: u * this.maxUX / 2,
              startPosY: u * this.maxUY / 4,
              endPosX: u * this.maxUX - u * this.maxUX / 2,
              endPosY: u * this.maxUY - u * this.maxUY / 4
            }
          );
        }
        if (this.char == "/") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.maxUX - u * this.maxUX / 4,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX / 4,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "\\") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.maxUX / 4,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - u * this.maxUX / 4,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "*") {
          if (this.maxUY > this.maxUX) {
            r = u * this.maxUX / 4;
          } else {
            r = u * this.maxUY / 4;
          }
          for (let theta = 90; theta < 360 + 90; theta+=360 / 6) {
            let pos = calcPos(r, theta, 6);
            let x = pos.x;
            let y = pos.y;
            this.parts.push(
              {
                type: "line",
                startPosX: u * this.maxUX / 2,
                startPosY: u * this.maxUY / 2,
                endPosX: u * this.maxUX / 2 + x,
                endPosY: u * this.maxUY / 2 + y
              }
            );
          }
        }
        if (this.char == "#") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.maxUX / 3,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX / 4,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.maxUX - u * this.maxUX / 4,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - u * this.maxUX / 3,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.maxUX / 14,
              startPosY: u * this.maxUY / 4,
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY / 4
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY - u * this.maxUY / 4,
              endPosX: u * this.maxUX - u * this.maxUX / 14,
              endPosY: u * this.maxUY - u * this.maxUY / 4
            }
          );
        }
        if (this.char == "$") {
          if (this.maxUY - this.maxUY / 4 > this.maxUX * 2) {
            r = u * this.maxUX - u * this.maxUX / 4 - this.strokeWeight / 2 - offset;
          } else {
            r = (u * this.maxUY - u * this.maxUY / 4) / 2 - this.strokeWeight / 2 - offset;
          }
          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY / 8 + r / 2,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.maxUY / 2 - r / 2
            },
            {
              type: "line",
              startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              startPosY: u * this.maxUY / 2 + r / 2,
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - u * this.maxUY / 8 - r / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY / 2,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY / 2
            },
            {
              type: "line",
              startPosX: u * this.maxUX / 3,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX / 3,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.maxUX - u * this.maxUX / 3,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - u * this.maxUX / 3,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY / 8,
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY / 8
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY - u * this.maxUY / 8,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - u * this.maxUY / 8
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.maxUY / 8 + r / 2,
              radius: r,
              start: - PI,
              end: - PI / 2
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.maxUY / 2 - r / 2,
              radius: r,
              start: PI / 2,
              end: PI
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY / 2 + r / 2,
              radius: r,
              start: - PI / 2,
              end: 0
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY - u * this.maxUY / 8 - r / 2,
              radius: r,
              start: 0,
              end: PI / 2
            }
          );
        }
        if (this.char == "¥") {
          if (this.maxUY > this.maxUX) {
            r = u * this.maxUX - this.strokeWeight - offset * 2;
          } else {
            r = u * this.maxUY - this.strokeWeight - offset * 2;
          }
          this.parts.push(
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: this.strokeWeight / 2 + offset,
              radius: r,
              start: PI / 2,
              end: PI
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: this.strokeWeight / 2 + offset,
              radius: r,
              start: 0,
              end: PI / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY / 2,
              endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY / 2
            },
            {
              type: "line",
              startPosX: u * this.maxUX / 2,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX / 2,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.maxUX / 2 - u * this.maxUX / 4,
              startPosY: u * this.maxUY / 2 + u * this.maxUY / 8,
              endPosX: u * this.maxUX / 2 + u * this.maxUX / 4,
              endPosY: u * this.maxUY / 2 + u * this.maxUY / 8
            },
            {
              type: "line",
              startPosX: u * this.maxUX / 2 - u * this.maxUX / 4,
              startPosY: u * this.maxUY / 2 + u * this.maxUY / 4,
              endPosX: u * this.maxUX / 2 + u * this.maxUX / 4,
              endPosY: u * this.maxUY / 2 + u * this.maxUY / 4
            }
          );
        }
        if (this.char == "&") {
          let lr;
          if (this.maxUY > this.maxUX) {
            r = u * this.maxUX / 2 - this.strokeWeight - offset * 2;
            lr = (u * this.maxUY - r / 2 - this.strokeWeight - offset * 2) * 2;
          } else {
            r = u * this.maxUY / 2 - this.strokeWeight - offset * 2;
            lr = (u * this.maxUY - r / 2 - this.strokeWeight - offset * 2) * 2;
          }
          this.parts.push(
            {
              type: "arc",
              posX: u * this.maxUX / 6 + r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI,
              end: - PI / 2
            },
            {
              type: "line",
              startPosX: u * this.maxUX / 6 + r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - (u * this.maxUX / 6 + r / 2) - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "arc",
              posX: u * this.maxUX - u * this.maxUX / 6 - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI / 2,
              end: 0
            },
            {
              type: "line",
              startPosX: u * this.maxUX - u * this.maxUX / 6 - this.strokeWeight / 2 - offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - u * this.maxUX / 6 - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY / 2 - r / 2
            },
            {
              type: "arc",
              posX: u * this.maxUX - u * this.maxUX / 6 - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY / 2 - r / 2,
              radius: r,
              start: 0,
              end: PI / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY / 2,
              endPosX: u * this.maxUX - (u * this.maxUX / 6 + r / 2) - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY / 2
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.maxUY / 2 + r / 2,
              radius: r,
              start: - PI,
              end: - PI / 2
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY / 2 + r / 2,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: PI / 2,
              end: PI
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
              endPosX: u * this.maxUX - r * 1.5 / 2,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: u * this.maxUX - r * 1.5 / 2,
              posY: u * this.maxUY - r * 1.5 / 2 - this.strokeWeight / 2 - offset,
              radius: r * 1.5,
              start: 0,
              end: PI / 2
            },
            {
              type: "arc",
              posX: u * this.maxUX,
              posY: u * this.maxUY - lr / 2 - this.strokeWeight / 2 - offset,
              radius: (u * this.maxUX - u * this.maxUX / 6) * 2 - this.strokeWeight / 2 - offset * 2,
              radiusY: lr,
              start: PI / 2,
              end: PI
            }
          );
        }
        if (this.char == "@") {
          if (this.maxUY > this.maxUX) {
            r = u * this.maxUX - this.strokeWeight - offset * 2;
            this.parts.push(
              // 外
              {
                type: "line",
                startPosX: this.strokeWeight / 2 + offset,
                startPosY: r / 2 + this.strokeWeight / 2 + offset,
                endPosX: this.strokeWeight / 2 + offset,
                endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
              },
              // 内
              {
                type: "line",
                startPosX: r / 2 - r / 1.75 / 2 + this.strokeWeight / 2 + offset,
                startPosY: r / 2 + this.strokeWeight / 2 + offset,
                endPosX: r / 2 - r / 1.75 / 2 + this.strokeWeight / 2 + offset,
                endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
              }
            );
          } else {
            r = u * this.maxUY - this.strokeWeight - offset * 2;
            this.parts.push(
              // 外
              {
                type: "line",
                startPosX: r / 2 + this.strokeWeight / 2 + offset,
                startPosY: this.strokeWeight / 2 + offset,
                endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
                endPosY: this.strokeWeight / 2 + offset
              },
              {
                type: "line",
                startPosX: r / 2 + this.strokeWeight / 2 + offset,
                startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
                endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
                endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
              },
              // 内
              {
                type: "line",
                startPosX: r / 2 + this.strokeWeight / 2 + offset,
                startPosY: r / 2 - r / 1.75 / 2 + this.strokeWeight / 2 + offset,
                endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
                endPosY: r / 2 - r / 1.75 / 2 + this.strokeWeight / 2 + offset
              },
              {
                type: "line",
                startPosX: r / 2 + this.strokeWeight / 2 + offset,
                startPosY: u * this.maxUY - (r / 2 - r / 1.75 / 2) - this.strokeWeight / 2 - offset,
                endPosX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
                endPosY: u * this.maxUY - (r / 2 - r / 1.75 / 2) - this.strokeWeight / 2 - offset
              }
            );
          }
          this.parts.push(
            // 外
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI,
              end: - PI / 2
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: PI / 2,
              end: - PI
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI / 2,
              end: 0
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: PI / 3,
              end: PI / 2
            },
            {
              type: "line",
              startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - r / 2.5 - this.strokeWeight / 2 - offset
            },
            // 内
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r / 1.75,
              start: - PI,
              end: - PI / 2
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r / 1.75,
              start: PI / 2,
              end: - PI
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r / 1.75,
              start: - PI / 2,
              end: 0
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r / 1.75,
              start: 0,
              end: PI / 2
            },
            {
              type: "line",
              startPosX: u * this.maxUX - (r / 2 - r / 1.75 / 2) - this.strokeWeight / 2 - offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - (r / 2 - r / 1.75 / 2) - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - r / 2.5 - this.strokeWeight / 2 - offset
            },
            // つなぎ
            {
              type: "arc",
              posX: u * this.maxUX - (r - r / 1.75) / 4 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY - r / 2.5 - this.strokeWeight / 2 - offset,
              radius: (r - r / 1.75) / 2,
              start: 0,
              end: PI
            }
          );
        }
        if (this.char == "%") {
          if (this.maxUY > this.maxUX) {
            r = u * this.maxUX / 2 - this.strokeWeight - offset * 2
          } else {
            r = u * this.maxUY / 2 - this.strokeWeight - offset * 2
          }
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.maxUX - u * this.maxUX / 4,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX / 4,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI,
              end: 0
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + u * this.maxUY / 8 + this.strokeWeight / 2 + offset,
              radius: r,
              start: 0,
              end: PI
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY - r / 2 - u * this.maxUY / 8 - this.strokeWeight / 2 - offset,
              radius: r,
              start: - PI,
              end: 0
            },
            {
              type: "arc",
              posX: u * this.maxUX - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: PI
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: r / 2 + u * this.maxUY / 8 + this.strokeWeight / 2 + offset
            },
            {
              type: "line",
              startPosX: r + this.strokeWeight / 2 + offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: r + this.strokeWeight / 2 + offset,
              endPosY: r / 2 + u * this.maxUY / 8 + this.strokeWeight / 2 + offset
            },
            {
              type: "line",
              startPosX: u * this.maxUX - r - this.strokeWeight / 2 - offset,
              startPosY: u * this.maxUY - u * this.maxUY / 8 - r / 2 - this.strokeWeight / 2 - offset,
              endPosX: u * this.maxUX - r - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              startPosY: u * this.maxUY - u * this.maxUY / 8 - r / 2 - this.strokeWeight / 2 - offset,
              endPosX: u * this.maxUX - this.strokeWeight / 2 - offset,
              endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "(") {
          if (this.maxUY > this.maxUX) {
            r = u * this.maxUX - this.strokeWeight - offset * 2
          } else {
            r = u * this.maxUY - this.strokeWeight - offset * 2
          }
          this.parts.push(
            {
              type: "arc",
              posX: u * this.maxUX / 4 + r / 2,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI,
              end: - PI / 2
            },
            {
              type: "line",
              startPosX: u * this.maxUX / 4,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX / 4,
              endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: u * this.maxUX / 4 + r / 2,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: PI / 2,
              end: PI
            }
          );
        }
        if (this.char == ")") {
          if (this.maxUY > this.maxUX) {
            r = u * this.maxUX - this.strokeWeight - offset * 2
          } else {
            r = u * this.maxUY - this.strokeWeight - offset * 2
          }
          this.parts.push(
            {
              type: "arc",
              posX: u * this.maxUX - u * this.maxUX / 4 - r / 2,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI / 2,
              end: 0
            },
            {
              type: "line",
              startPosX: u * this.maxUX - u * this.maxUX / 4,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - u * this.maxUX / 4,
              endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: u * this.maxUX - u * this.maxUX / 4 - r / 2,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: PI / 2
            }
          );
        }
        if (this.char == "[") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.maxUX / 4,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX / 2 + u * this.maxUX / 6,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "line",
              startPosX: u * this.maxUX / 4,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX / 4,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.maxUX / 4,
              startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
              endPosX: u * this.maxUX / 2 + u * this.maxUX / 6,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "]") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.maxUX / 2 - u * this.maxUX / 6,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - u * this.maxUX / 4,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "line",
              startPosX: u * this.maxUX - u * this.maxUX / 4,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - u * this.maxUX / 4,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.maxUX / 2 - u * this.maxUX / 6,
              startPosY: u * this.maxUY - this.strokeWeight / 2 - offset,
              endPosX: u * this.maxUX - u * this.maxUX / 4,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "<") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.maxUX / 2 + u * this.maxUX / 6,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX / 4,
              endPosY: u * this.maxUY / 2
            },
            {
              type: "line",
              startPosX: u * this.maxUX / 4,
              startPosY: u * this.maxUY / 2,
              endPosX: u * this.maxUX / 2 + u * this.maxUX / 6,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == ">") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.maxUX / 2 - u * this.maxUX / 6,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - u * this.maxUX / 4,
              endPosY: u * this.maxUY / 2
            },
            {
              type: "line",
              startPosX: u * this.maxUX - u * this.maxUX / 4,
              startPosY: u * this.maxUY / 2,
              endPosX: u * this.maxUX / 2 - u * this.maxUX / 6,
              endPosY: u * this.maxUY - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "{") {
          if (this.maxUY > this.maxUX) {
            r = u * this.maxUX / 2 - this.strokeWeight - offset * 2
          } else {
            r = u * this.maxUY / 2 - this.strokeWeight - offset * 2
          }
          this.parts.push(
            {
              type: "arc",
              posX: u * this.maxUX / 4 + r,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI,
              end: - PI / 2
            },
            {
              type: "line",
              startPosX: u * this.maxUX / 4 + r / 2,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX / 4 + r / 2,
              endPosY: u * this.maxUY / 2 - r / 4
            },
            {
              type: "arc",
              posX: u * this.maxUX / 4 + r / 4,
              posY: u * this.maxUY / 2 - r / 4,
              radius: r / 2,
              start: 0,
              end: PI / 2
            },
            {
              type: "arc",
              posX: u * this.maxUX / 4 + r / 4,
              posY: u * this.maxUY / 2 + r / 4,
              radius: r / 2,
              start: - PI / 2,
              end: 0
            },
            {
              type: "line",
              startPosX: u * this.maxUX / 4 + r / 2,
              startPosY: u * this.maxUY / 2 + r / 4,
              endPosX: u * this.maxUX / 4 + r / 2,
              endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: u * this.maxUX / 4 + r,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: PI / 2,
              end: PI
            }
          );
        }
        if (this.char == "}") {
          if (this.maxUY > this.maxUX) {
            r = u * this.maxUX / 2 - this.strokeWeight - offset * 2
          } else {
            r = u * this.maxUY / 2 - this.strokeWeight - offset * 2
          }
          this.parts.push(
            {
              type: "arc",
              posX: u * this.maxUX - u * this.maxUX / 4 - r,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - PI / 2,
              end: 0
            },
            {
              type: "line",
              startPosX: u * this.maxUX - u * this.maxUX / 4 - r / 2,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - u * this.maxUX / 4 - r / 2,
              endPosY: u * this.maxUY / 2 - r / 4
            },
            {
              type: "arc",
              posX: u * this.maxUX - u * this.maxUX / 4 - r / 4,
              posY: u * this.maxUY / 2 - r / 4,
              radius: r / 2,
              start: PI / 2,
              end: - PI
            },
            {
              type: "arc",
              posX: u * this.maxUX - u * this.maxUX / 4 - r / 4,
              posY: u * this.maxUY / 2 + r / 4,
              radius: r / 2,
              start: - PI,
              end: - PI / 2
            },
            {
              type: "line",
              startPosX: u * this.maxUX - u * this.maxUX / 4 - r / 2,
              startPosY: u * this.maxUY / 2 + r / 4,
              endPosX: u * this.maxUX - u * this.maxUX / 4 - r / 2,
              endPosY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: u * this.maxUX - u * this.maxUX / 4 - r,
              posY: u * this.maxUY - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: PI / 2
            }
          );
        }
        if (this.char == "\'") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.maxUX / 2,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX / 2,
              endPosY: u * this.maxUY / 6
            }
          );
        }
        if (this.char == "\"") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * (this.maxUX / 2 - 1),
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * (this.maxUX / 2 - 1),
              endPosY: u * this.maxUY / 6
            },
            {
              type: "line",
              startPosX: u * (this.maxUX / 2 + 1),
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * (this.maxUX / 2 + 1),
              endPosY: u * this.maxUY / 6
            }
          );
        }
        if (this.char == "^") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.maxUX / 2,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX / 4,
              endPosY: u * this.maxUY / 6
            },
            {
              type: "line",
              startPosX: u * this.maxUX / 2,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.maxUX - u * this.maxUX / 4,
              endPosY: u * this.maxUY / 6
            }
          );
        }
        if (this.char == "~") {
          if (this.maxUY > this.maxUX) {
            r = u * this.maxUX / 2 - this.strokeWeight / 2 - offset
          } else {
            r = u * this.maxUY / 2 - this.strokeWeight / 2 - offset
          }
          this.parts.push(
            {
              type: "arc",
              posX: u * this.maxUX / 2 - r / 2,
              posY: u * this.maxUY / 2,
              radius: r,
              start: - PI,
              end: 0
            },
            {
              type: "arc",
              posX: u * this.maxUX / 2 + r / 2,
              posY: u * this.maxUY / 2,
              radius: r,
              start: 0,
              end: PI
            }
          );
        }
        break;

      // bitmap style
      case "bitmap":
        if (this.char == "A") {
          this.parts.push({
            type: "rect",
            posX: u * 2 + offset,
            posY: offset,
            width: u * (this.maxUX - 4) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u + offset,
            width: u,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 2) - offset,
            posY: u + offset,
            width: u,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u * 2 + offset,
            width: u,
            height: u * (this.maxUY - 2) - offset * 2
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u * 2 + offset,
            width: u,
            height: u * (this.maxUY - 2) - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) / 2 + 1),
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          });
        }
        if (this.char == "B") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * this.maxUY - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.maxUX - 3) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 2) - offset,
            posY: u + offset,
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) / 2),
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u * ((this.maxUY - 1) / 2),
            width: u,
            height: u * ((this.maxUY - 1) / 2 + 1) - offset
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          });
        }
        if (this.char == "C") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.maxUX - 1) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * (this.maxUY - 2) - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u * (this.maxUX - 1) - offset * 2,
            height: u
          });
        }
        if (this.char == "D") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * this.maxUY - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.maxUX - 3) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 2) - offset,
            posY: u + offset,
            width: u,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u * 2 + offset,
            width: u,
            height: u * (this.maxUY - 3) - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          });
        }
        if (this.char == "E") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * this.maxUY - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.maxUX - 1) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) / 2),
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u * (this.maxUX - 1) - offset * 2,
            height: u
          });
        }
        if (this.char == "F") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * this.maxUY - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.maxUX - 1) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) / 2),
            width: u * (this.maxUX - 3) - offset * 2,
            height: u
          });
        }
        if (this.char == "G") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.maxUX - 1) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * (this.maxUY - 2) - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u * ((this.maxUY - 1) / 2) + offset,
            width: u,
            height: u * ((this.maxUY - 1) / 2 + 1) - offset * 2
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2) + offset,
            posY: u * ((this.maxUY - 1) / 2) + offset,
            width: u * ((this.maxUX - 1) / 2) - offset * 2,
            height: u
          });
        }
        if (this.char == "H") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * this.maxUY - offset * 2
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: offset,
            width: u,
            height: u * this.maxUY - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) / 2),
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          });
        }
        if (this.char == "I") {
          this.parts.push({
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2),
            posY: offset,
            width: u,
            height: u * this.maxUY - offset * 2
          },
          {
            type: "rect",
            posX: offset,
            posY: offset,
            width: u * this.maxUX - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u * this.maxUX - offset * 2,
            height: u
          });
        }
        if (this.char == "J") {
          this.parts.push({
            type: "rect",
            posX: u * (this.maxUX - 2) - offset,
            posY: u + offset,
            width: u,
            height: u * (this.maxUY - 2) - offset * 2
          },
          {
            type: "rect",
            posX: offset,
            posY: offset,
            width: u * this.maxUX - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          });
        }
        if (this.char == "K") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * this.maxUY - offset * 2
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: offset,
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 2) - offset,
            posY: u * ((this.maxUY - 1) / 2 - 1),
            width: u,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) / 2),
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u * ((this.maxUY - 1) / 2 + 1),
            width: u,
            height: u * ((this.maxUY - 1) / 2) - offset
          });
        }
        if (this.char == "L") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * this.maxUY - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u * (this.maxUX - 1) - offset * 2,
            height: u
          });
        }
        if (this.char == "M") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * (this.maxUY - 1) - offset * 2
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u + offset,
            width: u,
            height: u * (this.maxUY - 1) - offset * 2
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2),
            posY: u + offset,
            width: u,
            height: u * (this.maxUY - 2) - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * ((this.maxUX - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2 + 1),
            posY: offset,
            width: u * ((this.maxUX - 3) / 2) - offset,
            height: u
          });
        }
        if (this.char == "N") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * this.maxUY - offset * 2
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: offset,
            width: u,
            height: u * this.maxUY - offset * 2
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2),
            posY: u + offset,
            width: u,
            height: u * (this.maxUY - 2) - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * ((this.maxUX - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2 + 1),
            posY: u * (this.maxUY - 1) - offset,
            width: u * ((this.maxUX - 3) / 2) - offset,
            height: u
          });
        }
        if (this.char == "O") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * (this.maxUY - 2) - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u + offset,
            width: u,
            height: u * (this.maxUY - 2) - offset * 2
          });
        }
        if (this.char == "P") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * this.maxUY - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) / 2),
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u + offset,
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          });
        }
        if (this.char == "Q") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * (this.maxUY - 2) - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u * (this.maxUX - 3) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u + offset,
            width: u,
            height: u * (this.maxUY - 3) - offset * 2
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 3) - offset,
            posY: u * (this.maxUY - 3) - offset,
            width: u,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 2) - offset,
            posY: u * (this.maxUY - 2) - offset,
            width: u,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u,
            height: u
          });
        }
        if (this.char == "R") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * this.maxUY - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) / 2),
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u + offset,
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 2) - offset,
            posY: u * ((this.maxUY - 1) / 2 + 1),
            width: u,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u * ((this.maxUY - 1) / 2 + 2),
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          });
        }
        if (this.char == "S") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.maxUX - 1) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) / 2),
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u * (this.maxUX - 1) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u * ((this.maxUY - 1) / 2 + 1),
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          });
        }
        if (this.char == "T") {
          this.parts.push({
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2),
            posY: offset,
            width: u,
            height: u * this.maxUY - offset * 2
          },
          {
            type: "rect",
            posX: offset,
            posY: offset,
            width: u * this.maxUX - offset * 2,
            height: u
          });
        }
        if (this.char == "U") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * (this.maxUY - 1) - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: offset,
            width: u,
            height: u * (this.maxUY - 1) - offset * 2
          });
        }
        if (this.char == "V") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * ((this.maxUY - 1) / 2 + 1) - offset
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) / 2 + 1),
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 2) - offset,
            posY: u * ((this.maxUY - 1) / 2 + 1),
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u * 2 + offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u * (this.maxUX - 4) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: offset,
            width: u,
            height: u * ((this.maxUY - 1) / 2 + 1) - offset
          });
        }
        if (this.char == "W") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * (this.maxUY - 1) - offset * 2
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: offset,
            width: u,
            height: u * (this.maxUY - 1) - offset * 2
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2),
            posY: u + offset,
            width: u,
            height: u * (this.maxUY - 2) - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u * ((this.maxUX - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2 + 1),
            posY: u * (this.maxUY - 1) - offset,
            width: u * ((this.maxUX - 3) / 2) - offset,
            height: u
          });
        }
        if (this.char == "X") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) / 2 - 1),
            width: u * ((this.maxUX - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2 + 1),
            posY: u * ((this.maxUY - 1) / 2 - 1),
            width: u * ((this.maxUX - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2),
            posY: u * ((this.maxUY - 1) / 2),
            width: u,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: offset,
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) / 2 + 1),
            width: u * ((this.maxUX - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2 + 1),
            posY: u * ((this.maxUY - 1) / 2 + 1),
            width: u * ((this.maxUX - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u * ((this.maxUY - 1) / 2 + 2),
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u * ((this.maxUY - 1) / 2 + 2),
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          });
        }
        if (this.char == "Y") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) / 2 - 1),
            width: u * ((this.maxUX - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2 + 1),
            posY: u * ((this.maxUY - 1) / 2 - 1),
            width: u * ((this.maxUX - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2),
            posY: u * ((this.maxUY - 1) / 2),
            width: u,
            height: u * ((this.maxUY - 1) / 2 + 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: offset,
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          });
        }
        if (this.char == "Z") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u * this.maxUX - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) / 2),
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u * this.maxUX - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u + offset,
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: offset,
            posY: u * ((this.maxUY - 1) / 2 + 1),
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          });
        }
        if (this.char == "0") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * (this.maxUY - 2) - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u + offset,
            width: u,
            height: u * (this.maxUY - 2) - offset * 2
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2),
            posY: u * ((this.maxUY - 1) / 2),
            width: u,
            height: u
          });
        }
        if (this.char == "1") {
          this.parts.push({
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2),
            posY: offset,
            width: u,
            height: u * this.maxUY - offset * 2
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2 - 2) + offset,
            posY: offset,
            width: u * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u * this.maxUX - offset * 2,
            height: u
          });
        }
        if (this.char == "2") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) / 2),
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u * this.maxUX - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u + offset,
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: offset,
            posY: u * ((this.maxUY - 1) / 2 + 1),
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          });
        }
        if (this.char == "3") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) / 2),
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u * (this.maxUX - 1) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u + offset,
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u * ((this.maxUY - 1) / 2 + 1),
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          });
        }
        if (this.char == "4") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * ((this.maxUY - 1) / 2 + 2) - offset
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) / 2 + 1),
            width: u * (this.maxUX - 1) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 2) - offset,
            posY: u + offset,
            width: u,
            height: u * (this.maxUY - 1) - offset * 2
          });
        }
        if (this.char == "5") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u * (this.maxUX - 1) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u * ((this.maxUY - 1) / 2),
            width: u * (this.maxUX - 1) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u * (this.maxUX - 1) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u * ((this.maxUY - 1) / 2 + 1),
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          });
        }
        if (this.char == "6") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u * ((this.maxUY - 1) / 2),
            width: u * (this.maxUX - 1) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * (this.maxUY - 2) - offset * 2
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u * ((this.maxUY - 1) / 2 + 1),
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          });
        }
        if (this.char == "7") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u * this.maxUX - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 2) - offset,
            posY: u * ((this.maxUY - 1) / 2),
            width: u,
            height: u * ((this.maxUY - 1) / 2 + 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u + offset,
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          });
        }
        if (this.char == "8") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) / 2),
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u + offset,
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: offset,
            posY: u * ((this.maxUY - 1) / 2 + 1),
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u * ((this.maxUY - 1) / 2 + 1),
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          });
        }
        if (this.char == "9") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) / 2),
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u + offset,
            width: u,
            height: u * (this.maxUY - 2) - offset * 2
          });
        }
        if (this.char == ",") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: u * (this.maxUY - 2) - offset,
            width: u * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * 2 + offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u,
            height: u
          });
        }
        if (this.char == ".") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: u * (this.maxUY - 1.5) - offset,
            width: u * 1.5,
            height: u * 1.5
          });
        }
        if (this.char == "!") {
          this.parts.push(
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2),
            posY: offset,
            width: u,
            height: u * (this.maxUY - 2) - offset * 2
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2 - 0.25),
            posY: u * (this.maxUY - 1) - offset,
            width: u * 1.5,
            height: u * 1
          });
        }
        if (this.char == "?") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset * 2
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2 + 1),
            posY: u * ((this.maxUY - 1) / 2) - offset,
            width: u * ((this.maxUX - 1) / 2 - 1) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2),
            posY: u * ((this.maxUY - 1) / 2 + 0.5),
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1.25) - offset
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u + offset,
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset * 2
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2 - 0.25),
            posY: u * (this.maxUY - 1) - offset,
            width: u * 1.5,
            height: u
          });
        }
        if (this.char == ":") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) / 2 - 1.5),
            width: u * 1.5,
            height: u * 1.5
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) / 2 + 1) + offset,
            width: u * 1.5,
            height: u * 1.5
          });
        }
        if (this.char == ";") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) / 2 - 1.5),
            width: u * 1.5,
            height: u * 1.5
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.maxUY - 2) - offset,
            width: u * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * 2 + offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u,
            height: u
          });
        }
        if (this.char == "-") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) / 2),
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          });
        }
        if (this.char == "+") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) / 2),
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2),
            posY: u + offset,
            width: u,
            height: u * (this.maxUY - 2) - offset * 2
          });
        }
        if (this.char == "=") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) / 2 - 1),
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) / 2 + 1),
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          });
        }
        if (this.char == "*") {
          this.parts.push(
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) / 2 - 1),
            width: u * ((this.maxUX - 2) / 3) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) - ((this.maxUX - 2) / 3)),
            posY: u * ((this.maxUY - 1) / 2 - 1),
            width: u * ((this.maxUX - 2) / 3) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 2) / 3 + 1),
            posY: u * ((this.maxUY - 1) / 2),
            width: u * ((this.maxUX - 2) / 3),
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) / 2 + 1),
            width: u * ((this.maxUX - 2) / 3) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) - ((this.maxUX - 2) / 3)),
            posY: u * ((this.maxUY - 1) / 2 + 1),
            width: u * ((this.maxUX - 2) / 3) - offset,
            height: u
          });
        }
        if (this.char == "/") {
          this.parts.push({
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: offset,
            width: u,
            height: u * ((this.maxUY - 2) / 3) - offset
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2 + 1),
            posY: u * ((this.maxUY - 2) / 3),
            width: u * ((this.maxUX - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2),
            posY: u * ((this.maxUY - 2) / 3 + 1),
            width: u,
            height: u * ((this.maxUY - 2) / 3)
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) - ((this.maxUY - 2) / 3)),
            width: u * ((this.maxUX - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u * ((this.maxUY) - (this.maxUY - 2) / 3),
            width: u,
            height: u * ((this.maxUY - 2) / 3) - offset
          });
        }
        if (this.char == "\\") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * ((this.maxUY - 2) / 3) - offset
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 2) / 3),
            width: u * ((this.maxUX - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2),
            posY: u * ((this.maxUY - 2) / 3 + 1),
            width: u,
            height: u * ((this.maxUY - 2) / 3)
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2 + 1),
            posY: u * ((this.maxUY - 1) - ((this.maxUY - 2) / 3)),
            width: u * ((this.maxUX - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u * ((this.maxUY) - (this.maxUY - 2) / 3),
            width: u,
            height: u * ((this.maxUY - 2) / 3) - offset
          });
        }
        if (this.char == "#") {
          this.parts.push({
            type: "rect",
            posX: u * ((this.maxUX - 2) / 3) + offset,
            posY: offset,
            width: u,
            height: u * this.maxUY - offset * 2
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 0.75) - (this.maxUX - 2) / 3) - offset,
            posY: offset,
            width: u,
            height: u * this.maxUY - offset * 2
          },
          {
            type: "rect",
            posX: u * 0.5 + offset,
            posY: u * ((this.maxUY - 2) / 3) + offset,
            width: u * (this.maxUX - 0.75) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * 0.5 + offset,
            posY: u * (this.maxUY - 1 - (this.maxUY - 2) / 3) - offset,
            width: u * (this.maxUX - 0.75) - offset * 2,
            height: u
          });
        }
        if (this.char == "$") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) / 2),
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u * ((this.maxUY - 1) / 2 + 1),
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2),
            posY: offset,
            width: u,
            height: u * this.maxUY - offset * 2
          });
        }
        if (this.char == "¥") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) / 2 - 1),
            width: u * ((this.maxUX - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2 + 1),
            posY: u * ((this.maxUY - 1) / 2 - 1),
            width: u * ((this.maxUX - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2),
            posY: u * ((this.maxUY - 1) / 2),
            width: u,
            height: u * ((this.maxUY - 1) / 2 + 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: offset,
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) / 2 + 1) + offset,
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          });
        }
        if (this.char == "@") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.maxUX - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * (this.maxUY - 2) - offset * 2
          },
          {
            type: "rect",
            posX: u * 3 + offset,
            posY: u * 2 + offset,
            width: u * (this.maxUX - 4),
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u + offset,
            width: u,
            height: u * (this.maxUY - 2) - offset * 2
          },
          {
            type: "rect",
            posX: u * 2 + offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u * (this.maxUX - 3) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * 2 + offset,
            posY: u * 3 + offset,
            width: u,
            height: u * (this.maxUY - 3) - offset * 2
          });
        }
        if (this.char == "%") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * ((this.maxUX - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 2) / 3 + 1),
            width: u * ((this.maxUX - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * ((this.maxUY - 2) / 3) - offset
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 3) / 2 + 1),
            posY: u + offset,
            width: u,
            height: u * ((this.maxUY - 2) / 3) - offset
          },

          {
            type: "rect",
            posX: u * ((this.maxUX - 3) / 2 + 2),
            posY: u * ((this.maxUY - 2) / 3 * 2),
            width: u * ((this.maxUX - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 3) / 2 + 2),
            posY: u * (this.maxUY - 1) - offset,
            width: u * ((this.maxUX - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u * ((this.maxUY - 2) / 3 * 2 + 1),
            width: u,
            height: u * ((this.maxUY - 2) / 3) - offset
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 3) / 2 + 1),
            posY: u * ((this.maxUY - 2) / 3 * 2 + 1),
            width: u,
            height: u * ((this.maxUY - 2) / 3) - offset
          },

          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: offset,
            width: u,
            height: u * ((this.maxUY - 2) / 3) - offset
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2 + 1),
            posY: u * ((this.maxUY - 2) / 3),
            width: u * ((this.maxUX - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2),
            posY: u * ((this.maxUY - 2) / 3 + 1),
            width: u,
            height: u * ((this.maxUY - 2) / 3)
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) - ((this.maxUY - 2) / 3)),
            width: u * ((this.maxUX - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u * ((this.maxUY) - (this.maxUY - 2) / 3),
            width: u,
            height: u * ((this.maxUY - 2) / 3) - offset
          });
        }
        if (this.char == "&") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.maxUX - 4) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.maxUY - 1) / 2),
            width: u * (this.maxUX - 3) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u * (this.maxUX - 3) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: offset,
            posY: u * ((this.maxUY - 1) / 2 + 1),
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u * ((this.maxUY - 1) / 2),
            width: u,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 3) - offset,
            posY: u + offset,
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 2) - offset,
            posY: u * ((this.maxUY - 1) / 2 + 1),
            width: u,
            height: u * ((this.maxUY - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u,
            height: u
          });
        }
        if (this.char == "(") {
          this.parts.push({
            type: "rect",
            posX: u * (this.maxUX - 2) - offset,
            posY: offset,
            width: u,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 2) - offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 3) - offset,
            posY: u + offset,
            width: u,
            height: u * (this.maxUY - 2) - offset * 2
          });
        }
        if (this.char == ")") {
          this.parts.push({
            type: "rect",
            posX: u * 2 + offset,
            posY: offset,
            width: u,
            height: u
          },
          {
            type: "rect",
            posX: u * 2 + offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u,
            height: u
          },
          {
            type: "rect",
            posX: u * 3 + offset,
            posY: u + offset,
            width: u,
            height: u * (this.maxUY - 2) - offset * 2
          });
        }
        if (this.char == "[") {
          this.parts.push({
            type: "rect",
            posX: u * (this.maxUX - 3) - offset,
            posY: offset,
            width: u * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 3) - offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 3) - offset,
            posY: offset,
            width: u,
            height: u * this.maxUY - offset * 2
          });
        }
        if (this.char == "]") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * 2 + offset,
            posY: offset,
            width: u,
            height: u * this.maxUY - offset * 2
          });
        }
        if (this.char == "<") {
          this.parts.push({
            type: "rect",
            posX: u * (this.maxUX - 2) - offset,
            posY: offset,
            width: u,
            height: u * (this.maxUY / 5)
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 2) - offset,
            posY: u * (this.maxUY / 5 * 4) - offset,
            width: u,
            height: u * (this.maxUY / 5)
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 3) - offset,
            posY: u * (this.maxUY / 5),
            width: u,
            height: u * (this.maxUY / 5)
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 3) - offset,
            posY: u * (this.maxUY / 5 * 3),
            width: u,
            height: u * (this.maxUY / 5)
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 4) - offset,
            posY: u * (this.maxUY / 5 * 2),
            width: u,
            height: u * (this.maxUY / 5)
          });
        }
        if (this.char == ">") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u,
            height: u * (this.maxUY / 5)
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.maxUY / 5 * 4) - offset,
            width: u,
            height: u * (this.maxUY / 5)
          },
          {
            type: "rect",
            posX: u * 2 + offset,
            posY: u * (this.maxUY / 5),
            width: u,
            height: u * (this.maxUY / 5)
          },
          {
            type: "rect",
            posX: u * 2 + offset,
            posY: u * (this.maxUY / 5 * 3),
            width: u,
            height: u * (this.maxUY / 5)
          },
          {
            type: "rect",
            posX: u * 3 + offset,
            posY: u * (this.maxUY / 5 * 2),
            width: u,
            height: u * (this.maxUY / 5)
          });
        }
        if (this.char == "{") {
          this.parts.push({
            type: "rect",
            posX: u * (this.maxUX - 3) - offset,
            posY: offset,
            width: u * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 3) - offset,
            posY: offset,
            width: u,
            height: u * ((this.maxUY - 1) / 2) - offset
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 4) - offset,
            posY: u * ((this.maxUY - 1) / 2),
            width: u,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 3) - offset,
            posY: u * ((this.maxUY - 1) / 2 + 1),
            width: u,
            height: u * ((this.maxUY - 1) / 2) - offset
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 3) - offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u * 2,
            height: u
          });
        }
        if (this.char == "}") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * 2 + offset,
            posY: offset,
            width: u,
            height: u * ((this.maxUY - 1) / 2) - offset
          },
          {
            type: "rect",
            posX: u * 3 + offset,
            posY: u * ((this.maxUY - 1) / 2),
            width: u,
            height: u
          },
          {
            type: "rect",
            posX: u * 2 + offset,
            posY: u * ((this.maxUY - 1) / 2 + 1),
            width: u,
            height: u * ((this.maxUY - 1) / 2) - offset
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.maxUY - 1) - offset,
            width: u * 2,
            height: u
          });
        }
        if (this.char == "^") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: u * 2 + offset,
            width: u * (this.maxUX / 5),
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX / 5),
            posY: u + offset,
            width: u * (this.maxUX / 5),
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX / 5 * 2),
            posY: offset,
            width: u * (this.maxUX / 5),
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX / 5 * 3),
            posY: u + offset,
            width: u * (this.maxUX / 5),
            height: u
          },
          {
            type: "rect",
            posX: u * (this.maxUX / 5 * 4) - offset,
            posY: u * 2 + offset,
            width: u * (this.maxUX / 5),
            height: u
          });
        }
        if (this.char == "~") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: u * 2 + offset,
            width: u,
            height: u * (this.maxUY - 5)
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u + offset,
            width: u * ((this.maxUX - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2),
            posY: u * 2 + offset,
            width: u,
            height: u * (this.maxUY - 4) - offset * 2
          },
          {
            type: "rect",
            posX: u * (this.maxUX - 1) - offset,
            posY: u * 3 + offset,
            width: u,
            height: u * (this.maxUY - 5)
          },
          {
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2 + 1),
            posY: u * (this.maxUY - 2) - offset,
            width: u * ((this.maxUX - 3) / 2) - offset,
            height: u
          });
        }
        if (this.char == "\"") {
          this.parts.push({
            type: "rect",
            posX: u * ((this.maxUX - 3) / 2),
            posY: offset,
            width: u,
            height: u * (this.maxUY / 5 * 2)
          },
          {
            type: "rect",
            posX: u * (this.maxUX - ((this.maxUX - 3) / 2) - 1),
            posY: offset,
            width: u,
            height: u * (this.maxUY / 5 * 2)
          });
        }
        if (this.char == "\'") {
          this.parts.push({
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2),
            posY: offset,
            width: u,
            height: u * (this.maxUY / 5 * 2)
          });
        }
        if (this.char == "|") {
          this.parts.push({
            type: "rect",
            posX: u * ((this.maxUX - 1) / 2),
            posY: offset,
            width: u,
            height: u * (this.maxUY) - offset * 2
          });
        }
        if (this.char == "寅") {
          this.parts.push(
            {
              type: "rect",
              posX: u * ((this.maxUX - 1) / 2),
              posY: offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: offset,
              posY: u + offset,
              width: u * this.maxUX - offset * 2,
              height: u
            },
            {
              type: "rect",
              posX: offset,
              posY: u * 2 + offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * (this.maxUX - 1) - offset,
              posY: u * 2 + offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * 2 + offset,
              posY: u * 3 + offset,
              width: u * (this.maxUX - 4) - offset * 2,
              height: u
            },
            {
              type: "rect",
              posX: u + offset,
              posY: u * 5 + offset,
              width: u * (this.maxUX - 2) - offset * 2,
              height: u
            },
            {
              type: "rect",
              posX: u + offset,
              posY: u * 5 + u * ((this.maxUY - 8) / 2),
              width: u * (this.maxUX - 2) - offset * 2,
              height: u
            },
            {
              type: "rect",
              posX: u + offset,
              posY: u * (this.maxUY - 3) - offset,
              width: u * (this.maxUX - 2) - offset * 2,
              height: u
            },
            {
              type: "rect",
              posX: u + offset,
              posY: u * 5 + offset,
              width: u,
              height: u * (this.maxUY - 8) - offset * 2
            },
            {
              type: "rect",
              posX: u * ((this.maxUX - 1) / 2),
              posY: u * 4 + offset,
              width: u,
              height: u * (this.maxUY - 7) - offset * 2
            },
            {
              type: "rect",
              posX: u * (this.maxUX - 2) - offset,
              posY: u * 5 + offset,
              width: u,
              height: u * (this.maxUY - 8) - offset * 2
            },
            {
              type: "rect",
              posX: u * 2 + offset,
              posY: u * (this.maxUY - 2) - offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u + offset,
              posY: u * (this.maxUY - 1) - offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * (this.maxUX - 3) - offset,
              posY: u * (this.maxUY - 2) - offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * (this.maxUX - 2) - offset,
              posY: u * (this.maxUY - 1) - offset,
              width: u,
              height: u
            }
          );
        }
        if (this.char == "虎") {
          this.parts.push(
            // 耳
            {
              type: "rect",
              posX: u + offset,
              posY: offset,
              width: u * ((this.maxUX - 4) / 3),
              height: u
            },
            {
              type: "rect",
              posX: u * (this.maxUX - ((this.maxUX - 4) / 3) - 1) - offset,
              posY: offset,
              width: u * ((this.maxUX - 4) / 3),
              height: u
            },
            {
              type: "rect",
              posX: offset,
              posY: u + offset,
              width: u,
              height: u * 3
            },
            {
              type: "rect",
              posX: u * (this.maxUX - 1) - offset,
              posY: u + offset,
              width: u,
              height: u * 3
            },
            {
              type: "rect",
              posX: u * ((this.maxUX - 4) / 3 + 1) + offset,
              posY: u + offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * (this.maxUX - ((this.maxUX - 4) / 3) - 2) - offset,
              posY: u + offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * 2 + offset,
              posY: u * 2 + offset,
              width: u * ((this.maxUX - 4) / 3 - 2),
              height: u
            },
            {
              type: "rect",
              posX: u * ((this.maxUX - 4) / 3 + 1) + offset,
              posY: u * 2 + offset,
              width: u * ((this.maxUX - 4) / 3 + 2) - offset * 2,
              height: u
            },
            {
              type: "rect",
              posX: u * (this.maxUX - ((this.maxUX - 4) / 3)) - offset,
              posY: u * 2 + offset,
              width: u * ((this.maxUX - 4) / 3 - 2),
              height: u
            },
            {
              type: "rect",
              posX: u + offset,
              posY: u * 3 + offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * (this.maxUX - 2) - offset,
              posY: u * 3 + offset,
              width: u,
              height: u
            },
            // 額
            {
              type: "rect",
              posX: u * ((this.maxUX - 1) / 2),
              posY: u * 3 + offset,
              width: u,
              height: u * 3
            },
            {
              type: "rect",
              posX: u * ((this.maxUX - 1) / 2 - 1),
              posY: u * 4 + offset,
              width: u * 3,
              height: u
            },
            // 左頬
            {
              type: "rect",
              posX: offset,
              posY: u * 4 + offset,
              width: u,
              height: u * (this.maxUY - 8) - offset * 2
            },
            {
              type: "rect",
              posX: u + offset,
              posY: u * 5 + offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u + offset,
              posY: u * (this.maxUY - 5) - offset,
              width: u * 2,
              height: u
            },
            {
              type: "rect",
              posX: u + offset,
              posY: u * (this.maxUY - 4) - offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * 3 + offset,
              posY: u * (this.maxUY - 4) - offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * 2 + offset,
              posY: u * (this.maxUY - 3) - offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u + offset,
              posY: u * (this.maxUY - 2) - offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * 3 + offset,
              posY: u * (this.maxUY - 2) - offset,
              width: u * 2,
              height: u
            },
            // 右頬
            {
              type: "rect",
              posX: u * (this.maxUX - 1) - offset,
              posY: u * 4 + offset,
              width: u,
              height: u * (this.maxUY - 8) - offset * 2
            },
            {
              type: "rect",
              posX: u * (this.maxUX - 2) - offset,
              posY: u * 5 + offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * (this.maxUX - 3) - offset,
              posY: u * (this.maxUY - 5) - offset,
              width: u * 2,
              height: u
            },
            {
              type: "rect",
              posX: u * (this.maxUX - 2) - offset,
              posY: u * (this.maxUY - 4) - offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * (this.maxUX - 4) - offset,
              posY: u * (this.maxUY - 4) - offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * (this.maxUX - 3) - offset,
              posY: u * (this.maxUY - 3) - offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * (this.maxUX - 2) - offset,
              posY: u * (this.maxUY - 2) - offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * (this.maxUX - 5) - offset,
              posY: u * (this.maxUY - 2) - offset,
              width: u * 2,
              height: u
            },
            // 鼻
            {
              type: "rect",
              posX: u * ((this.maxUX - 1) / 2 - 1),
              posY: u * (this.maxUY - 6) - offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * ((this.maxUX - 1) / 2 + 1),
              posY: u * (this.maxUY - 6) - offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * ((this.maxUX - 1) / 2 - 1),
              posY: u * (this.maxUY - 5) - offset,
              width: u * 3,
              height: u
            },
            // 口、顎
            {
              type: "rect",
              posX: u * ((this.maxUX - 1) / 2),
              posY: u * (this.maxUY - 4) - offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * 4 + offset,
              posY: u * (this.maxUY - 3) - offset,
              width: u * (this.maxUX - 8) - offset * 2,
              height: u
            },
            {
              type: "rect",
              posX: u * 4 + offset,
              posY: u * (this.maxUY - 1) - offset,
              width: u * (this.maxUX - 8) - offset * 2,
              height: u
            },
            // 左目
            {
              type: "rect",
              posX: u * 3 + offset,
              posY: u * 5 + offset,
              width: u * ((this.maxUX - 11) / 2) - offset,
              height: u
            },
            {
              type: "rect",
              posX: u * 2 + offset,
              posY: u * 6 + offset,
              width: u,
              height: u * (this.maxUY - 12) - offset * 2
            },
            {
              type: "rect",
              posX: u * ((this.maxUX - 1) / 2 - 2),
              posY: u * 6 + offset,
              width: u,
              height: u * (this.maxUY - 12) - offset * 2
            },
            {
              type: "rect",
              posX: u * 3 + offset,
              posY: u * (this.maxUY - 6) - offset,
              width: u * ((this.maxUX - 11) / 2) - offset,
              height: u
            },
            // 右目
            {
              type: "rect",
              posX: u * ((this.maxUX - 1) / 2 + 3),
              posY: u * 5 + offset,
              width: u * ((this.maxUX - 11) / 2) - offset,
              height: u
            },
            {
              type: "rect",
              posX: u * ((this.maxUX - 1) / 2 + 2),
              posY: u * 6 + offset,
              width: u,
              height: u * (this.maxUY - 12) - offset * 2
            },
            {
              type: "rect",
              posX: u * (this.maxUX - 3) - offset,
              posY: u * 6 + offset,
              width: u,
              height: u * (this.maxUY - 12) - offset * 2
            },
            {
              type: "rect",
              posX: u * ((this.maxUX - 1) / 2 + 3),
              posY: u * (this.maxUY - 6) - offset,
              width: u * ((this.maxUX - 11) / 2) - offset,
              height: u
            }
          );
        }
        break;
      default:
        break;
    }
  }
  draw() {
    for (const i in this.parts) {
      let p = this.parts[i];
      switch(p.type) {
        case "rect":
          if (this.r === undefined) {
            rect(p.posX, p.posY, p.width, p.height);
          } else {
            this.r.rect(p.posX, p.posY, p.width, p.height);
          }
          break;
        case "arc":
          if (this.r === undefined) {
            if (p.radiusY) {
              arc(p.posX, p.posY, p.radius, p.radiusY, p.start, p.end);
            } else {
              arc(p.posX, p.posY, p.radius, p.radius, p.start, p.end);
            }
          } else {
            if (p.radiusY) {
              this.r.arc(p.posX, p.posY, p.radius, p.radiusY, p.start, p.end);
            } else {
              this.r.arc(p.posX, p.posY, p.radius, p.radius, p.start, p.end);
            }
          }
          break;
        case "line":
          this.r.line(p.startPosX, p.startPosY, p.endPosX, p.endPosY);
          break;
        case "point":
          this.r.point(p.posX, p.posY);
          break;
        default:
          break;
      }
    }
  }
  print() {
    this.generate();
    if (this.r === undefined) {
      if (this.style == "bitmap") {
        if (this.option == "outline") {
          stroke(0);
          strokeWeight(this.strokeWeight);
          fill(0);
        } else {
          noStroke();
          fill(0);
        }
        this.draw();
        if (this.option == "outline") {
          noStroke();
          fill(255);
          this.draw();
        }
      }

      if (this.style == "rounded") {
        stroke(0);
        noFill();
        if (this.option == "outline") {
          strokeWeight(this.u + this.strokeWeight);
        } else {
          strokeWeight(this.strokeWeight);
        }
        this.draw();
        if (this.option == "outline") {
          stroke(255);
          strokeWeight(this.strokeWeight);
          this.draw();
        }
      }
    } else {
      const r = this.r;
      if (this.style == "bitmap") {
        if (this.option == "outline") {
          r.stroke(0);
          r.strokeWeight(this.strokeWeight);
          r.fill(0);
        } else {
          r.noStroke();
          r.fill(0);
        }
        this.draw();
        if (this.option == "outline") {
          r.noStroke();
          r.fill(255);
          this.draw();
        }
      }

      if (this.style == "rounded") {
        r.stroke(0);
        r.noFill();
        if (this.option == "outline") {
          r.strokeWeight(this.u + this.strokeWeight);
        } else {
          r.strokeWeight(this.strokeWeight);
        }
        this.draw();
        if (this.option == "outline") {
          r.stroke(255);
          r.strokeWeight(this.strokeWeight);
          this.draw();
        }
      }
    }
  }
}

// pgMask function
const pgMask = (_content, _mask) => {
  //Create the mask as image
  let img = createImage(_mask.width,_mask.height);
  img.copy(_mask, 0, 0, _mask.width, _mask.height, 0, 0, _mask.width, _mask.height);
  //load pixels
  img.loadPixels();
  for (let i = 0; i < img.pixels.length; i += 4) {
    // 0 red, 1 green, 2 blue, 3 alpha
    // Assuming that the mask image is in grayscale,
    // the red channel is used for the alpha mask.
    // the color is set to black (rgb => 0) and the
    // alpha is set according to the pixel brightness.
    let v = img.pixels[i];
    img.pixels[i] = 0;
    img.pixels[i+1] = 0;
    img.pixels[i+2] = 0;
    img.pixels[i+3] = v;
  }
  img.updatePixels();

  //convert _content from pg to image
  let contentImg = createImage(_content.width,_content.height);
  contentImg.copy(_content, 0, 0, _content.width, _content.height, 0, 0, _content.width, _content.height);
  // create the mask
  contentImg.mask(img)
  // return the masked image
  return contentImg;
}

// calcPos function https://qiita.com/reona396/items/95812b213910c007154f
const calcPos = (r, t, num) => {
  let x = r * cos(t) * func(t, num);
  let y = r * sin(t) * func(t, num);
  let vec = createVector(x, y);
  return vec;
}

const func = (t, num) => {
  let A = cos(180 / num);
  let b = 360 / num;
  let B = cos(b * (t / b - floor(t / b)) - 180 / num);
  return A / B;
}
