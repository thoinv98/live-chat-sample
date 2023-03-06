var chatItem = `
<div class="chat-item px-2 my-2 d-flex align-items-center {{active}}" convId="{{convId}}">
    <div class="avatar my-2">
        <img src="{{avatarUrl}}">
    </div>
    <div class="info">
        <p class="name fw-bolder">{{name}}</p>
        <p class="last-message m-0">{{lastMessage}}</p>
    </div>
</div>
`;

var ortherMessage = `
<div class="message d-flex ">
    <div>
        <div class="avatar avatar-sm align-items-center">
            <img src="{{avatarUrl}}">
        </div>
    </div>
    <div class="message-other">
        {{messageItem}}
    </div>
</div>
`;

var myMessage = `
<div class="message my-message">
    {{messageItem}}
</div>
`;

var messageItem = `
<p class="item-message">
    {{contentMessage}}
</p>
<br>
`;