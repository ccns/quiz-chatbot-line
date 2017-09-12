var channelToken = '';

function doGet(e) {
	return ContentService.createTextOutput(UrlFetchApp.fetch('http://ip-api.com/json'));
}

function doPost(e) { 
	var reToken = JSON.parse(e.postData.contents).events[0].replyToken;
	if (typeof reToken === 'undefined') return;
	var userId = JSON.parse(e.postData.contents).events[0].source.userId;
	var userName = getName(userId);
	var userType = JSON.parse(e.postData.contents).events[0].type;
  var userMsg = JSON.parse(e.postData.contents).events[0].message.text;
  botEho(reToken, userMsg + 'HaHaHa');
	return ContentService.createTextOutput(JSON.stringify({'content': 'post ok'})).setMimeType(ContentService.MimeType.JSON);
}

function botEcho(reToken, userMsg) {
	var url = 'https://api.line.me/v2/bot/message/reply';
	var opt = {
		'headers': {
			'Content-Type': 'application/json; charset=UTF-8',
			'Authorization': 'Bearer ' + channelToken,
		},
		'method': 'post',
		'payload': JSON.stringify({
				'replyToken': reToken,
				'messages': [{'type': 'text', 'text': userMsg}]
				})
	};
	var res = UrlFetchApp.fetch(url, opt);
	return res;
}

function getName(userId) {
	if (typeof userId === 'undefined')  return;
	var url = 'https://api.line.me/v2/bot/profile/' + userId;
	var opt = {
		'headers': {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + channelToken,
		},
		'method': 'get',
	};
	var res = JSON.parse(UrlFetchApp.fetch(url, opt)).displayName;
	return res;
}
