import shuntSpawner from "./shunt"
import { isDevMode, pythonFilePath, logDirectoryPath } from "./constant"

const getEnvironment = shuntSpawner(
  () => process.env
)(
  () => {
    if (isDevMode) {
      return process.env
    } else {
      const path = window.require("path");
      const fs = window.require("fs");
      const dotenv = window.require("dotenv");
      const dirPath = path.resolve(".");
      const envPath = path.join(dirPath, ".env");
      if (fs.existsSync(envPath)) {
        const buf = fs.readFileSync(envPath);
        return dotenv.parse(buf);
      } else {
        return Object();
      }
    }
  }
);

const sendPrompts = shuntSpawner(
  () => new Promise((resolve, _) => {
    setTimeout(resolve, 750);
  })
)(
  (prompts, attachedFilePath, operators) => new Promise((resolve, reject) => {
    const path = window.require("path");
    const fs = window.require("fs");
    const { exec } = window.require("child_process");
    const openBrowser = window.require('open-web-browser');
    const {
      handleAddBubble,
      handleAddStep,
      handleStepNew,
      handleStepFin
    } = operators;

    const wrapper = (str) => "\"" + str.replaceAll("\"", "\\\"") + "\"";
    const pythonCommand = (env, filePath, arg) => {
      const envList = Object
        .keys(env)
        .filter((key) => env[key] !== undefined)
        .map((key) => `${key}=${wrapper(env[key])}`)
      const argList = Object
        .keys(arg)
        .filter((key) => arg[key] !== undefined)
        .map((key) => `--${key}=${wrapper(arg[key])}`)
      return envList.concat([`python ${filePath}`]).concat(argList).join(" ");
    }

    const {
      REACT_APP_PATH: fridayDirPath,
      REACT_APP_PROXY: proxyURL,
      REACT_APP_MIRROR: mirrorURL,
    } = getEnvironment();
    const absolutePath = path.resolve(fridayDirPath);
    const queryID = new Date().getTime().toString();
    const logFileName = `${queryID}.log`;
    const prefix = Array(8).fill().reduce(
      (current) =>
        current + Math.random().toString(36).slice(2, 6),
      ""
    )

    let recordIndex = 0;
    let detected = false;
    const fingerprint = prefix;
    const timerID = setInterval(() => {
      const logFilePath = path.join(absolutePath, logDirectoryPath, logFileName);
      if (!fs.existsSync(logFilePath)) {
        return;
      }

      if (!detected && fs.existsSync("/home/ichinoe/Downloads/page.html")) {
        detected = true;
        openBrowser("file:///home/ichinoe/Downloads/page.html");
      }
      const logRecord = fs.readFileSync(logFilePath).toString().split(`[${prefix}] `).slice(1)
      const newRecord = logRecord.slice(recordIndex);
      recordIndex = logRecord.length;
      newRecord.forEach((item) => {
        const log = item.slice(33);
        const trimmed = log.split(":").slice(1).join(":").slice(1);
        if (/^The overall response is: /.test(log)) {
          handleAddBubble(false, trimmed);
          handleAddStep(fingerprint);
        } else if (/^The current subtask is: /.test(log)) {
          handleStepNew(fingerprint, trimmed);
        } else if (/^The subtask result is: /.test(log)) {
          const result = JSON.parse(trimmed);
          handleStepFin(fingerprint, {
            color: result.error ? "danger" : "success",
            content: (result.error || result.result).replaceAll(/<return>[^]+<\/return>/g, "")
          })
        }
      });
    }, 100);

    const command = pythonCommand({
      HTTP_PROXY: proxyURL,
      HTTPS_PROXY: proxyURL,
      HF_ENDPOINT: mirrorURL,
      PYTHONPATH: absolutePath
    }, pythonFilePath, {
      query: prompts,
      query_file_path: attachedFilePath ?? undefined,
      logging_filedir: logDirectoryPath,
      logging_filename: logFileName,
      logging_prefix: prefix
    });

    console.log(command)
    exec(command, { cwd: absolutePath }, (err, stdout, stderr) => {
      clearInterval(timerID);
      stderr
        ? reject({ type: "stderr", info: stderr })
        : err
        ? reject({ type: "cmderr", info: err })
        : resolve(stdout);
    });
  })
);

export default sendPrompts;
export {
  sendPrompts,
};
