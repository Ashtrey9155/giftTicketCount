const gmailParser = require('gmail-parser');
const OAuth2 = 1088990786013-jtm284iue8s6lsgkv5o7s2e2je3rh9jk.apps.googleusercontent.com;
const userid = it@aerograd.ru;
gmail.users.messages.get({auth:OAuth2, userId:userid, id:messageId, format:'raw'},(err, rawMail)=>{
    	gmailParser.parseGmail(rawMail,callback);
    	let mail = gmailParser.parseGmail(rawMail);
    	//doSomething(mail);
	console.log('MAIL: ', mail);
})
