import shuntSpawner from "./shunt"
import {
  proxyURL,
  mirrorURL,
  jarvisDirectoryName,
  pythonFilePath,
  logDirectoryPath
} from "./constant"

const sendPrompts = shuntSpawner(
  (prompts) => new Promise((resolve, reject) => {
    setTimeout(resolve, 750, "Sure! I can help you set up your working environment.");
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

    const pythonCommand = (env, filePath, arg) => {
      const envList = Object
        .keys(env)
        .map((key) => `${key}=${env[key]}`)
      const argList = Object
        .keys(arg)
        .filter((key) => arg[key] !== undefined)
        .map((key) => `--${key}=${arg[key]}`)
      return envList.concat([`python ${filePath}`]).concat(argList).join(" ");
    }

    const absolutePath = path.resolve(path.join(".", jarvisDirectoryName));
    const queryID = new Date().getTime().toString();
    const prefix = Array(8).fill().reduce(
      (current) =>
        current + Math.random().toString(36).slice(2, 6),
      ""
    )

    let recordIndex = 0;
    let detected = false;
    const fingerprint = prefix;
    const timerID = setInterval(() => {
      const logFilePath = path.join(absolutePath, logDirectoryPath, `${queryID}.log`);
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

    const wrapper = (str) => "\"" + str.replaceAll("\"", "\\\"") + "\"";
    const command = pythonCommand({
      HTTP_PROXY: proxyURL,
      HTTPS_PROXY: proxyURL,
      HF_ENDPOINT: mirrorURL,
      PYTHONPATH: wrapper(absolutePath)
    }, pythonFilePath, {
      query: wrapper(prompts),
      query_file_path: attachedFilePath ? wrapper(attachedFilePath) : undefined,
      logging_filedir: wrapper(logDirectoryPath),
      query_id: queryID,
      logging_prefix: prefix
    });

    const virtualCommand = `. env/bin/activate && (${command})`
    console.log(virtualCommand);
    exec(virtualCommand, { cwd: absolutePath }, (err, stdout, stderr) => {
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
