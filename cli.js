import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { keyword, UID } from './api.js';
import { showHelp, historycommand, searchcommand } from './app.js';

yargs(hideBin(process.argv))
  .usage('$0 <command> [args]')

  .command(
    'search <filter> <value>',
    'Search for a Yu-Gi-Oh! card using a fname or ID',
    (yargs) => {
      yargs
        .positional('filter', {
          describe: 'Filter (e.g. fname or ID)',
          type: 'string'
        })
        .positional('value', {
          describe: 'The value for the selected filter',
          type: 'string'
        });
    },
    async (argv) => {
      const { filter, value } = argv;
      await searchcommand(filter, value);
    }
  )

  .command(
    'history <type>',
    'Show previous search keywords or card selections',
    (yargs) => {
      yargs.positional('type', {
        describe: 'Type of history to view',
        choices: ['keywords', 'selections']
      });
    },
    async (argv) => {
      await historycommand(argv.type);
    }
  )

  .command(
    'helpinfo',
    'Display available filters and examples',
    () => {},
    () => {
      showHelp();
    }
  )
  .help().argv;
