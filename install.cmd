node --version && (echo Found NodeJS) || (echo NodeJS not found. Installing now && winget install OpenJS.NodeJS)

npm i -g yarn
yarn
