var stringeeClient;
var stringeeChat;
var userIds = [];
var myUserId = '';
var accessToken = '';
var isLogin = false;
var userInfo = {};
var convList = [];
var currentConv = {};
var currentMessages = [];

$(document).ready(function () {
    console.log("document ready");

    if (localStorage.getItem("accessToken")) {
        accessToken = localStorage.getItem("accessToken");
        $('#accessToken').val(accessToken);
    }

    // Init
    stringeeClient = new StringeeClient();

    settingClientEvents(stringeeClient);

    $('#btnConnect').click(()=>{
        accessToken = $('#accessToken').val();
        accessToken =  accessToken.trim();
        if (accessToken.length == 0) {
            toast("Access token không được để trống!");
        } else {
            stringeeClient.connect(accessToken);
            console.log("Click connect | token: ", accessToken);
        }
    })

    $('#btnStart').click(()=>{
        const strUserIds = $('#userIds').val().trim();
        if (strUserIds.length == 0) {
            toast("User Id không được để trống!", 'Lỗi');
        } else {
            userIds = strUserIds.split(',');
            userIds = userIds.map(e => {
                return e.trim();
            })

            createConv();
            console.log(userIds);
        }
    })

    $('#btnSend').click(()=>{
        const content = $('#messageContent').val();
        sendMessage(content);
    })

    $(document).on('click', '.chat-item', function(event) {
        const convId = $(this).attr('convId');
        $('.chat-item').removeClass('active');
        $(this).addClass('active');
        if (convId) {
            showChat(convId);
        }
    });

    $(document).on('keypress', '#messageContent',function(e) {
        if(e.which == 13) {
            const content = $('#messageContent').val();
            sendMessage(content);
        }
    });
})

function toast(message, title = 'Thông báo'){
    $('.toast-content').html(message);
    $('.toast-title').html(title);

    const toastLiveExample = document.getElementById('liveToast');
    const toast = new bootstrap.Toast(toastLiveExample)
    toast.show()
}

function createConv() {
    return new Promise(function (resolve, reject) {
        let options = {
            name: "New conversation",
            isDistinct: false,
            isGroup: true
        };
        stringeeChat.createConversation(userIds, options, (res) => {
            // console.log('status:' + status + ' code:' + code + ' message:' + message + ' conv:' + JSON.stringify(conv));
            console.log("createConversation", res);
            resolve(res);
        })
    })
}

function sendMessage(message) {
    const type = 1;
    let body = {
        convId: currentConv.id,
        message: {
            content: message
        },
        type: type,
    };
    stringeeChat.sendMessage(body, function(res){
        console.log("OKOKOKOKOK", res);
        if (res) {
            resetChat();
        }
    })
}

function resetChat(){
    $('#messageContent').val('');
    $('#messageContent').focus();
}

function settingClientChat() {
    stringeeChat.on('onObjectChange', function (info) {

        if (info.objectType === 0) {
            handleUpdateChatList(info.objectChanges);
        } else {
            handleUpdateMessage(info.objectChanges);
        }
        console.log('RECEIVED ONOBJECTCHANGE EVENT', info);
    });
}

function handleUpdateMessage(messages){
    messages.forEach(element => {
        const indexConv = convList.findIndex(e => e.id == element.convId);
        if (indexConv !== -1) {
            convList[indexConv].lastMessage = element;
            updateViewChatList(convList);

            if (element.convId == currentConv.id) {
                const indexMsg = currentMessages.findIndex(e => e.id == element.id);
                console.log("currentMessages", currentMessages);
                console.log("element.id", element.id);
                console.log("indexMsg", indexMsg);
                if (indexMsg >= 0) {
                    currentMessages[indexMsg] = {...element};
                } else {
                    currentMessages.push(element);
                }
                updateViewChatContent(currentMessages);
            }
        }
    });
}

function scrollToLastMessage(){
    const itemElement = document.getElementsByClassName('item-message');
    if (itemElement && itemElement.length > 0) {
        itemElement[itemElement.length - 1].scrollIntoView({behavior: "smooth", block: "end"});
    }
}

function handleUpdateChatList(convs){
    convs.forEach(element => {
        const index = convList.findIndex(e => e.id == element.id);
        if (index === -1) {
            convList.unshift(element);
        } else {
            convList[index] = {...element};
            if (convList[index].id != currentConv.id) {
                convList[index].hasNewMsg = true;
            }
        }

        console.log("handleUpdateChatList", convList);

        updateViewChatList(convList);
    });
}

