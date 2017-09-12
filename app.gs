var channelToken = '';

// main
function doPost(e) { 
	var reToken = JSON.parse(e.postData.contents).events[0].replyToken;
	if (typeof reToken === 'undefined') return;
	var userId = JSON.parse(e.postData.contents).events[0].source.userId;
	var userName = getName(userId);
	var userType = JSON.parse(e.postData.contents).events[0].type;
	if(userType === 'message') {
		var userMsg = JSON.parse(e.postData.contents).events[0].message.text;       
		switch(userMsg.toLowerCase()) {
			case '/start':
				userLogin(userId, userName);
				botPush(userId, '▶ ' + botGreet());
				botQues(reToken, userId);
				break;
			case '/help':
				botPush(userId, 'start - 開始答題\nstatus - 查詢自己成績\nboard - 排行榜');
				break;
			case '/status':
				var tmp = getStatus(userId);
				botPush(userId, 'point - ' + tmp.point + '分\norder - 第' + tmp.order + '名\n全部' + tmp.total + '個人');
				break;
			case '/board':
				botBoard(userId);
				break;
			default:
				botEcho(reToken, userMsg);
		};
	}
	else if(userType === 'postback') {
		if(JSON.parse(e.postData.contents).events[0].postback.data == 'Ha') return;
		var userData = JSON.parse(JSON.parse(e.postData.contents).events[0].postback.data);
		var res = quesCheck(userId, userData.id, userData.ans);
		botPush(userId, '你選擇: ' + String.fromCharCode(65 + userData.ans));
		if(res == 'true') botPush(userId, '👍 ' +  botRight());
		else botPush(userId,'👎 '+ botWrong());
		if(userData.id == 'finish') botPush(userId, '這並不是結束, 而是嶄新的開始');
		botQues(reToken, userId);
		return;
	}
	else {
		return;
	}
	return ContentService.createTextOutput(JSON.stringify({'content': 'post ok'})).setMimeType(ContentService.MimeType.JSON);
}

function botBoard(userId) {
	var data =     
	{
		'to' : userId,
		'messages': [{
			"type": "template",
			"altText": "this is a buttons template",
			"template": {
				"type": "buttons",
				"text": "LeaderBoard",
				"actions": [        
				{
					"type": "uri",
					"label": "Link",
					"uri": "http://leaderboard.xxx.tw"
				}
				]
			}
		}]
	};

	var url = 'https://api.line.me/v2/bot/message/push';
	var opt = {
		'headers': {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + channelToken,
		},
		'method': 'post',
		'payload': JSON.stringify(data)
	};
	UrlFetchApp.fetch(url, opt);
}

function quesCheck(userId, quesId, userAns) {
	var url = 'http://xxx.com/answer';
	var data = {
		'user': userId, 
		'id': quesId, 
		'answer': userAns
	};
	var opt = {
		'method' : 'post',
		'contentType': 'application/json',
		'payload' : JSON.stringify(data)
	};
	var res = UrlFetchApp.fetch(url, opt);
	return res;
}



function quesMsgMake(ques) {
	var msg = 'Question:\nQ:  ' + ques.question + '\n' + 'Options:\n';
	var act = [];
	for(var i = 0; i < 4; i++) {
		var chr = String.fromCharCode(65 + i);
		var data = {'id': ques.id, 'ans': i};
		msg = msg + chr + ':  ' + ques.option[i] + '\n';
		act.push({'type': 'postback','label': chr,'data': JSON.stringify(data) });
	}
	var res = {'type': 'buttons','text': msg, 'actions': act};
	return res;
}

function botQues(reToken, userId) {
	var ques = getQues(userId);
	var quesMsg = [{'type': 'template', 'altText': 'this msg have buttons.', 'template': quesMsgMake(ques)}];
	if(ques.hint != '') quesMsg.push({'type': 'text', 'text': 'Hint:  ' + ques.hint});
	var url = 'https://api.line.me/v2/bot/message/reply';
	var opt = {
		'headers': {
			'Content-Type': 'application/json; charset=UTF-8',
			'Authorization': 'Bearer ' + channelToken,
		},
		'method': 'post',
		'payload': JSON.stringify({
				'replyToken': reToken,
				'messages': quesMsg
				})
	};
	var res = UrlFetchApp.fetch(url, opt);
	return res;
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

function botPush(userId, botMsg) {
	var url = 'https://api.line.me/v2/bot/message/push';
	var opt = {
		'headers': {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + channelToken,
		},
		'method': 'post',
		'payload': JSON.stringify({
				'to' : userId,
				'messages': [{'type': 'text', 'text': botMsg}]
				})
	};
	UrlFetchApp.fetch(url, opt);
}

function doGet(e) {
	return ContentService.createTextOutput(UrlFetchApp.fetch('http://ip-api.com/json'));
}

function userLogin(userId, userName) {
	var url = 'http://xxx.com/user';
	var data = {
		'user': userId, 
		'nickname': userName, 
		'platform': 'line'
	};
	var opt = {
		'method' : 'post',
		'contentType': 'application/json',
		'payload' : JSON.stringify(data)
	};
	try{
		var res = UrlFetchApp.fetch(url, opt);
	}
	catch(e){
		Logger.log(e.message);
	}
	return res;
}

function getQues(userId) {
	if (typeof userId === 'undefined') return;
	var url = 'http://xxx.com/question?user=' + userId;
	var opt = {'method': 'get'};
	var res = JSON.parse(UrlFetchApp.fetch(url, opt));
    do {
        var num = res.question.length;
        res = JSON.parse(UrlFetchApp.fetch(url, opt));
        for(var i = 0; i < 4; i++) num = num + res.option[i].length;
    }while(num >= 70 || res.question.length <=   1)  
	return res;
}

function getStatus(userId) {
	if (typeof userId === 'undefined') return;
	var url = 'http://xxx.com/user?user=' + userId;
	var opt = {'method': 'get'};
	var res = JSON.parse(UrlFetchApp.fetch(url, opt));
	res = JSON.parse(UrlFetchApp.fetch(url, opt));
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

function botGreet() {
	var greeting = [
		'Welcome to the Japari Park',
		'Hello, world!',
		'歡迎光臨 my phone',
		'777! 聊天室 7 起來!'];
	return greeting[Math.floor((Math.random() * 4))];
}


function botRight() {
	var str = ['すごーい!',
			'たーのしい！',
			'庫克饒富興味的看了你一眼',
			'答的不錯，晚上到辦公室找我',
			'不錯嘛，這個屌',
			'答對囉',
			'超過 100 分',
			'完全的正確',
			'睿智的人類，去支配世界吧！',
			'渾身充滿了勝利的氣息…！',
			'這回答我只能給 82 分，剩餘的分數拆成 666 打出來'];
	return str[Math.floor((Math.random() * 4))];
}

function botWrong() {
	var str = ['連這題不會，你只能去寫 COBOL 了',
			'這也錯？連 PHP 工程師都答的比你好',
			'答錯了啦，是不會查 stackoverflow 嗎？',
			'Error. STFW, OK?',
			'嘿嘿，見鬼啦，不是這個吧。',
			'答錯 0 分',
			'拜託，幫我撐十秒。',
			'會有更多題目讓你答錯的，不用擔心'];
	return str[Math.floor((Math.random() * 4))];
}
