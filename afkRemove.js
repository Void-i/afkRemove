var bot = { 
    afkLimit: 60, //60 minutes
    users: {},
    getTime: function (ms) {
        ms = Math.floor(ms / 60000);
        var t = ms - Math.floor(ms / 60) * 60;
        var n = (ms - t) / 60;
        var r = '';
        r += n < 10 ? '0' : '';
        r += n + 'h';
        r += t < 10 ? '0' : '';
        r += t;
        return r
    },
    afkRemover: function () {
        var waitList = API.getWaitList(), now = Date.now(), index = [waitList[4], waitList[2], waitList[0]];
        if (waitList.length > 4) {
            if (now - bot.users[index[0].id].afkTime >= bot.afkLimit * 60000 && !bot.users[index[0].id].warns.warn1) {
                API.sendChat('@' + index[0].username + ' AFK Time - ' + bot.getTime(now - bot.users[index[0].id].afkTime) + ' | Chat in 5 songs or I will remove you');
                bot.users[index[0].id].warns.warn1 = true;
            };
            if (now - bot.users[index[1].id].afkTime >= bot.afkLimit * 60000 && !bot.users[index[1].id].warns.warn2 && bot.users[index[1].id].warns.warn1) {
                API.sendChat('@' + index[1].username + ' AFK Time - ' + bot.getTime(now - bot.users[index[1].id].afkTime) + ' | Last warning. Chat in 2 songs or I will remove you');
                bot.users[index[0].id].warns.warn2 = true;
            };
            if (now - bot.users[index[2].id].afkTime >= bot.afkLimit * 60000 && bot.users[index[2].id].warns.warn2 && !bot.users[index[2].id].warns.removed) {
                API.sendChat('@' + index[2].username + ' You were ' + Math.round((now - bot.users[index[2].id].afkTime) / 60000) + ' minutes past AFK limit (' + bot.afkLimit + 'm) | Chat every ' + bot.afkLimit + ' minutes while in the waitlist.');
                API.moderateRemoveDJ(index[2].id);
            };
        };
    },
    user: function(obj) {
        this.id = obj.id;
        this.afkTime = Date.now();
        this.joinTime = Date.now();
        this.warns = {
            warn1: false,
            warn2: false,
            removed: false
        };
    },
    eventWaitlistUpdate: function() {
        bot.afkRemover();
    },
    eventJoin: function(obj) {
        bot.users[obj.id] = new bot.user(obj);
    },
    eventLeave: function(obj) {
        delete bot.users[obj.id];
    },
    eventChat: function(obj) {
        bot.users[obj.fromID].afkTime = Date.now();
    }
};

API
.on(API.WAIT_LIST_UPDATE, $.proxy(bot.eventWaitlistUpdate, this))
.on(API.USER_JOIN, $.proxy(bot.eventJoin, this))
.on(API.USER_LEAVE, $.proxy(bot.eventLeave, this))
.on(API.CHAT, $.proxy(bot.eventChat, this));

for (var i in API.getUsers()) {
    bot.users[API.getUsers()[i].id] = new bot.user(API.getUsers()[i]);
}

API.chatLog('Running AFK Removal', true);
