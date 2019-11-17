#!/usr/bin/env node
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Gmail API.
  authorize(JSON.parse(content), listLabels);
  authorize(JSON.parse(content), gMailListUserMessages);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
  const gmail = google.gmail({version: 'v1', auth});
  gmail.users.labels.list({
    userId: 'me',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const labels = res.data.labels;
    if (labels.length) {
      // console.log('Labels:');
      labels.forEach((label) => {
        // console.log(`Title: ${label.name} | ID: ${label.id}`);
      });
      //gMailListUserMessages();
    } else {
      console.log('No labels found.');
    }
  });
}






  function gMailListUserMessages(auth) {
    const gmail = google.gmail({version: 'v1', auth});
    const jsonObj = [];
    	gmail.users.messages.list({
      		userId: 'me',
      		includeSpamTrash: false,
      		labelIds: [
        		"Label_3859400968981087020"
          ],
          "q": "is:unread"
    	}, (err, response) => {
        if (err) {
          console.log('The Gmail API returned an error: ' + err);
          return;
        }
        if (response.data.resultSizeEstimate === 0) return console.log(response.data);

        //const message_id = response.data.messages[0].id;
        const messagesUnread = response.data.messages;
        

        messagesUnread.reduce((acc, e) => {
          gmail.users.messages.get({
            userId: 'me',
            id: e.id
          }, (err, response) => {
            if (err) return console.log('The API returned an error: ' + err);
            let item = {};
            const message_raw = response.data.payload.parts[0].body.data;
            const data = message_raw;  
            const buff = Buffer.from(data, 'base64');  
            const str = buff.toString();

            const id = str.match(/Извещение № (.+)/);
            const dataTime = str.match(/Время платежа: (.+)/);
            const cash = str.match(/Сумма: (.+)/);
            const nomberTrunsaction = str.match(/Номер транзакции: (.+)/);
            const identityClient = str.match(/Идентификатор клиента: (.+)/);
            const fioClient = str.match(/Ф.И.О.: (.+)/);
            const addresClient = str.match(/Адрес доставки: (.+)/);
            const emailClient = str.match(/E-mail: ().+/);
            const service = str.match(/Подарочный сертификат на (.+)#/);
            const ref = str.match(/#REF(.+)/);
            const owner = str.match(/Владелец: (.+)/);
            
            item["id"] = id[1];
            item["dataTime"] = dataTime[1];
            item["nomberTrunsaction"] = nomberTrunsaction[1];
            item["identityClient"] = identityClient[1];
            item["fioClient"] = fioClient[1];
            item["addresClient"] = addresClient[1];
            item["emailClient"] = emailClient[1];
            item["service"] = service[1];
            item["ref"] = ref[1];
            item["owner"] = owner[1];

            jsonObj.push(item);

            // console.log(jsonObj);
            
            // console.log('RES: ',response.data.payload.parts[0].body.data);
            });
          
        }, jsonObj);
           
    });
    
}
