import { pdfQueue } from '../config/queue.js';

const testQueue = async () => {
  console.log('Triggering test job...');

  await pdfQueue.add('pdf-processing', {
    filename: 'test-document.pdf',
    path: '/tmp/test-document.pdf',
  });

  console.log('Job added to queue!');
  await pdfQueue.close();
  process.exit(0);
};

testQueue();
