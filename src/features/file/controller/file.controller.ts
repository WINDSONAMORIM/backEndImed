import path from "path";
import fs from "fs";
import { Request, Response } from "express";

export class FileController {
  upload(request: Request, response: Response) {
    try {
      if (!request.file || request.files?.length === 0) {
        return response.status(400).send({ message: "Please upload a file!" });
      }
      const uploadFiles = request.files as Express.Multer.File[];
      const fileNames = uploadFiles.map((file) => file.originalname);

      response.status(200).send({
        message: "Uploaded the file successfully: " + fileNames.join(", "),
      });
    } catch (error: unknown) {
      if (error instanceof Error && (error as any).code === "LIMIT_FILE_SIZE") {
        return response.status(500).send({
          message: "File size cannot be larger than 2MB!",
        });
      }
      response.status(500).send({
        message: `Could not upload the file: ${error}`,
      });
    }
  }

  getListFiles(request: Request, response: Response) {
    try {
      const directoryPath = path.join(
        __dirname + "/resources/static/assets/uploads/"
      );
      fs.readdir(directoryPath, function (err, files) {
        if (err) {
          response.status(500).send({
            message: "Unable to scan files!",
          });
        }

        const fileInfos: { name: string; url: string }[] = [];

        files.forEach((file) => {
          fileInfos.push({
            name: file,
            url:
              request.protocol + "://" + request.get("host") + "/files/" + file,
          });
        });

        response.status(200).send(fileInfos);
      });
    } catch (error) {
      response.status(500).send({
        message: "An error occurred while retrieving files.",
      });
    }
  }

  download(request: Request, response: Response) {
    try {
      const fileName = request.params.name;
      const directoryPath = path.join(
        __dirname + "/resources/static/assets/uploads/"
      );
      response.download(directoryPath + fileName, fileName, (err) => {
        if (err) {
          response.status(500).send({
            message: "Could not download the file. " + err,
          });
        }
      });
    } catch (error) {}
  }
}
