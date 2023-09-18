import { umzug } from '../umzugConfig';

umzug
  .up()
  .then(() => {
    console.log('Migrations up complete.');
  })
  .catch((err) => {
    console.error('Error running migrations', err);
  });
