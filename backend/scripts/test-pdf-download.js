const axios = require('axios');
const fs = require('fs');

async function testDownload() {
  const entryId = '129c9532-ed3b-4bbc-add2-b842be5141b7';
  const url = `http://localhost:3002/payroll/entries/${entryId}/pdf`;

  try {
    console.log(`Fetching ${url}...`);
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    });

    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data Length:', response.data.length);

    const contentType = response.headers['content-type'];
    if (contentType === 'application/pdf') {
      console.log('SUCCESS: Content-Type is application/pdf');
      fs.writeFileSync('test_payslip.pdf', response.data);
      console.log('Saved to test_payslip.pdf');
    } else {
      console.log('FAILURE: Content-Type is', contentType);
      console.log(
        'Data as String:',
        response.data.toString().substring(0, 100),
      );
    }
  } catch (err) {
    console.error('Error:', err.message);
    if (err.response) {
      console.error('Response Data:', err.response.data.toString());
    }
  }
}

testDownload();
