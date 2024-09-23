import csvParser from "csv-parser";
import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { Transform } from "stream";
import { SuperDigital } from "../../../models/superDigital";
import { footerOFX } from "../footerOFX";
import { headerOFX } from "../headerOFX";

export class TransformController {
  convert(request: Request, response: Response) {
    try {
      const filePath = path.join(
        __dirname,
        "../../../uploads/20240211_20240217_3296848.txt"
      );

      const readbleStream = fs.createReadStream(filePath, {
        encoding: "utf-8",
      });

      let totalBytes = 0;
      readbleStream.on("data", (chunk) => {
        totalBytes += chunk.length;
        console.log(`Processing ${totalBytes} bytes`);
      });

      let isFirstLine = true;
      let ofxData = '';

      const writebleMapToOFX = new Transform({
        objectMode: true,
        transform(chunk, encoding, callback) {
          if (isFirstLine) {
            isFirstLine = false; // Pula a primeira linha
            callback(); // Ignora o cabeçalho
            return;
          }

          const csvLine: SuperDigital = {
            CNPJ: chunk[0],
            razaoSocial: chunk[1],
            NSU: chunk[2],
            numeroCartaomask: chunk[3],
            statusCartao: chunk[4],
            apelido: chunk[5],
            dataLancto: formatDateToCustomString(new Date(chunk[6])),
            historico: chunk[7],
            valor: parseFloat(chunk[8]),
            statusLancamento: chunk[9],
          };

          const ofxLine = convertCSVToOFX(csvLine);
          ofxData += ofxLine; // Concatena os dados OFX
          callback();
        },
      });

      const outputPath = path.join(__dirname, "../../../uploads/output.ofx");
      const writeStream = fs.createWriteStream(outputPath);

      readbleStream
        .pipe(csvParser({ separator: "\t", headers: false }))
        .pipe(writebleMapToOFX)
        .on("finish", () => {
          const finalOFX = headerOFX + ofxData + footerOFX;
          fs.writeFileSync(outputPath, finalOFX);
          console.log("Arquivo OFX gerado com sucesso!");
        });

      writeStream.on("finish", () => {
        response
          .status(200)
          .json({ message: "Arquivo convertido com sucesso!" });
      });

      writeStream.on("error", (error) => {
        console.error("Write stream error:", error);
        response.status(500).json({ message: "Erro ao escrever o arquivo." });
      });
    } catch (error) {
      console.log(error);
    }
  }
}

function convertCSVToOFX(csvLine: SuperDigital): string {
  let type, id: string;
  console.log(csvLine);
  const {
    CNPJ,
    razaoSocial,
    NSU,
    numeroCartaomask,
    statusCartao,
    apelido,
    dataLancto,
    historico,
    valor,
    statusLancamento,
  } = csvLine;
  if (valor < 0) {
    type = "DEBIT";
    id = "teste";
  } else {
    type = "CREDIT";
    id = "teste";
  }
  return `
    <STMTTRN>
      <TRNTYPE>${type}</TRNTYPE>
      <DTPOSTED>${dataLancto}</DTPOSTED>
      <TRNAMT>${valor}</TRNAMT>
      <FITID>${id}</FITID>
      <MEMO>${historico}</MEMO>
    </STMTTRN>
  `;
}

function formatDateToCustomString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Janeiro é 0
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}
