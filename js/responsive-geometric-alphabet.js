// Responsive Geometric Alphabet

// RGAインスタンスを入れる配列を用意
const RGAs = new Array();

// 文字を組む
const composeRGA = RGAmode => {

  // テキスト処理 行に分割して配列化
  let lines = [];
  let lineCount = 0;
  for (const char in RGAmode.givenText) {
    if (!lines[lineCount]) {
      lines[lineCount] = "";
    }
    // 改行モードによって処理を分岐
    switch(RGAmode.line) {
      case("line-per-word"): // 単語ごとに分割する場合
        if (RGAmode.givenText[char].match(/\s+/)) {
          lineCount++;
        } else {
          lines[lineCount] += RGAmode.givenText[char];
        }
        if (RGAmode.givenText[char].match(/[.,!?]/g)) {
          lineCount++;
        }
        break;
      default:
        // 成り行き流し込みの場合の処理を書く
        break;
    }
  }

  // 文字配置のための変数
  let posX = RGAmode.posX;
  let posY = RGAmode.posY;
  let width = RGAmode.width;
  let height = RGAmode.height;
  let style = RGAmode.style;
  let option = RGAmode.option;
  let strokeWeight = RGAmode.strokeWeight;
  let charUnitW, charUnitH, offsetX, offsetY;
  let lineGap = RGAmode.thickness;
  let letterSpacing = RGAmode.thickness;

  // 最大文字数の判定
  const unit = RGAmode.thickness;
  const lineLengths = lines.map(line => line.length);
  const maxLineLength = Math.max(...lineLengths); // 行の最大文字数はどこに活用？
  const lineHeight = (height - lineGap * (lines.length - 1)) / lines.length;

  // 行ごとに配列化
  lines.forEach(function(line, index) {
    RGAs.push([index]);
    for (let c = 0;c < line.length;c++) {
      switch(RGAmode.line) {
        case "line-per-word":
          charUnitW = (width - (unit * (line.length - 1))) / line.length / unit;
          break;
        default:
          // line-per-wordと成り行き流し込み（default）だけあればいい気がしてきた
          break;
      }

      // 文字の高さモードがランダムの場合
      if (RGAmode.charHeight == "random") {
        charUnitH = random(5, lineHeight / unit);
      } else {
        charUnitH = lineHeight / unit;
      }

      offsetX = unit * charUnitW + letterSpacing; // 文字送り
      offsetY = lineHeight + lineGap; // 行送り
      console.log(`char: ${line[c]}, unit: ${unit}, charUnitW: ${charUnitW}, charUnitH: ${charUnitH}, mode: ${RGAmode.line}, strokeWeight: ${RGAmode.strokeWeight}, r: ${RGAmode.target}`);
      RGAs[index][c] = new RGAlphabet(line[c], unit, posX, posY, charUnitW, charUnitH, style, option, strokeWeight);

      // 文字を生成して格納
      RGAs[index][c].compose();

      // _rがあるときはprint(),ないときはdraw()
      if (!RGAmode.target) {
        fill(RGAmode.colorFill);
        noStroke();
        push();
        switch(RGAmode.valign) {
          case "top":
            translate(posX, posY);
            break;
          case "middle":
            translate(posX, posY + (lineHeight - unit * charUnitH) / 2);
            break;
          case "bottom":
            translate(posX, posY + (lineHeight - unit * charUnitH));
            break;
          case "baseline":
            break;
          default:
            translate(posX, posY);
            break;
        }
        RGAs[index][c].draw();
        pop();
      } else {
        RGAmode.target.push();
        RGAmode.target.translate();
        RGAs[index][c].print();
        RGAmode.target.pop();
      }
      posX += offsetX; // 字送り
    }
    if (RGAmode.line == "line-per-word") {
      posX = RGAmode.posX;
      posY += lineHeight + lineGap;
    } else {
      posX += offsetX / 2;
    }
  });
}
console.log(RGAs);

