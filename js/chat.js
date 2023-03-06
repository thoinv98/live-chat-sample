var stringeeClient;
var stringeeChat;
var userIds = [];
var myUserId = '';
var accessToken = '';
var convId = '';

$(document).ready(function () {
    console.log("document ready");
    $a = new ChatDemo();

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
            toast("User Id không được để trống!");
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
        sendMessage("test content");
    })
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
        convId: convId,
        message: {
            content: message
        },
        type: type,
    };
    stringeeChat.sendMessage(body, function(res){
        console.log("OKOKOKOKOK", res);
    })
}

function settingClientChat() {
    stringeeChat.on('onObjectChange', function (info) {
        console.log("onObjectChange", info);
        if (!convId) {
            convId = info.objectChanges[0].id;
            console.log('onObjectChange', info);
        } else {
            let conInfo = info.objectChanges.find(e => e.id == convId);
            console.log('conInfo', conInfo);
        }
        console.log('RECEIVED ONOBJECTCHANGE EVENT', info);
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
            stringeeChat = new StringeeChat(stringeeClient);
            settingClientChat();
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