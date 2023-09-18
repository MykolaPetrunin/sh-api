import { umzug } from '../umzugConfig';

umzug
  .down()
  .then(() => {
    console.log('Migrations down complete.');
  })
  .catch((err) => {
    console.error('Error reverting migrations', err);
  });
