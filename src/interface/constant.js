const defaultExport = undefined;
export default defaultExport;

const reactInterval = {
  rapid: 150,
  medium: 300,
  slow: 450
};
export { reactInterval };

const isWebview = window.require === undefined;
const isDevMode = window.location.port === "3000";
export { isWebview, isDevMode }

const proxyURL = "http://127.0.0.1:7890/";
const mirrorURL = "https://hf-mirror.com/";
const jarvisDirectoryName = "backend";
const pythonFilePath = "examples/run.py";
const logDirectoryPath = "log/task";
export {
  proxyURL,
  mirrorURL,
  jarvisDirectoryName,
  pythonFilePath,
  logDirectoryPath
};