function settingClientEvents(client) {
    client.on('connect', function (res) {
        console.log('Connected to StringeeServer');
    });

    client.on('authen', function (res) {
        console.log('authen', res);
        if (res.r === 0) {
            myUserId = res.userId;
            localStorage.setItem("accessToken", accessToken);

            $('#userId').html(myUserId);
            $('#userId').show();
            $('#login-form').hide('fast');
            $('#chat-box').show('fast');
            stringeeChat = new StringeeChat(stringeeClient);
            settingClientChat();
            getConversation();
        } else {
            toast(res.message, "Lỗi")
        }
    });

    client.on('disconnect', function () {
        $('#callBtn').attr('disabled', 'disabled');
        $('#videoCallBtn').attr('disabled', 'disabled');
        console.log('Disconnected');
    });

    client.on('requestnewtoken', function () {
        console.log('Requestnewtoken; please get new access_token from YourServer and call client.connect(new_access_token)');
        //please get new access_token from YourServer and call: 
        //client.connect(new_access_token);
    });
}

function getConversation(){
    stringeeChat.getLastConversations(10, false, function (status, code, message, convs) {
        console.log(status + code + message + ' convs:', convs);
        updateViewChatList(convs);
        convList = convs;
    });
}

function getLastMessages(convId){
    stringeeChat.getLastMessages(convId, 50, true, function (status, code, message, msgs) {
        console.log('status:' + status + ' code:' + code + ' message:' + message + ' conv:', msgs);
        currentMessages = msgs;
        updateViewChatContent(msgs);
    });
}

function getConvName(convInfo){
    let arr = convInfo.participants.filter(e => e.userId != myUserId);
    arr = arr.map(e => e.userId);
    convsName = arr.join(', ');

    return convsName;
}

function showChat(convId){
    getLastMessages(convId);
    $('#noChat').hide('fast');
    $('#chatContent').show('fast');
    currentConv = convList.find(e => e.id == convId);
    console.log("currentConv: ", currentConv);
    currentConv.hasNewMsg = false;
    if (currentConv) {
        $('#convName').html(getConvName(currentConv))
    }
}

function updateViewChatList(convs){
    let html = '';
    console.log("updateViewChatList", convs);
    convs.forEach((element, index) => {
        let chatItemTemp = chatItem;
        let convsName = '';

        const lastMessage = element.lastMessage && element.lastMessage.content && element.lastMessage.content.content ? element.lastMessage.content.content : '...';
        if (element.id == currentConv.id) {
            chatItemTemp = chatItemTemp.replaceAll('{{active}}', 'active');
        } else {
            chatItemTemp = chatItemTemp.replaceAll('{{active}}', '');
        }

        let arr = element.participants.filter(e => e.userId != myUserId);
        arr = arr.map(e => e.userId);
        convsName = arr.join(', ');

        chatItemTemp = chatItemTemp.replaceAll('{{name}}', convsName);
        chatItemTemp = chatItemTemp.replaceAll('{{convId}}', element.id);
        chatItemTemp = chatItemTemp.replaceAll('{{lastMessage}}', lastMessage);
        chatItemTemp = chatItemTemp.replaceAll('{{avatarUrl}}', './img/' + index + '.jfif');

        if (element.hasNewMsg) {
            chatItemTemp = chatItemTemp.replaceAll('{{badgeNewMsg}}', badgeNewMsg);
        } else {
            chatItemTemp = chatItemTemp.replaceAll('{{badgeNewMsg}}', '');
        }

        userInfo[arr[0]] = './img/' + index + '.jfif';

        html += chatItemTemp;
    });
    $('#chatList').html(html);
}

function updateViewChatContent(messages){
    let html = '';
    let sender = '';
    let htmlItem = '';

    console.log("updateViewChatContent", messages);

    messages.forEach((element, index) => {
        let htmlMessageItem = messageItem;
        if (!sender) {
            sender = element.sender;
        } else if (sender != element.sender) {
            if (sender != myUserId) {
                console.log("OK userInfo 1",userInfo[sender]);
                let htmlOrtherMessage = ortherMessage.replaceAll('{{avatarUrl}}', userInfo[sender]);
                htmlOrtherMessage = htmlOrtherMessage.replaceAll('{{messageItem}}', htmlItem.substring(0, htmlItem.length - 5));
                html += htmlOrtherMessage;
                htmlItem = '';
            } else {
                let htmlMyMessage = myMessage.replaceAll('{{messageItem}}', htmlItem.substring(0, htmlItem.length - 5));
                html += htmlMyMessage;
                htmlItem = '';
            }
            sender = element.sender;
        }
        const content = element.content ? element.content.content : '';
        if (content) {
            htmlItem += htmlMessageItem.replaceAll('{{contentMessage}}', content);
        }

        if (index >= messages.length - 1) {
            if (sender != myUserId) {
                let htmlOrtherMessage = ortherMessage.replaceAll('{{avatarUrl}}', userInfo[sender]);
                htmlOrtherMessage = htmlOrtherMessage.replaceAll('{{messageItem}}', htmlItem.substring(0, htmlItem.length - 5));
                html += htmlOrtherMessage;
            } else {
                let htmlMyMessage = myMessage.replaceAll('{{messageItem}}', htmlItem.substring(0, htmlItem.length - 5));
                html += htmlMyMessage;
                htmlItem = '';
            }
        }
    });

    $('#chatContent').html(html);
    scrollToLastMessage();
}