class RGAlphabet {
  constructor(_char, _u, _posX, _posY, _charUnitW, _charUnitH, _style, _option, _strokeWeight) {
    this.char = _char;
    this.u = _u;
    this.posX = _posX;
    this.posY = _posY;
    this.charUnitW = _charUnitW;
    this.charUnitH = _charUnitH;
    this.style = _style;
    this.option = _option;
    this.strokeWeight = _strokeWeight * 2;
    this.parts = [];
  }
  // 文字を生成して格納
  compose() {
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
          if (this.charUnitH > this.charUnitW) {
            r = u * this.charUnitW - this.strokeWeight / 2 - offset;
          } else {
            r = u * this.charUnitH - this.strokeWeight / 2 - offset;
          }
          this.parts.push(
            {
              type: "arc",
              posX: r / 2 + offset,
              posY: r / 2 + offset,
              radius: r - this.strokeWeight,
              start: - 180,
              end: - 180 / 2
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - offset,
              posY: r / 2 + offset,
              radius: r - this.strokeWeight,
              start: - 180 / 2,
              end: 0
            }
          );
          if (this.charUnitH < this.charUnitW) {
            this.parts.push(
              {
                type: "line",
                startPosX: r / 2 + offset,
                startPosY: this.strokeWeight / 2 + offset,
                endPosX: u * this.charUnitW - r / 2 - offset,
                endPosY: this.strokeWeight / 2 + offset
              }
            );
          }
          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: r / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              startPosY: r / 2 + offset,
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH - u * (this.charUnitH / 4),
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - u * (this.charUnitH / 4)
            }
          );
        }
        if (this.char == "B") {
          if (this.charUnitH > this.charUnitW * 2) {
            r = u * this.charUnitW - this.strokeWeight / 2 - offset;
            eY = this.charUnitH - this.charUnitW;
            this.parts.push(
              {
                type: "line",
                startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                startPosY: r / 2 + this.strokeWeight / 2 + offset,
                endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                endPosY: u * (eY / 2) + offset
              },
              {
                type: "line",
                startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                startPosY: u * this.charUnitH - u * (eY / 2) - offset,
                endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                endPosY: u * this.charUnitH - r / 2 - offset
              },
              {
                type: "arc",
                posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
                posY: u * (eY / 2) + offset,
                radius: r,
                start: 0,
                end: 180 / 2
              },
              {
                type: "arc",
                posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
                posY: u * this.charUnitH - u * (eY / 2) - offset,
                radius: r,
                start: - 180 / 2,
                end: 0
              }
            );
          } else {
            r = u * this.charUnitH / 2 - this.strokeWeight / 2 - offset;
            eY = 0;
            this.parts.push(
              {
                type: "arc",
                posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
                posY: r / 2 + this.strokeWeight / 2 + offset,
                radius: r,
                start: 0,
                end: 180 / 2
              },
              {
                type: "arc",
                posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
                posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
                radius: r,
                start: - 180 / 2,
                end: 0
              }
            )
          }
          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH / 2,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH / 2
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180 / 2,
              end: 0
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: 180 / 2
            }
          );
        }
        if (this.char == "C") {
          if (this.charUnitH > this.charUnitW) {
            r = u * this.charUnitW - this.strokeWeight - offset;
            this.parts.push(
              {
                type: "line",
                startPosX: this.strokeWeight / 2 + offset,
                startPosY: r / 2 + this.strokeWeight / 2 + offset,
                endPosX: this.strokeWeight / 2 + offset,
                endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
              },
              {
                type: "line",
                startPosX: r / 2 + offset,
                startPosY: this.strokeWeight / 2 + offset,
                endPosX: u * this.charUnitW - r / 2.75 - offset,
                endPosY: this.strokeWeight / 2 + offset
              },
              {
                type: "line",
                startPosX: r / 2 + offset,
                startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
                endPosX: u * this.charUnitW - r / 2.75 - offset,
                endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
              }
            );
          } else {
            r = u * this.charUnitH - this.strokeWeight - offset;
            this.parts.push(
              {
                type: "line",
                startPosX: r / 2 + offset,
                startPosY: this.strokeWeight / 2 + offset,
                endPosX: u * this.charUnitW - r / 2.75 - offset,
                endPosY: this.strokeWeight / 2 + offset
              },
              {
                type: "line",
                startPosX: r / 2 + offset,
                startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
                endPosX: u * this.charUnitW - r / 2.75 - offset,
                endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
              }
            );
          }
          this.parts.push(
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180,
              end: - 180 / 2
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 180 / 2,
              end: - 180
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2.75 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180 / 2,
              end: - 180 / 4
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2.75 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 180 / 4,
              end: 180 / 2
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
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            }
          );
          if (this.charUnitH >= this.charUnitW) {
            r = u * this.charUnitW - this.strokeWeight - offset;
            this.parts.push(
              {
                type: "line",
                startPosX: this.strokeWeight / 2 + offset,
                startPosY: r / 2 + this.strokeWeight / 2 + offset,
                endPosX: this.strokeWeight / 2 + offset,
                endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
              },
              {
                type: "line",
                startPosX: this.strokeWeight / 2 + offset,
                startPosY: this.strokeWeight / 2 + offset,
                endPosX: u * this.charUnitW - r / 2 - offset,
                endPosY: this.strokeWeight / 2 + offset
              },
              {
                type: "line",
                startPosX: this.strokeWeight / 2 + offset,
                startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
                endPosX: u * this.charUnitW - r / 2 - offset,
                endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
              },
              {
                type: "line",
                startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                startPosY: r / 2 + this.strokeWeight / 2 + offset,
                endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
              }
            );
          } else {
            r = u * this.charUnitH - this.strokeWeight - offset;
            this.parts.push(
              {
                type: "line",
                startPosX: this.strokeWeight / 2 + offset,
                startPosY: this.strokeWeight / 2 + offset,
                endPosX: u * this.charUnitW - r / 2 - offset,
                endPosY: this.strokeWeight / 2 + offset
              },
              {
                type: "line",
                startPosX: this.strokeWeight / 2 + offset,
                startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
                endPosX: u * this.charUnitW - r / 2 - offset,
                endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
              }
            );
          }
          this.parts.push(
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180 / 2,
              end: 0
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: 180 / 2
            }
          );
        }
        if (this.char == "E") {
          if (this.charUnitH > this.charUnitW * 2) {
            r = u * this.charUnitW - this.strokeWeight / 2 - offset;
          } else {
            r = u * this.charUnitH / 2 - this.strokeWeight / 2 - offset;
          }
          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.charUnitH - r / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH / 2,
              endPosX: u * (this.charUnitW - 1.5) - offset,
              endPosY: u * this.charUnitH / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
              endPosX: u * this.charUnitW - this.strokeWeight  / 2 - offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180,
              end: - 180 / 2
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: - 180 * 1.5,
              end: - 180
            }
          );
        }
        if (this.char == "F") {
          if (this.charUnitH > this.charUnitW * 2) {
            r = u * this.charUnitW - this.strokeWeight / 2 - offset;
            eY = this.charUnitH - this.charUnitW;
          } else {
            r = u * this.charUnitH / 2 - this.strokeWeight / 2 - offset;
            eY = 0;
          }
          this.parts.push(
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH / 2,
              endPosX: u * (this.charUnitW - 1.5) - offset,
              endPosY: u * this.charUnitH / 2
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180,
              end: - 180 / 2
            }
          );
        }
        if (this.char == "G") {
          if (this.charUnitH > this.charUnitW) {
            r = u * this.charUnitW - this.strokeWeight - offset;
            this.parts.push(
              {
                type: "line",
                startPosX: this.strokeWeight / 2 + offset,
                startPosY: r / 2 + this.strokeWeight / 2 + offset,
                endPosX: this.strokeWeight / 2 + offset,
                endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
              },
              {
                type: "line",
                startPosX: r / 2 + offset,
                startPosY: this.strokeWeight / 2 + offset,
                endPosX: u * this.charUnitW - r / 2.75 - offset,
                endPosY: this.strokeWeight / 2 + offset
              },
              {
                type: "line",
                startPosX: r / 2 + offset,
                startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
                endPosX: u * this.charUnitW - r / 2.75 - offset,
                endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
              }
            );
          } else {
            r = u * this.charUnitH - this.strokeWeight - offset;
            this.parts.push(
              {
                type: "line",
                startPosX: r / 2 + offset,
                startPosY: this.strokeWeight / 2 + offset,
                endPosX: u * this.charUnitW - r / 2.75 - offset,
                endPosY: this.strokeWeight / 2 + offset
              },
              {
                type: "line",
                startPosX: r / 2 + offset,
                startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
                endPosX: u * this.charUnitW - r / 2.75 - offset,
                endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
              }
            );
          }
          this.parts.push(
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180,
              end: - 180 / 2
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 180 / 2,
              end: - 180
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2.75 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180 / 2,
              end: - 180 / 4
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 3 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH - r / 3 - this.strokeWeight / 2 - offset,
              radius: r / 1.5,
              start: 0,
              end: 180 / 2
            },
            {
              type: "line",
              startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              startPosY: u * this.charUnitH - u * this.charUnitH / 2.5,
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.charUnitW - u * this.charUnitW / 2.5,
              startPosY: u * this.charUnitH - u * this.charUnitH / 2.5,
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - u * this.charUnitH / 2.5
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
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH / 2,
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH / 2
            }
          );
        }
        if (this.char == "I") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.charUnitW / 2,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW / 2,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.charUnitW / 2 - u * this.charUnitW / 4,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW / 2 + u * this.charUnitW / 4,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "line",
              startPosX: u * this.charUnitW / 2 - u * this.charUnitW / 4,
              startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
              endPosX: u * this.charUnitW / 2 + u * this.charUnitW / 4,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "J") {
          r = u * (this.charUnitH / 5 * 3);
          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "arc",
              posX: u * this.charUnitW - u * (this.charUnitW / 4) - r / 2 - offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: 180 / 2
            },
            {
              type: "line",
              startPosX: u * this.charUnitW - u * (this.charUnitW / 4) - offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - u * (this.charUnitW / 4) - offset,
              endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
              endPosX: u * this.charUnitW - u * (this.charUnitW / 4) - r / 2 - offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "K") {
          if (this.charUnitH > this.charUnitW * 2) {
            r = u * this.charUnitW - this.strokeWeight - offset * 2;
            this.parts.push(
              {
                type: "line",
                startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                startPosY: this.strokeWeight / 2 + offset,
                endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                endPosY: u * (this.charUnitH / 2) - r
              },
              {
                type: "arc",
                posX: u * this.charUnitW - r - this.strokeWeight / 2 - offset,
                posY: u * (this.charUnitH / 2) - r,
                radius: r * 2,
                start: 0,
                end: 180 / 2
              },
              {
                type: "arc",
                posX: u * this.charUnitW - r - this.strokeWeight / 2 - offset,
                posY: u * (this.charUnitH / 2) + r,
                radius: r * 2,
                start: - 180 / 2,
                end: 0
              },
              {
                type: "line",
                startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                startPosY: u * (this.charUnitH / 2) + r,
                endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
              }
            );
          } else {
            r = u * this.charUnitH / 2 - this.strokeWeight / 2 - offset;
            this.parts.push(
              {
                type: "arc",
                posX: u * this.charUnitW - r - this.strokeWeight / 2 - offset,
                posY: u * (this.charUnitH / 2) - r,
                radius: r * 2,
                start: 0,
                end: 180 / 2
              },
              {
                type: "arc",
                posX: u * this.charUnitW - r - this.strokeWeight / 2 - offset,
                posY: u * (this.charUnitH / 2) + r,
                radius: r * 2,
                start: - 180 / 2,
                end: 0
              },
              {
                type: "line",
                startPosX: this.strokeWeight / 2 + offset,
                startPosY: u * (this.charUnitH / 2),
                endPosX: u * this.charUnitW - r,
                endPosY: u * (this.charUnitH / 2)
              }
            );
          }
          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "L") {
          if (this.charUnitH > this.charUnitW) {
            r = u * (this.charUnitW / 2) - this.strokeWeight - offset * 2;
          } else {
            r = u * (this.charUnitH / 2) - this.strokeWeight - offset * 2;
          }
          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: - 180 * 1.5,
              end: - 180
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "M") {
          if (this.charUnitW > this.charUnitH * 2) {
            r = u * this.charUnitH - this.strokeWeight / 2 - offset;
            eX = this.charUnitW - this.charUnitH;
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
                startPosX: u * this.charUnitW - u * (eX / 2) - offset,
                startPosY: this.strokeWeight / 2 + offset,
                endPosX: u * this.charUnitW - r / 2 - offset,
                endPosY: this.strokeWeight / 2 + offset
              },
              {
                type: "arc",
                posX: u * (eX / 2) + offset,
                posY: r / 2 + this.strokeWeight / 2 + offset,
                radius: r,
                start: - 180 / 2,
                end: 0
              },
              {
                type: "arc",
                posX: u * this.charUnitW - u * (eX / 2) - offset,
                posY: r / 2 + this.strokeWeight / 2 + offset,
                radius: r,
                start: - 180,
                end: - 180 / 2
              }
            );
          } else {
            r = u * this.charUnitW / 2 - this.strokeWeight / 2 - offset;
            eX = 0;
            this.parts.push(
              {
                type: "arc",
                posX: r / 2 + this.strokeWeight / 2 + offset,
                posY: r / 2 + this.strokeWeight / 2 + offset,
                radius: r,
                start: - 180 / 2,
                end: 0
              },
              {
                type: "arc",
                posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
                posY: r / 2 + this.strokeWeight / 2 + offset,
                radius: r,
                start: - 180,
                end: - 180 / 2
              }
            )
          }
          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.charUnitW / 2,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW / 2,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - this.strokeWeight  / 2 - offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180,
              end: - 180 / 2
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180 / 2,
              end: 0
            }
          );
        }
        if (this.char == "N") {
          if (this.charUnitW > this.charUnitH * 2) {
            r = u * this.charUnitH - this.strokeWeight / 2 - offset;
            eX = this.charUnitW - this.charUnitH;
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
                startPosX: u * this.charUnitW - u * (eX / 2) - offset,
                startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
                endPosX: u * this.charUnitW - r / 2 - offset,
                endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
              },
              {
                type: "arc",
                posX: u * (eX / 2) + offset,
                posY: r / 2 + this.strokeWeight / 2 + offset,
                radius: r,
                start: - 180 / 2,
                end: 0
              },
              {
                type: "arc",
                posX: u * this.charUnitW - u * (eX / 2) - offset,
                posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
                radius: r,
                start: 180 / 2,
                end: - 180
              }
            );
          } else {
            r = u * this.charUnitW / 2 - this.strokeWeight / 2 - offset;
            eX = 0;
            this.parts.push(
              {
                type: "arc",
                posX: r / 2 + this.strokeWeight / 2 + offset,
                posY: r / 2 + this.strokeWeight / 2 + offset,
                radius: r,
                start: - 180 / 2,
                end: 0
              },
              {
                type: "arc",
                posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
                posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
                radius: r,
                start: 180 / 2,
                end: - 180
              }
            )
          }
          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.charUnitW / 2,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW / 2,
              endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - this.strokeWeight  / 2 - offset,
              endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180,
              end: - 180 / 2
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: 180 / 2
            }
          );
        }
        if (this.char == "O") {
          if (this.charUnitH > this.charUnitW) {
            r = u * this.charUnitW - this.strokeWeight / 2 - offset;
          } else {
            r = u * this.charUnitH - this.strokeWeight / 2 - offset;
          }
          this.parts.push(
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180,
              end: - 180 / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180 / 2,
              end: 0
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - this.strokeWeight  / 2 - offset,
              endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 180 / 2,
              end: 180
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: 180 / 2
            }
          );
        }
        if (this.char == "P") {
          if (this.charUnitH > this.charUnitW * 2) {
            r = u * this.charUnitW - this.strokeWeight / 2 - offset;
            eY = this.charUnitH - this.charUnitW;
            this.parts.push(
              {
                type: "line",
                startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                startPosY: r / 2 + this.strokeWeight / 2 + offset,
                endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                endPosY: u * (eY / 2) + offset
              },
              {
                type: "arc",
                posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
                posY: u * (eY / 2) + offset,
                radius: r,
                start: 0,
                end: 180 / 2
              }
            );
          } else {
            r = u * this.charUnitH / 2 - this.strokeWeight / 2 - offset;
            eY = 0;
            this.parts.push(
              {
                type: "arc",
                posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
                posY: r / 2 + this.strokeWeight / 2 + offset,
                radius: r,
                start: 0,
                end: 180 / 2
              }
            )
          }
          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH / 2,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH / 2
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180 / 2,
              end: 0
            }
          );
        }
        if (this.char == "Q") {
          if (this.charUnitH > this.charUnitW) {
            r = u * this.charUnitW - this.strokeWeight / 2 - offset;
          } else {
            r = u * this.charUnitH - this.strokeWeight / 2 - offset;
          }
          this.parts.push(
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180,
              end: - 180 / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180 / 2,
              end: 0
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - this.strokeWeight  / 2 - offset,
              endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 180 / 2,
              end: 180
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: 180 / 2
            },
            {
              type: "line",
              startPosX: u * this.charUnitW / 1.5,
              startPosY: u * this.charUnitH / 1.5,
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "R") {
          if (this.charUnitH > this.charUnitW * 2) {
            r = u * this.charUnitW - this.strokeWeight / 2 - offset;
            eY = this.charUnitH - this.charUnitW;
            this.parts.push(
              {
                type: "line",
                startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                startPosY: r / 2 + this.strokeWeight / 2 + offset,
                endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                endPosY: u * (eY / 2) + offset
              },
              {
                type: "line",
                startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                startPosY: u * this.charUnitH - u * (eY / 2) - offset,
                endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                endPosY: u * this.charUnitH - r / 2 - offset
              },
              {
                type: "arc",
                posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
                posY: u * (eY / 2) + offset,
                radius: r,
                start: 0,
                end: 90
              },
              {
                type: "arc",
                posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
                posY: u * this.charUnitH - u * (eY / 2) - offset,
                radius: r,
                start: - 90,
                end: 0
              }
            );
          } else {
            r = u * this.charUnitH / 2 - this.strokeWeight / 2 - offset;
            eY = 0;
            this.parts.push(
              {
                type: "arc",
                posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
                posY: r / 2 + this.strokeWeight / 2 + offset,
                radius: r,
                start: 0,
                end: 90
              },
              {
                type: "arc",
                posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
                posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
                radius: r,
                start: - 90,
                end: 0
              }
            )
          }
          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH / 2,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH / 2
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 90,
              end: 0
            },
            {
              type: "line",
              startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              startPosY: u * (this.charUnitH / 2) + r / 2 + offset,
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "S") {
          if (this.charUnitH > this.charUnitW * 2) {
            r = u * this.charUnitW - this.strokeWeight / 2 - offset;
            this.parts.push(
              {
                type: "line",
                startPosX: this.strokeWeight / 2 + offset,
                startPosY: r / 2 + this.strokeWeight / 2 + offset,
                endPosX: this.strokeWeight / 2 + offset,
                endPosY: u * this.charUnitH / 2 - r / 2
              },
              {
                type: "line",
                startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                startPosY: u * this.charUnitH / 2 + r / 2,
                endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                endPosY: u * this.charUnitH - r / 2
              }
            );
          } else {
            r = u * this.charUnitH / 2 - this.strokeWeight / 2 - offset;
            this.parts.push(
              {
                type: "line",
                startPosX: r / 2 + this.strokeWeight / 2 + offset,
                startPosY: u * this.charUnitH / 2,
                endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
                endPosY: u * this.charUnitH / 2
              }
            );
          }
          this.parts.push(
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180,
              end: - 180 / 2
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.charUnitH / 2 - r / 2,
              radius: r,
              start: 180 / 2,
              end: 180
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH / 2 + r / 2,
              radius: r,
              start: - 180 / 2,
              end: 0
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: 180 / 2
            }
          );
        }
        if (this.char == "T") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.charUnitW / 2,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW / 2,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            }
          );
        }
        if (this.char == "U") {
          if (this.charUnitH > this.charUnitW) {
            r = u * this.charUnitW - this.strokeWeight - offset * 2;
          } else {
            r = u * this.charUnitH - this.strokeWeight - offset * 2;
          }
          this.parts.push(
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 180 / 2,
              end: 180
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: 180 / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight - offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            }
          );

          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "V") {
          if (this.charUnitH >= this.charUnitW) {
            r = u * this.charUnitW * 2 - this.strokeWeight * 2 - offset * 4;
            this.parts.push(
              {
                type: "line",
                startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                startPosY: this.strokeWeight / 2 + offset,
                endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
              }
            );
          } else {
            r = u * this.charUnitH * 2 - this.strokeWeight * 2 - offset * 4;
            this.parts.push(
              {
                type: "line",
                startPosX: this.strokeWeight / 2 + offset,
                startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
                endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
                endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
              }
            );
          }
          this.parts.push(
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: 180 / 2
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "W") {
          if (this.charUnitW > this.charUnitH * 2) {
            r = u * this.charUnitH - this.strokeWeight / 2 - offset;
            eX = this.charUnitW - this.charUnitH;
            this.parts.push(
              {
                type: "line",
                startPosX: r / 2 + this.strokeWeight / 2 + offset,
                startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
                endPosX: u * (eX / 2) + offset,
                endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
              },
              {
                type: "line",
                startPosX: u * this.charUnitW - u * (eX / 2) - offset,
                startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
                endPosX: u * this.charUnitW - r / 2 - offset,
                endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
              },
              {
                type: "arc",
                posX: u * (eX / 2) + offset,
                posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
                radius: r,
                start: 0,
                end: 180 / 2
              },
              {
                type: "arc",
                posX: u * this.charUnitW - u * (eX / 2) - offset,
                posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
                radius: r,
                start: 180 / 2,
                end: 180
              }
            );
          } else {
            r = u * this.charUnitW / 2 - this.strokeWeight / 2 - offset;
            eX = 0;
            this.parts.push(
              {
                type: "arc",
                posX: r / 2 + this.strokeWeight / 2 + offset,
                posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
                radius: r,
                start: 0,
                end: 180 / 2
              },
              {
                type: "arc",
                posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
                posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
                radius: r,
                start: 180 / 2,
                end: 180
              }
            )
          }
          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.charUnitW / 2,
              startPosY: u * this.charUnitH / 2,
              endPosX: u * this.charUnitW / 2,
              endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - this.strokeWeight  / 2 - offset,
              endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 180 / 2,
              end: 180
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: 180 / 2
            }
          );
        }
        if (this.char == "X") {
          if (this.charUnitH > this.charUnitW) {
            r = u * this.charUnitW - this.strokeWeight / 2 - offset;
          } else {
            r = u * this.charUnitH - this.strokeWeight / 2 - offset;
          }
          this.parts.push(
            {
              type: "arc",
              posX: u * this.charUnitW / 2 + r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: 180,
              end: - 180 / 2
            },
            {
              type: "line",
              startPosX: u * this.charUnitW / 2 + r / 2 - this.strokeWeight / 2 - offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "line",
              startPosX: u * this.charUnitW / 2 + r / 2 - this.strokeWeight / 2 - offset,
              startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: u * this.charUnitW / 2 + r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 180 / 2,
              end: 180
            },
            {
              type: "line",
              startPosX: u * this.charUnitW / 2 - this.strokeWeight / 2 - offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: u * this.charUnitW / 2 - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: 180 / 2
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW / 2 - r / 2,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
              endPosX: u * this.charUnitW / 2 - r / 2,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: u * this.charUnitW / 2 - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180 / 2,
              end: 0
            }
          );
        }
        if (this.char == "Y") {
          if (this.charUnitH > this.charUnitW) {
            r = u * this.charUnitW - this.strokeWeight - offset * 2;
          } else {
            r = u * this.charUnitH - this.strokeWeight - offset * 2;
          }
          this.parts.push(
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.charUnitH / 1.5 - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 180 / 2,
              end: 180
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH / 1.5 - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: 180 / 2
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: 180 / 2
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.charUnitH / 1.5 - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH / 1.5 - this.strokeWeight / 2 - offset,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH / 1.5 - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.charUnitW / 4,
              startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "Z") {
          if (this.charUnitH > this.charUnitW) {
            r = u * this.charUnitW - this.strokeWeight - offset * 2;
            this.parts.push(
              {
                type: "line",
                startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                startPosY: this.strokeWeight / 2 + offset,
                endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                endPosY: u * this.charUnitH / 2 - r / 2
              },
              {
                type: "line",
                startPosX: this.strokeWeight / 2 + offset,
                startPosY: u * this.charUnitH / 2 + r / 2,
                endPosX: this.strokeWeight / 2 + offset,
                endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
              }
            );
          } else {
            r = u * this.charUnitH - this.strokeWeight - offset * 2;
            this.parts.push(
              {
                type: "line",
                startPosX: r / 2 + this.strokeWeight / 2 + offset,
                startPosY: u * this.charUnitH / 2,
                endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
                endPosY: u * this.charUnitH / 2
              }
            );
          }
          this.parts.push(
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH / 2 - r / 2,
              radius: r,
              start: 0,
              end: 180 / 2
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.charUnitH / 2 + r / 2,
              radius: r,
              start: 180,
              end: 180 * 1.5
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.charUnitW / 4,
              startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "1") {
          if (this.charUnitH > this.charUnitW) {
            r = u * this.charUnitW - this.strokeWeight - offset;
          } else {
            r = u * this.charUnitH - this.strokeWeight - offset;
            this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW / 2 - r / 2,
              endPosY: r / 2 + this.strokeWeight / 2 + offset
            }
          );
          }
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.charUnitW / 2,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW / 2,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: u * this.charUnitW / 2 - r / 2,
              posY: this.strokeWeight / 2 + offset,
              radius: r,
              start: 0,
              end: 180 / 2
            }
          );
        }
        if (this.char == "2") {
          if (this.charUnitH > this.charUnitW * 1.5) {
            r = u * this.charUnitW - this.strokeWeight / 2 - offset;
            eY = this.charUnitH - this.charUnitW;
            this.parts.push(
              {
                type: "line",
                startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                startPosY: r / 2 + this.strokeWeight / 2 + offset,
                endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                endPosY: u * (eY / 2) + offset
              },
              {
                type: "line",
                startPosX: this.strokeWeight / 2 + offset,
                startPosY: u * this.charUnitH - u * (eY / 2) - offset,
                endPosX: this.strokeWeight / 2 + offset,
                endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
              },
              {
                type: "arc",
                posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
                posY: u * (eY / 2) + offset,
                radius: r,
                start: 0,
                end: 180 / 2
              },
              {
                type: "arc",
                posX: r / 2 + this.strokeWeight / 2 + offset,
                posY: u * this.charUnitH / 2 + r / 2,
                radius: r,
                start: - 180,
                end: - 180 / 2
              }
            );
          } else {
            r = u * this.charUnitH / 2 - this.strokeWeight / 2 - offset;
            eY = 0;
            this.parts.push(
              {
                type: "arc",
                posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
                posY: r / 2 + this.strokeWeight / 2 + offset,
                radius: r,
                start: 0,
                end: 180 / 2
              },
              {
                type: "arc",
                posX: r * 1.5 / 2 + this.strokeWeight / 2 + offset,
                posY: u * this.charUnitH / 2 + r * 1.5 / 2,
                radius: r * 1.5,
                start: - 180,
                end: - 180 / 2
              },
              {
                type: "line",
                startPosX: r * 1.5 / 2 + this.strokeWeight / 2 + offset,
                startPosY: u * this.charUnitH / 2,
                endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
                endPosY: u * this.charUnitH / 2
              },
              {
                type: "line",
                startPosX: this.strokeWeight / 2 + offset,
                startPosY: u * this.charUnitH / 2 + r * 1.5 / 2,
                endPosX: this.strokeWeight / 2 + offset,
                endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
              }
            )
          }
          this.parts.push(
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180,
              end: - 180 / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180 / 2,
              end: 0
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "3") {
          if (this.charUnitH > this.charUnitW * 2) {
            r = u * this.charUnitW - this.strokeWeight / 2 - offset;
            eY = this.charUnitH - this.charUnitW;
            this.parts.push(
              {
                type: "line",
                startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                startPosY: r / 2 + this.strokeWeight / 2 + offset,
                endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                endPosY: u * (eY / 2) + offset
              },
              {
                type: "arc",
                posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
                posY: u * (eY / 2) + offset,
                radius: r,
                start: 0,
                end: 180 / 2
              },
              {
                type: "arc",
                posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
                posY: u * this.charUnitH / 2 + r / 2,
                radius: r,
                start: - 180 / 2,
                end: 0
              },
              {
                type: "line",
                startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                startPosY: u * this.charUnitH / 2 + r / 2,
                endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                endPosY: u * this.charUnitH - r / 2
              }
            );
          } else {
            r = u * this.charUnitH / 2 - this.strokeWeight / 2 - offset;
            eY = 0;
            this.parts.push(
              {
                type: "arc",
                posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
                posY: r / 2 + this.strokeWeight / 2 + offset,
                radius: r,
                start: 0,
                end: 180 / 2
              },
              {
                type: "line",
                startPosX: u * this.charUnitW / 2,
                startPosY: u * this.charUnitH / 2,
                endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
                endPosY: u * this.charUnitH / 2
              },
              {
                type: "arc",
                posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
                posY: u * this.charUnitH / 2 + r / 2,
                radius: r,
                start: - 180 / 2,
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
              start: - 180,
              end: - 180 / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180 / 2,
              end: 0
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: 180 / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 180 / 2,
              end: 180
            }
          );
        }
        if (this.char == "4") {
          if (this.charUnitH > this.charUnitW) {
            r = u * (this.charUnitW / 2) - this.strokeWeight - offset * 2;
          } else {
            r = u * (this.charUnitH / 2) - this.strokeWeight - offset * 2;
          }
          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * (this.charUnitH / 4 * 3) - r / 2
            },
            {
              type: "line",
              startPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * (this.charUnitH / 4 * 3) - r / 2,
              radius: r,
              start: 180 / 2,
              end: 180
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * (this.charUnitH / 4 * 3),
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: u * (this.charUnitH / 4 * 3)
            }
          );
        }
        if (this.char == "5") {
          if (this.charUnitH > this.charUnitW * 2) {
            r = u * this.charUnitW - this.strokeWeight / 2 - offset;
            eY = this.charUnitH - this.charUnitW;
            this.parts.push(
              {
                type: "line",
                startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                startPosY: u * this.charUnitH / 2 + r / 2,
                endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                endPosY: u * this.charUnitH - r / 2
              }
            );
          } else {
            r = u * this.charUnitH / 2 - this.strokeWeight / 2 - offset;
            eY = 0;
          }
          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.charUnitH / 2
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH / 2,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH / 2
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH / 2 + r / 2,
              radius: r,
              start: - 180 / 2,
              end: 0
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: 180 / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 180 / 2,
              end: 180
            }
          );
        }
        if (this.char == "6") {
          if (this.charUnitH > this.charUnitW * 2) {
            r = u * this.charUnitW - this.strokeWeight / 2 - offset;
            eY = this.charUnitH - this.charUnitW;
            this.parts.push(
              {
                type: "line",
                startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                startPosY: u * this.charUnitH / 2 + r / 2,
                endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                endPosY: u * this.charUnitH - r / 2
              }
            );
          } else {
            r = u * this.charUnitH / 2 - this.strokeWeight / 2 - offset;
            eY = 0;
          }
          this.parts.push(
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180,
              end: - 180 / 2
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180 / 2,
              end: 0
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.charUnitH / 2 + r / 2,
              radius: r,
              start: - 180,
              end: - 180 / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH / 2,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH / 2
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH / 2 + r / 2,
              radius: r,
              start: - 180 / 2,
              end: 0
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: 180 / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 180 / 2,
              end: 180
            }
          );
        }
        if (this.char == "7") {
          if (this.charUnitH > this.charUnitW) {
            r = u * this.charUnitW / 2 - this.strokeWeight - offset * 2;
          } else {
            r = u * this.charUnitH / 2 - this.strokeWeight - offset * 2;
          }
          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.charUnitH / 4
            },
            {
              type: "line",
              startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH / 2 - r / 2
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH / 2 - r / 2,
              radius: r,
              start: 0,
              end: 180 / 2
            },
            {
              type: "arc",
              posX: u * this.charUnitW / 2 + r / 2,
              posY: u * this.charUnitH / 2 + r / 2,
              radius: r,
              start: 180,
              end: 180 * 1.5
            },
            {
              type: "line",
              startPosX: u * this.charUnitW / 2 + r / 2,
              startPosY: u * this.charUnitH / 2,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH / 2
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "line",
              startPosX: u * this.charUnitW / 2,
              startPosY: u * this.charUnitH / 2 + r / 2,
              endPosX: u * this.charUnitW / 2,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "8") {
          if (this.charUnitH > this.charUnitW * 2) {
            r = u * this.charUnitW - this.strokeWeight / 2 - offset;
            eY = this.charUnitH - this.charUnitW;
            this.parts.push(
              {
                type: "line",
                startPosX: this.strokeWeight / 2 + offset,
                startPosY: r / 2 + this.strokeWeight / 2 + offset,
                endPosX: this.strokeWeight / 2 + offset,
                endPosY: u * this.charUnitH / 2 - r / 2
              },
              {
                type: "line",
                startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                startPosY: r / 2 + this.strokeWeight / 2 + offset,
                endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                endPosY: u * this.charUnitH / 2 - r / 2
              },
              {
                type: "line",
                startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                startPosY: u * this.charUnitH / 2 + r / 2,
                endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                endPosY: u * this.charUnitH - r / 2
              },
              {
                type: "line",
                startPosX: this.strokeWeight / 2 + offset,
                startPosY: u * this.charUnitH / 2 + r / 2,
                endPosX: this.strokeWeight / 2 + offset,
                endPosY: u * this.charUnitH - r / 2
              },
              {
                type: "line",
                startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                startPosY: u * this.charUnitH / 2 + r / 2,
                endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
                endPosY: u * this.charUnitH - r / 2
              }
            );
          } else {
            r = u * this.charUnitH / 2 - this.strokeWeight / 2 - offset;
            eY = 0;
          }
          this.parts.push(
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180,
              end: - 180 / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180 / 2,
              end: 0
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.charUnitH / 2 - r / 2,
              radius: r,
              start: 180 / 2,
              end: 180
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH / 2 - r / 2,
              radius: r,
              start: 0,
              end: 180 / 2
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.charUnitH / 2 + r / 2,
              radius: r,
              start: - 180,
              end: - 180 / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH / 2,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH / 2
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH / 2 + r / 2,
              radius: r,
              start: - 180 / 2,
              end: 0
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: 180 / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 180 / 2,
              end: 180
            }
          );
        }
        if (this.char == "9") {
          if (this.charUnitH > this.charUnitW * 2) {
            r = u * this.charUnitW - this.strokeWeight / 2 - offset;
            eY = this.charUnitH - this.charUnitW;
          } else {
            r = u * this.charUnitH / 2 - this.strokeWeight / 2 - offset;
            eY = 0;
          }
          this.parts.push(
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180,
              end: - 180 / 2
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.charUnitH / 2 - r / 2
            },
            {
              type: "line",
              startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180 / 2,
              end: 0
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.charUnitH / 2 - r / 2,
              radius: r,
              start: 180 / 2,
              end: 180
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH / 2,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH / 2
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH / 2 - r / 2,
              radius: r,
              start: 0,
              end: 180 / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: 180 / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 180 / 2,
              end: 180
            }
          );
        }
        if (this.char == "0") {
          if (this.charUnitH > this.charUnitW) {
            r = u * this.charUnitW - this.strokeWeight / 2 - offset;
          } else {
            r = u * this.charUnitH / 2 - this.strokeWeight / 2 - offset;
          }
          this.parts.push(
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180,
              end: - 180 / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180 / 2,
              end: 0
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - this.strokeWeight  / 2 - offset,
              endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 180 / 2,
              end: 180
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: 180 / 2
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: r / 2 + this.strokeWeight / 2 + offset
            }
          );
        }
        if (this.char == ".") {
          this.parts.push(
            {
              type: "point",
              posX: u + this.strokeWeight / 2 + offset,
              posY: u * this.charUnitH - this.strokeWeight / 2 - offset,
              radius: this.strokeWeight
            }
          );
        }
        if (this.char == ",") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * 1.5 + this.strokeWeight / 2 + offset,
              startPosY: u * (this.charUnitH - 1.25) - this.strokeWeight / 2 - offset,
              endPosX: u + this.strokeWeight / 2 + offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "!") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.charUnitW / 2,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW / 2,
              endPosY: u * (this.charUnitH - 3) - this.strokeWeight / 2 - offset
            },
            {
              type: "point",
              posX: u * this.charUnitW / 2,
              posY: u * this.charUnitH - this.strokeWeight / 2 - offset,
              radius: this.strokeWeight
            }
          );
        }
        if (this.char == "?") {
          if (this.charUnitH > this.charUnitW * 2) {
            r = u * this.charUnitW - this.strokeWeight / 2 - offset;
            eY = this.charUnitH - this.charUnitW;
            this.parts.push(
            );
          } else {
            r = u * this.charUnitH / 2 - this.strokeWeight / 2 - offset;
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
              start: - 180,
              end: - 180 / 2
            },
            {
              type: "line",
              startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH / 2 - r / 4 - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.charUnitW / 2 + r / 4,
              startPosY: u * this.charUnitH / 2 - this.strokeWeight / 2 - offset,
              endPosX: u * this.charUnitW - r / 4 - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180 / 2,
              end: 0
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 4 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH / 2 - r / 4 - this.strokeWeight / 2 - offset,
              radius: r / 2,
              start: 0,
              end: 180 / 2
            },
            {
              type: "arc",
              posX: u * this.charUnitW / 2 + r / 4,
              posY: u * this.charUnitH / 2 + r / 4 - this.strokeWeight / 2 - offset,
              radius: r / 2,
              start: - 180,
              end: - 180 / 2
            },
            {
              type: "line",
              startPosX: u * this.charUnitW / 2,
              startPosY: u * this.charUnitH / 2 + r / 4 - this.strokeWeight / 2 - offset,
              endPosX: u * this.charUnitW / 2,
              endPosY: u * (this.charUnitH - 3) - this.strokeWeight / 2 - offset
            },
            {
              type: "point",
              posX: u * this.charUnitW / 2,
              posY: u * this.charUnitH - this.strokeWeight / 2 - offset,
              radius: this.strokeWeight
            }
          );
        }
        if (this.char == ";") {
          this.parts.push(
            {
              type: "point",
              posX: u * 1.5 + this.strokeWeight / 2 + offset,
              posY: u * this.charUnitH / 2,
              radius: this.strokeWeight
            },
            {
              type: "line",
              startPosX: u * 1.5 + this.strokeWeight / 2 + offset,
              startPosY: u * (this.charUnitH - 1.25) - this.strokeWeight / 2 - offset,
              endPosX: u + this.strokeWeight / 2 + offset,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == ":") {
          this.parts.push(
            {
              type: "point",
              posX: u + this.strokeWeight / 2 + offset,
              posY: u * this.charUnitH / 2,
              radius: this.strokeWeight
            },
            {
              type: "point",
              posX: u + this.strokeWeight / 2 + offset,
              posY: u * this.charUnitH - this.strokeWeight / 2 - offset,
              radius: this.strokeWeight
            }
          );
        }
        if (this.char == "-") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.charUnitW / 4,
              startPosY: u * this.charUnitH / 2,
              endPosX: u * this.charUnitW - u * this.charUnitW / 4,
              endPosY: u * this.charUnitH / 2
            }
          );
        }
        if (this.char == "=") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.charUnitW / 4,
              startPosY: u * this.charUnitH / 2.5,
              endPosX: u * this.charUnitW - u * this.charUnitW / 4,
              endPosY: u * this.charUnitH / 2.5
            },
            {
              type: "line",
              startPosX: u * this.charUnitW / 4,
              startPosY: u * this.charUnitH - u * this.charUnitH / 2.5,
              endPosX: u * this.charUnitW - u * this.charUnitW / 4,
              endPosY: u * this.charUnitH - u * this.charUnitH / 2.5
            }
          );
        }
        if (this.char == "+") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.charUnitW / 4,
              startPosY: u * this.charUnitH / 2,
              endPosX: u * this.charUnitW - u * this.charUnitW / 4,
              endPosY: u * this.charUnitH / 2
            },
            {
              type: "line",
              startPosX: u * this.charUnitW / 2,
              startPosY: u * this.charUnitH / 4,
              endPosX: u * this.charUnitW - u * this.charUnitW / 2,
              endPosY: u * this.charUnitH - u * this.charUnitH / 4
            }
          );
        }
        if (this.char == "/") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.charUnitW - u * this.charUnitW / 4,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW / 4,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "\\") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.charUnitW / 4,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - u * this.charUnitW / 4,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "*") {
          if (this.charUnitH > this.charUnitW) {
            r = u * this.charUnitW / 4;
          } else {
            r = u * this.charUnitH / 4;
          }
          for (let theta = 180; theta < 360 + 180; theta+=360 / 6) {
            let pos = calcPos(r, theta, 6);
            let x = pos.x;
            let y = pos.y;
            this.parts.push(
              {
                type: "line",
                startPosX: u * this.charUnitW / 2,
                startPosY: u * this.charUnitH / 2,
                endPosX: u * this.charUnitW / 2 + x,
                endPosY: u * this.charUnitH / 2 + y
              }
            );
          }
        }
        if (this.char == "#") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.charUnitW / 3,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW / 4,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.charUnitW - u * this.charUnitW / 4,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - u * this.charUnitW / 3,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.charUnitW / 14,
              startPosY: u * this.charUnitH / 4,
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH / 4
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH - u * this.charUnitH / 4,
              endPosX: u * this.charUnitW - u * this.charUnitW / 14,
              endPosY: u * this.charUnitH - u * this.charUnitH / 4
            }
          );
        }
        if (this.char == "$") {
          if (this.charUnitH - this.charUnitH / 4 > this.charUnitW * 2) {
            r = u * this.charUnitW - u * this.charUnitW / 4 - this.strokeWeight / 2 - offset;
          } else {
            r = (u * this.charUnitH - u * this.charUnitH / 4) / 2 - this.strokeWeight / 2 - offset;
          }
          this.parts.push(
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH / 8 + r / 2,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.charUnitH / 2 - r / 2
            },
            {
              type: "line",
              startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              startPosY: u * this.charUnitH / 2 + r / 2,
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - u * this.charUnitH / 8 - r / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH / 2,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH / 2
            },
            {
              type: "line",
              startPosX: u * this.charUnitW / 3,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW / 3,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.charUnitW - u * this.charUnitW / 3,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - u * this.charUnitW / 3,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH / 8,
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH / 8
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH - u * this.charUnitH / 8,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - u * this.charUnitH / 8
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.charUnitH / 8 + r / 2,
              radius: r,
              start: - 180,
              end: - 180 / 2
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.charUnitH / 2 - r / 2,
              radius: r,
              start: 180 / 2,
              end: 180
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH / 2 + r / 2,
              radius: r,
              start: - 180 / 2,
              end: 0
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH - u * this.charUnitH / 8 - r / 2,
              radius: r,
              start: 0,
              end: 180 / 2
            }
          );
        }
        if (this.char == "¥") {
          if (this.charUnitH > this.charUnitW) {
            r = u * this.charUnitW - this.strokeWeight - offset * 2;
          } else {
            r = u * this.charUnitH - this.strokeWeight - offset * 2;
          }
          this.parts.push(
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: this.strokeWeight / 2 + offset,
              radius: r,
              start: 180 / 2,
              end: 180
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: this.strokeWeight / 2 + offset,
              radius: r,
              start: 0,
              end: 180 / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH / 2,
              endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH / 2
            },
            {
              type: "line",
              startPosX: u * this.charUnitW / 2,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW / 2,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.charUnitW / 2 - u * this.charUnitW / 4,
              startPosY: u * this.charUnitH / 2 + u * this.charUnitH / 8,
              endPosX: u * this.charUnitW / 2 + u * this.charUnitW / 4,
              endPosY: u * this.charUnitH / 2 + u * this.charUnitH / 8
            },
            {
              type: "line",
              startPosX: u * this.charUnitW / 2 - u * this.charUnitW / 4,
              startPosY: u * this.charUnitH / 2 + u * this.charUnitH / 4,
              endPosX: u * this.charUnitW / 2 + u * this.charUnitW / 4,
              endPosY: u * this.charUnitH / 2 + u * this.charUnitH / 4
            }
          );
        }
        if (this.char == "&") {
          let lr;
          if (this.charUnitH > this.charUnitW) {
            r = u * this.charUnitW / 2 - this.strokeWeight - offset * 2;
            lr = (u * this.charUnitH - r / 2 - this.strokeWeight - offset * 2) * 2;
          } else {
            r = u * this.charUnitH / 2 - this.strokeWeight - offset * 2;
            lr = (u * this.charUnitH - r / 2 - this.strokeWeight - offset * 2) * 2;
          }
          this.parts.push(
            {
              type: "arc",
              posX: u * this.charUnitW / 6 + r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180,
              end: - 180 / 2
            },
            {
              type: "line",
              startPosX: u * this.charUnitW / 6 + r / 2 + this.strokeWeight / 2 + offset,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - (u * this.charUnitW / 6 + r / 2) - this.strokeWeight / 2 - offset,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "arc",
              posX: u * this.charUnitW - u * this.charUnitW / 6 - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180 / 2,
              end: 0
            },
            {
              type: "line",
              startPosX: u * this.charUnitW - u * this.charUnitW / 6 - this.strokeWeight / 2 - offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - u * this.charUnitW / 6 - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH / 2 - r / 2
            },
            {
              type: "arc",
              posX: u * this.charUnitW - u * this.charUnitW / 6 - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH / 2 - r / 2,
              radius: r,
              start: 0,
              end: 180 / 2
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH / 2,
              endPosX: u * this.charUnitW - (u * this.charUnitW / 6 + r / 2) - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH / 2
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.charUnitH / 2 + r / 2,
              radius: r,
              start: - 180,
              end: - 180 / 2
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH / 2 + r / 2,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 180 / 2,
              end: 180
            },
            {
              type: "line",
              startPosX: r / 2 + this.strokeWeight / 2 + offset,
              startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
              endPosX: u * this.charUnitW - r * 1.5 / 2,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r * 1.5 / 2,
              posY: u * this.charUnitH - r * 1.5 / 2 - this.strokeWeight / 2 - offset,
              radius: r * 1.5,
              start: 0,
              end: 180 / 2
            },
            {
              type: "arc",
              posX: u * this.charUnitW,
              posY: u * this.charUnitH - lr / 2 - this.strokeWeight / 2 - offset,
              radius: (u * this.charUnitW - u * this.charUnitW / 6) * 2 - this.strokeWeight / 2 - offset * 2,
              radiusY: lr,
              start: 180 / 2,
              end: 180
            }
          );
        }
        if (this.char == "@") {
          if (this.charUnitH > this.charUnitW) {
            r = u * this.charUnitW - this.strokeWeight - offset * 2;
            this.parts.push(
              // 外
              {
                type: "line",
                startPosX: this.strokeWeight / 2 + offset,
                startPosY: r / 2 + this.strokeWeight / 2 + offset,
                endPosX: this.strokeWeight / 2 + offset,
                endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
              },
              // 内
              {
                type: "line",
                startPosX: r / 2 - r / 1.75 / 2 + this.strokeWeight / 2 + offset,
                startPosY: r / 2 + this.strokeWeight / 2 + offset,
                endPosX: r / 2 - r / 1.75 / 2 + this.strokeWeight / 2 + offset,
                endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
              }
            );
          } else {
            r = u * this.charUnitH - this.strokeWeight - offset * 2;
            this.parts.push(
              // 外
              {
                type: "line",
                startPosX: r / 2 + this.strokeWeight / 2 + offset,
                startPosY: this.strokeWeight / 2 + offset,
                endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
                endPosY: this.strokeWeight / 2 + offset
              },
              {
                type: "line",
                startPosX: r / 2 + this.strokeWeight / 2 + offset,
                startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
                endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
                endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
              },
              // 内
              {
                type: "line",
                startPosX: r / 2 + this.strokeWeight / 2 + offset,
                startPosY: r / 2 - r / 1.75 / 2 + this.strokeWeight / 2 + offset,
                endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
                endPosY: r / 2 - r / 1.75 / 2 + this.strokeWeight / 2 + offset
              },
              {
                type: "line",
                startPosX: r / 2 + this.strokeWeight / 2 + offset,
                startPosY: u * this.charUnitH - (r / 2 - r / 1.75 / 2) - this.strokeWeight / 2 - offset,
                endPosX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
                endPosY: u * this.charUnitH - (r / 2 - r / 1.75 / 2) - this.strokeWeight / 2 - offset
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
              start: - 180,
              end: - 180 / 2
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 180 / 2,
              end: - 180
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180 / 2,
              end: 0
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 180 / 3,
              end: 180 / 2
            },
            {
              type: "line",
              startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - r / 2.5 - this.strokeWeight / 2 - offset
            },
            // 内
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r / 1.75,
              start: - 180,
              end: - 180 / 2
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r / 1.75,
              start: 180 / 2,
              end: - 180
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r / 1.75,
              start: - 180 / 2,
              end: 0
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r / 1.75,
              start: 0,
              end: 180 / 2
            },
            {
              type: "line",
              startPosX: u * this.charUnitW - (r / 2 - r / 1.75 / 2) - this.strokeWeight / 2 - offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - (r / 2 - r / 1.75 / 2) - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - r / 2.5 - this.strokeWeight / 2 - offset
            },
            // つなぎ
            {
              type: "arc",
              posX: u * this.charUnitW - (r - r / 1.75) / 4 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH - r / 2.5 - this.strokeWeight / 2 - offset,
              radius: (r - r / 1.75) / 2,
              start: 0,
              end: 180
            }
          );
        }
        if (this.char == "%") {
          if (this.charUnitH > this.charUnitW) {
            r = u * this.charUnitW / 2 - this.strokeWeight - offset * 2
          } else {
            r = u * this.charUnitH / 2 - this.strokeWeight - offset * 2
          }
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.charUnitW - u * this.charUnitW / 4,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW / 4,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180,
              end: 0
            },
            {
              type: "arc",
              posX: r / 2 + this.strokeWeight / 2 + offset,
              posY: r / 2 + u * this.charUnitH / 8 + this.strokeWeight / 2 + offset,
              radius: r,
              start: 0,
              end: 180
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH - r / 2 - u * this.charUnitH / 8 - this.strokeWeight / 2 - offset,
              radius: r,
              start: - 180,
              end: 0
            },
            {
              type: "arc",
              posX: u * this.charUnitW - r / 2 - this.strokeWeight / 2 - offset,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: 180
            },
            {
              type: "line",
              startPosX: this.strokeWeight / 2 + offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: this.strokeWeight / 2 + offset,
              endPosY: r / 2 + u * this.charUnitH / 8 + this.strokeWeight / 2 + offset
            },
            {
              type: "line",
              startPosX: r + this.strokeWeight / 2 + offset,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: r + this.strokeWeight / 2 + offset,
              endPosY: r / 2 + u * this.charUnitH / 8 + this.strokeWeight / 2 + offset
            },
            {
              type: "line",
              startPosX: u * this.charUnitW - r - this.strokeWeight / 2 - offset,
              startPosY: u * this.charUnitH - u * this.charUnitH / 8 - r / 2 - this.strokeWeight / 2 - offset,
              endPosX: u * this.charUnitW - r - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              startPosY: u * this.charUnitH - u * this.charUnitH / 8 - r / 2 - this.strokeWeight / 2 - offset,
              endPosX: u * this.charUnitW - this.strokeWeight / 2 - offset,
              endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "(") {
          if (this.charUnitH > this.charUnitW) {
            r = u * this.charUnitW - this.strokeWeight - offset * 2
          } else {
            r = u * this.charUnitH - this.strokeWeight - offset * 2
          }
          this.parts.push(
            {
              type: "arc",
              posX: u * this.charUnitW / 4 + r / 2,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180,
              end: - 180 / 2
            },
            {
              type: "line",
              startPosX: u * this.charUnitW / 4,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW / 4,
              endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: u * this.charUnitW / 4 + r / 2,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 180 / 2,
              end: 180
            }
          );
        }
        if (this.char == ")") {
          if (this.charUnitH > this.charUnitW) {
            r = u * this.charUnitW - this.strokeWeight - offset * 2
          } else {
            r = u * this.charUnitH - this.strokeWeight - offset * 2
          }
          this.parts.push(
            {
              type: "arc",
              posX: u * this.charUnitW - u * this.charUnitW / 4 - r / 2,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180 / 2,
              end: 0
            },
            {
              type: "line",
              startPosX: u * this.charUnitW - u * this.charUnitW / 4,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - u * this.charUnitW / 4,
              endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: u * this.charUnitW - u * this.charUnitW / 4 - r / 2,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: 180 / 2
            }
          );
        }
        if (this.char == "[") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.charUnitW / 4,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW / 2 + u * this.charUnitW / 6,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "line",
              startPosX: u * this.charUnitW / 4,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW / 4,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.charUnitW / 4,
              startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
              endPosX: u * this.charUnitW / 2 + u * this.charUnitW / 6,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "]") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.charUnitW / 2 - u * this.charUnitW / 6,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - u * this.charUnitW / 4,
              endPosY: this.strokeWeight / 2 + offset
            },
            {
              type: "line",
              startPosX: u * this.charUnitW - u * this.charUnitW / 4,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - u * this.charUnitW / 4,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            },
            {
              type: "line",
              startPosX: u * this.charUnitW / 2 - u * this.charUnitW / 6,
              startPosY: u * this.charUnitH - this.strokeWeight / 2 - offset,
              endPosX: u * this.charUnitW - u * this.charUnitW / 4,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "<") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.charUnitW / 2 + u * this.charUnitW / 6,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW / 4,
              endPosY: u * this.charUnitH / 2
            },
            {
              type: "line",
              startPosX: u * this.charUnitW / 4,
              startPosY: u * this.charUnitH / 2,
              endPosX: u * this.charUnitW / 2 + u * this.charUnitW / 6,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == ">") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.charUnitW / 2 - u * this.charUnitW / 6,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - u * this.charUnitW / 4,
              endPosY: u * this.charUnitH / 2
            },
            {
              type: "line",
              startPosX: u * this.charUnitW - u * this.charUnitW / 4,
              startPosY: u * this.charUnitH / 2,
              endPosX: u * this.charUnitW / 2 - u * this.charUnitW / 6,
              endPosY: u * this.charUnitH - this.strokeWeight / 2 - offset
            }
          );
        }
        if (this.char == "{") {
          if (this.charUnitH > this.charUnitW) {
            r = u * this.charUnitW / 2 - this.strokeWeight - offset * 2
          } else {
            r = u * this.charUnitH / 2 - this.strokeWeight - offset * 2
          }
          this.parts.push(
            {
              type: "arc",
              posX: u * this.charUnitW / 4 + r,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180,
              end: - 180 / 2
            },
            {
              type: "line",
              startPosX: u * this.charUnitW / 4 + r / 2,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW / 4 + r / 2,
              endPosY: u * this.charUnitH / 2 - r / 4
            },
            {
              type: "arc",
              posX: u * this.charUnitW / 4 + r / 4,
              posY: u * this.charUnitH / 2 - r / 4,
              radius: r / 2,
              start: 0,
              end: 180 / 2
            },
            {
              type: "arc",
              posX: u * this.charUnitW / 4 + r / 4,
              posY: u * this.charUnitH / 2 + r / 4,
              radius: r / 2,
              start: - 180 / 2,
              end: 0
            },
            {
              type: "line",
              startPosX: u * this.charUnitW / 4 + r / 2,
              startPosY: u * this.charUnitH / 2 + r / 4,
              endPosX: u * this.charUnitW / 4 + r / 2,
              endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: u * this.charUnitW / 4 + r,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 180 / 2,
              end: 180
            }
          );
        }
        if (this.char == "}") {
          if (this.charUnitH > this.charUnitW) {
            r = u * this.charUnitW / 2 - this.strokeWeight - offset * 2
          } else {
            r = u * this.charUnitH / 2 - this.strokeWeight - offset * 2
          }
          this.parts.push(
            {
              type: "arc",
              posX: u * this.charUnitW - u * this.charUnitW / 4 - r,
              posY: r / 2 + this.strokeWeight / 2 + offset,
              radius: r,
              start: - 180 / 2,
              end: 0
            },
            {
              type: "line",
              startPosX: u * this.charUnitW - u * this.charUnitW / 4 - r / 2,
              startPosY: r / 2 + this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - u * this.charUnitW / 4 - r / 2,
              endPosY: u * this.charUnitH / 2 - r / 4
            },
            {
              type: "arc",
              posX: u * this.charUnitW - u * this.charUnitW / 4 - r / 4,
              posY: u * this.charUnitH / 2 - r / 4,
              radius: r / 2,
              start: 180 / 2,
              end: - 180
            },
            {
              type: "arc",
              posX: u * this.charUnitW - u * this.charUnitW / 4 - r / 4,
              posY: u * this.charUnitH / 2 + r / 4,
              radius: r / 2,
              start: - 180,
              end: - 180 / 2
            },
            {
              type: "line",
              startPosX: u * this.charUnitW - u * this.charUnitW / 4 - r / 2,
              startPosY: u * this.charUnitH / 2 + r / 4,
              endPosX: u * this.charUnitW - u * this.charUnitW / 4 - r / 2,
              endPosY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset
            },
            {
              type: "arc",
              posX: u * this.charUnitW - u * this.charUnitW / 4 - r,
              posY: u * this.charUnitH - r / 2 - this.strokeWeight / 2 - offset,
              radius: r,
              start: 0,
              end: 180 / 2
            }
          );
        }
        if (this.char == "\'") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.charUnitW / 2,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW / 2,
              endPosY: u * this.charUnitH / 6
            }
          );
        }
        if (this.char == "\"") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * (this.charUnitW / 2 - 1),
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * (this.charUnitW / 2 - 1),
              endPosY: u * this.charUnitH / 6
            },
            {
              type: "line",
              startPosX: u * (this.charUnitW / 2 + 1),
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * (this.charUnitW / 2 + 1),
              endPosY: u * this.charUnitH / 6
            }
          );
        }
        if (this.char == "^") {
          this.parts.push(
            {
              type: "line",
              startPosX: u * this.charUnitW / 2,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW / 4,
              endPosY: u * this.charUnitH / 6
            },
            {
              type: "line",
              startPosX: u * this.charUnitW / 2,
              startPosY: this.strokeWeight / 2 + offset,
              endPosX: u * this.charUnitW - u * this.charUnitW / 4,
              endPosY: u * this.charUnitH / 6
            }
          );
        }
        if (this.char == "~") {
          if (this.charUnitH > this.charUnitW) {
            r = u * this.charUnitW / 2 - this.strokeWeight / 2 - offset
          } else {
            r = u * this.charUnitH / 2 - this.strokeWeight / 2 - offset
          }
          this.parts.push(
            {
              type: "arc",
              posX: u * this.charUnitW / 2 - r / 2,
              posY: u * this.charUnitH / 2,
              radius: r,
              start: - 180,
              end: 0
            },
            {
              type: "arc",
              posX: u * this.charUnitW / 2 + r / 2,
              posY: u * this.charUnitH / 2,
              radius: r,
              start: 0,
              end: 180
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
            width: u * (this.charUnitW - 4) - offset * 2,
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
            posX: u * (this.charUnitW - 2) - offset,
            posY: u + offset,
            width: u,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u * 2 + offset,
            width: u,
            height: u * (this.charUnitH - 2) - offset * 2
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u * 2 + offset,
            width: u,
            height: u * (this.charUnitH - 2) - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) / 2 + 1),
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          });
        }
        if (this.char == "B") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * this.charUnitH - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.charUnitW - 3) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 2) - offset,
            posY: u + offset,
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) / 2),
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u * ((this.charUnitH - 1) / 2),
            width: u,
            height: u * ((this.charUnitH - 1) / 2 + 1) - offset
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.charUnitH - 1) - offset,
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          });
        }
        if (this.char == "C") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.charUnitW - 1) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * (this.charUnitH - 2) - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.charUnitH - 1) - offset,
            width: u * (this.charUnitW - 1) - offset * 2,
            height: u
          });
        }
        if (this.char == "D") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * this.charUnitH - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.charUnitW - 3) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 2) - offset,
            posY: u + offset,
            width: u,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u * 2 + offset,
            width: u,
            height: u * (this.charUnitH - 3) - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.charUnitH - 1) - offset,
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          });
        }
        if (this.char == "E") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * this.charUnitH - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.charUnitW - 1) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) / 2),
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.charUnitH - 1) - offset,
            width: u * (this.charUnitW - 1) - offset * 2,
            height: u
          });
        }
        if (this.char == "F") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * this.charUnitH - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.charUnitW - 1) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) / 2),
            width: u * (this.charUnitW - 3) - offset * 2,
            height: u
          });
        }
        if (this.char == "G") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.charUnitW - 1) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * (this.charUnitH - 2) - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.charUnitH - 1) - offset,
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u * ((this.charUnitH - 1) / 2) + offset,
            width: u,
            height: u * ((this.charUnitH - 1) / 2 + 1) - offset * 2
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2) + offset,
            posY: u * ((this.charUnitH - 1) / 2) + offset,
            width: u * ((this.charUnitW - 1) / 2) - offset * 2,
            height: u
          });
        }
        if (this.char == "H") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * this.charUnitH - offset * 2
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: offset,
            width: u,
            height: u * this.charUnitH - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) / 2),
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          });
        }
        if (this.char == "I") {
          this.parts.push({
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2),
            posY: offset,
            width: u,
            height: u * this.charUnitH - offset * 2
          },
          {
            type: "rect",
            posX: offset,
            posY: offset,
            width: u * this.charUnitW - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u * (this.charUnitH - 1) - offset,
            width: u * this.charUnitW - offset * 2,
            height: u
          });
        }
        if (this.char == "J") {
          this.parts.push({
            type: "rect",
            posX: u * (this.charUnitW - 2) - offset,
            posY: u + offset,
            width: u,
            height: u * (this.charUnitH - 2) - offset * 2
          },
          {
            type: "rect",
            posX: offset,
            posY: offset,
            width: u * this.charUnitW - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u * (this.charUnitH - 1) - offset,
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          });
        }
        if (this.char == "K") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * this.charUnitH - offset * 2
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: offset,
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 2) - offset,
            posY: u * ((this.charUnitH - 1) / 2 - 1),
            width: u,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) / 2),
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u * ((this.charUnitH - 1) / 2 + 1),
            width: u,
            height: u * ((this.charUnitH - 1) / 2) - offset
          });
        }
        if (this.char == "L") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * this.charUnitH - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.charUnitH - 1) - offset,
            width: u * (this.charUnitW - 1) - offset * 2,
            height: u
          });
        }
        if (this.char == "M") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * (this.charUnitH - 1) - offset * 2
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u + offset,
            width: u,
            height: u * (this.charUnitH - 1) - offset * 2
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2),
            posY: u + offset,
            width: u,
            height: u * (this.charUnitH - 2) - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * ((this.charUnitW - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2 + 1),
            posY: offset,
            width: u * ((this.charUnitW - 3) / 2) - offset,
            height: u
          });
        }
        if (this.char == "N") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * this.charUnitH - offset * 2
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: offset,
            width: u,
            height: u * this.charUnitH - offset * 2
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2),
            posY: u + offset,
            width: u,
            height: u * (this.charUnitH - 2) - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * ((this.charUnitW - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2 + 1),
            posY: u * (this.charUnitH - 1) - offset,
            width: u * ((this.charUnitW - 3) / 2) - offset,
            height: u
          });
        }
        if (this.char == "O") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * (this.charUnitH - 2) - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.charUnitH - 1) - offset,
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u + offset,
            width: u,
            height: u * (this.charUnitH - 2) - offset * 2
          });
        }
        if (this.char == "P") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * this.charUnitH - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) / 2),
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u + offset,
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          });
        }
        if (this.char == "Q") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * (this.charUnitH - 2) - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.charUnitH - 1) - offset,
            width: u * (this.charUnitW - 3) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u + offset,
            width: u,
            height: u * (this.charUnitH - 3) - offset * 2
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 3) - offset,
            posY: u * (this.charUnitH - 3) - offset,
            width: u,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 2) - offset,
            posY: u * (this.charUnitH - 2) - offset,
            width: u,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u * (this.charUnitH - 1) - offset,
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
            height: u * this.charUnitH - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) / 2),
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u + offset,
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 2) - offset,
            posY: u * ((this.charUnitH - 1) / 2 + 1),
            width: u,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u * ((this.charUnitH - 1) / 2 + 2),
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          });
        }
        if (this.char == "S") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.charUnitW - 1) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) / 2),
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u * (this.charUnitH - 1) - offset,
            width: u * (this.charUnitW - 1) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u * ((this.charUnitH - 1) / 2 + 1),
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          });
        }
        if (this.char == "T") {
          this.parts.push({
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2),
            posY: offset,
            width: u,
            height: u * this.charUnitH - offset * 2
          },
          {
            type: "rect",
            posX: offset,
            posY: offset,
            width: u * this.charUnitW - offset * 2,
            height: u
          });
        }
        if (this.char == "U") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * (this.charUnitH - 1) - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.charUnitH - 1) - offset,
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: offset,
            width: u,
            height: u * (this.charUnitH - 1) - offset * 2
          });
        }
        if (this.char == "V") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * ((this.charUnitH - 1) / 2 + 1) - offset
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) / 2 + 1),
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 2) - offset,
            posY: u * ((this.charUnitH - 1) / 2 + 1),
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u * 2 + offset,
            posY: u * (this.charUnitH - 1) - offset,
            width: u * (this.charUnitW - 4) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: offset,
            width: u,
            height: u * ((this.charUnitH - 1) / 2 + 1) - offset
          });
        }
        if (this.char == "W") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * (this.charUnitH - 1) - offset * 2
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: offset,
            width: u,
            height: u * (this.charUnitH - 1) - offset * 2
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2),
            posY: u + offset,
            width: u,
            height: u * (this.charUnitH - 2) - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.charUnitH - 1) - offset,
            width: u * ((this.charUnitW - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2 + 1),
            posY: u * (this.charUnitH - 1) - offset,
            width: u * ((this.charUnitW - 3) / 2) - offset,
            height: u
          });
        }
        if (this.char == "X") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) / 2 - 1),
            width: u * ((this.charUnitW - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2 + 1),
            posY: u * ((this.charUnitH - 1) / 2 - 1),
            width: u * ((this.charUnitW - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2),
            posY: u * ((this.charUnitH - 1) / 2),
            width: u,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: offset,
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) / 2 + 1),
            width: u * ((this.charUnitW - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2 + 1),
            posY: u * ((this.charUnitH - 1) / 2 + 1),
            width: u * ((this.charUnitW - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u * ((this.charUnitH - 1) / 2 + 2),
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u * ((this.charUnitH - 1) / 2 + 2),
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          });
        }
        if (this.char == "Y") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) / 2 - 1),
            width: u * ((this.charUnitW - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2 + 1),
            posY: u * ((this.charUnitH - 1) / 2 - 1),
            width: u * ((this.charUnitW - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2),
            posY: u * ((this.charUnitH - 1) / 2),
            width: u,
            height: u * ((this.charUnitH - 1) / 2 + 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: offset,
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          });
        }
        if (this.char == "Z") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u * this.charUnitW - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) / 2),
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u * (this.charUnitH - 1) - offset,
            width: u * this.charUnitW - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u + offset,
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: offset,
            posY: u * ((this.charUnitH - 1) / 2 + 1),
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          });
        }
        if (this.char == "0") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * (this.charUnitH - 2) - offset * 2
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.charUnitH - 1) - offset,
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u + offset,
            width: u,
            height: u * (this.charUnitH - 2) - offset * 2
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2),
            posY: u * ((this.charUnitH - 1) / 2),
            width: u,
            height: u
          });
        }
        if (this.char == "1") {
          this.parts.push({
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2),
            posY: offset,
            width: u,
            height: u * this.charUnitH - offset * 2
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2 - 2) + offset,
            posY: offset,
            width: u * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u * (this.charUnitH - 1) - offset,
            width: u * this.charUnitW - offset * 2,
            height: u
          });
        }
        if (this.char == "2") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) / 2),
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u * (this.charUnitH - 1) - offset,
            width: u * this.charUnitW - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u + offset,
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: offset,
            posY: u * ((this.charUnitH - 1) / 2 + 1),
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          });
        }
        if (this.char == "3") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) / 2),
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u * (this.charUnitH - 1) - offset,
            width: u * (this.charUnitW - 1) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u + offset,
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u * ((this.charUnitH - 1) / 2 + 1),
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          });
        }
        if (this.char == "4") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * ((this.charUnitH - 1) / 2 + 2) - offset
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) / 2 + 1),
            width: u * (this.charUnitW - 1) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 2) - offset,
            posY: u + offset,
            width: u,
            height: u * (this.charUnitH - 1) - offset * 2
          });
        }
        if (this.char == "5") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u * (this.charUnitW - 1) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u * ((this.charUnitH - 1) / 2),
            width: u * (this.charUnitW - 1) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u * (this.charUnitH - 1) - offset,
            width: u * (this.charUnitW - 1) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u * ((this.charUnitH - 1) / 2 + 1),
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          });
        }
        if (this.char == "6") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u * ((this.charUnitH - 1) / 2),
            width: u * (this.charUnitW - 1) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.charUnitH - 1) - offset,
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * (this.charUnitH - 2) - offset * 2
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u * ((this.charUnitH - 1) / 2 + 1),
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          });
        }
        if (this.char == "7") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u * this.charUnitW - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 2) - offset,
            posY: u * ((this.charUnitH - 1) / 2),
            width: u,
            height: u * ((this.charUnitH - 1) / 2 + 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u + offset,
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          });
        }
        if (this.char == "8") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) / 2),
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.charUnitH - 1) - offset,
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u + offset,
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: offset,
            posY: u * ((this.charUnitH - 1) / 2 + 1),
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u * ((this.charUnitH - 1) / 2 + 1),
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          });
        }
        if (this.char == "9") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) / 2),
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.charUnitH - 1) - offset,
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u + offset,
            width: u,
            height: u * (this.charUnitH - 2) - offset * 2
          });
        }
        if (this.char == ",") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: u * (this.charUnitH - 2) - offset,
            width: u * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * 2 + offset,
            posY: u * (this.charUnitH - 1) - offset,
            width: u,
            height: u
          });
        }
        if (this.char == ".") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: u * (this.charUnitH - 1.5) - offset,
            width: u * 1.5,
            height: u * 1.5
          });
        }
        if (this.char == "!") {
          this.parts.push(
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2),
            posY: offset,
            width: u,
            height: u * (this.charUnitH - 2) - offset * 2
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2 - 0.25),
            posY: u * (this.charUnitH - 1) - offset,
            width: u * 1.5,
            height: u * 1
          });
        }
        if (this.char == "?") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset * 2
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2 + 1),
            posY: u * ((this.charUnitH - 1) / 2) - offset,
            width: u * ((this.charUnitW - 1) / 2 - 1) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2),
            posY: u * ((this.charUnitH - 1) / 2 + 0.5),
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1.25) - offset
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u + offset,
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset * 2
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2 - 0.25),
            posY: u * (this.charUnitH - 1) - offset,
            width: u * 1.5,
            height: u
          });
        }
        if (this.char == ":") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) / 2 - 1.5),
            width: u * 1.5,
            height: u * 1.5
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) / 2 + 1) + offset,
            width: u * 1.5,
            height: u * 1.5
          });
        }
        if (this.char == ";") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) / 2 - 1.5),
            width: u * 1.5,
            height: u * 1.5
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.charUnitH - 2) - offset,
            width: u * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * 2 + offset,
            posY: u * (this.charUnitH - 1) - offset,
            width: u,
            height: u
          });
        }
        if (this.char == "-") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) / 2),
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          });
        }
        if (this.char == "+") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) / 2),
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2),
            posY: u + offset,
            width: u,
            height: u * (this.charUnitH - 2) - offset * 2
          });
        }
        if (this.char == "=") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) / 2 - 1),
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) / 2 + 1),
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          });
        }
        if (this.char == "*") {
          this.parts.push(
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) / 2 - 1),
            width: u * ((this.charUnitW - 2) / 3) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) - ((this.charUnitW - 2) / 3)),
            posY: u * ((this.charUnitH - 1) / 2 - 1),
            width: u * ((this.charUnitW - 2) / 3) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 2) / 3 + 1),
            posY: u * ((this.charUnitH - 1) / 2),
            width: u * ((this.charUnitW - 2) / 3),
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) / 2 + 1),
            width: u * ((this.charUnitW - 2) / 3) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) - ((this.charUnitW - 2) / 3)),
            posY: u * ((this.charUnitH - 1) / 2 + 1),
            width: u * ((this.charUnitW - 2) / 3) - offset,
            height: u
          });
        }
        if (this.char == "/") {
          this.parts.push({
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: offset,
            width: u,
            height: u * ((this.charUnitH - 2) / 3) - offset
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2 + 1),
            posY: u * ((this.charUnitH - 2) / 3),
            width: u * ((this.charUnitW - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2),
            posY: u * ((this.charUnitH - 2) / 3 + 1),
            width: u,
            height: u * ((this.charUnitH - 2) / 3)
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) - ((this.charUnitH - 2) / 3)),
            width: u * ((this.charUnitW - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u * ((this.charUnitH) - (this.charUnitH - 2) / 3),
            width: u,
            height: u * ((this.charUnitH - 2) / 3) - offset
          });
        }
        if (this.char == "\\") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * ((this.charUnitH - 2) / 3) - offset
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 2) / 3),
            width: u * ((this.charUnitW - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2),
            posY: u * ((this.charUnitH - 2) / 3 + 1),
            width: u,
            height: u * ((this.charUnitH - 2) / 3)
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2 + 1),
            posY: u * ((this.charUnitH - 1) - ((this.charUnitH - 2) / 3)),
            width: u * ((this.charUnitW - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u * ((this.charUnitH) - (this.charUnitH - 2) / 3),
            width: u,
            height: u * ((this.charUnitH - 2) / 3) - offset
          });
        }
        if (this.char == "#") {
          this.parts.push({
            type: "rect",
            posX: u * ((this.charUnitW - 2) / 3) + offset,
            posY: offset,
            width: u,
            height: u * this.charUnitH - offset * 2
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 0.75) - (this.charUnitW - 2) / 3) - offset,
            posY: offset,
            width: u,
            height: u * this.charUnitH - offset * 2
          },
          {
            type: "rect",
            posX: u * 0.5 + offset,
            posY: u * ((this.charUnitH - 2) / 3) + offset,
            width: u * (this.charUnitW - 0.75) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * 0.5 + offset,
            posY: u * (this.charUnitH - 1 - (this.charUnitH - 2) / 3) - offset,
            width: u * (this.charUnitW - 0.75) - offset * 2,
            height: u
          });
        }
        if (this.char == "$") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) / 2),
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.charUnitH - 1) - offset,
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u * ((this.charUnitH - 1) / 2 + 1),
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2),
            posY: offset,
            width: u,
            height: u * this.charUnitH - offset * 2
          });
        }
        if (this.char == "¥") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: offset,
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) / 2 - 1),
            width: u * ((this.charUnitW - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2 + 1),
            posY: u * ((this.charUnitH - 1) / 2 - 1),
            width: u * ((this.charUnitW - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2),
            posY: u * ((this.charUnitH - 1) / 2),
            width: u,
            height: u * ((this.charUnitH - 1) / 2 + 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: offset,
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) / 2 + 1) + offset,
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          });
        }
        if (this.char == "@") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.charUnitW - 2) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * (this.charUnitH - 2) - offset * 2
          },
          {
            type: "rect",
            posX: u * 3 + offset,
            posY: u * 2 + offset,
            width: u * (this.charUnitW - 4),
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u + offset,
            width: u,
            height: u * (this.charUnitH - 2) - offset * 2
          },
          {
            type: "rect",
            posX: u * 2 + offset,
            posY: u * (this.charUnitH - 1) - offset,
            width: u * (this.charUnitW - 3) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * 2 + offset,
            posY: u * 3 + offset,
            width: u,
            height: u * (this.charUnitH - 3) - offset * 2
          });
        }
        if (this.char == "%") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * ((this.charUnitW - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 2) / 3 + 1),
            width: u * ((this.charUnitW - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * ((this.charUnitH - 2) / 3) - offset
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 3) / 2 + 1),
            posY: u + offset,
            width: u,
            height: u * ((this.charUnitH - 2) / 3) - offset
          },

          {
            type: "rect",
            posX: u * ((this.charUnitW - 3) / 2 + 2),
            posY: u * ((this.charUnitH - 2) / 3 * 2),
            width: u * ((this.charUnitW - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 3) / 2 + 2),
            posY: u * (this.charUnitH - 1) - offset,
            width: u * ((this.charUnitW - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u * ((this.charUnitH - 2) / 3 * 2 + 1),
            width: u,
            height: u * ((this.charUnitH - 2) / 3) - offset
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 3) / 2 + 1),
            posY: u * ((this.charUnitH - 2) / 3 * 2 + 1),
            width: u,
            height: u * ((this.charUnitH - 2) / 3) - offset
          },

          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: offset,
            width: u,
            height: u * ((this.charUnitH - 2) / 3) - offset
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2 + 1),
            posY: u * ((this.charUnitH - 2) / 3),
            width: u * ((this.charUnitW - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2),
            posY: u * ((this.charUnitH - 2) / 3 + 1),
            width: u,
            height: u * ((this.charUnitH - 2) / 3)
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) - ((this.charUnitH - 2) / 3)),
            width: u * ((this.charUnitW - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u * ((this.charUnitH) - (this.charUnitH - 2) / 3),
            width: u,
            height: u * ((this.charUnitH - 2) / 3) - offset
          });
        }
        if (this.char == "&") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u * (this.charUnitW - 4) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * ((this.charUnitH - 1) / 2),
            width: u * (this.charUnitW - 3) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.charUnitH - 1) - offset,
            width: u * (this.charUnitW - 3) - offset * 2,
            height: u
          },
          {
            type: "rect",
            posX: offset,
            posY: u + offset,
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: offset,
            posY: u * ((this.charUnitH - 1) / 2 + 1),
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u * ((this.charUnitH - 1) / 2),
            width: u,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 3) - offset,
            posY: u + offset,
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 2) - offset,
            posY: u * ((this.charUnitH - 1) / 2 + 1),
            width: u,
            height: u * ((this.charUnitH - 1) / 2 - 1) - offset
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u * (this.charUnitH - 1) - offset,
            width: u,
            height: u
          });
        }
        if (this.char == "(") {
          this.parts.push({
            type: "rect",
            posX: u * (this.charUnitW - 2) - offset,
            posY: offset,
            width: u,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 2) - offset,
            posY: u * (this.charUnitH - 1) - offset,
            width: u,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 3) - offset,
            posY: u + offset,
            width: u,
            height: u * (this.charUnitH - 2) - offset * 2
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
            posY: u * (this.charUnitH - 1) - offset,
            width: u,
            height: u
          },
          {
            type: "rect",
            posX: u * 3 + offset,
            posY: u + offset,
            width: u,
            height: u * (this.charUnitH - 2) - offset * 2
          });
        }
        if (this.char == "[") {
          this.parts.push({
            type: "rect",
            posX: u * (this.charUnitW - 3) - offset,
            posY: offset,
            width: u * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 3) - offset,
            posY: u * (this.charUnitH - 1) - offset,
            width: u * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 3) - offset,
            posY: offset,
            width: u,
            height: u * this.charUnitH - offset * 2
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
            posY: u * (this.charUnitH - 1) - offset,
            width: u * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * 2 + offset,
            posY: offset,
            width: u,
            height: u * this.charUnitH - offset * 2
          });
        }
        if (this.char == "<") {
          this.parts.push({
            type: "rect",
            posX: u * (this.charUnitW - 2) - offset,
            posY: offset,
            width: u,
            height: u * (this.charUnitH / 5)
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 2) - offset,
            posY: u * (this.charUnitH / 5 * 4) - offset,
            width: u,
            height: u * (this.charUnitH / 5)
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 3) - offset,
            posY: u * (this.charUnitH / 5),
            width: u,
            height: u * (this.charUnitH / 5)
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 3) - offset,
            posY: u * (this.charUnitH / 5 * 3),
            width: u,
            height: u * (this.charUnitH / 5)
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 4) - offset,
            posY: u * (this.charUnitH / 5 * 2),
            width: u,
            height: u * (this.charUnitH / 5)
          });
        }
        if (this.char == ">") {
          this.parts.push({
            type: "rect",
            posX: u + offset,
            posY: offset,
            width: u,
            height: u * (this.charUnitH / 5)
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.charUnitH / 5 * 4) - offset,
            width: u,
            height: u * (this.charUnitH / 5)
          },
          {
            type: "rect",
            posX: u * 2 + offset,
            posY: u * (this.charUnitH / 5),
            width: u,
            height: u * (this.charUnitH / 5)
          },
          {
            type: "rect",
            posX: u * 2 + offset,
            posY: u * (this.charUnitH / 5 * 3),
            width: u,
            height: u * (this.charUnitH / 5)
          },
          {
            type: "rect",
            posX: u * 3 + offset,
            posY: u * (this.charUnitH / 5 * 2),
            width: u,
            height: u * (this.charUnitH / 5)
          });
        }
        if (this.char == "{") {
          this.parts.push({
            type: "rect",
            posX: u * (this.charUnitW - 3) - offset,
            posY: offset,
            width: u * 2,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 3) - offset,
            posY: offset,
            width: u,
            height: u * ((this.charUnitH - 1) / 2) - offset
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 4) - offset,
            posY: u * ((this.charUnitH - 1) / 2),
            width: u,
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 3) - offset,
            posY: u * ((this.charUnitH - 1) / 2 + 1),
            width: u,
            height: u * ((this.charUnitH - 1) / 2) - offset
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 3) - offset,
            posY: u * (this.charUnitH - 1) - offset,
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
            height: u * ((this.charUnitH - 1) / 2) - offset
          },
          {
            type: "rect",
            posX: u * 3 + offset,
            posY: u * ((this.charUnitH - 1) / 2),
            width: u,
            height: u
          },
          {
            type: "rect",
            posX: u * 2 + offset,
            posY: u * ((this.charUnitH - 1) / 2 + 1),
            width: u,
            height: u * ((this.charUnitH - 1) / 2) - offset
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u * (this.charUnitH - 1) - offset,
            width: u * 2,
            height: u
          });
        }
        if (this.char == "^") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: u * 2 + offset,
            width: u * (this.charUnitW / 5),
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW / 5),
            posY: u + offset,
            width: u * (this.charUnitW / 5),
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW / 5 * 2),
            posY: offset,
            width: u * (this.charUnitW / 5),
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW / 5 * 3),
            posY: u + offset,
            width: u * (this.charUnitW / 5),
            height: u
          },
          {
            type: "rect",
            posX: u * (this.charUnitW / 5 * 4) - offset,
            posY: u * 2 + offset,
            width: u * (this.charUnitW / 5),
            height: u
          });
        }
        if (this.char == "~") {
          this.parts.push({
            type: "rect",
            posX: offset,
            posY: u * 2 + offset,
            width: u,
            height: u * (this.charUnitH - 5)
          },
          {
            type: "rect",
            posX: u + offset,
            posY: u + offset,
            width: u * ((this.charUnitW - 3) / 2) - offset,
            height: u
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2),
            posY: u * 2 + offset,
            width: u,
            height: u * (this.charUnitH - 4) - offset * 2
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - 1) - offset,
            posY: u * 3 + offset,
            width: u,
            height: u * (this.charUnitH - 5)
          },
          {
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2 + 1),
            posY: u * (this.charUnitH - 2) - offset,
            width: u * ((this.charUnitW - 3) / 2) - offset,
            height: u
          });
        }
        if (this.char == "\"") {
          this.parts.push({
            type: "rect",
            posX: u * ((this.charUnitW - 3) / 2),
            posY: offset,
            width: u,
            height: u * (this.charUnitH / 5 * 2)
          },
          {
            type: "rect",
            posX: u * (this.charUnitW - ((this.charUnitW - 3) / 2) - 1),
            posY: offset,
            width: u,
            height: u * (this.charUnitH / 5 * 2)
          });
        }
        if (this.char == "\'") {
          this.parts.push({
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2),
            posY: offset,
            width: u,
            height: u * (this.charUnitH / 5 * 2)
          });
        }
        if (this.char == "|") {
          this.parts.push({
            type: "rect",
            posX: u * ((this.charUnitW - 1) / 2),
            posY: offset,
            width: u,
            height: u * (this.charUnitH) - offset * 2
          });
        }
        if (this.char == "寅") {
          this.parts.push(
            {
              type: "rect",
              posX: u * ((this.charUnitW - 1) / 2),
              posY: offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: offset,
              posY: u + offset,
              width: u * this.charUnitW - offset * 2,
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
              posX: u * (this.charUnitW - 1) - offset,
              posY: u * 2 + offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * 2 + offset,
              posY: u * 3 + offset,
              width: u * (this.charUnitW - 4) - offset * 2,
              height: u
            },
            {
              type: "rect",
              posX: u + offset,
              posY: u * 5 + offset,
              width: u * (this.charUnitW - 2) - offset * 2,
              height: u
            },
            {
              type: "rect",
              posX: u + offset,
              posY: u * 5 + u * ((this.charUnitH - 8) / 2),
              width: u * (this.charUnitW - 2) - offset * 2,
              height: u
            },
            {
              type: "rect",
              posX: u + offset,
              posY: u * (this.charUnitH - 3) - offset,
              width: u * (this.charUnitW - 2) - offset * 2,
              height: u
            },
            {
              type: "rect",
              posX: u + offset,
              posY: u * 5 + offset,
              width: u,
              height: u * (this.charUnitH - 8) - offset * 2
            },
            {
              type: "rect",
              posX: u * ((this.charUnitW - 1) / 2),
              posY: u * 4 + offset,
              width: u,
              height: u * (this.charUnitH - 7) - offset * 2
            },
            {
              type: "rect",
              posX: u * (this.charUnitW - 2) - offset,
              posY: u * 5 + offset,
              width: u,
              height: u * (this.charUnitH - 8) - offset * 2
            },
            {
              type: "rect",
              posX: u * 2 + offset,
              posY: u * (this.charUnitH - 2) - offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u + offset,
              posY: u * (this.charUnitH - 1) - offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * (this.charUnitW - 3) - offset,
              posY: u * (this.charUnitH - 2) - offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * (this.charUnitW - 2) - offset,
              posY: u * (this.charUnitH - 1) - offset,
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
              width: u * ((this.charUnitW - 4) / 3),
              height: u
            },
            {
              type: "rect",
              posX: u * (this.charUnitW - ((this.charUnitW - 4) / 3) - 1) - offset,
              posY: offset,
              width: u * ((this.charUnitW - 4) / 3),
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
              posX: u * (this.charUnitW - 1) - offset,
              posY: u + offset,
              width: u,
              height: u * 3
            },
            {
              type: "rect",
              posX: u * ((this.charUnitW - 4) / 3 + 1) + offset,
              posY: u + offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * (this.charUnitW - ((this.charUnitW - 4) / 3) - 2) - offset,
              posY: u + offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * 2 + offset,
              posY: u * 2 + offset,
              width: u * ((this.charUnitW - 4) / 3 - 2),
              height: u
            },
            {
              type: "rect",
              posX: u * ((this.charUnitW - 4) / 3 + 1) + offset,
              posY: u * 2 + offset,
              width: u * ((this.charUnitW - 4) / 3 + 2) - offset * 2,
              height: u
            },
            {
              type: "rect",
              posX: u * (this.charUnitW - ((this.charUnitW - 4) / 3)) - offset,
              posY: u * 2 + offset,
              width: u * ((this.charUnitW - 4) / 3 - 2),
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
              posX: u * (this.charUnitW - 2) - offset,
              posY: u * 3 + offset,
              width: u,
              height: u
            },
            // 額
            {
              type: "rect",
              posX: u * ((this.charUnitW - 1) / 2),
              posY: u * 3 + offset,
              width: u,
              height: u * 3
            },
            {
              type: "rect",
              posX: u * ((this.charUnitW - 1) / 2 - 1),
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
              height: u * (this.charUnitH - 8) - offset * 2
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
              posY: u * (this.charUnitH - 5) - offset,
              width: u * 2,
              height: u
            },
            {
              type: "rect",
              posX: u + offset,
              posY: u * (this.charUnitH - 4) - offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * 3 + offset,
              posY: u * (this.charUnitH - 4) - offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * 2 + offset,
              posY: u * (this.charUnitH - 3) - offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u + offset,
              posY: u * (this.charUnitH - 2) - offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * 3 + offset,
              posY: u * (this.charUnitH - 2) - offset,
              width: u * 2,
              height: u
            },
            // 右頬
            {
              type: "rect",
              posX: u * (this.charUnitW - 1) - offset,
              posY: u * 4 + offset,
              width: u,
              height: u * (this.charUnitH - 8) - offset * 2
            },
            {
              type: "rect",
              posX: u * (this.charUnitW - 2) - offset,
              posY: u * 5 + offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * (this.charUnitW - 3) - offset,
              posY: u * (this.charUnitH - 5) - offset,
              width: u * 2,
              height: u
            },
            {
              type: "rect",
              posX: u * (this.charUnitW - 2) - offset,
              posY: u * (this.charUnitH - 4) - offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * (this.charUnitW - 4) - offset,
              posY: u * (this.charUnitH - 4) - offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * (this.charUnitW - 3) - offset,
              posY: u * (this.charUnitH - 3) - offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * (this.charUnitW - 2) - offset,
              posY: u * (this.charUnitH - 2) - offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * (this.charUnitW - 5) - offset,
              posY: u * (this.charUnitH - 2) - offset,
              width: u * 2,
              height: u
            },
            // 鼻
            {
              type: "rect",
              posX: u * ((this.charUnitW - 1) / 2 - 1),
              posY: u * (this.charUnitH - 6) - offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * ((this.charUnitW - 1) / 2 + 1),
              posY: u * (this.charUnitH - 6) - offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * ((this.charUnitW - 1) / 2 - 1),
              posY: u * (this.charUnitH - 5) - offset,
              width: u * 3,
              height: u
            },
            // 口、顎
            {
              type: "rect",
              posX: u * ((this.charUnitW - 1) / 2),
              posY: u * (this.charUnitH - 4) - offset,
              width: u,
              height: u
            },
            {
              type: "rect",
              posX: u * 4 + offset,
              posY: u * (this.charUnitH - 3) - offset,
              width: u * (this.charUnitW - 8) - offset * 2,
              height: u
            },
            {
              type: "rect",
              posX: u * 4 + offset,
              posY: u * (this.charUnitH - 1) - offset,
              width: u * (this.charUnitW - 8) - offset * 2,
              height: u
            },
            // 左目
            {
              type: "rect",
              posX: u * 3 + offset,
              posY: u * 5 + offset,
              width: u * ((this.charUnitW - 11) / 2) - offset,
              height: u
            },
            {
              type: "rect",
              posX: u * 2 + offset,
              posY: u * 6 + offset,
              width: u,
              height: u * (this.charUnitH - 12) - offset * 2
            },
            {
              type: "rect",
              posX: u * ((this.charUnitW - 1) / 2 - 2),
              posY: u * 6 + offset,
              width: u,
              height: u * (this.charUnitH - 12) - offset * 2
            },
            {
              type: "rect",
              posX: u * 3 + offset,
              posY: u * (this.charUnitH - 6) - offset,
              width: u * ((this.charUnitW - 11) / 2) - offset,
              height: u
            },
            // 右目
            {
              type: "rect",
              posX: u * ((this.charUnitW - 1) / 2 + 3),
              posY: u * 5 + offset,
              width: u * ((this.charUnitW - 11) / 2) - offset,
              height: u
            },
            {
              type: "rect",
              posX: u * ((this.charUnitW - 1) / 2 + 2),
              posY: u * 6 + offset,
              width: u,
              height: u * (this.charUnitH - 12) - offset * 2
            },
            {
              type: "rect",
              posX: u * (this.charUnitW - 3) - offset,
              posY: u * 6 + offset,
              width: u,
              height: u * (this.charUnitH - 12) - offset * 2
            },
            {
              type: "rect",
              posX: u * ((this.charUnitW - 1) / 2 + 3),
              posY: u * (this.charUnitH - 6) - offset,
              width: u * ((this.charUnitW - 11) / 2) - offset,
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
      strokeWeight(this.strokeWeight);
      switch(p.type) {
        case "rect":
          rect(p.posX, p.posY, p.width, p.height);
          break;
        case "arc":
          if (p.radiusY) {
            arc(p.posX, p.posY, p.radius, p.radiusY, p.start, p.end);
          } else {
            arc(p.posX, p.posY, p.radius, p.radius, p.start, p.end);
          }
          break;
        case "line":
          line(p.startPosX, p.startPosY, p.endPosX, p.endPosY);
          break;
        case "point":
          point(p.posX, p.posY);
          break;
        default:
          break;
      }
    }
  }
  print() {
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
