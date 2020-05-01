'use strict';
const {
  ExitCode
} = require(`../../constants`);
const {
  getRandomInt,
  shuffle,
  getRandomDate
} = require(`../../utils`);
const fs = require(`fs`).promises;
const chalk = require(`chalk`);

const DEFAULT_COUNT = 1;
const MAX_COUNT = 1000;
const FILE_NAME = `mocks.json`;

const FILE_TITLES_PATH = `./data/titles.txt`;
const FILE_SENTENCES_PATH = `./data/sentences.txt`;
const FILE_CATEGORIES_PATH = `./data/categories.txt`;

function getStartMonth() {
  return new Date().getMonth() - 2
}

function generateOffers(count, titles, sentences, categories) {
  return Array(count).fill({}).map(() => ({
    title: [titles[getRandomInt(0, titles.length - 1)]],
    announce: shuffle(sentences).slice(0, 5).join(` `),
    fullText: shuffle(sentences).slice(5, sentences.length - 1).join(` `),
    createdDate: getRandomDate(new Date(new Date().getFullYear(), getStartMonth(), 1), new Date()).toISOString(),
    category: shuffle(categories).slice(0, 3).join(` `)
  }))
}

const readContent = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, `utf8`);
    return content.split(`\n`);
  } catch (err) {
    console.error(chalk.red(err));
    return [];
  }
};

module.exports = {
  name: '--generate',
  async run(args) {
    const [count] = args;
    const countOffer = Number.parseInt(count, 10) || DEFAULT_COUNT;
    const titles = await readContent(FILE_TITLES_PATH);
    const sentences = await readContent(FILE_SENTENCES_PATH);
    const categories = await readContent(FILE_CATEGORIES_PATH);

    if (countOffer > MAX_COUNT) {
      console.log(chalk.red(`Ошибка. Максимальное число файлов ${MAX_COUNT}`));
      process.exit(ExitCode.error)
    }

    const content = JSON.stringify(generateOffers(countOffer, titles, sentences, categories));

    try {
      await fs.writeFile(FILE_NAME, content);
      console.info(chalk.green(`Operation success. File created.`));
      process.exit(ExitCode.success);
    } catch (e) {
      console.error(chalk.red(`Can't write data to file...`));
      process.exit(ExitCode.error);
    }
  }
};
