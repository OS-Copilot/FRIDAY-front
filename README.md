# FRIDAY Front

## Usage

1. Make sure that OS-Copilot/FRIDAY is properly installed;

    ```shell
    git clone https://github.com/OS-Copilot/FRIDAY
    cd FRIDAY/
    pip install -r requirement.txt
    pip install pysqlite3-binary
    ```

2. For developers, make sure Node.js (as well as npm) is installed:

    ```shell
    git clone https://github.com/OS-Copilot/FRIDAY-front
    cd FRIDAY-front/
    npm install
    touch .env
    echo "REACT_APP_PATH=${FRIDAY_PATH}" >> .env
    npm start
    ```

    change `${FRIDAY_PATH}` to real absolute path;

3. For deployer, make sure Node.js (as well as npm) is installed:

    ```shell
    git clone https://github.com/OS-Copilot/FRIDAY-front
    cd FRIDAY-front/
    npm install
    npm run build
    touch dist/.env
    echo "REACT_APP_PATH=${FRIDAY_PATH}" >> dist/.env
    ```

    change `${FRIDAY_PATH}` to real absolute path;

4. For users, download the packed application and add an `.env` file:

    ```shell
    touch dist/.env
    echo "REACT_APP_PATH=${FRIDAY_PATH}" >> dist/.env
    ```

    change `${FRIDAY_PATH}` to real absolute path;

## .env Config

- `REACT_APP_PATH` (**required**): absolute path of backend file;
- `REACT_APP_PROXY` (optional): proxy URL used when executing python scripts;
- `REACT_APP_MIRROR` (optional): mirror site of Hugging Face.

## Prompts Examples

- Move the text files containing the word 'agent' from the folder named 'document' to the path 'working_dir/agent'.
