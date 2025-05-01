import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { keyword, UID } from './api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keyjson = path.join(__dirname,'mock_database', 'search_history_keyword.json');
const seljson = path.join(__dirname,'mock_database',  'search_history_selection.json');

function readJson(file) {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export function showHelp() {
  console.log(` 
      Filters
      =================
      fname          - Fuzzy name search (e.g. 'Magician')
      id             - 8-digit unique ID (e.g. 46986414)
      `);
}

export async function historycommand(mode) {
  const file = mode === 'keywords' ? keyjson : seljson;
  const items = readJson(file);

  if (!items.length) {
    console.log(`No ${mode} history found.\n`);
    return;
  }

  const choices = items.map((entry) => ({
    name: mode === 'keywords' ? entry : `Card ID: ${entry}`,
    value: entry
  }));

  choices.unshift(new inquirer.Separator(), { name: 'Exit', value: 'exit' });

  const { selected } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selected',
      message: `Select a ${mode === 'keywords' ? 'keyword' : 'card'} to reuse:`,
      choices
    }
  ]);

  if (selected === 'exit') return;

  if (mode === 'keywords') {
    const [param, value] = selected.split('=');

    if (!param || !value) {
      console.log('Invalid keyword format.');
      return;
    }

    await searchcommand(param, value);
  } else {
    const card = await UID(selected);
    if (!card) {
      console.log('Card not found.');
      return;
    }

    carddetails(card);
  }
}

export async function searchcommand(param, value) {
  if (param === 'id') {
    const card = await UID(value.trim());
    if (!card) {
      console.log('Card not found.');
      return;
    }
    carddetails(card);
    return;
  }

  const results = await keyword(param, value.trim());
  if (!results || results.length === 0) {
    console.log(`No results found for "${param}=${value}".`);
    return;
  }

  const choices = results.map(card => ({
    name: `${card.name} (ID: ${card.id})`,
    value: card.id
  }));

  choices.unshift(new inquirer.Separator(), { name: 'Exit', value: 'exit' });

  const { selectedId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedId',
      message: 'Select a card to view details:',
      choices
    }
  ]);

  if (selectedId === 'exit') return;

  const shistory = readJson(seljson);
  if (!shistory.includes(selectedId)) {
    shistory.push(selectedId);
    writeJson(seljson, shistory);
  }

  const khistory = readJson(keyjson);
  const kfill = `${param}=${value}`;
  if (!khistory.includes(kfill)) {
    khistory.push(kfill);
    writeJson(keyjson, khistory);
  }

  const card = await UID(selectedId);
  if (!card) {
    console.log('Card not found.');
    return;
  }

  carddetails(card);
}

function carddetails(card) {
  console.log(`\n Card Details\n----------------------------\n` +
    `Name:        ${card.name}\n` +
    `ID:          ${card.id}\n` +
    `Type:        ${card.type}\n` +
    `Race:        ${card.race}\n` +
    `Attribute:   ${card.attribute || 'N/A'}\n` +
    `Level/Rank:  ${card.level || 'N/A'}\n` +
    `ATK:         ${card.atk || 'N/A'}\n` +
    `DEF:         ${card.def || 'N/A'}\n` +
    `Archetype:   ${card.archetype || 'N/A'}\n` +
    `Description: ${card.desc?.slice(0, 200) || 'N/A'}\n` +
    `----------------------------\n`);
}
